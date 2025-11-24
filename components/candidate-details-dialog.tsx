"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Phone, Linkedin, FileText, Download, User } from "lucide-react"
import { JobApplicationResponse } from "@/lib/services/job-application-service"
import { toast } from "sonner"

interface CandidateDetailsDialogProps {
  application: JobApplicationResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CandidateDetailsDialog({
  application,
  open,
  onOpenChange,
}: CandidateDetailsDialogProps) {

  if (!application || !application.candidate) return null

  const candidate = application.candidate
  const candidateName = candidate.fullName || "Candidato"
  const candidatePhone = candidate.phone || "Não informado"
  const candidateBio = candidate.bio
  const resumeUrl = candidate.resumeUrl
  const linkedInUrl = candidate.linkedInUrl
  const tags = candidate.tags || []

  const handleDownloadResume = () => {
    if (!resumeUrl) {
      toast.error("Currículo não disponível", {
        description: "Este candidato ainda não enviou um currículo.",
      })
      return
    }

    const link = document.createElement("a")
    link.href = resumeUrl
    link.download = `curriculo-${candidateName.replace(/\s+/g, "-").toLowerCase()}.pdf`
    link.target = "_blank"
    link.rel = "noopener noreferrer"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success("Download iniciado", {
      description: "O currículo está sendo baixado.",
    })
  }

  const handleOpenResume = () => {
    if (!resumeUrl) {
      toast.error("Currículo não disponível", {
        description: "Este candidato ainda não enviou um currículo.",
      })
      return
    }

    window.open(resumeUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle id="dialog-title">Dados do Candidato</DialogTitle>
          <DialogDescription id="dialog-description">
            Informações completas do candidato e opções para visualizar ou baixar o currículo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              {candidate.imageUrl ? (
                <img
                  src={candidate.imageUrl}
                  alt={candidateName}
                  className="w-20 h-20 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                  <User className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-foreground">{candidateName}</h3>
                {candidateBio && (
                  <p className="text-sm text-muted-foreground mt-1">{candidateBio}</p>
                )}
              </div>
            </div>

            <Separator />

            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Telefone</p>
                  <a
                    href={`tel:${candidatePhone}`}
                    className="text-sm text-primary hover:underline"
                    aria-label={`Ligar para ${candidatePhone}`}
                  >
                    {candidatePhone}
                  </a>
                </div>
              </div>

              {linkedInUrl && (
                <div className="flex items-center gap-3">
                  <Linkedin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">LinkedIn</p>
                    <a
                      href={linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                      aria-label={`Abrir perfil LinkedIn de ${candidateName}`}
                    >
                      Ver perfil
                    </a>
                  </div>
                </div>
              )}
            </div>

            {tags.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Habilidades e Competências</p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag.id} variant="secondary">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Currículo</p>
              {resumeUrl ? (
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      Currículo disponível para visualização e download
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenResume}
                      aria-label="Abrir currículo em nova aba"
                    >
                      <FileText className="h-4 w-4 mr-2" aria-hidden="true" />
                      Visualizar
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleDownloadResume}
                      aria-label="Baixar currículo"
                    >
                      <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                      Baixar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                  <p className="text-sm">Currículo não disponível</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

