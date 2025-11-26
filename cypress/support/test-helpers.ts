import type { CandidateData, EmployerData, VacancyData } from './types';
import { cnpj } from 'cpf-cnpj-validator';
export class TestDataGenerator {
  private static timestamp = Date.now();
  static generateCandidateData(): CandidateData {
    return {
      fullName: `Candidato Teste ${this.timestamp}`,
      email: `candidato-${this.timestamp}@test.com`,
      phone: '11999999999',
      password: 'senha123456',
      confirmPassword: 'senha123456',
    };
  }
  static generateEmployerData(): EmployerData {
    const validCnpj = cnpj.generate();
    
    return {
      companyName: `Empresa Teste ${this.timestamp}`,
      contactName: `Contato Teste ${this.timestamp}`,
      cnpj: validCnpj,
      email: `empresa-${this.timestamp}@test.com`,
      phone: '11988888888',
      password: 'senha123456',
      confirmPassword: 'senha123456',
    };
  }

  static generateVacancyData(): VacancyData {
    return {
      title: `Vaga Teste ${this.timestamp}`,
      description: 'Esta é uma vaga de teste criada automaticamente pelo Cypress. A vaga requer conhecimentos em tecnologias modernas e oferece excelentes benefícios para os candidatos selecionados.',
      location: 'São Paulo, SP',
      modality: 'REMOTE',
      minimumSalaryValue: 5000,
      maximumSalaryValue: 8000,
    };
  }

  static refreshTimestamp(): void {
    this.timestamp = Date.now();
  }

  static getCurrentTimestamp(): number {
    return this.timestamp;
  }
}

