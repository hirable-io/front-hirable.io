/**
 * Funções utilitárias para mapear valores do backend para textos legíveis em português
 */

/**
 * Mapeia o status de uma aplicação para texto legível em português
 * @param status - Status da aplicação (NEW, REVIEWED, ANALISYS)
 * @returns String formatada em português ou o próprio status se não estiver mapeado
 */
export function getApplicationStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    NEW: 'Nova',
    REVIEWED: 'Revisada',
    ANALISYS: 'Em Análise',
  };
  return statusMap[status] || status;
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

