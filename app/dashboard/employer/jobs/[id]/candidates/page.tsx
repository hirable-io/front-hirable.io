"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ArrowLeft, Calendar, FileText, User, Briefcase } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { jobApplicationService, type JobApplicationResponse, type ApiError } from "@/lib/services/job-application-service"
import { vacancyService, type VacancyResponse } from "@/lib/services/vacancy-service"
import { formatDate, formatSalaryRange } from "@/lib/utils"
import { getApplicationStatusLabel, getStatusColor, getModalityLabel } from "@/lib/utils/application-status"
import { ApplicationStatusDialog } from "@/components/application-status-dialog"
import { CandidateDetailsDialog } from "@/components/candidate-details-dialog"

const APPLICATIONS_PER_PAGE = 10

export default function JobCandidatesPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [applications, setApplications] = useState<JobApplicationResponse[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)
  const [vacancy, setVacancy] = useState<VacancyResponse | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<JobApplicationResponse | null>(null)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [selectedCandidateApplication, setSelectedCandidateApplication] = useState<JobApplicationResponse | null>(null)
  const [isCandidateDialogOpen, setIsCandidateDialogOpen] = useState(false)

  const totalPages = Math.ceil(total / APPLICATIONS_PER_PAGE)

  const loadApplications = async (page: number) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const offset = (page - 1) * APPLICATIONS_PER_PAGE
      const response = await jobApplicationService.fetchVacancyApplications({
        vacancyId: params.id,
        limit: APPLICATIONS_PER_PAGE,
        offset,
      })
      
      setApplications(response.jobApplications)
      setTotal(response.total)

      if (response.jobApplications.length > 0 && response.jobApplications[0].vacancy && !vacancy) {
        setVacancy(response.jobApplications[0].vacancy)
      }
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError)
      
      if (apiError.status === 401) {
        router.push("/auth/login")
        return
      }
      
      if (apiError.status === 404) {
        toast.error("Vaga não encontrada", {
          description: "Esta vaga não existe ou você não tem permissão para visualizá-la. Você será redirecionado para o dashboard.",
        })
        router.push("/dashboard/employer")
        return
      }
      
      if (apiError.status === 403) {
        toast.error("Acesso negado", {
          description: "Você não tem permissão para visualizar candidaturas desta vaga.",
        })
        router.push("/dashboard/employer")
        return
      }
      
      if (apiError.status === 0) {
        toast.error("Erro de conexão", {
          description: "Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.",
        })
        return
      }
      
      toast.error("Erro ao carregar candidaturas", {
        description: apiError.message || "Ocorreu um erro inesperado. Por favor, tente novamente em alguns instantes.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadVacancy = async () => {
    try {
      const response = await vacancyService.listVacancies({ limit: 100 })
      const foundVacancy = response.vacancies.find(v => v.id === params.id)
      if (foundVacancy) {
        setVacancy(foundVacancy)
      }
    } catch (err) {
      console.error("Erro ao carregar informações da vaga:", err)
    }
  }

  useEffect(() => {
    loadApplications(currentPage)
    loadVacancy()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, params.id])

  const handleStatusUpdate = (application: JobApplicationResponse) => {
    setSelectedApplication(application)
    setIsStatusDialogOpen(true)
  }

  const handleStatusUpdateSuccess = () => {
    loadApplications(currentPage)
    setIsStatusDialogOpen(false)
    setSelectedApplication(null)
  }

  const handleViewCandidate = (application: JobApplicationResponse) => {
    setSelectedCandidateApplication(application)
    setIsCandidateDialogOpen(true)
  }

  const totalApplications = total
  const newApplications = applications.filter((a) => a.status === 'NEW').length
  const inAnalysisApplications = applications.filter((a) => a.status === 'ANALISYS').length
  const reviewedApplications = applications.filter((a) => a.status === 'REVIEWED').length
  const rejectedApplications = applications.filter((a) => a.status === 'REJECTED').length
  const hiredApplications = applications.filter((a) => a.status === 'HIRED').length

  return (
    <div className="min-h-screen bg-background">
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isLoading ? "Carregando candidaturas..." : applications.length > 0 ? `${applications.length} candidaturas carregadas` : "Nenhuma candidatura encontrada"}
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard/employer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Voltar para o dashboard de vagas"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar ao Dashboard
          </Link>
        </div>

        <div className="mb-8">
          {isLoading && !vacancy ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : vacancy ? (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Candidatos para: {vacancy.title}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {vacancy.location}
                </span>
                <Badge variant="outline">{getModalityLabel(vacancy.modality)}</Badge>
                {vacancy.minimumSalaryValue > 0 && vacancy.maximumSalaryValue > 0 && (
                  <span>{formatSalaryRange(vacancy.minimumSalaryValue, vacancy.maximumSalaryValue)}</span>
                )}
              </div>
            </>
          ) : (
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Candidatos para a Vaga
            </h1>
          )}
        </div>

        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          role="region"
          aria-label="Estatísticas de candidaturas"
        >
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-8 w-16 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <p className="text-2xl font-bold text-foreground" aria-label={`Total de ${totalApplications} candidatos`}>
                        {totalApplications}
                      </p>
                      <p className="text-xs text-muted-foreground">Total de Candidatos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <p className="text-2xl font-bold text-foreground" aria-label={`${newApplications} candidaturas novas`}>
                        {newApplications}
                      </p>
                      <p className="text-xs text-muted-foreground">Novos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <p className="text-2xl font-bold text-foreground" aria-label={`${inAnalysisApplications} candidaturas em análise`}>
                        {inAnalysisApplications}
                      </p>
                      <p className="text-xs text-muted-foreground">Em Análise</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <div>
                      <p className="text-2xl font-bold text-foreground" aria-label={`${hiredApplications} candidatos contratados`}>
                        {hiredApplications}
                      </p>
                      <p className="text-xs text-muted-foreground">Contratados</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {isLoading && (
          <div className="grid gap-6" role="status" aria-label="Carregando candidaturas">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="border-border/50">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <Skeleton className="h-4 w-40" />
                    <div className="flex gap-2">
                      <Skeleton className="h-9 w-32" />
                      <Skeleton className="h-9 w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && error && (
          <Card className="border-border/50 shadow-lg" role="alert">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-foreground mb-2">Erro ao carregar candidaturas</h3>
                <p className="text-muted-foreground mb-4">
                  {error.status === 0
                    ? 'Erro de conexão. Verifique sua conexão com a internet e tente novamente. Se o problema persistir, verifique se o servidor está online.'
                    : error.status === 500
                    ? 'Erro interno do servidor. Nossa equipe foi notificada. Por favor, tente novamente em alguns instantes.'
                    : error.message || 'Ocorreu um erro inesperado. Por favor, tente novamente em alguns instantes.'}
                </p>
                <Button 
                  onClick={() => loadApplications(currentPage)} 
                  variant="outline"
                  aria-label="Tentar carregar candidaturas novamente"
                >
                  Tentar novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && applications.length === 0 && (
          <Card className="border-border/50 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma candidatura ainda</h3>
                <p className="text-muted-foreground">
                  Esta vaga ainda não recebeu candidaturas. Compartilhe a vaga para atrair candidatos!
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && applications.length > 0 && (
          <>
            <div 
              className="grid gap-6"
              role="list"
              aria-label={`Lista de ${applications.length} candidaturas`}
            >
              {applications.map((application) => {
                const candidateName = application.candidate?.fullName || "Candidato"
                const statusLabel = getApplicationStatusLabel(application.status)

                return (
                  <Card 
                    key={application.id} 
                    className="hover:shadow-lg transition-shadow border-border/50"
                    role="listitem"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="space-y-2 flex-1 min-w-0">
                          <CardTitle className="text-xl text-foreground">{candidateName}</CardTitle>
                          <CardDescription className="flex items-center gap-4 text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1" aria-label={`Candidatura em ${formatDate(application.applicationDate)}`}>
                              <Calendar className="h-4 w-4" aria-hidden="true" />
                              Candidatura em {formatDate(application.applicationDate)}
                            </span>
                          </CardDescription>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge 
                            className={getStatusColor(application.status)}
                            aria-label={`Status: ${statusLabel}`}
                          >
                            {statusLabel}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between pt-4 border-t border-border flex-wrap gap-4">
                        <div className="text-sm text-muted-foreground">
                          Status atual: <strong aria-label={`Status atual da candidatura: ${statusLabel}`}>{statusLabel}</strong>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(application)}
                            aria-label={`Atualizar status da candidatura de ${candidateName}`}
                          >
                            Atualizar Status
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewCandidate(application)}
                            aria-label={`Ver dados e currículo de ${candidateName}`}
                          >
                            <FileText className="h-4 w-4 mr-2" aria-hidden="true" />
                            Visualizar Candidato
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {totalPages > 1 && (
              <nav className="mt-8" aria-label="Navegação de páginas">
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
                        aria-label="Página anterior"
                        aria-disabled={currentPage === 1}
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
                            aria-label={`Ir para página ${page}`}
                            aria-current={currentPage === page ? "page" : undefined}
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
                        aria-label="Próxima página"
                        aria-disabled={currentPage === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
                <p className="text-center text-sm text-muted-foreground mt-4" aria-live="polite">
                  Página {currentPage} de {totalPages} ({total} candidaturas no total)
                </p>
              </nav>
            )}
          </>
        )}

        <ApplicationStatusDialog
          application={selectedApplication}
          open={isStatusDialogOpen}
          onOpenChange={setIsStatusDialogOpen}
          onSuccess={handleStatusUpdateSuccess}
        />

        <CandidateDetailsDialog
          application={selectedCandidateApplication}
          open={isCandidateDialogOpen}
          onOpenChange={setIsCandidateDialogOpen}
        />
      </div>
    </div>
  )
}
