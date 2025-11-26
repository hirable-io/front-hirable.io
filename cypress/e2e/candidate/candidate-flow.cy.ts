/// <reference types="cypress" />

import { TestDataGenerator } from '../../support/test-helpers';
import type { CandidateData } from '../../support/types';

describe('Fluxo Básico do Candidato', () => {
  let candidateData: CandidateData;

  before(() => {
    TestDataGenerator.refreshTimestamp();
    candidateData = TestDataGenerator.generateCandidateData();
    
    cy.log('Generated candidate data:', candidateData.email);
  });

  it('CT-01: Deve criar uma conta de candidato', () => {
    cy.signupCandidate(candidateData);
    
    cy.url().should('include', '/auth/login');
    cy.contains('Conta criada com sucesso', { timeout: 5000 }).should('be.visible');
    
    cy.log('✓ Candidate account created successfully');
  });

  it('CT-02: Deve fazer login como candidato', () => {
    cy.login(candidateData.email, candidateData.password);
    
    cy.url().should('include', '/feed', { timeout: 10000 });
    cy.contains('Vagas Disponíveis').should('be.visible');
    
    cy.log('✓ Candidate logged in successfully');
  });
});

