"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { ArrowLeft, Upload, FileText, User, Trash2, Camera } from 'lucide-react'
import { candidateService, type CandidateProfileResponse, type UpdateCandidateRequest, type ApiError } from "@/lib/services/candidate-service"

const profileSchema = z.object({
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().optional(),
  linkedinUrl: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || val === "" || z.string().url().safeParse(val).success,
      { message: "URL inválida" }
    ),
})

type ProfileForm = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState<CandidateProfileResponse | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [profileError, setProfileError] = useState<ApiError | null>(null)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [hasExistingResume, setHasExistingResume] = useState(false)
  const [existingResumeFileName, setExistingResumeFileName] = useState<string | null>(null)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isUploadingResume, setIsUploadingResume] = useState(false)

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      linkedinUrl: "",
    },
  })

  const loadProfile = async () => {
    setIsLoadingProfile(true)
    setProfileError(null)
    try {
      const data = await candidateService.getProfile()
      setProfile(data)
      
      // Preencher formulário com dados carregados
      form.reset({
        fullName: data.fullName || "",
        phone: data.phone || "",
        linkedinUrl: data.linkedInUrl || "",
      })

      // Carregar foto de perfil se existir (priorizar imageUrl do candidate)
      if (data.imageUrl) {
        setProfileImage(data.imageUrl)
      } else if (data.user?.imageUrl) {
        setProfileImage(data.user.imageUrl)
      } else {
        setProfileImage(null)
      }

      // Carregar informações do currículo se existir
      if (data.resumeUrl) {
        setHasExistingResume(true)
        // Extrair nome do arquivo da URL ou usar nome genérico
        const fileName = data.resumeUrl.split('/').pop() || 'curriculo.pdf'
        setExistingResumeFileName(fileName)
      } else {
        setHasExistingResume(false)
        setExistingResumeFileName(null)
      }
    } catch (err) {
      console.error('[ProfilePage] Error loading profile:', err)
      const apiError = err as ApiError
      setProfileError(apiError)
      if (apiError?.status === 401) {
        router.push('/auth/login')
        return
      }
      toast.error('Erro ao carregar perfil', {
        description: apiError?.message || 'Tente novamente mais tarde.',
      })
    } finally {
      setIsLoadingProfile(false)
    }
  }

  useEffect(() => {
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true)
    try {
      const updateData: UpdateCandidateRequest = {
        fullName: data.fullName,
        phone: data.phone || undefined,
        linkedInUrl: data.linkedinUrl || undefined,
      }
      
      const updated = await candidateService.updateProfile(updateData)
      setProfile(updated)
      toast.success('Perfil atualizado com sucesso!')
    } catch (err) {
      const apiError = err as ApiError
      if (apiError.status === 401) {
        router.push('/auth/login')
        return
      }
      toast.error('Erro ao atualizar perfil', {
        description: apiError.message || 'Tente novamente mais tarde.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const validateImageFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return 'Apenas imagens JPG, PNG ou WebP são aceitas'
    }
    
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      return 'Imagem deve ter no máximo 2MB'
    }
    
    return null
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validação
    const validationError = validateImageFile(file)
    if (validationError) {
      toast.error(validationError)
      // Limpar input para permitir selecionar o mesmo arquivo novamente
      event.target.value = ''
      return
    }

    // Salvar imagem anterior para reverter em caso de erro
    const previousImage = profileImage

    // Preview imediato
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      setProfileImage(imageUrl)
      setImageFile(file)
    }
    reader.readAsDataURL(file)

    // Upload
    setIsUploadingImage(true)
    try {
      const response = await candidateService.uploadProfileImage(file)
      setProfileImage(response.url)
      // Atualizar profile se necessário (priorizar imageUrl do candidate)
      if (profile) {
        setProfile({
          ...profile,
          imageUrl: response.url,
          user: { ...profile.user, imageUrl: response.url },
        })
      }
      toast.success('Foto de perfil atualizada com sucesso!')
    } catch (err) {
      const apiError = err as ApiError
      if (apiError.status === 401) {
        router.push('/auth/login')
        return
      }
      toast.error('Erro ao fazer upload da imagem', {
        description: apiError.message || 'Tente novamente mais tarde.',
      })
      // Reverter para imagem anterior em caso de erro
      if (previousImage) {
        setProfileImage(previousImage)
      } else if (profile?.imageUrl) {
        setProfileImage(profile.imageUrl)
      } else if (profile?.user?.imageUrl) {
        setProfileImage(profile.user.imageUrl)
      } else {
        setProfileImage(null)
      }
      setImageFile(null)
    } finally {
      setIsUploadingImage(false)
      // Limpar input para permitir selecionar o mesmo arquivo novamente
      event.target.value = ''
    }
  }

  const handleRemoveImage = () => {
    setProfileImage(null)
    setImageFile(null)
    if (profile) {
      setProfile({
        ...profile,
        imageUrl: undefined,
        user: { ...profile.user, imageUrl: undefined },
      })
    }
    toast.success("Imagem removida")
  }

  const validateResumeFile = (file: File): string | null => {
    if (file.type !== 'application/pdf') {
      return 'Apenas arquivos PDF são aceitos'
    }
    
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return 'Arquivo deve ter no máximo 5MB'
    }
    
    return null
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validação
    const validationError = validateResumeFile(file)
    if (validationError) {
      toast.error(validationError)
      // Limpar input para permitir selecionar o mesmo arquivo novamente
      event.target.value = ''
      return
    }

    // Upload
    setIsUploadingResume(true)
    try {
      const response = await candidateService.uploadResume(file)
      setExistingResumeFileName(file.name)
      setHasExistingResume(true)
      setResumeFile(file)
      // Atualizar profile se necessário
      if (profile) {
        setProfile({
          ...profile,
          resumeUrl: response.resumeUrl,
        })
      }
      toast.success('Currículo enviado com sucesso!')
    } catch (err) {
      const apiError = err as ApiError
      if (apiError.status === 401) {
        router.push('/auth/login')
        return
      }
      toast.error('Erro ao fazer upload do currículo', {
        description: apiError.message || 'Tente novamente mais tarde.',
      })
    } finally {
      setIsUploadingResume(false)
      // Limpar input para permitir selecionar o mesmo arquivo novamente
      event.target.value = ''
    }
  }

  const handleRemoveResume = () => {
    setResumeFile(null)
    setHasExistingResume(false)
    setExistingResumeFileName("")
    toast.success("Currículo removido")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Feed
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Meu Perfil</h1>
            <p className="text-muted-foreground">
              Mantenha suas informações atualizadas para receber as melhores oportunidades
            </p>
          </div>

          {isLoadingProfile ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-40 w-40 rounded-full mx-auto" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            </div>
          ) : profileError ? (
            <Card className="border-border/50 shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-foreground mb-2">Erro ao carregar perfil</h3>
                  <p className="text-muted-foreground mb-4">
                    {profileError.status === 0
                      ? 'Erro de conexão. Verifique sua internet e tente novamente.'
                      : profileError.message || 'Ocorreu um erro inesperado. Por favor, tente novamente em alguns instantes.'}
                  </p>
                  <Button onClick={loadProfile} variant="outline">
                    Tentar novamente
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Informações Pessoais
                </CardTitle>
                <CardDescription>Atualize seus dados pessoais e profissionais</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 flex flex-col items-center">
                  <div className="relative mb-4">
                    {profileImage ? (
                      <Image
                        src={profileImage}
                        alt="Foto de perfil"
                        width={150}
                        height={150}
                        className="h-40 w-40 rounded-full object-cover border-4 border-primary/20"
                        onError={() => {
                          setProfileImage(null)
                        }}
                      />
                    ) : (
                      <div className="h-40 w-40 rounded-full bg-muted border-4 border-primary/20 flex items-center justify-center">
                        <User className="h-20 w-20 text-muted-foreground" />
                      </div>
                    )}
                    <button
                      onClick={() => !isUploadingImage && document.getElementById("profile-image-upload")?.click()}
                      className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Alterar foto de perfil"
                      disabled={isUploadingImage}
                    >
                      <Camera className="h-5 w-5" />
                    </button>
                    {isUploadingImage && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("profile-image-upload")?.click()}
                      disabled={isUploadingImage}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploadingImage ? "Enviando..." : "Upload de Foto"}
                    </Button>
                    {profileImage && !isUploadingImage && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveImage}
                        className="text-destructive hover:text-destructive"
                        disabled={isUploadingImage}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <input
                    id="profile-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Imagens até 2MB • JPG, PNG ou WebP
                  </p>
                </div>

                <div className="border-t border-border/50 pt-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Completo</FormLabel>
                            <FormControl>
                              <Input placeholder="Seu nome completo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {profile?.user?.email && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Email</label>
                          <Input
                            value={profile.user.email}
                            disabled
                            className="bg-muted/50 cursor-not-allowed"
                          />
                          <p className="text-xs text-muted-foreground">
                            O email não pode ser alterado
                          </p>
                        </div>
                      )}

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone (opcional)</FormLabel>
                            <FormControl>
                              <Input placeholder="(11) 99999-9999" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="linkedinUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Link do LinkedIn (opcional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://linkedin.com/in/seuperfil" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        disabled={isLoading}
                      >
                        {isLoading ? "Salvando..." : "Salvar Alterações"}
                      </Button>
                    </form>
                  </Form>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Meu Currículo
                </CardTitle>
                <CardDescription>Faça upload do seu currículo em formato PDF (máx. 5MB)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hasExistingResume ? (
                    <div className="relative p-4 bg-muted/30 rounded-lg border border-border/50">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileText className="h-8 w-8 text-secondary flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground truncate">{existingResumeFileName}</p>
                            <p className="text-sm text-muted-foreground">PDF • {isUploadingResume ? "Enviando..." : "Enviado"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => !isUploadingResume && document.getElementById("resume-upload")?.click()}
                            disabled={isUploadingResume}
                          >
                            {isUploadingResume ? "Enviando..." : "Trocar Arquivo"}
                          </Button>
                          {!isUploadingResume && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleRemoveResume}
                              className="text-destructive hover:text-destructive bg-transparent"
                              disabled={isUploadingResume}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {isUploadingResume && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg z-10">
                          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border/50 rounded-lg bg-muted/20">
                      <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-foreground font-medium mb-2">Nenhum currículo enviado</p>
                      <p className="text-sm text-muted-foreground mb-4 text-center">
                        Arraste e solte seu arquivo PDF aqui ou clique para selecionar
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => !isUploadingResume && document.getElementById("resume-upload")?.click()}
                        className="flex items-center gap-2"
                        disabled={isUploadingResume}
                      >
                        <Upload className="h-4 w-4" />
                        {isUploadingResume ? "Enviando..." : "Fazer Upload"}
                      </Button>
                    </div>
                  )}

                  <input id="resume-upload" type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Apenas arquivos PDF são aceitos</p>
                    <p>• Tamanho máximo: 5MB</p>
                    <p>• Recomendamos um currículo atualizado e bem formatado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          )}
        </div>
      </div>
    </div>
  )
}
