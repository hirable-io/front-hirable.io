"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Plus } from "lucide-react"
import { toast } from "sonner"

const jobSchema = z.object({
  title: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
  description: z.string().min(50, "Descrição deve ter pelo menos 50 caracteres"),
  location: z.string().min(3, "Localização é obrigatória"),
  type: z.string().min(1, "Tipo de contrato é obrigatório"),
  salary: z.string().optional(),
  requirements: z.string().min(10, "Requisitos devem ter pelo menos 10 caracteres"),
})

type JobForm = z.infer<typeof jobSchema>

export default function NewJobPage() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      type: "",
      salary: "",
      requirements: "",
    },
  })

  const onSubmit = async (data: JobForm) => {
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      console.log("[v0] New job data:", data)

      toast.success("Vaga criada com sucesso!", {
        description: "Sua vaga foi publicada e já está disponível para candidatos.",
      })

      form.reset()
    } catch (error) {
      toast.error("Erro ao criar vaga", {
        description: "Tente novamente em alguns instantes.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-primary-foreground font-bold">V</span>
              </div>
              <span className="font-bold text-xl text-foreground">Hirable.io</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard/employer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link href="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
                Perfil da Empresa
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                Configurações
              </Button>
              <Button size="sm">Sair</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link
            href="/dashboard/employer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Criar Nova Vaga</h1>
          <p className="text-muted-foreground">Preencha as informações da vaga para atrair os melhores candidatos</p>
        </div>
        <Card className="border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Informações da Vaga
            </CardTitle>
            <CardDescription>Forneça detalhes claros e atrativos sobre a posição</CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título da Vaga *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Desenvolvedor Frontend React" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Localização *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: São Paulo, SP ou Remoto" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Contrato *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CLT">CLT</SelectItem>
                            <SelectItem value="PJ">PJ</SelectItem>
                            <SelectItem value="Estágio">Estágio</SelectItem>
                            <SelectItem value="Freelancer">Freelancer</SelectItem>
                            <SelectItem value="Temporário">Temporário</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faixa Salarial (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: R$ 5.000 - R$ 8.000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição da Vaga *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva as responsabilidades, objetivos e o que a empresa oferece..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requisitos e Qualificações *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Liste os requisitos técnicos, experiência necessária, habilidades desejadas..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center gap-4 pt-6">
                  <Button
                    type="submit"
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                        Publicando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Publicar Vaga
                      </>
                    )}
                  </Button>

                  <Button type="button" variant="outline" onClick={() => form.reset()}>
                    Limpar Formulário
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
