"use client"

import { Button } from "@/components/ui/button"
import { Menu, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export function Header() {
  const pathname = usePathname()
  const { isAuthenticated, user, logout } = useAuth()

  const isActive = (path: string) => pathname === path

  const candidateNavItems = [
    { label: 'Feed de vagas', path: '/feed' },
    { label: 'Editar perfil', path: '/profile' },
    { label: 'Candidaturas', path: '/applications' },
  ]

  const isCandidate = isAuthenticated && user?.role === 'CANDIDATE'

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 w-full max-w-7xl items-center justify-between mx-auto px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/hirable-logo.png"
            alt="Logo Hirable.io"
            width={32}
            height={32}
            className="object-cover"
          />
          <span className="text-xl font-bold text-foreground">Hirable.io</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {isCandidate ? (
            candidateNavItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-primary'
                    : 'text-foreground hover:text-primary'
                }`}
              >
                {item.label}
              </Link>
            ))
          ) : (
            <>
              <a href="#inicio" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Início
              </a>
              <Link href="/feed" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Vagas
              </Link>
              <a href="#sobre" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Sobre
              </a>
              <a href="#contato" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Contato
              </a>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:inline-flex text-foreground hover:text-primary"
                onClick={logout}
              >
                Sair
              </Button>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:inline-flex text-foreground hover:text-primary"
                asChild
              >
                <Link href="/auth/login">Entrar</Link>
              </Button>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 hidden md:inline-flex" asChild>
                <Link href="/auth/signup">Cadastrar-se</Link>
              </Button>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}