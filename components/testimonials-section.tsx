import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Ana Silva",
      role: "Desenvolvedora Frontend",
      company: "TechCorp",
      content:
        "Encontrei minha vaga dos sonhos em apenas 2 semanas! O processo foi super simples e as oportunidades eram realmente compatíveis com meu perfil.",
      rating: 5,
    },
    {
      name: "Carlos Mendes",
      role: "Gerente de RH",
      company: "StartupXYZ",
      content:
        "Como empresa, conseguimos contratar 3 desenvolvedores excelentes em 1 mês. A qualidade dos candidatos é impressionante.",
      rating: 5,
    },
    {
      name: "Mariana Costa",
      role: "Designer UX/UI",
      company: "Creative Agency",
      content:
        "A plataforma é intuitiva e o suporte é excepcional. Recomendo para qualquer profissional que busca novas oportunidades.",
      rating: 5,
    },
  ]

  return (
    <section id="depoimentos" className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-balance">O que nossos usuários dizem</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Milhares de profissionais e empresas já transformaram suas carreiras e equipes com a Hirable.io.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <blockquote className="text-sm leading-relaxed mb-6 flex-grow">"{testimonial.content}"</blockquote>

                <div className="mt-auto">
                  <div className="font-semibold text-sm">{testimonial.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {testimonial.role} • {testimonial.company}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
