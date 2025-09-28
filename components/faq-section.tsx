import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FaqSection() {
  const faqs = [
    {
      question: "Como funciona o processo de cadastro?",
      answer:
        "O cadastro é simples e rápido. Para candidatos, basta criar um perfil com suas informações profissionais e preferências. Para empresas, é necessário verificar a conta e descrever as vagas disponíveis. Todo o processo leva menos de 5 minutos.",
    },
    {
      question: "A plataforma é gratuita?",
      answer:
        "Sim! Para candidatos, a plataforma é 100% gratuita. Para empresas, oferecemos um plano gratuito com funcionalidades básicas e planos premium com recursos avançados de recrutamento e análise.",
    },
    {
      question: "Como vocês garantem a qualidade das vagas?",
      answer:
        "Todas as empresas passam por um processo de verificação. Analisamos a legitimidade da empresa, histórico e qualidade das vagas oferecidas. Vagas suspeitas são removidas automaticamente.",
    },
    {
      question: "Posso editar meu perfil depois do cadastro?",
      answer:
        "Claro! Você pode atualizar seu perfil a qualquer momento, incluindo experiências, habilidades, preferências salariais e localização. Recomendamos manter o perfil sempre atualizado para melhores matches.",
    },
    {
      question: "Como funciona o algoritmo de matching?",
      answer:
        "Nosso algoritmo analisa múltiplos fatores: habilidades, experiência, localização, preferências salariais, cultura da empresa e histórico de contratações. Isso garante matches mais precisos e relevantes.",
    },
    {
      question: "Oferecem suporte durante o processo seletivo?",
      answer:
        "Sim! Nossa equipe oferece suporte completo, desde dicas para otimizar seu perfil até orientações durante entrevistas. Para empresas, auxiliamos na criação de vagas atrativas e processo seletivo eficiente.",
    },
  ]

  return (
    <section id="faq" className="py-20">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-balance">Perguntas Frequentes</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Tire suas dúvidas sobre como funciona nossa plataforma e como podemos ajudar você a alcançar seus objetivos
            profissionais.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
