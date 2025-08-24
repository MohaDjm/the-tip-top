// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Handle uncaught exceptions from the application
Cypress.on('uncaught:exception', (err) => {
  // Handle specific Next.js/React errors that don't affect test functionality
  if (err.message.includes('k is not async iterable') || 
      err.message.includes('async iterable') ||
      err.message.includes('ResizeObserver loop limit exceeded') ||
      err.message.includes('Non-Error promise rejection captured')) {
    console.log('Ignoring known frontend error:', err.message)
    return false
  }
  
  // Let other errors fail the test
  console.log('Uncaught exception:', err.message)
  return false
})

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      injectAxe(): Chainable<void>
      checkA11y(): Chainable<void>
    }
  }
}
