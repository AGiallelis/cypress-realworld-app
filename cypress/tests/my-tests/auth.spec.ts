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

  it.only('AUTH-004: Login with empty username', () => {
    cy.visit("/signin")
    cy.get('#username').first().focus()
    cy.get('[data-test="signin-password"]').type('s3cret') 
    cy.get('#username-helper-text').should('be.visible').and('contain','Username is required')
    // cy.get('[data-test="signin-submit"]').click()
    // cy.url().should('include', '/signin')
    // cy.get('[data-test="signin-error"]').should('be.visible').and('contain','Username or password is invalid')
    // cy.get('[data-test="signin-username"]').should('be.visible').and('have.value','')
    // cy.get('[data-test="signin-password"]').should('be.visible').and('have.value','')
    // cy.get('[data-test="sidenav-username"]').should('not.exist')
  })
})