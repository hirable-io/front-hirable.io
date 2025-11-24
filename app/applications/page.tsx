"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Clock, DollarSign, Briefcase, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { jobApplicationService, type JobApplicationResponse, type ApiError } from "@/lib/services/job-application-service"
import { formatSalaryRange, formatDate, truncateText } from "@/lib/utils"
import { getModalityLabel, getApplicationStatusLabel } from "@/lib/utils/application-status"
import { RoleGuard } from "@/components/role-guard"

export default function ApplicationsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<JobApplicationResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  const loadApplications = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await jobApplicationService.listApplications()
      setApplications(response.jobApplications)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError)
      if (apiError.status === 401) {
        router.push('/auth/login')
        return
      }
      toast.error('Não foi possível carregar suas candidaturas', {
        description: apiError.message || 'Verifique sua conexão e tente novamente.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadApplications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <RoleGuard allowedRoles={['CANDIDATE']}>
      <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Minhas Candidaturas</h1>
          <p className="text-muted-foreground">
            Acompanhe o status das vagas que você se candidatou
          </p>
        </div>
        <div className="mb-8">
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Feed
          </Link>
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
          <Card className="border-border/50 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-foreground mb-2">Erro ao carregar candidaturas</h3>
                <p className="text-muted-foreground mb-4">
                  {error.status === 0
                    ? 'Erro de conexão. Verifique sua internet e tente novamente.'
                    : error.message || 'Ocorreu um erro inesperado. Por favor, tente novamente em alguns instantes.'}
                </p>
                <Button onClick={loadApplications} variant="outline">
                  Tentar novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estado Vazio */}
        {!isLoading && !error && applications.length === 0 && (
          <Card className="border-border/50 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma candidatura ainda</h3>
                <p className="text-muted-foreground mb-4">
                  Você ainda não se candidatou para nenhuma vaga. Explore as vagas disponíveis!
                </p>
                <Button asChild>
                  <Link href="/feed">Explorar Vagas</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Aplicações */}
        {!isLoading && !error && applications.length > 0 && (
          <div className="grid gap-6">
            {applications.map((application) => {
              if (!application.vacancy) return null

              const vacancy = application.vacancy
              return (
                <Card key={application.id} className="hover:shadow-lg transition-shadow border-border/50">
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
                            Candidatura em {application.applicationDate ? formatDate(application.applicationDate) : "Data não disponível"}
                          </span>
                        </CardDescription>
                      </div>

                      <div className="flex items-center gap-2 ml-4 flex-wrap">
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
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/feed`}>Ver Detalhes</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
    </RoleGuard>
  )
}

