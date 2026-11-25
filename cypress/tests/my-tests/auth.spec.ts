import { notEqual } from "assert"

describe('Authentication', () => {

  beforeEach(()=>{
        cy.visit('/signin')
  })

  it('AUTH-001: Login with valid credentials', () => {
    cy.login('Heath93','s3cret')
    cy.url().should('not.include', '/signin')
    cy.get('[data-test="main"]').should('be.visible')
    cy.get('[data-test="sidenav-signout"]').click()
    cy.url().should('include', '/signin')
  })

  it('AUTH-002: Login with invalid username', () => {
    cy.login('test','s3cret')
    cy.url().should('include', '/signin')
    cy.get('[data-test="signin-error"]').should('be.visible').and('contain','Username or password is invalid')
    cy.get('[data-test="signin-username"]').should('be.visible').and('have.value','')
    cy.get('[data-test="signin-password"]').should('be.visible').and('have.value','')
    cy.get('[data-test="sidenav-username"]').should('not.exist')
  })

  it('AUTH-003: Login with invalid password', () => {
    cy.login('Heath93','test')
    cy.url().should('include', '/signin')
    cy.get('[data-test="signin-error"]').should('be.visible').and('contain','Username or password is invalid')
    cy.get('[data-test="signin-username"]').should('be.visible').and('have.value','')
    cy.get('[data-test="signin-password"]').should('be.visible').and('have.value','')
    cy.get('[data-test="sidenav-username"]').should('not.exist')
  })

  it('AUTH-004: Login with empty username', () => {
    cy.get('#username').focus()
    cy.get('[data-test="signin-password"]').type('s3cret') 
    cy.get('#username-helper-text').should('be.visible').and('contain','Username is required')
    cy.get('[data-test="signin-submit"]').should('be.disabled')
    cy.url().should('include', '/signin')  
  })

  it('AUTH-EXTRA-001: Password with 3 characters is rejected', () => {
    cy.get('[data-test="signin-username"]').type("Heath93")
    cy.get('[data-test="signin-password"]').type('tes')
    cy.get('#password').blur()
    cy.get('[data-test="signin-submit"]').should('be.disabled')
    cy.get('#password-helper-text').should('be.visible').and('contain','Password must contain at least 4 characters')
    cy.url().should('include', '/signin')  
  })

  it('AUTH-EXTRA-002: Password with exactly 4 characters is accepted',() => {
    cy.login('Heath93','test')
    cy.get('[data-test="signin-submit"]').click()
    cy.get('[data-test="signin-error"]').should('be.visible').and('contain','Username or password is invalid')
    cy.url().should('include', '/signin')  
  })
  
  // BUG-001: No validation message shown for empty password (expected per AUTH-005)
  it.skip('AUTH-005: Login with empty password', () => {
    cy.get('[data-test="signin-username"]').type("Heath93")
    cy.get('#password').focus().blur()
    cy.get('[data-test="signin-submit"]').should('be.disabled')
    cy.get('#username-helper-text').should('not.exist')
    cy.get('#password-helper-text').should('be.visible')
    cy.url().should('include', '/signin')  
  })

  // TODO: add password helper-text assertion when BUG-001 is fixed
  it('AUTH-006: Login with both fields empty', () => {
    cy.get("#username").focus().blur()
    cy.get('#password').focus().blur()
    cy.get('[data-test="signin-submit"]').should('be.disabled')
    cy.get('#username-helper-text').should('be.visible').and('contain','Username is required')
  })

  it('AUTH-007: Logout from application', () => {
    cy.login('Heath93', 's3cret')
    cy.url().should('not.include', '/signin')
    cy.get('[data-test="sidenav-username"]').should('be.visible').and('contain', '@Heath93')
    cy.get('[data-test="sidenav-signout"]').click()
    cy.url().should('include', '/signin')
    cy.get("#username").should('be.visible')
    cy.get('#password').should('be.visible')
    cy.get('[data-test="sidenav-username"]').should('not.exist')
  })
})