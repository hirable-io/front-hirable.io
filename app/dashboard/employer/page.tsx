"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Users, Eye, Calendar, MapPin, DollarSign, Briefcase } from "lucide-react"
import Link from "next/link"

const mockEmployerJobs = [
  {
    id: 1,
    title: "Desenvolvedor Frontend React",
    location: "São Paulo, SP",
    type: "CLT",
    salary: "R$ 8.000 - R$ 12.000",
    status: "Ativa",
    applicants: 23,
    postedAt: "2024-01-15",
    description: "Buscamos desenvolvedor React experiente para integrar nossa equipe de frontend.",
  },
  {
    id: 2,
    title: "Designer UX/UI Sênior",
    location: "Rio de Janeiro, RJ",
    type: "PJ",
    salary: "R$ 6.000 - R$ 10.000",
    status: "Ativa",
    applicants: 15,
    postedAt: "2024-01-18",
    description: "Procuramos designer UX/UI sênior para liderar projetos de produtos digitais.",
  },
  {
    id: 3,
    title: "Engenheiro de Software Backend",
    location: "Belo Horizonte, MG",
    type: "CLT",
    salary: "R$ 10.000 - R$ 15.000",
    status: "Pausada",
    applicants: 31,
    postedAt: "2024-01-10",
    description: "Desenvolvedor backend para trabalhar com APIs REST, microserviços e arquitetura cloud.",
  },
]

export default function EmployerDashboard() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredJobs = mockEmployerJobs.filter((job) => job.title.toLowerCase().includes(searchTerm.toLowerCase()))

  const totalApplicants = mockEmployerJobs.reduce((sum, job) => sum + job.applicants, 0)
  const activeJobs = mockEmployerJobs.filter((job) => job.status === "Ativa").length

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
              <Link href="/dashboard/employer" className="text-primary font-medium">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Vagas Ativas</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{activeJobs}</div>
              <p className="text-xs text-muted-foreground">{mockEmployerJobs.length - activeJobs} pausadas</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Candidatos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalApplicants}</div>
              <p className="text-xs text-muted-foreground">
                Média de {Math.round(totalApplicants / mockEmployerJobs.length)} por vaga
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Resposta</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">87%</div>
              <p className="text-xs text-muted-foreground">+5% desde o mês passado</p>
            </CardContent>
          </Card>
        </div>
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
        <div className="grid gap-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl text-foreground">{job.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(job.postedAt).toLocaleDateString("pt-BR")}
                      </span>
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={job.status === "Ativa" ? "default" : "secondary"}>{job.status}</Badge>
                    <Badge variant="outline">{job.type}</Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">{job.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-primary font-medium">
                      <DollarSign className="h-4 w-4" />
                      {job.salary}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {job.applicants} candidatos
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Editar Vaga
                    </Button>
                    <Link href={`/dashboard/employer/jobs/${job.id}/candidates`}>
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

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma vaga encontrada</h3>
            <p className="text-muted-foreground mb-4">Tente ajustar sua busca ou crie uma nova vaga</p>
            <Link href="/dashboard/employer/new-job">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Criar Nova Vaga
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
