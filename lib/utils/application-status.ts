/**
 * Funções utilitárias para mapear valores do backend para textos legíveis em português
 */

/**
 * Mapeia o status de uma aplicação para texto legível em português
 * @param status - Status da aplicação (NEW, REVIEWED, ANALISYS, REJECTED, HIRED)
 * @returns String formatada em português ou o próprio status se não estiver mapeado
 */
export function getApplicationStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    NEW: 'Nova',
    REVIEWED: 'Revisada',
    ANALISYS: 'Em Análise',
    REJECTED: 'Rejeitada',
    HIRED: 'Contratado',
  };
  return statusMap[status] || status;
}

/**
 * Retorna classes CSS do Tailwind para cores de badge baseadas no status
 * @param status - Status da aplicação (NEW, REVIEWED, ANALISYS, REJECTED, HIRED)
 * @returns String com classes CSS do Tailwind ou classes padrão (cinza) se status não estiver mapeado
 */
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    NEW: 'bg-blue-100 text-blue-800 border-blue-200',
    REVIEWED: 'bg-purple-100 text-purple-800 border-purple-200',
    ANALISYS: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    REJECTED: 'bg-red-100 text-red-800 border-red-200',
    HIRED: 'bg-green-100 text-green-800 border-green-200',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
}

/**
 * Mapeia a modalidade de trabalho para texto legível em português
 * @param modality - Modalidade de trabalho (REMOTE, HYBRID, ONSITE)
 * @returns String formatada em português ou a própria modalidade se não estiver mapeada
 */
export function getModalityLabel(modality: string): string {
  const modalityMap: Record<string, string> = {
    REMOTE: 'Remoto',
    HYBRID: 'Híbrido',
    ONSITE: 'Presencial',
  };
  return modalityMap[modality] || modality;
}

