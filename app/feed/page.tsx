"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Clock, DollarSign, Briefcase } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import { vacancyService, type VacancyResponse, type ApiError } from "@/lib/services/vacancy-service"
import { formatSalaryRange, formatDate, truncateText } from "@/lib/utils"
import { getModalityLabel } from "@/lib/utils/application-status"
import { ApplicationConfirmDialog } from "@/components/application-confirm-dialog"
import { RoleGuard } from "@/components/role-guard"
import { useAuth } from "@/hooks/use-auth"

export default function FeedPage() {
  const [modalityFilter, setModalityFilter] = useState<string | undefined>(undefined)
  const [vacancies, setVacancies] = useState<VacancyResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)
  const [total, setTotal] = useState(0)
  const [applyingVacancy, setApplyingVacancy] = useState<VacancyResponse | null>(null)
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false)
  const [appliedVacancyIds, setAppliedVacancyIds] = useState<Set<string>>(new Set())
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = () => {
    if (typeof window === 'undefined') {
      return
    }
    logout()
    window.location.href = '/'
  }

  const loadVacancies = async (modality?: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await vacancyService.listAvailableVacancies({
        modality: modality as 'REMOTE' | 'HYBRID' | 'ONSITE' | undefined,
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
      toast.error("Não foi possível carregar as vagas", {
        description: apiError.message || "Verifique sua conexão e tente novamente.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadVacancies(modalityFilter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalityFilter])

  const handleApplyClick = (vacancy: VacancyResponse) => {
    setApplyingVacancy(vacancy)
    setIsApplicationDialogOpen(true)
  }

  const handleApplicationSuccess = () => {
    if (applyingVacancy) {
      setAppliedVacancyIds((prev) => new Set([...prev, applyingVacancy.id]))
    }
    setIsApplicationDialogOpen(false)
    setApplyingVacancy(null)
    loadVacancies(modalityFilter)
  }

  return (
    <RoleGuard allowedRoles={['CANDIDATE']}>
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
              <Link href="/feed" className="text-primary font-medium">
                Feed de Vagas
              </Link>
              <Link href="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
                Meu Perfil
              </Link>
              <Link href="/applications" className="text-muted-foreground hover:text-foreground transition-colors">
                Candidaturas
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Vagas Disponíveis</h1>
          <p className="text-muted-foreground">
            Explore oportunidades de emprego
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Select
            value={modalityFilter || 'all'}
            onValueChange={(value) => {
              setModalityFilter(value === 'all' ? undefined : value)
            }}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Modalidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="REMOTE">Remoto</SelectItem>
              <SelectItem value="HYBRID">Híbrido</SelectItem>
              <SelectItem value="ONSITE">Presencial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
          <span className="flex items-center gap-1">
            <Briefcase className="h-4 w-4" />
            {isLoading ? "Carregando..." : `${vacancies.length} vagas encontradas`}
          </span>
        </div>
            {/* Estado de Loading */}
            {isLoading && (
              <div className="grid gap-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="border-border/50">
                    <CardHeader className="pb-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Skeleton className="h-20 w-full" />
                      <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-9 w-32" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Estado de Erro */}
            {!isLoading && error && (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Erro ao carregar vagas</h3>
                <p className="text-muted-foreground mb-4">
                  {error.status === 0
                    ? "Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente."
                    : error.message || "Ocorreu um erro inesperado. Por favor, tente novamente em alguns instantes."}
                </p>
                <Button onClick={() => loadVacancies(modalityFilter)} variant="outline">
                  Tentar Novamente
                </Button>
              </div>
            )}

            {/* Estado Vazio */}
            {!isLoading && !error && vacancies.length === 0 && (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma vaga disponível</h3>
                <p className="text-muted-foreground">
                  Não há vagas disponíveis no momento. Tente novamente mais tarde.
                </p>
              </div>
            )}

            {/* Lista de Vagas */}
            {!isLoading && !error && vacancies.length > 0 && (
              <div className="grid gap-6">
                {vacancies.map((vacancy) => (
                  <Card key={vacancy.id} className="hover:shadow-lg transition-shadow border-border/50">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <CardTitle className="text-xl text-foreground hover:text-primary transition-colors cursor-pointer">
                            {vacancy.title}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {vacancy.location || "Localização não informada"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {vacancy.createdAt ? formatDate(vacancy.createdAt) : "Data não disponível"}
                            </span>
                          </CardDescription>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Badge variant="secondary">{getModalityLabel(vacancy.modality)}</Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {vacancy.description ? (
                        <p className="text-muted-foreground leading-relaxed">
                          {truncateText(vacancy.description, 200)}
                        </p>
                      ) : (
                        <p className="text-muted-foreground italic">Descrição não disponível</p>
                      )}

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
                          {vacancy.minimumSalaryValue > 0 && vacancy.maximumSalaryValue > 0 ? (
                            <span className="flex items-center gap-1 text-primary font-medium">
                              <DollarSign className="h-4 w-4" />
                              {formatSalaryRange(vacancy.minimumSalaryValue, vacancy.maximumSalaryValue)}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <DollarSign className="h-4 w-4" />
                              A combinar
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            Ver Detalhes
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApplyClick(vacancy)}
                            disabled={appliedVacancyIds.has(vacancy.id)}
                            className={
                              appliedVacancyIds.has(vacancy.id)
                                ? "bg-success text-success-foreground"
                                : "bg-accent text-accent-foreground hover:bg-accent/90"
                            }
                          >
                            {appliedVacancyIds.has(vacancy.id) ? "Candidatura Enviada" : "Candidatar-se"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

        {/* Diálogo de Confirmação de Aplicação */}
        <ApplicationConfirmDialog
          vacancy={applyingVacancy}
          open={isApplicationDialogOpen}
          onOpenChange={setIsApplicationDialogOpen}
          onSuccess={handleApplicationSuccess}
        />
      </div>
    </div>
    </RoleGuard>
  )
}
