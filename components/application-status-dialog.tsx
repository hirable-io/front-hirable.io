"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { jobApplicationService, type JobApplicationResponse, type ApiError } from "@/lib/services/job-application-service"
import { getApplicationStatusLabel } from "@/lib/utils/application-status"

interface ApplicationStatusDialogProps {
  application: JobApplicationResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

type ApplicationStatus = 'NEW' | 'REVIEWED' | 'ANALISYS' | 'REJECTED' | 'HIRED'

export function ApplicationStatusDialog({
  application,
  open,
  onOpenChange,
  onSuccess,
}: ApplicationStatusDialogProps) {
  const router = useRouter()
  const [status, setStatus] = useState<ApplicationStatus | ''>('')
  const [sendMessage, setSendMessage] = useState(false)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open && application) {
      setStatus('')
      setSendMessage(false)
      setMessage('')
    }
  }, [open, application])

  useEffect(() => {
    if (status === 'REJECTED') {
      setSendMessage(false)
      setMessage('')
    }
  }, [status])

  const handleSubmit = async () => {
    if (!application) return

    if (status === 'REJECTED' && sendMessage) {
      toast.error("Erro de validação", {
        description: "Não é possível enviar email ao rejeitar uma candidatura.",
      })
      return
    }

    if (!status) {
      toast.error("Selecione um status", {
        description: "Por favor, selecione o novo status da candidatura.",
      })
      return
    }

    if (sendMessage && (!message || message.trim().length === 0)) {
      toast.error("Mensagem obrigatória", {
        description: "Por favor, preencha a mensagem personalizada ou desmarque a opção de enviar email.",
      })
      return
    }

    setIsLoading(true)
    try {
      const requestData: {
        applicationId: string
        status: ApplicationStatus
        message?: string
        sendMessage: boolean
      } = {
        applicationId: application.id,
        status: status as ApplicationStatus,
        sendMessage,
      }

      if (sendMessage && message) {
        requestData.message = message.trim()
      }

      await jobApplicationService.processApplication(requestData)

      toast.success("Status atualizado com sucesso!", {
        description: sendMessage
          ? "O status foi atualizado e o candidato foi notificado por email."
          : "O status da candidatura foi atualizado.",
      })

      if (onSuccess) {
        onSuccess()
      }

      onOpenChange(false)
    } catch (error) {
      const apiError = error as ApiError

      if (apiError.status === 401) {
        toast.error("Sessão expirada", {
          description: "Por favor, faça login novamente.",
        })
        router.push("/auth/login")
        onOpenChange(false)
        return
      }

      if (apiError.status === 403) {
        toast.error("Acesso negado", {
          description: "Você não tem permissão para atualizar esta candidatura.",
        })
        onOpenChange(false)
        return
      }

      if (apiError.status === 404) {
        toast.error("Candidatura não encontrada", {
          description: "Esta candidatura não existe mais ou foi removida. A lista será atualizada.",
        })
        if (onSuccess) {
          onSuccess()
        }
        onOpenChange(false)
        return
      }

      if (apiError.status === 422) {
        toast.error("Erro de validação", {
          description: apiError.message || "Os dados fornecidos são inválidos. Verifique as informações e tente novamente.",
        })
        return
      }

      if (apiError.status === 500) {
        toast.error("Erro interno do servidor", {
          description: "Nossa equipe foi notificada. Por favor, tente novamente em alguns instantes.",
        })
        return
      }

      if (apiError.status === 0) {
        toast.error("Erro de conexão", {
          description: "Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.",
        })
        return
      }

      toast.error("Erro ao atualizar status", {
        description: apiError.message || "Ocorreu um erro inesperado. Por favor, tente novamente em alguns instantes.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!application) return null

  const candidateName = application.candidate?.fullName || "Candidato"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby="dialog-description">
        <DialogHeader>
          <DialogTitle id="dialog-title">Atualizar Status da Candidatura</DialogTitle>
          <DialogDescription id="dialog-description">
            Atualize o status da candidatura de <strong>{candidateName}</strong> e opcionalmente envie uma notificação por email.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">
              Novo Status <span className="text-destructive" aria-label="obrigatório">*</span>
            </Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as ApplicationStatus)}
              disabled={isLoading}
            >
              <SelectTrigger 
                id="status" 
                className="w-full"
                aria-label="Selecione o novo status da candidatura"
                aria-required="true"
              >
                <SelectValue placeholder="Selecione o novo status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="REVIEWED">
                  {getApplicationStatusLabel('REVIEWED')}
                </SelectItem>
                <SelectItem value="ANALISYS">
                  {getApplicationStatusLabel('ANALISYS')}
                </SelectItem>
                <SelectItem value="REJECTED">
                  {getApplicationStatusLabel('REJECTED')}
                </SelectItem>
                <SelectItem value="HIRED">
                  {getApplicationStatusLabel('HIRED')}
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Selecione o novo status para a candidatura de {candidateName}
            </p>
          </div>

          {status && status !== 'REJECTED' && (
            <div className="flex items-start space-x-2">
              <Checkbox
                id="sendMessage"
                checked={sendMessage}
                onCheckedChange={(checked) => setSendMessage(checked === true)}
                disabled={isLoading}
                aria-label="Enviar notificação por email ao candidato"
              />
              <Label
                htmlFor="sendMessage"
                className="text-sm font-normal cursor-pointer leading-5"
              >
                Enviar notificação por email ao candidato
              </Label>
            </div>
          )}

          {status && status !== 'REJECTED' && sendMessage && (
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium">
                Mensagem Personalizada <span className="text-muted-foreground font-normal">(Opcional)</span>
              </Label>
              <Textarea
                id="message"
                placeholder="Digite uma mensagem personalizada para o candidato"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isLoading}
                rows={4}
                className="resize-none"
                aria-label="Mensagem personalizada para o candidato"
                aria-describedby="message-help"
              />
            </div>
          )}

          {status === 'REJECTED' && (
            <div 
              className="rounded-md bg-muted p-3 text-sm text-muted-foreground"
              role="alert"
              aria-live="polite"
            >
              <p>
                Ao rejeitar uma candidatura, nenhuma notificação por email será enviada ao candidato.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            aria-label="Cancelar atualização de status"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !status}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            aria-label={status ? `Atualizar status para ${getApplicationStatusLabel(status)}` : "Selecione um status para atualizar"}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" aria-hidden="true" />
                <span>Atualizando...</span>
              </>
            ) : (
              "Atualizar Status"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

