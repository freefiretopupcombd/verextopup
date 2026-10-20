"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowRight,
  Loader2,
  Zap,
  Shield,
  ShoppingBag,
} from "lucide-react";
import { ProductReviews } from "@/modules/reviews/components/product-reviews";

import { ProductHeader } from "./product-header";
import { PackageSelector } from "./package-selector";
import { AccountInfoFields } from "./account-info-fields";
import { QuantitySelector } from "./quantity-selector";
import { TrustBar } from "./trust-bar";
import { ProductTabs } from "./product-tabs";
import { PaymentMethodCards } from "./payment-method-cards";

import { HowItWorks } from "./how-it-works";
import { DualPrice } from "@/modules/currency/components/dual-price";
import { createUddoktaPaySessionAction } from "@/modules/payments/actions";
import { createOrderFromProductAction } from "@/modules/orders/actions";
type Variant = {
  id: string;
  name: string;
  price: number;
  salePrice: number | null;
  stock: number | null;
  unlimitedStock: boolean;
  icon: string | null;
};

type Field = {
  id: string;
  label: string;
  name: string;
  fieldType: string;
  placeholder: string | null;
  helpText: string | null;
  required: boolean;
  minLength: number | null;
  maxLength: number | null;
  regex: string | null;
  defaultValue: string | null;
  options: { label: string; value: string }[];
};

type Review = {
  id: string;
  rating: number;
  title: string | null;
  content: string;
  imageUrl?: string | null;
  isVerifiedPurchase?: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
  replies?: { id: string; content: string; createdAt: string }[];
};

type PaymentMethod = {
  id: string;
  name: string;
  slug: string;
  type: string;
  logo: string | null;
  instructions: string | null;
  accountNumber: string | null;
  merchantNumber: string | null;
  inputFields: any[];
};

type Product = {
  id: string;
  name: string;
  slug: string;
  shortDesc: string | null;
  fullDesc: string | null;
  thumbnail: string | null;
  icon: string | null;
  brand: string | null;
  instructions: string | null;
  terms: string | null;
  soldCount: number;
  productType: string;
  variants: Variant[];
  fields: Field[];
  category: { name: string; slug: string } | null;
  reviews: Review[];

  // Dynamic Badges
  badge1Text?: string | null;
  badge1Icon?: string | null;
  badge1Color?: string | null;
  badge2Text?: string | null;
  badge2Icon?: string | null;
  badge2Color?: string | null;
  badge3Text?: string | null;
  badge3Icon?: string | null;
  badge3Color?: string | null;
};

