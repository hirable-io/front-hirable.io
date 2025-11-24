"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ArrowLeft, Eye, EyeOff, User, Building2 } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { useAuth, type ApiError } from "@/hooks/use-auth"

const baseSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
  isEmployer: z.boolean().default(false),
})

const jobSeekerSchema = baseSchema.extend({
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(10, "Telefone inválido"),
})

const employerSchema = baseSchema.extend({
  companyName: z.string().min(2, "Nome da empresa deve ter pelo menos 2 caracteres"),
  contactName: z.string().min(2, "Nome do contato deve ter pelo menos 2 caracteres"),
  phone: z.string().min(10, "Telefone inválido"),
  cnpj: z.string().min(14, "CNPJ inválido"),
})

type SignupForm = z.infer<typeof jobSeekerSchema> | z.infer<typeof employerSchema>

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEmployer, setIsEmployer] = useState(false)
  const { registerCandidate, registerEmployer } = useAuth()
  const router = useRouter()

  const schema = isEmployer ? employerSchema : jobSeekerSchema

  const form = useForm({
    resolver: zodResolver(
      schema.refine((data) => data.password === data.confirmPassword, {
        message: "Senhas não coincidem",
        path: ["confirmPassword"],
      }),
    ),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      isEmployer: false,
      fullName: "",
      phone: "",
      companyName: "",
      contactName: "",
      cnpj: "",
    },
  })

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      if (isEmployer) {
        await registerEmployer({
          companyName: data.companyName,
          contactName: data.contactName,
          cnpj: data.cnpj,
          email: data.email,
          phone: data.phone,
          password: data.password,
          confirmPassword: data.confirmPassword,
        })
      } else {
        await registerCandidate({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          password: data.password,
          confirmPassword: data.confirmPassword,
        })
      }

      toast.success('Conta criada com sucesso!')
      router.push('/auth/login')
    } catch (error) {
      const apiError = error as ApiError
      
      if (apiError.status === 409) {
        const errorMessage = apiError.message?.toLowerCase() || ''
        if (errorMessage.includes('cnpj') || errorMessage.includes('document')) {
          toast.error('CNPJ já cadastrado')
        } else {
          toast.error('Email já cadastrado')
        }
      } else if (apiError.status === 400) {
        toast.error(apiError.message || 'Dados inválidos')
      } else if (apiError.status === 0) {
        toast.error('Erro de conexão. Tente novamente.')
      } else {
        toast.error(apiError.message || 'Erro ao criar conta')
      }
      
      form.setValue('password', '')
      form.setValue('confirmPassword', '')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserTypeChange = (checked: boolean) => {
    setIsEmployer(checked)
    form.setValue("isEmployer", checked)
    form.reset({
      email: form.getValues("email"),
      password: form.getValues("password"),
      confirmPassword: form.getValues("confirmPassword"),
      isEmployer: checked,
    })
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao início
          </Link>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <Image
                src="/images/hirable-logo.png"
                alt="Logo Hirable.io"
                width={48}
                height={48}
                className="object-cover"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Criar sua conta</CardTitle>
            <CardDescription className="text-muted-foreground">
              Junte-se ao Hirable.io e encontre oportunidades incríveis
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="relative mb-6 w-full rounded-full bg-muted p-1 grid grid-cols-2">
              <div
                className={`absolute top-1 bottom-1 left-1 w-1/2 rounded-full bg-primary transition-transform duration-300 ease-in-out ${
                  isEmployer ? "translate-x-full" : "translate-x-0"
                }`}
              />
              <button
                type="button"
                onClick={() => handleUserTypeChange(false)}
                className={`relative z-10 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors duration-300 ${
                  !isEmployer ? "text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                <User className="h-4 w-4" />
                Candidato
              </button>
              <button
                type="button"
                onClick={() => handleUserTypeChange(true)}
                className={`relative z-10 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors duration-300 ${
                  isEmployer ? "text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                <Building2 className="h-4 w-4" />
                Empresa
              </button>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {isEmployer ? (
                  <>
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Empresa</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome da sua empresa" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Contato</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cnpj"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CNPJ</FormLabel>
                          <FormControl>
                            <Input placeholder="00.000.000/0000-00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                ) : (
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
                )}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="seu@email.com" type="email" {...field} />
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
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(11) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Digite sua senha"
                            type={showPassword ? "text" : "password"}
                            {...field}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Confirme sua senha"
                            type={showConfirmPassword ? "text" : "password"}
                            {...field}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
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
                  {isLoading ? "Criando conta..." : "Criar conta"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                  Entrar
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}