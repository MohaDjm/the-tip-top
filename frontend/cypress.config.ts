// frontend/cypress.config.ts
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3001',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    
    setupNodeEvents(on) {
      // Événements personnalisés
      on('task', {
        // Nettoyer la base de données avant les tests
        async resetDb() {
          console.log('Réinitialisation de la base de données de test...');
          return null;
        },
        
        // Générer des codes de test
        async generateTestCodes() {
          console.log('Génération de codes de test...');
          return null;
        },
      });
    },
    
    env: {
      apiUrl: 'http://localhost:3001/api',
      coverage: true,
    },
  },
  
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
  },
});