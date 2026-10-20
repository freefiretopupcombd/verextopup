import Link from "next/link";
import { ChevronRight, HelpCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";

export async function PopularFaqs() {
  const faqs = await prisma.fAQ.findMany({
    where: {
      status: "ACTIVE",
      scope: { in: ["GLOBAL", "SUPPORT"] },
    },
    orderBy: [{ sortOrder: "asc" }],
    take: 8,
  });

  if (faqs.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
          Popular Questions
        </h2>
        <p className="text-text-muted text-sm mt-1">
          সবার বেশি জিজ্ঞাসিত প্রশ্ন
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {faqs.map((faq) => (
          <details
            key={faq.id}
            className="group bg-bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition"
          >
            <summary className="flex items-center justify-between gap-3 p-4 cursor-pointer list-none">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <span className="font-medium text-sm text-text-primary">
                  {faq.question}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted shrink-0 group-open:rotate-90 transition" />
            </summary>
            <div className="px-4 pb-4 pt-0 text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>

      <div className="text-center mt-6">
        <Link
          href="/support/faq"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
        >
          সব FAQ দেখুন →
        </Link>
      </div>
    </div>
  );
}