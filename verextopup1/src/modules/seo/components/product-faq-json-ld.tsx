// ==================================================
// Product FAQ JSON-LD
// ==================================================
// Injects FAQPage schema for products that have FAQs.
// Google shows these as expandable FAQ rich results in SERP.
//
// Only renders if there are actual FAQs — empty schema
// can be flagged as spam by Google.
// ==================================================

type FaqItem = {
  question: string;
  answer: string;
};

type ProductFaqJsonLdProps = {
  faqs: FaqItem[];
};

export function ProductFaqJsonLd({ faqs }: ProductFaqJsonLdProps) {
  // Skip if no FAQs — empty FAQPage schema is a spam signal
  if (!faqs || faqs.length === 0) {
    return null;
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const jsonLd = JSON.stringify(schema);

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}