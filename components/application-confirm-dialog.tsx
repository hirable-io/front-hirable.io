"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"
import { toast } from "sonner"
import { jobApplicationService, type ApiError } from "@/lib/services/job-application-service"
import { type VacancyResponse } from "@/lib/services/vacancy-service"
import { getModalityLabel } from "@/lib/utils/application-status"

interface ApplicationConfirmDialogProps {
  vacancy: VacancyResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ApplicationConfirmDialog({
  vacancy,
  open,
  onOpenChange,
  onSuccess,
}: ApplicationConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleConfirm = async () => {
    if (!vacancy) return

    setIsLoading(true)
    try {
      await jobApplicationService.apply({ vacancyId: vacancy.id })
      
      toast.success("Candidatura enviada com sucesso!", {
        description: "Sua candidatura para esta vaga foi registrada.",
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

      if (apiError.status === 409) {
        toast.error("Você já aplicou para esta vaga", {
          description: "Esta vaga já está na sua lista de candidaturas.",
        })
        onOpenChange(false)
        return
      }

      if (apiError.status === 404) {
        toast.error("Vaga não encontrada", {
          description: "Esta vaga não está mais disponível.",
        })
        onOpenChange(false)
        return
      }

      toast.error("Erro ao enviar candidatura", {
        description: apiError.message || "Tente novamente em alguns instantes.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!vacancy) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Candidatura</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Você está prestes a se candidatar para a vaga:
            </p>
            <div className="font-semibold text-foreground mt-2">
              {vacancy.title}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {vacancy.location}
              </span>
              <span>{getModalityLabel(vacancy.modality)}</span>
            </div>
            <p className="mt-4">
              Tem certeza que deseja enviar sua candidatura para esta vaga?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Enviando...
                </>
              ) : (
                "Confirmar Candidatura"
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

