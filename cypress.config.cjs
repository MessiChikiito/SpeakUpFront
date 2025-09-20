// cypress.config.cjs - CommonJS to avoid ts-node hooks on JS
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  video: false,
  e2e: {
    baseUrl: 'http://localhost:8090',
    specPattern: 'cypress/e2e/**/*.cy.{js,ts,jsx,tsx}',
    supportFile: false,
    viewportWidth: 1280,
    viewportHeight: 800,
  },
});