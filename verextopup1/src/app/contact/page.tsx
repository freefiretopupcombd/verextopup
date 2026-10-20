import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

import { ContactForm } from "@/modules/support/components/contact-form";

export const metadata: Metadata = {
  title: "Contact Us — VerexTopUp",
  description: "আমাদের সাথে যোগাযোগ করুন",
};

export default function ContactPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">
          Contact Us
        </h1>
        <p className="text-text-muted mt-2 max-w-lg mx-auto">
          আমাদের সাথে যোগাযোগ করুন — আমরা ২৪ ঘণ্টার মধ্যে reply করি
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Form */}
        <div>
          <ContactForm />
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <div className="bg-bg-card border border-border rounded-xl p-5">
            <h2 className="font-bold text-text-primary text-sm mb-4">
              Contact Information
            </h2>

            <div className="space-y-4">
              <a
                href="mailto:support@verextopup.com"
                className="flex items-start gap-3 group"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-text-muted">Email</div>
                  <div className="text-sm text-text-primary font-medium group-hover:text-primary transition truncate">
                    support@verextopup.com
                  </div>
                </div>
              </a>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-success/10 text-success flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-text-muted">Phone</div>
                  <div className="text-sm text-text-primary font-medium">
                    +880 1700-000000
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-text-muted">Address</div>
                  <div className="text-sm text-text-primary font-medium">
                    Dhaka, Bangladesh
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-warning/10 text-warning flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-text-muted">Support Hours</div>
                  <div className="text-sm text-text-primary font-medium">
                    24/7 Online
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
            <p className="text-xs text-text-secondary leading-relaxed">
              💡 <strong className="text-text-primary">দ্রুত response পেতে:</strong>{" "}
              Order-related সমস্যার জন্য <strong>ticket</strong> খুলুন (order
              link সহ)। General প্রশ্নের জন্য এই form ব্যবহার করুন।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}