/// <reference types="cypress" />

import { TestDataGenerator } from '../../support/test-helpers';
import type { EmployerData, VacancyData } from '../../support/types';

describe('Fluxo Básico da Empresa', () => {
  let employerData: EmployerData;

  before(() => {
    TestDataGenerator.refreshTimestamp();
    employerData = TestDataGenerator.generateEmployerData();
    
    cy.log('Generated employer data:', employerData.email);
    cy.log('Generated CNPJ:', employerData.cnpj);
  });

  it('ET-01: Deve criar uma conta de empresa', () => {
    cy.signupEmployer(employerData);
    
    cy.url().should('include', '/auth/login');
    cy.contains('Conta criada com sucesso', { timeout: 5000 }).should('be.visible');
    
    cy.log('✓ Employer account created successfully');
  });

  it('ET-02: Deve fazer login como empresa', () => {
    cy.login(employerData.email, employerData.password);
    
    cy.url().should('include', '/dashboard/employer', { timeout: 10000 });
    cy.contains('Dashboard').should('be.visible');
    
    cy.log('✓ Employer logged in successfully');
  });
});

