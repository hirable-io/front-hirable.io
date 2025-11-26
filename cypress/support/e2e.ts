import './commands';

Cypress.on('uncaught:exception', (err, runnable) => {
  console.error('Uncaught exception:', err.message);
  return false;
});

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});

