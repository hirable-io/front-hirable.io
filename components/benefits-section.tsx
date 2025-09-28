import { Card, CardContent } from "@/components/ui/card"
import { Search, Zap, Shield, Target, Users, TrendingUp } from "lucide-react"

export function BenefitsSection() {
  const benefits = [
    {
      icon: Search,
      title: "Busca Inteligente",
      description: "Algoritmo avançado que encontra as vagas mais compatíveis com seu perfil profissional.",
    },
    {
      icon: Zap,
      title: "Cadastro Rápido",
      description: "Processo simplificado de cadastro em menos de 3 minutos para candidatos e empresas.",
    },
    {
      icon: Shield,
      title: "Segurança Total",
      description: "Seus dados protegidos com criptografia de ponta e verificação de empresas.",
    },
    {
      icon: Target,
      title: "Match Preciso",
      description: "Conectamos você apenas com oportunidades que fazem sentido para sua carreira.",
    },
    {
      icon: Users,
      title: "Rede Qualificada",
      description: "Acesso a uma rede de profissionais e empresas verificadas e de qualidade.",
    },
    {
      icon: TrendingUp,
      title: "Crescimento Contínuo",
      description: "Ferramentas e insights para impulsionar sua carreira ou encontrar os melhores talentos.",
    },
  ]

  return (
    <section id="beneficios" className="py-20">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-balance">Por que escolher a Hirable.io?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Oferecemos a melhor experiência tanto para candidatos quanto para empresas, com tecnologia de ponta e foco
            em resultados.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                  <benefit.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
