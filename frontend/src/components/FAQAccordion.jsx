import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FAQS } from "@/lib/content";

export default function FAQAccordion() {
  return (
    <div className="max-w-3xl mx-auto" data-testid="faq-accordion">
      <Accordion type="single" collapsible className="w-full">
        {FAQS.map((f, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="border-b border-stone-200">
            <AccordionTrigger
              data-testid={`faq-q-${i}`}
              className="font-serif text-left text-base sm:text-lg py-5 hover:no-underline text-[#1C1C1C]"
            >
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-[15px] text-stone-700 leading-relaxed pb-5">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
    </div>
  );
}
