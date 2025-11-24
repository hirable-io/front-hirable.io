"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Save, X, Plus, Search } from "lucide-react"
import { toast } from "sonner"
import { tagService, type Tag, type ApiError } from "@/lib/services/tag-service"
import { vacancyService, type VacancyResponse, type UpdateVacancyFormData } from "@/lib/services/vacancy-service"
import { cn } from "@/lib/utils"

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

interface VacancyEditDialogProps {
  vacancy: VacancyResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function VacancyEditDialog({ vacancy, open, onOpenChange, onSuccess }: VacancyEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [tagSearch, setTagSearch] = useState("")
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
    if (open) {
      loadTags()
    }
  }, [open])

  useEffect(() => {
    if (vacancy && open) {
      form.reset({
        title: vacancy.title,
        description: vacancy.description,
        location: vacancy.location,
        modality: vacancy.modality as "REMOTE" | "HYBRID" | "ONSITE",
        minimumSalaryValue: vacancy.minimumSalaryValue,
        maximumSalaryValue: vacancy.maximumSalaryValue,
        tags: vacancy.tags || [],
      })
      setTagSearch("")
    }
  }, [vacancy, open, form])

  const onSubmit = async (data: JobForm) => {
    if (!vacancy) return

    setIsLoading(true)
    try {
      const updateData: UpdateVacancyFormData = {
        title: data.title,
        description: data.description,
        location: data.location,
        modality: data.modality,
        minimumSalaryValue: data.minimumSalaryValue,
        maximumSalaryValue: data.maximumSalaryValue,
        status: vacancy.status as 'OPEN' | 'CLOSED', // Manter o status atual da vaga
        tags: data.tags,
      }

      await vacancyService.updateVacancy(vacancy.id, updateData)
      
      toast.success("Vaga atualizada com sucesso!", {
        description: "As alterações foram salvas e já estão disponíveis.",
      })
      
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      const apiError = error as ApiError
      if (apiError.status === 401) {
        router.push("/auth/login")
      } else {
        toast.error("Erro ao atualizar vaga", {
          description: apiError.message || "Tente novamente em alguns instantes.",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const filterAvailableTags = (currentSelected: Tag[]) => {
    return availableTags.filter(
      (tag) =>
        !currentSelected.some((selected) => selected.id === tag.id) &&
        tag.name.toLowerCase().includes(tagSearch.toLowerCase()),
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Editar Vaga</DialogTitle>
          <DialogDescription>
            Atualize as informações da vaga. Todos os campos são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col max-h-[calc(90vh-8rem)]">
            <div className="overflow-y-auto flex-1 space-y-6 pr-2">
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
                    <Select onValueChange={field.onChange} value={field.value}>
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

            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-3">
                  <FormLabel>Tags e Tecnologias</FormLabel>
                  
                  {/* Área de Tags Selecionadas */}
                  <div
                    className={cn(
                      "min-h-[42px] p-2 rounded-md border bg-background flex flex-wrap gap-2",
                      (!field.value || field.value.length === 0) && "justify-center items-center border-dashed",
                    )}
                  >
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

                  {/* Área de Busca e Sugestões */}
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-muted/30 p-2 border-b flex items-center gap-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <input
                        className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
                        placeholder="Filtrar tags disponíveis..."
                        value={tagSearch}
                        onChange={(e) => setTagSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.preventDefault()
                        }}
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
                              setTagSearch("")
                            }}
                          >
                            <Plus className="h-3 w-3" />
                            {tag.name}
                          </Badge>
                        ))}
                        {filterAvailableTags(field.value || []).length === 0 && (
                          <span className="text-sm text-muted-foreground p-2 w-full text-center">
                            {tagSearch
                              ? "Nenhuma tag encontrada com esse nome."
                              : "Todas as tags disponíveis já foram selecionadas."}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />

            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

