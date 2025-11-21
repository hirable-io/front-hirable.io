import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata um valor numérico como moeda brasileira (R$)
 * @param value - Valor numérico a ser formatado
 * @returns String formatada como moeda (ex: "R$ 8.000,00")
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Formata uma faixa salarial (mínimo e máximo)
 * @param min - Valor mínimo
 * @param max - Valor máximo
 * @returns String formatada (ex: "R$ 8.000,00 - R$ 12.000,00")
 */
export function formatSalaryRange(min: number, max: number): string {
  return `${formatCurrency(min)} - ${formatCurrency(max)}`
}

/**
 * Formata uma data ISO para formato brasileiro (DD/MM/AAAA)
 * @param dateString - Data em formato ISO 8601
 * @returns String formatada (ex: "15/01/2024")
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR')
}

/**
 * Trunca um texto para um número máximo de caracteres
 * @param text - Texto a ser truncado
 * @param maxLength - Número máximo de caracteres
 * @returns Texto truncado com "..." se necessário
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
