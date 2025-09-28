import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background py-32 lg:py-40">
      <div className="container">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-8 text-5xl font-bold tracking-tight text-balance lg:text-7xl">
            A solução <span className="text-primary">definitiva</span>
            <br />
            para suas vagas
          </h1>

          <p className="mb-12 text-xl text-muted-foreground text-pretty max-w-3xl mx-auto leading-relaxed">
            Plataforma completa para conectar talentos com oportunidades. Cadastro rápido, busca inteligente e
            resultados garantidos.
          </p>

          <div className="flex justify-center mb-16">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 py-3 group"
            >
              Solicitar acesso
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <div className="relative mx-auto max-w-5xl">
            <div className="rounded-lg border border-border bg-card/50 backdrop-blur-sm p-1">
              <div className="aspect-video rounded-md bg-muted/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold text-xl">V</span>
                  </div>
                  <p className="text-muted-foreground">Interface da plataforma</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
