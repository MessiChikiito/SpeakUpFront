describe('Login screen (web)', () => {
  it('loads and validates form errors', () => {
    cy.visit('/');

    // Ensure screen is visible
    cy.get('[data-testid="login-screen"]').should('exist');

    // Try to submit empty
    cy.get('[data-testid="login-submit"]').click();

    // Shows field validations
    cy.contains('El email es requerido').should('be.visible');
    cy.contains('La contraseña es requerida').should('be.visible');

    // Type invalid email and short password
    cy.get('[data-testid="login-email"]').type('foo');
    cy.get('[data-testid="login-password"]').type('123');
    cy.get('[data-testid="login-submit"]').click();

    cy.contains('Email inválido').should('be.visible');
    cy.contains('La contraseña debe tener al menos 6 caracteres').should('be.visible');
  });
});