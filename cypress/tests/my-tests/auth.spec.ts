import { notEqual } from "assert"

describe('Authentication', () => {
  it('AUTH-001: Login with valid credentials', () => {
    cy.visit("/signin")
    cy.get('[data-test="signin-username"]').type("Heath93")
    cy.get('[data-test="signin-password"]').type('s3cret')
    cy.get('[data-test="signin-submit"]').click()
    cy.url().should('not.include', '/signin')
    cy.get('[data-test="main"]').should('be.visible')
    cy.get('[data-test="sidenav-username"]').should('be.visible').and('contain','@Heath93')
    cy.get('[data-test="sidenav-signout"]').click()
    cy.url().should('include', '/signin')
  })

  it('AUTH-002: Login with invalid username', () => {
    cy.visit("/signin")
    cy.get('[data-test="signin-username"]').type("test")
    cy.get('[data-test="signin-password"]').type('s3cret')
    cy.get('[data-test="signin-submit"]').click()
    cy.url().should('include', '/signin')
    cy.get('[data-test="signin-error"]').should('be.visible').and('contain','Username or password is invalid')
    cy.get('[data-test="signin-username"]').should('be.visible').and('have.value','')
    cy.get('[data-test="signin-password"]').should('be.visible').and('have.value','')
    cy.get('[data-test="sidenav-username"]').should('not.exist')
  })

  it('AUTH-003: Login with invalid password', () => {
    cy.visit("/signin")
    cy.get('[data-test="signin-username"]').type("Heath93")
    cy.get('[data-test="signin-password"]').type('test')
    cy.get('[data-test="signin-submit"]').click()
    cy.url().should('include', '/signin')
    cy.get('[data-test="signin-error"]').should('be.visible').and('contain','Username or password is invalid')
    cy.get('[data-test="signin-username"]').should('be.visible').and('have.value','')
    cy.get('[data-test="signin-password"]').should('be.visible').and('have.value','')
    cy.get('[data-test="sidenav-username"]').should('not.exist')
  })

  it('AUTH-004: Login with empty username', () => {
    cy.visit("/signin")
    cy.get('#username').focus()
    cy.get('[data-test="signin-password"]').type('s3cret') 
    cy.get('#username-helper-text').should('be.visible').and('contain','Username is required')
    cy.get('[data-test="signin-submit"]').should('be.disabled')
    cy.url().should('include', '/signin')  
  })

  it('AUTH-EXTRA-001: Password with 3 characters is rejected', () => {
    cy.visit("/signin")
    cy.get('[data-test="signin-username"]').type("Heath93")
    cy.get('[data-test="signin-password"]').type('tes') 
    cy.get('[data-test="signin-submit"]').should('be.disabled')
    cy.get('#password-helper-text').should('be.visible').and('contain','Password must contain at least 4 characters')
    cy.url().should('include', '/signin')  
  })

  it('AUTH-EXTRA-002: Password with exactly 4 characters is accepted',() => {
    cy.visit("/signin")
    cy.get('[data-test="signin-username"]').type("Heath93")
    cy.get('[data-test="signin-password"]').type('test') 
    cy.get('[data-test="signin-submit"]').click()
    cy.get('[data-test="signin-error"]').should('be.visible').and('contain','Username or password is invalid')
    cy.url().should('include', '/signin')  
  })
  // BUG-001: No validation message shown for empty password (expected per AUTH-005)
  it.skip('AUTH-005: Login with empty password', () => {
    cy.visit("/signin")
    cy.get('[data-test="signin-username"]').type("Heath93")
    cy.get('#password').focus().blur()
    cy.get('[data-test="signin-submit"]').should('be.disabled')
    cy.get('#username-helper-text').should('not.exist')
    cy.get('#password-helper-text').should('be.visible')
    cy.url().should('include', '/signin')  
  })
})