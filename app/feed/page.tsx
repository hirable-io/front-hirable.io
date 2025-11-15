"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Clock, DollarSign, Search, Briefcase, Users, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const mockJobs = [
  {
    id: 1,
    title: "Desenvolvedor Frontend React",
    company: "TechCorp",
    location: "São Paulo, SP",
    type: "CLT",
    salary: "R$ 8.000 - R$ 12.000",
    description:
      "Buscamos desenvolvedor React experiente para integrar nossa equipe de frontend. Conhecimento em TypeScript, Next.js e Tailwind CSS são diferenciais.",
    requirements: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    postedAt: "2 dias atrás",
    applicants: 23,
    rating: 4.8,
  },
  {
    id: 2,
    title: "Designer UX/UI Sênior",
    company: "DesignStudio",
    location: "Rio de Janeiro, RJ",
    type: "PJ",
    salary: "R$ 6.000 - R$ 10.000",
    description:
      "Procuramos designer UX/UI sênior para liderar projetos de produtos digitais. Experiência com Figma, prototipagem e design systems.",
    requirements: ["Figma", "Prototipagem", "Design Systems", "UX Research"],
    postedAt: "1 dia atrás",
    applicants: 15,
    rating: 4.9,
  },
  {
    id: 3,
    title: "Engenheiro de Software Backend",
    company: "DataFlow",
    location: "Belo Horizonte, MG",
    type: "CLT",
    salary: "R$ 10.000 - R$ 15.000",
    description:
      "Desenvolvedor backend para trabalhar com APIs REST, microserviços e arquitetura cloud. Experiência com Node.js, Python ou Java.",
    requirements: ["Node.js", "Python", "AWS", "Docker", "Microserviços"],
    postedAt: "3 dias atrás",
    applicants: 31,
    rating: 4.7,
  },
  {
    id: 4,
    title: "Product Manager",
    company: "InnovaTech",
    location: "Remoto",
    type: "CLT",
    salary: "R$ 12.000 - R$ 18.000",
    description:
      "Product Manager para liderar estratégia de produto em startup de tecnologia. Experiência com metodologias ágeis e análise de dados.",
    requirements: ["Scrum", "Analytics", "Roadmap", "Stakeholder Management"],
    postedAt: "1 semana atrás",
    applicants: 42,
    rating: 4.6,
  },
  {
    id: 5,
    title: "Analista de Marketing Digital",
    company: "GrowthCo",
    location: "Curitiba, PR",
    type: "CLT",
    salary: "R$ 4.000 - R$ 7.000",
    description:
      "Analista para gerenciar campanhas de marketing digital, SEO/SEM e análise de performance. Conhecimento em Google Ads e Facebook Ads.",
    requirements: ["Google Ads", "Facebook Ads", "SEO", "Analytics", "Growth Hacking"],
    postedAt: "4 dias atrás",
    applicants: 18,
    rating: 4.5,
  },
  {
    id: 6,
    title: "DevOps Engineer",
    company: "CloudTech",
    location: "Porto Alegre, RS",
    type: "PJ",
    salary: "R$ 9.000 - R$ 14.000",
    description:
      "Engenheiro DevOps para implementar e manter infraestrutura cloud, CI/CD e monitoramento. Experiência com Kubernetes e Terraform.",
    requirements: ["Kubernetes", "Terraform", "AWS", "CI/CD", "Monitoring"],
    postedAt: "5 dias atrás",
    applicants: 27,
    rating: 4.8,
  },
]

export default function FeedPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("Todas as localizações")
  const [typeFilter, setTypeFilter] = useState("Todos")
  const [appliedJobs, setAppliedJobs] = useState<number[]>([])

  const handleApply = (jobId: number) => {
    setAppliedJobs((prev) => [...prev, jobId])
  
    console.log(`[v0] Applied to job ${jobId} - Resume sent automatically`)
  }

  const filteredJobs = mockJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation = locationFilter === "Todas as localizações" || job.location.includes(locationFilter)
    const matchesType = typeFilter === "Todos" || job.type === typeFilter

    return matchesSearch && matchesLocation && matchesType
  })

  return (
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
              <Button size="sm">Sair</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar vagas por título ou empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Localização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todas as localizações">Todas as localizações</SelectItem>
                <SelectItem value="São Paulo">São Paulo</SelectItem>
                <SelectItem value="Rio de Janeiro">Rio de Janeiro</SelectItem>
                <SelectItem value="Belo Horizonte">Belo Horizonte</SelectItem>
                <SelectItem value="Remoto">Remoto</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="CLT">CLT</SelectItem>
                <SelectItem value="PJ">PJ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              {filteredJobs.length} vagas encontradas
            </span>
          </div>
        </div>

        <div className="grid gap-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl text-foreground hover:text-primary transition-colors cursor-pointer">
                      {job.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 text-muted-foreground">
                      <span className="font-medium text-foreground">{job.company}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {job.postedAt}
                      </span>
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{job.type}</Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      {job.rating}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">{job.description}</p>

                <div className="flex flex-wrap gap-2">
                  {job.requirements.map((req, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {req}
                    </Badge>
                  ))}
                </div>

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
                      Ver Detalhes
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApply(job.id)}
                      disabled={appliedJobs.includes(job.id)}
                      className={
                        appliedJobs.includes(job.id)
                          ? "bg-success text-success-foreground"
                          : "bg-accent text-accent-foreground hover:bg-accent/90"
                      }
                    >
                      {appliedJobs.includes(job.id) ? "Candidatura Enviada" : "Candidatar-se"}
                    </Button>
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
            <p className="text-muted-foreground">Tente ajustar seus filtros de busca</p>
          </div>
        )}
      </div>
    </div>
  )
}
