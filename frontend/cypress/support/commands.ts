// frontend/cypress/support/commands.ts

// Custom command for login
Cypress.Commands.add('login', (email: string, password: string, role: string = 'CLIENT') => {
  cy.request('POST', 'http://localhost:3001/api/auth/login', {
    email,
    password,
  }).then((response) => {
    window.localStorage.setItem('token', response.body.token);
    window.localStorage.setItem('user', JSON.stringify(response.body.user));
  });
});

// Custom command for accessibility testing
Cypress.Commands.add('injectAxe', () => {
  cy.window({ log: false }).then((win) => {
    const script = win.document.createElement('script');
    script.src = 'https://unpkg.com/axe-core@4.4.3/axe.min.js';
    win.document.head.appendChild(script);
  });
});

Cypress.Commands.add('checkA11y', (context?: any, options?: any) => {
  cy.window({ log: false }).then((win) => {
    if (win.axe) {
      cy.wrap(null).then(() => {
        return new Cypress.Promise((resolve, reject) => {
          win.axe.run(context || win.document, options || {}, (err: any, results: any) => {
            if (err) {
              reject(err);
            } else {
              const violations = results.violations;
              if (violations.length > 0) {
                cy.log(`Found ${violations.length} accessibility violations`);
                violations.forEach((violation: any) => {
                  cy.log(`${violation.impact}: ${violation.description}`);
                });
                reject(new Error(`${violations.length} accessibility violations found`));
              } else {
                resolve(results);
              }
            }
          });
        });
      });
    }
  });
});

// Extend Cypress namespace for TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string, role?: string): Chainable<void>;
      injectAxe(): Chainable<void>;
      checkA11y(context?: any, options?: any): Chainable<void>;
    }
  }
}
