import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Autenticação | Hirable.io",
  description: "Entre ou cadastre-se no Hirable.io para encontrar as melhores oportunidades de trabalho.",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-background">{children}</div>
}
