"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Search, Users, Eye, Calendar, MapPin, DollarSign, Briefcase, Trash2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { vacancyService, type VacancyResponse, type ApiError } from "@/lib/services/vacancy-service"
import { formatSalaryRange, formatDate, truncateText } from "@/lib/utils"
import { VacancyEditDialog } from "@/components/vacancy-edit-dialog"
import { RoleGuard } from "@/components/role-guard"
import { useAuth } from "@/hooks/use-auth"

const VACANCIES_PER_PAGE = 5

export default function EmployerDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [vacancies, setVacancies] = useState<VacancyResponse[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)
  const [editingVacancy, setEditingVacancy] = useState<VacancyResponse | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deletingVacancy, setDeletingVacancy] = useState<VacancyResponse | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = () => {
    if (typeof window === 'undefined') {
      return
    }
    logout()
    window.location.href = '/'
  }

  const totalPages = Math.ceil(total / VACANCIES_PER_PAGE)

  const loadVacancies = async (page: number) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const offset = (page - 1) * VACANCIES_PER_PAGE
      const response = await vacancyService.listVacancies({
        limit: VACANCIES_PER_PAGE,
        offset,
      })
      
      setVacancies(response.vacancies)
      setTotal(response.total)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError)
      
      if (apiError.status === 401) {
        router.push("/auth/login")
        return
      }
      
      toast.error("Erro ao carregar vagas", {
        description: apiError.message || "Tente novamente em alguns instantes.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadVacancies(currentPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const filteredVacancies = vacancies.filter((vacancy) =>
    vacancy.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeJobs = vacancies.filter((v) => v.status === "OPEN").length
  const closedJobs = vacancies.filter((v) => v.status === "CLOSED").length

  const getModalityLabel = (modality: string) => {
    switch (modality) {
      case "REMOTE":
        return "Remoto"
      case "HYBRID":
        return "Híbrido"
      case "ONSITE":
        return "Presencial"
      default:
        return modality
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "OPEN":
        return "Aberta"
      case "CLOSED":
        return "Fechada"
      default:
        return status
    }
  }

  const handleDeleteVacancy = async () => {
    if (!deletingVacancy) return

    setIsDeleting(true)
    try {
      await vacancyService.deleteVacancy(deletingVacancy.id)
      
      toast.success("Vaga excluída com sucesso!", {
        description: "A vaga foi removida permanentemente.",
      })

      const newTotal = total - 1
      const newTotalPages = Math.ceil(newTotal / VACANCIES_PER_PAGE)
      
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages)
      } else {
        await loadVacancies(currentPage)
      }

      setIsDeleteDialogOpen(false)
      setDeletingVacancy(null)
    } catch (error) {
      const apiError = error as ApiError
      if (apiError.status === 401) {
        router.push("/auth/login")
      } else {
        toast.error("Erro ao excluir vaga", {
          description: apiError.message || "Tente novamente em alguns instantes.",
        })
      }
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <RoleGuard allowedRoles={['EMPLOYER']}>
      <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/hirable-logo.png"
                alt="Logo Hirable.io"
                width={32}
                height={32}
                className="object-cover"
              />
              <span className="font-bold text-xl text-foreground">Hirable.io</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard/employer" className="text-primary font-medium">
                Dashboard
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                Configurações
              </Button>
              <Button size="sm" onClick={handleLogout}>Sair</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard do Empregador</h1>
            <p className="text-muted-foreground">Gerencie suas vagas e candidatos</p>
          </div>

          <Link href="/dashboard/employer/new-job">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="h-4 w-4 mr-2" />
              Nova Vaga
            </Button>
          </Link>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Vagas Ativas</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-foreground">{activeJobs}</div>
                  <p className="text-xs text-muted-foreground">{closedJobs} fechadas</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Vagas</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-foreground">{total}</div>
                  <p className="text-xs text-muted-foreground">Total cadastradas</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Resposta</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">-</div>
              <p className="text-xs text-muted-foreground">Em desenvolvimento</p>
            </CardContent>
          </Card>
        </div>

        {/* Busca */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar vagas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 max-w-md"
            />
          </div>
        </div>

        {/* Lista de Vagas */}
        {isLoading ? (
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="border-border/50">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Erro ao carregar vagas</h3>
            <p className="text-muted-foreground mb-4">{error.message || "Tente novamente em alguns instantes."}</p>
            <Button onClick={() => loadVacancies(currentPage)}>
              Tentar Novamente
            </Button>
          </div>
        ) : filteredVacancies.length === 0 && searchTerm ? (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma vaga encontrada</h3>
            <p className="text-muted-foreground mb-4">Tente ajustar sua busca</p>
          </div>
        ) : vacancies.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma vaga cadastrada</h3>
            <p className="text-muted-foreground mb-4">Comece criando sua primeira vaga</p>
            <Link href="/dashboard/employer/new-job">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar Nova Vaga
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-6">
              {filteredVacancies.map((vacancy) => (
                <Card key={vacancy.id} className="hover:shadow-lg transition-shadow border-border/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-xl text-foreground">{vacancy.title}</CardTitle>
                        <CardDescription className="flex items-center gap-4 text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {vacancy.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(vacancy.createdAt)}
                          </span>
                        </CardDescription>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={vacancy.status === "OPEN" ? "default" : "secondary"}>
                          {getStatusLabel(vacancy.status)}
                        </Badge>
                        <Badge variant="outline">{getModalityLabel(vacancy.modality)}</Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {truncateText(vacancy.description, 200)}
                    </p>

                    {vacancy.tags && vacancy.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {vacancy.tags.map((tag) => (
                          <Badge key={tag.id} variant="outline" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-primary font-medium">
                          <DollarSign className="h-4 w-4" />
                          {formatSalaryRange(vacancy.minimumSalaryValue, vacancy.maximumSalaryValue)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingVacancy(vacancy)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          Editar Vaga
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDeletingVacancy(vacancy)
                            setIsDeleteDialogOpen(true)
                          }}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </Button>
                        <Link href={`/dashboard/employer/jobs/${vacancy.id}/candidates`}>
                          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Candidatos
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (currentPage > 1) {
                            setCurrentPage(currentPage - 1)
                            window.scrollTo({ top: 0, behavior: "smooth" })
                          }
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              setCurrentPage(page)
                              window.scrollTo({ top: 0, behavior: "smooth" })
                            }}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (currentPage < totalPages) {
                            setCurrentPage(currentPage + 1)
                            window.scrollTo({ top: 0, behavior: "smooth" })
                          }
                        }}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}

        {/* Dialog de Edição */}
        <VacancyEditDialog
          vacancy={editingVacancy}
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open)
            if (!open) {
              setEditingVacancy(null)
            }
          }}
          onSuccess={() => {
            // Recarregar lista após edição bem-sucedida
            loadVacancies(currentPage)
          }}
        />

        {/* Dialog de Confirmação de Exclusão */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir a vaga{" "}
                <strong className="font-semibold text-foreground">
                  "{deletingVacancy?.title}"
                </strong>
                ? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting} onClick={() => setDeletingVacancy(null)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteVacancy}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Confirmar Exclusão
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
    </RoleGuard>
  )
}
