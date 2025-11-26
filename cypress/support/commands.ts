/// <reference types="cypress" />

import type { CandidateData, EmployerData } from './types';

// ***********************************************
// Custom Cypress commands for E2E testing
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      signupCandidate(data: CandidateData): Chainable<void>;
      signupEmployer(data: EmployerData): Chainable<void>;
      login(email: string, password: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('signupCandidate', (data: CandidateData) => {
  cy.visit('/auth/signup');

  cy.contains('button', 'Candidato').should('exist');
  
  cy.get('input[name="fullName"]').clear().type(data.fullName);
  cy.get('input[name="email"]').clear().type(data.email);
  cy.get('input[name="phone"]').clear().type(data.phone);
  
  cy.get('input[type="password"]').first().clear().type(data.password);
  cy.get('input[type="password"]').last().clear().type(data.confirmPassword);
  
  cy.contains('button', 'Criar conta').click();
  
  cy.url().should('include', '/auth/login', { timeout: 10000 });
});

Cypress.Commands.add('signupEmployer', (data: EmployerData) => {
  cy.visit('/auth/signup');
  
  cy.contains('button', 'Empresa').click();
  
  cy.wait(500);

  cy.get('input[name="companyName"]').clear().type(data.companyName);
  cy.get('input[name="contactName"]').clear().type(data.contactName);
  cy.get('input[name="cnpj"]').clear().type(data.cnpj);
  cy.get('input[name="email"]').clear().type(data.email);
  cy.get('input[name="phone"]').clear().type(data.phone);
  
  cy.get('input[type="password"]').first().clear().type(data.password);
  cy.get('input[type="password"]').last().clear().type(data.confirmPassword);
  
  cy.contains('button', 'Criar conta').click();
  
  cy.url().should('include', '/auth/login', { timeout: 10000 });
});

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/auth/login');
  
  cy.get('input[type="email"]').clear().type(email);
  cy.get('input[type="password"]').clear().type(password);
  
  cy.contains('button', 'Entrar').click();
  
  cy.url().should('not.include', '/auth/login', { timeout: 10000 });
});

export {};

