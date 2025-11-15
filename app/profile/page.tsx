"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { ArrowLeft, Upload, FileText, User, Trash2, Camera } from 'lucide-react'

const profileSchema = z.object({
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  linkedinUrl: z.string().url("URL inválida").optional().or(z.literal("")),
})

type ProfileForm = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [hasExistingResume, setHasExistingResume] = useState(false)
  const [existingResumeFileName, setExistingResumeFileName] = useState("curriculo_joao_silva.pdf")
  const [profileImage, setProfileImage] = useState<string | null>("/abstract-profile.png")
  const [imageFile, setImageFile] = useState<File | null>(null)

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "João Silva",
      email: "joao.silva@email.com",
      phone: "(11) 99999-9999",
      jobTitle: "Desenvolvedor Frontend Sênior",
      linkedinUrl: "https://linkedin.com/in/joaosilva",
    },
  })

  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log("[v0] Profile data:", data)
    console.log("[v0] Profile image file:", imageFile)
    toast.success("Perfil atualizado com sucesso!")
    setIsLoading(false)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Apenas imagens são aceitas")
        return
      }

      if (file.size > 2 * 1024 * 1024) {
        toast.error("Imagem deve ter no máximo 2MB")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        setProfileImage(imageUrl)
        setImageFile(file)
        toast.success("Imagem de perfil atualizada!")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setProfileImage("/abstract-profile.png")
    setImageFile(null)
    toast.success("Imagem removida")
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Apenas arquivos PDF são aceitos")
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Arquivo deve ter no máximo 5MB")
        return
      }

      setResumeFile(file)
      setHasExistingResume(true)
      setExistingResumeFileName(file.name)
      toast.success("Currículo enviado com sucesso!")
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
                    <Image
                      src={profileImage || "/placeholder.svg?height=150&width=150&query=profile"}
                      alt="Foto de perfil"
                      width={150}
                      height={150}
                      className="h-40 w-40 rounded-full object-cover border-4 border-primary/20"
                    />
                    <button
                      onClick={() => document.getElementById("profile-image-upload")?.click()}
                      className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
                      title="Alterar foto de perfil"
                    >
                      <Camera className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("profile-image-upload")?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload de Foto
                    </Button>
                    {profileImage !== "/abstract-profile.png" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveImage}
                        className="text-destructive hover:text-destructive"
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

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="seu@email.com"
                                type="email"
                                disabled
                                className="bg-muted/50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
                        name="jobTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título Profissional</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Desenvolvedor Frontend Sênior" {...field} />
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
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-secondary" />
                        <div>
                          <p className="font-medium text-foreground">{existingResumeFileName}</p>
                          <p className="text-sm text-muted-foreground">PDF • Enviado</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById("resume-upload")?.click()}
                        >
                          Trocar Arquivo
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveResume}
                          className="text-destructive hover:text-destructive bg-transparent"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
                        onClick={() => document.getElementById("resume-upload")?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Fazer Upload
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
        </div>
      </div>
    </div>
  )
}