export function ProductView({
  product,
  isLoggedIn,
  walletBalance,
  paymentMethods,
  uddoktaPayEnabled = false,
}: {
  product: Product;
  isLoggedIn: boolean;
  walletBalance: number;
  paymentMethods: PaymentMethod[];
  uddoktaPayEnabled?: boolean;
}) {
  const router = useRouter();

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants.length > 0 ? product.variants[0].id : null
  );
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    product.fields.forEach((f) => {
      initial[f.name] = f.defaultValue || "";
    });
    return initial;
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  const [paymentChoice, setPaymentChoice] = useState<
    "WALLET" | "INSTANT" | "UDDOKTAPAY"
  >(() => {
    if (isLoggedIn && walletBalance > 0) return "WALLET";
    if (paymentMethods.length > 0) return "INSTANT";
    if (uddoktaPayEnabled) return "UDDOKTAPAY";
    return "INSTANT";
  });

  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(
    paymentMethods[0]?.id || null
  );
  const [uddoktaPayLoading, setUddoktaPayLoading] = useState(false);

  const selectedVariant = product.variants.find(
    (v) => v.id === selectedVariantId
  );

  const unitPrice = selectedVariant
    ? selectedVariant.salePrice ?? selectedVariant.price
    : 0;
  const totalAmount = unitPrice * quantity;
  const originalUnitPrice = selectedVariant?.price ?? 0;
  const originalTotal = originalUnitPrice * quantity;
  const savings = originalTotal - totalAmount;

  const hasEnoughWallet = isLoggedIn && walletBalance >= totalAmount;

  const maxQuantity =
    selectedVariant?.unlimitedStock || selectedVariant?.stock === null
      ? 100
      : Math.min(100, selectedVariant?.stock ?? 1);

  const handleFieldChange = (name: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    for (const field of product.fields) {
      const val = fieldValues[field.name] || "";
      if (field.required && !val.trim()) {
        errors[field.name] = `${field.label} দিতে হবে`;
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateVariantAndFields = (): {
    ok: boolean;
    message?: string;
  } => {
    if (!selectedVariant) {
      return { ok: false, message: "একটা package select করুন" };
    }

    const isOutOfStock =
      !selectedVariant.unlimitedStock &&
      selectedVariant.stock !== null &&
      selectedVariant.stock <= 0;

    if (isOutOfStock) {
      return { ok: false, message: "এই package stock-এ নেই" };
    }

    if (!validate()) {
      return { ok: false, message: "সব required field পূরণ করুন" };
    }

    return { ok: true };
  };

  const redirectToLogin = () => {
    if (!selectedVariant) return;
    const params = new URLSearchParams({
      variantId: selectedVariant.id,
      quantity: String(quantity),
      ...fieldValues,
    });
    router.push(
      `/login?callbackUrl=${encodeURIComponent(
        `/products/${product.slug}?${params.toString()}`
      )}`
    );
  };

  const [walletSubmitting, setWalletSubmitting] = useState(false);

const handleGoPayment = async () => {
  const validation = validateVariantAndFields();
  if (!validation.ok) {
    toast.error(validation.message || "Validation failed");
    return;
  }

  if (paymentChoice === "INSTANT" && !selectedMethodId) {
    toast.error("Payment method select করুন");
    return;
  }

  if (paymentChoice === "WALLET" && !hasEnoughWallet) {
    toast.error("Wallet-এ যথেষ্ট balance নেই");
    return;
  }

  if (!isLoggedIn) {
    toast.error("Login করুন");
    redirectToLogin();
    return;
  }

  // ==================================================
  // WALLET — Direct order (skip checkout)
  // ==================================================
  if (paymentChoice === "WALLET") {
    if (walletSubmitting) return;
    setWalletSubmitting(true);

    try {
      const formData = new FormData();
      formData.set("variantId", selectedVariant!.id);
      formData.set("quantity", String(quantity));
      formData.set("paymentType", "wallet");
      formData.set("fields", JSON.stringify(fieldValues));

      const result = await createOrderFromProductAction(formData);

      if (result.success && result.orderNumber) {
        toast.success("Order সফলভাবে তৈরি হয়েছে!");
        router.push(`/order/${result.orderNumber}`);
        router.refresh();
      } else {
        toast.error(result.message || "Order failed");
      }
    } catch (error) {
      console.error("Wallet order error:", error);
      toast.error("কিছু ভুল হয়েছে");
    } finally {
      setWalletSubmitting(false);
    }

    return;
  }

  // ==================================================
  // INSTANT — Checkout page (existing flow)
  // ==================================================
  const params = new URLSearchParams({
    variantId: selectedVariant!.id,
    quantity: String(quantity),
    paymentType: "instant",
  });

  if (selectedMethodId) {
    params.set("methodId", selectedMethodId);
  }

  Object.entries(fieldValues).forEach(([k, v]) => {
    if (v) params.set(k, v);
  });

  router.push(`/pay/${selectedVariant!.id}?${params.toString()}`);
};

  const handleUddoktaPay = async () => {
    if (uddoktaPayLoading) return;

    const validation = validateVariantAndFields();
    if (!validation.ok) {
      toast.error(validation.message || "Validation failed");
      return;
    }

    if (!isLoggedIn) {
      toast.error("Login করুন");
      redirectToLogin();
      return;
    }

    setUddoktaPayLoading(true);

    try {
      const result = await createUddoktaPaySessionAction({
        variantId: selectedVariant!.id,
        quantity,
        fields: fieldValues,
      });

      if (result.success && result.paymentUrl) {
        toast.success("Redirecting to payment gateway...");
        setTimeout(() => {
          window.location.href = result.paymentUrl!;
        }, 400);
      } else {
        toast.error(result.message || "Payment initialization failed");
        setUddoktaPayLoading(false);
      }
    } catch (error) {
      console.error("UddoktaPay error:", error);
      toast.error("কিছু ভুল হয়েছে");
      setUddoktaPayLoading(false);
    }
  };

  const totalReviews = product.reviews.length;
  const averageRating = useMemo(
    () =>
      totalReviews > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0,
    [product.reviews, totalReviews]
  );

  const keyFeatures = {
    game: product.category?.name || "N/A",
    type: product.productType || "Digital",
    delivery: "Instant",
    region: "Global",
    availability:
      !selectedVariant ||
      selectedVariant.unlimitedStock ||
      (selectedVariant.stock !== null && selectedVariant.stock > 0)
        ? "In Stock"
        : "Out of Stock",
  };

  const canProceed =
    !!selectedVariant &&
    (paymentChoice === "WALLET" ? hasEnoughWallet : !!selectedMethodId);

  const isUddoktaPay = paymentChoice === "UDDOKTAPAY" && uddoktaPayEnabled;
  const isWalletChoice = paymentChoice === "WALLET";
  const buttonLoading = isWalletChoice ? walletSubmitting : uddoktaPayLoading;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      {/* ============================================
          PRODUCT HEADER (Hero)
          ============================================ */}
      <ProductHeader
        name={product.name}
        categoryName={product.category?.name}
        icon={product.icon}
        thumbnail={product.thumbnail}
        rating={averageRating}
        reviewCount={totalReviews}
        region="BD"
        soldCount={product.soldCount}
        badges={[
          {
            text: product.badge1Text ?? null,
            icon: product.badge1Icon ?? null,
            color: product.badge1Color ?? null,
          },
          {
            text: product.badge2Text ?? null,
            icon: product.badge2Icon ?? null,
            color: product.badge2Color ?? null,
          },
          {
            text: product.badge3Text ?? null,
            icon: product.badge3Icon ?? null,
            color: product.badge3Color ?? null,
          },
        ]}
      />

      {/* ============================================
          MAIN GRID
          LEFT: Package Selector + Tabs
          RIGHT: Quantity + Account + Payment + Total
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-5 lg:gap-6 items-start mt-5">
        {/* ============================================
            LEFT COLUMN
            ============================================ */}
        <div className="order-2 lg:order-1 space-y-5">
          {/* Package Selector — Desktop only (mobile এ right column এ থাকবে) */}
          {product.variants.length > 0 && (
            <div className="hidden lg:block">
              <PackageSelector
                variants={product.variants}
                selectedId={selectedVariantId}
                onSelect={setSelectedVariantId}
              />
            </div>
          )}

          {/* Tabs — Description, How It Works, Reviews */}
          <ProductTabs
            reviewCount={totalReviews}
            keyFeatures={keyFeatures}
            description={
              product.fullDesc ? (
                <div>
                  <h3 className="text-base font-bold text-text-primary mb-3">
                    About {product.name}
                  </h3>
                  <div className="whitespace-pre-wrap mb-5">
                    {product.fullDesc}
                  </div>
                  <h4 className="text-sm font-bold text-text-primary mb-2">
                    Why Choose Us?
                  </h4>
                  <ul className="space-y-1.5 text-text-secondary">
                    <li>✓ Instant top-up (usually within 1-5 minutes)</li>
                    <li>✓ 100% safe and secure payment process</li>
                    <li>✓ Best price in the market</li>
                    <li>✓ 24/7 customer support</li>
                  </ul>
                </div>
              ) : (
                <p className="text-text-muted">
                  Description will be available soon.
                </p>
              )
            }
            howItWorks={<HowItWorks />}
            reviews={
              <ProductReviews
                productId={product.id}
                productName={product.name}
                reviews={product.reviews}
                totalReviews={totalReviews}
                averageRating={averageRating}
                isLoggedIn={isLoggedIn}
                hasReviewed={false}
              />
            }
          />
        </div>

        {/* ============================================
            RIGHT COLUMN — Purchase Panel
            ============================================ */}
        <div className="order-1 lg:order-2 space-y-4">
          {/* Package Selector — Mobile only */}
          {product.variants.length > 0 && (
            <div className="lg:hidden">
              <PackageSelector
                variants={product.variants}
                selectedId={selectedVariantId}
                onSelect={setSelectedVariantId}
              />
            </div>
          )}

          {/* Quantity */}
          {selectedVariant && (
            <QuantitySelector
              quantity={quantity}
              onQuantityChange={setQuantity}
              maxQuantity={maxQuantity}
              isUnlimited={selectedVariant.unlimitedStock}
              stockCount={selectedVariant.stock}
            />
          )}

          {/* Account Info — Step 2 */}
          <AccountInfoFields
            fields={product.fields}
            values={fieldValues}
            onChange={handleFieldChange}
            errors={fieldErrors}
          />

          {/* Payment Method — Step 3 */}
          <PaymentMethodCards
            isLoggedIn={isLoggedIn}
            walletBalance={walletBalance}
            totalAmount={totalAmount}
            hasEnoughWallet={hasEnoughWallet}
            paymentMethods={paymentMethods.map((pm) => ({
              id: pm.id,
              name: pm.name,
              slug: pm.slug,
              logo: pm.logo,
            }))}
            uddoktaPayEnabled={uddoktaPayEnabled}
            selected={paymentChoice}
            onSelect={setPaymentChoice}
            selectedMethodId={selectedMethodId}
            onMethodSelect={setSelectedMethodId}
          />

          {/* Total + CTA */}
          <div className="space-y-3">
            {/* Total */}
            <div className="bg-bg-card border border-border rounded-2xl p-4">
              {savings > 0 && (
                <>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-text-muted">Original</span>
                    <DualPrice
                      amountBDT={originalTotal}
                      size="sm"
                      layout="inline"
                      primaryClassName="text-text-muted line-through"
                      secondaryClassName="hidden"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-success font-medium">
                      Discount
                    </span>
                    <span className="text-success font-semibold">
                      −৳{savings.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-border my-2" />
                </>
              )}

              <div className="flex items-baseline justify-between">
                <span className="text-sm text-text-muted font-medium">
                  Total
                </span>
                <DualPrice
                  amountBDT={totalAmount}
                  size="lg"
                  layout="stacked"
                  primaryClassName="text-primary"
                />
              </div>
            </div>

            {/* CTA Button */}
            {isUddoktaPay ? (
  <button
    type="button"
    onClick={handleUddoktaPay}
    disabled={uddoktaPayLoading}
    className="w-full bg-gradient-primary text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] text-base"
  >
    {uddoktaPayLoading ? (
      <Loader2 className="w-5 h-5 animate-spin" />
    ) : (
      <Zap className="w-5 h-5" />
    )}
    {uddoktaPayLoading ? "Redirecting..." : "Pay Now"}
  </button>
) : (
  <button
    type="button"
    onClick={handleGoPayment}
    disabled={!canProceed || walletSubmitting}
    className="w-full bg-gradient-primary text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] text-base"
  >
    {isWalletChoice && walletSubmitting ? (
      <>
        <Loader2 className="w-5 h-5 animate-spin" />
        Processing...
      </>
    ) : isWalletChoice ? (
      <>
        <ShoppingBag className="w-5 h-5" />
        Pay with Wallet
        <ArrowRight className="w-5 h-5" />
      </>
    ) : (
      <>
        <ShoppingBag className="w-5 h-5" />
        Proceed to Payment
        <ArrowRight className="w-5 h-5" />
      </>
    )}
  </button>
)}

            {/* Trust line */}
            <div className="flex items-center justify-center gap-3 text-[11px] text-text-muted">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-success" />
                Secure
              </span>
              <span className="w-1 h-1 rounded-full bg-text-dim" />
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-warning" />
                Instant
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          TRUST BAR — Full width
          ============================================ */}
      <div className="mt-5">
        <TrustBar />
      </div>

      {/* ============================================
          TERMS (if any)
          ============================================ */}
      {product.terms && (
        <section className="mt-8 bg-bg-card border border-border rounded-2xl p-5 sm:p-6">
          <h2 className="text-base font-bold text-text-primary mb-3">
            Terms & Conditions
          </h2>
          <div className="text-sm text-text-muted whitespace-pre-wrap leading-relaxed">
            {product.terms}
          </div>
        </section>
      )}
    </div>
  );
}