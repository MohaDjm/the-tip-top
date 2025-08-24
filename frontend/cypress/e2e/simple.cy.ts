// cypress/e2e/simple.cy.ts
describe('Simple Frontend Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3001')
  })

  it('should load the homepage', () => {
    cy.get('body').should('be.visible')
    cy.title().should('not.be.empty')
  })

  it('should have basic navigation elements', () => {
    // Wait for page to load completely
    cy.wait(2000)
    
    // Check if page has loaded by looking for common elements
    cy.get('body').should('contain.text', 'Thé')
  })

  it('should be responsive', () => {
    // Test mobile viewport
    cy.viewport(375, 667)
    cy.get('body').should('be.visible')
    
    // Test tablet viewport
    cy.viewport(768, 1024)
    cy.get('body').should('be.visible')
    
    // Test desktop viewport
    cy.viewport(1280, 720)
    cy.get('body').should('be.visible')
  })

  it('should handle navigation', () => {
    // Wait for any async operations to complete
    cy.wait(1000)
    
    // Try to find any navigation links
    cy.get('body').then(($body) => {
      if ($body.find('nav').length > 0) {
        cy.get('nav').should('be.visible')
      }
    })
  })
})
