import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, MessageSquare, Mail, ArrowRight } from "lucide-react";

import { FAQAccordion } from "@/modules/support/components/faq-accordion";

export const metadata: Metadata = {
  title: "FAQ — VerexTopUp",
  description: "সাধারণ প্রশ্ন এবং উত্তর",
};

const faqData = [
  {
    category: "Order & Delivery",
    items: [
      {
        q: "Order করার পর কতক্ষণে delivery পাব?",
        a: "সাধারণত ৩০ সেকেন্ড থেকে ৫ মিনিটের মধ্যে delivery পেয়ে যাবেন। Automatic delivery-এর ক্ষেত্রে instantaneous, manual delivery-এর ক্ষেত্রে ৫-৩০ মিনিট লাগতে পারে।",
      },
      {
        q: "Order status কীভাবে check করব?",
        a: "Login করে /account/orders-এ যান। সেখানে সব order-এর status দেখতে পাবেন। কোনো order-এ click করে বিস্তারিত দেখতে পারবেন।",
      },
      {
        q: "ভুল Player ID দিলে কী হবে?",
        a: "সাথে সাথে support ticket খুলুন। যদি order processing না হয়ে থাকে, আমরা cancel করে refund দিতে পারব। Order complete হলে refund করা সম্ভব নাও হতে পারে।",
      },
      {
        q: "কোন product কিনতে কী লাগবে?",
        a: "শুধু আপনার game/account-এর ID লাগবে। Login করার পর product page-এ required fields দেখতে পাবেন।",
      },
    ],
  },
  {
    category: "Payment",
    items: [
      {
        q: "কী কী payment method আছে?",
        a: "আমরা bKash, Nagad, Rocket, Binance Pay, USDT (TRC20/ERC20/BEP20) এবং Wallet payment support করি।",
      },
      {
        q: "Payment করার পর verify হতে কতক্ষণ লাগে?",
        a: "সাধারণত ৫-৩০ মিনিটের মধ্যে admin verify করে। Business hours-এ দ্রুত, রাতে একটু দেরি হতে পারে।",
      },
      {
        q: "Payment verify হচ্ছে না কেন?",
        a: "সম্ভবত আপনি ভুল transaction ID দিয়েছেন অথবা screenshot clear না। Support ticket খুলে আমাদের জানান, আমরা দ্রুত check করব।",
      },
      {
        q: "Refund পাব কীভাবে?",
        a: "Order cancel হলে wallet-এ refund করা হয়। Wallet balance দিয়ে আবার order করতে পারবেন অথবা withdraw request করতে পারবেন।",
      },
    ],
  },
  {
    category: "Wallet",
    items: [
      {
        q: "Wallet-এ কীভাবে balance add করব?",
        a: "/account/wallet-এ যান → 'Recharge Now' click করুন → Amount এবং payment method select করে payment করুন। Admin verify করার পর balance add হবে।",
      },
      {
        q: "Wallet minimum recharge কত?",
        a: "সর্বনিম্ন ৳৫০ এবং সর্বোচ্চ ৳১,০০,০০০ recharge করা যায়।",
      },
      {
        q: "Wallet balance USDT-তে দেখাচ্ছে কেন?",
        a: "আমাদের site-এ dual currency system আছে। উপরের toggle থেকে ৳ BDT এবং USDT-এর মধ্যে switch করতে পারবেন।",
      },
    ],
  },
  {
    category: "Account & Security",
    items: [
      {
        q: "Password ভুলে গেলে কী করব?",
        a: "Login page-এ 'Password ভুলে গেছেন?' link-এ click করুন। Email-এ reset link পাঠানো হবে।",
      },
      {
        q: "Account delete করা যাবে?",
        a: "Support ticket খুলে account delete-এর request করুন। আমরা ৭ দিনের মধ্যে process করব।",
      },
      {
        q: "একই email দিয়ে multiple account খোলা যাবে?",
        a: "না, এক email দিয়ে একটাই account খোলা যাবে।",
      },
    ],
  },
  {
    category: "Support",
    items: [
      {
        q: "কীভাবে support পাব?",
        a: "৩টা উপায়ে: (১) /account/support-এ ticket খুলুন, (২) support@verextopup.com-এ email পাঠান, (৩) /contact থেকে message পাঠান।",
      },
      {
        q: "Support response time কত?",
        a: "সাধারণত ২৪ ঘণ্টার মধ্যে reply পাবেন। Urgent issue হলে ticket-এ priority mention করুন।",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/15 text-primary flex items-center justify-center mb-4">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">
          Help Center
        </h1>
        <p className="text-text-muted mt-2 max-w-lg mx-auto">
          সাধারণ প্রশ্ন এবং উত্তর খুঁজুন। আপনার উত্তর না পেলে support-এ যোগাযোগ করুন।
        </p>
      </div>

      {/* FAQ Categories */}
      <div className="space-y-8">
        {faqData.map((category, i) => (
          <div key={i}>
            <h2 className="text-lg sm:text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              {category.category}
            </h2>
            <FAQAccordion items={category.items} />
          </div>
        ))}
      </div>

      {/* Still need help */}
      <div className="mt-12 bg-bg-card border border-border rounded-2xl p-6 sm:p-8 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">
          এখনো সাহায্য দরকার?
        </h2>
        <p className="text-sm text-text-muted mb-6 max-w-md mx-auto">
          আমাদের support team ২৪/৭ খোলা। যেকোনো সময় যোগাযোগ করুন।
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/account/support"
            className="inline-flex items-center justify-center gap-2 bg-gradient-primary text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            <MessageSquare className="w-4 h-4" />
            Support Ticket
          </Link>
          <a
            href="mailto:support@verextopup.com"
            className="inline-flex items-center justify-center gap-2 bg-bg-secondary border border-border hover:border-primary text-text-primary font-medium px-6 py-3 rounded-lg transition"
          >
            <Mail className="w-4 h-4" />
            Email Support
          </a>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 bg-bg-secondary border border-border hover:border-primary text-text-primary font-medium px-6 py-3 rounded-lg transition"
          >
            <ArrowRight className="w-4 h-4" />
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}