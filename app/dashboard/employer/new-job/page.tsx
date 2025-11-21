"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, X, Plus, Search } from "lucide-react"
import { toast } from "sonner"
import { tagService, type Tag, type ApiError } from "@/lib/services/tag-service"
import { vacancyService } from "@/lib/services/vacancy-service"
import { cn } from "@/lib/utils"

// Schema de validação
const jobSchema = z
  .object({
    title: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
    description: z.string().min(50, "Descrição deve ter pelo menos 50 caracteres"),
    location: z.string().min(3, "Localização é obrigatória"),
    modality: z.enum(["REMOTE", "HYBRID", "ONSITE"], {
      errorMap: () => ({ message: "Modalidade é obrigatória" }),
    }),
    minimumSalaryValue: z.number().min(0, "Salário mínimo deve ser maior ou igual a 0"),
    maximumSalaryValue: z.number().min(0, "Salário máximo deve ser maior ou igual a 0"),
    tags: z
      .array(
        z.object({
          id: z.number(),
          name: z.string(),
        }),
      )
      .optional(),
  })
  .refine((data) => data.maximumSalaryValue >= data.minimumSalaryValue, {
    message: "Salário máximo deve ser maior ou igual ao salário mínimo",
    path: ["maximumSalaryValue"],
  })

type JobForm = z.infer<typeof jobSchema>

export default function NewJobPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [tagSearch, setTagSearch] = useState("") // Estado para o filtro de texto
  const router = useRouter()

  const form = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      modality: "REMOTE" as const,
      minimumSalaryValue: 0,
      maximumSalaryValue: 0,
      tags: [],
    },
  })

  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await tagService.getTags()
        setAvailableTags(Array.isArray(tags) ? tags : [])
      } catch (error) {
        console.error("Erro ao carregar tags:", error)
        setAvailableTags([])
      }
    }
    loadTags()
  }, [])

  const onSubmit = async (data: JobForm) => {
    setIsLoading(true)
    try {
      await vacancyService.createVacancy(data)
      toast.success("Vaga criada com sucesso!", {
        description: "Sua vaga foi publicada e já está disponível para candidatos.",
      })
      router.push("/dashboard/employer")
    } catch (error) {
      const apiError = error as ApiError
      if (apiError.status === 401) {
        router.push("/auth/login")
      } else {
        toast.error("Erro ao criar vaga", {
          description: apiError.message || "Tente novamente em alguns instantes.",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Filtra as tags disponíveis baseada na busca e remove as já selecionadas da lista
  const filterAvailableTags = (currentSelected: Tag[]) => {
    return availableTags.filter(
      (tag) =>
        !currentSelected.some((selected) => selected.id === tag.id) &&
        tag.name.toLowerCase().includes(tagSearch.toLowerCase()),
    )
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
                    name="modality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modalidade *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a modalidade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="REMOTE">Remoto</SelectItem>
                            <SelectItem value="HYBRID">Híbrido</SelectItem>
                            <SelectItem value="ONSITE">Presencial</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="minimumSalaryValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salário Mínimo (R$) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Ex: 5000"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maximumSalaryValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salário Máximo (R$) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Ex: 8000"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição da Vaga *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva as responsabilidades, objetivos e o que a empresa oferece..."
                          className="min-h-[120px] max-h-[300px] resize-none overflow-y-auto"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* NOVA ABORDAGEM DE TAGS: SEM POPOVER, TOTALMENTE INLINE */}
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-3">
                      <FormLabel>Tags e Tecnologias</FormLabel>
                      
                      {/* 1. Área de Tags Selecionadas */}
                      <div className={cn(
                        "min-h-[42px] p-2 rounded-md border bg-background flex flex-wrap gap-2",
                        (!field.value || field.value.length === 0) && "justify-center items-center border-dashed"
                      )}>
                        {(!field.value || field.value.length === 0) && (
                          <span className="text-muted-foreground text-sm italic">Nenhuma tag selecionada</span>
                        )}
                        {field.value?.map((tag) => (
                          <Badge key={tag.id} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                            {tag.name}
                            <button
                              type="button"
                              onClick={() => field.onChange(field.value?.filter((t) => t.id !== tag.id))}
                              className="hover:bg-destructive/20 hover:text-destructive rounded-full p-0.5 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>

                      {/* 2. Área de Busca e Sugestões */}
                      <div className="border rounded-md overflow-hidden">
                        <div className="bg-muted/30 p-2 border-b flex items-center gap-2">
                          <Search className="h-4 w-4 text-muted-foreground" />
                          <input
                            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
                            placeholder="Filtrar tags disponíveis..."
                            value={tagSearch}
                            onChange={(e) => setTagSearch(e.target.value)}
                            // Impede que o Enter envie o formulário neste campo
                            onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault(); }}
                          />
                        </div>
                        
                        <div className="p-2 max-h-[180px] overflow-y-auto bg-card">
                          <div className="flex flex-wrap gap-2">
                            {filterAvailableTags(field.value || []).map((tag) => (
                              <Badge
                                key={tag.id}
                                variant="outline"
                                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors py-1 pl-1 pr-2 flex items-center gap-1"
                                onClick={() => {
                                  const current = field.value || []
                                  field.onChange([...current, tag])
                                  setTagSearch("") // Limpa busca após selecionar
                                }}
                              >
                                <Plus className="h-3 w-3" />
                                {tag.name}
                              </Badge>
                            ))}
                            {filterAvailableTags(field.value || []).length === 0 && (
                              <span className="text-sm text-muted-foreground p-2 w-full text-center">
                                {tagSearch ? "Nenhuma tag encontrada com esse nome." : "Todas as tags disponíveis já foram selecionadas."}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

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