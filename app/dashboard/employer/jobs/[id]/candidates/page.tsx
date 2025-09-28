"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Download, Mail, Phone, MapPin, Calendar, FileText, Star, User } from "lucide-react"
import Link from "next/link"

const mockCandidates = [
  {
    id: 1,
    name: "Ana Silva",
    email: "ana.silva@email.com",
    phone: "(11) 99999-1234",
    location: "São Paulo, SP",
    title: "Desenvolvedora Frontend",
    experience: "3 anos",
    appliedAt: "2024-01-20",
    resumeUrl: "/resumes/ana-silva.pdf",
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    rating: 4.8,
    status: "Novo",
  },
  {
    id: 2,
    name: "Carlos Santos",
    email: "carlos.santos@email.com",
    phone: "(11) 98888-5678",
    location: "São Paulo, SP",
    title: "Desenvolvedor Full Stack",
    experience: "5 anos",
    appliedAt: "2024-01-19",
    resumeUrl: "/resumes/carlos-santos.pdf",
    skills: ["React", "Node.js", "PostgreSQL", "AWS"],
    rating: 4.9,
    status: "Em análise",
  },
  {
    id: 3,
    name: "Mariana Costa",
    email: "mariana.costa@email.com",
    phone: "(11) 97777-9012",
    location: "Campinas, SP",
    title: "Desenvolvedora React",
    experience: "2 anos",
    appliedAt: "2024-01-18",
    resumeUrl: "/resumes/mariana-costa.pdf",
    skills: ["React", "JavaScript", "CSS", "Git"],
    rating: 4.6,
    status: "Novo",
  },
  {
    id: 4,
    name: "Pedro Oliveira",
    email: "pedro.oliveira@email.com",
    phone: "(11) 96666-3456",
    location: "São Paulo, SP",
    title: "Frontend Developer",
    experience: "4 anos",
    appliedAt: "2024-01-17",
    resumeUrl: "/resumes/pedro-oliveira.pdf",
    skills: ["React", "Vue.js", "TypeScript", "Sass"],
    rating: 4.7,
    status: "Entrevistado",
  },
]

const mockJob = {
  id: 1,
  title: "Desenvolvedor Frontend React",
  company: "TechCorp",
  location: "São Paulo, SP",
  type: "CLT",
  salary: "R$ 8.000 - R$ 12.000",
}

export default function JobCandidatesPage({ params }: { params: { id: string } }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("Todos")

  const filteredCandidates = mockCandidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.title.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "Todos" || candidate.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleDownloadResume = (candidateId: number, candidateName: string) => {
    console.log(`[v0] Downloading resume for candidate ${candidateId}: ${candidateName}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Novo":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Em análise":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Entrevistado":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
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

      <div className="container mx-auto px-4 py-8">
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Candidatos para: {mockJob.title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {mockJob.location}
            </span>
            <Badge variant="outline">{mockJob.type}</Badge>
            <span>{mockJob.salary}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{mockCandidates.length}</p>
                  <p className="text-xs text-muted-foreground">Total de Candidatos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {mockCandidates.filter((c) => c.status === "Novo").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Novos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {mockCandidates.filter((c) => c.status === "Em análise").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Em Análise</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {mockCandidates.filter((c) => c.status === "Entrevistado").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Entrevistados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar candidatos por nome, email ou cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 max-w-md"
            />
          </div>
        </div>
        <div className="grid gap-6">
          {filteredCandidates.map((candidate) => (
            <Card key={candidate.id} className="hover:shadow-lg transition-shadow border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl text-foreground">{candidate.name}</CardTitle>
                    <CardDescription className="flex items-center gap-4 text-muted-foreground">
                      <span className="font-medium text-foreground">{candidate.title}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {candidate.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(candidate.appliedAt).toLocaleDateString("pt-BR")}
                      </span>
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(candidate.status)}>{candidate.status}</Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      {candidate.rating}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {candidate.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {candidate.phone}
                  </span>
                  <span>Experiência: {candidate.experience}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Candidatou-se em {new Date(candidate.appliedAt).toLocaleDateString("pt-BR")}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      Contatar
                    </Button>
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => handleDownloadResume(candidate.id, candidate.name)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Ver Currículo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCandidates.length === 0 && (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum candidato encontrado</h3>
            <p className="text-muted-foreground">Tente ajustar sua busca ou aguarde novos candidatos</p>
          </div>
        )}
      </div>
    </div>
  )
}
