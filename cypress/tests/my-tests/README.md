# Cypress E2E Automation – Real World App

This folder contains my automated end-to-end tests for the **Cypress Real World App (RWA)**.
The goal of this project is to convert manual QA test cases into reliable, maintainable Cypress tests, while learning Cypress and good test automation practices along the way.

## About

- **Application under test:** [Cypress Real World App](https://github.com/cypress-io/cypress-realworld-app), a demo payment application
- **Source of test cases:** Manual QA test case workbook (Excel), covering ~90 test cases across 10 modules
- **Tool:** Cypress (E2E testing)
- **Language:** TypeScript

## Project structure

```
cypress/
└── tests/
    └── my-tests/
        ├── auth.spec.ts    # Authentication tests (AUTH-xxx)
        └── README.md       # This file
```

My tests live in their own folder so they stay separate from the example tests that ship with the RWA repository.

## How to run

**Prerequisites:** Node.js and Yarn installed.

1. Install dependencies and start the application (frontend on port `3000`, backend on port `3001`):

   ```bash
   yarn install
   yarn dev
   ```

2. In a second terminal, open the Cypress Test Runner:

   ```bash
   yarn cypress:open
   ```

   Choose **E2E Testing**, pick a browser, and select `auth.spec.ts`.

3. Or run only my tests in headless mode:

   ```bash
   yarn cypress run --spec "cypress/tests/my-tests/**"
   ```

**Test data:** tests use the seeded user `Heath93` (password `s3cret`) that comes with the RWA development database. These credentials are for local demo data only.

## Test coverage

| Test ID  | Scenario                       | Type                  | Status         |
|----------|--------------------------------|-----------------------|----------------|
| AUTH-001 | Login with valid credentials   | Positive / Functional | ✅ Automated   |
| AUTH-002 | Login with invalid username    | Negative / Functional | ✅ Automated   |
| AUTH-003 | Login with invalid password    | Negative / Functional | 🚧 In progress |
| AUTH-004 | Login with empty username      | Validation            | ⏳ Planned     |
| AUTH-005 | Login with empty password      | Validation            | ⏳ Planned     |
| AUTH-006 | Login with both fields empty   | Validation            | ⏳ Planned     |
| AUTH-007 | Logout from application        | Positive / Functional | ⏳ Planned     |
| AUTH-008 | Open protected page after logout | Security            | ⏳ Planned     |
| AUTH-009 | Refresh page after login       | Session               | ⏳ Planned     |
| AUTH-010 | Verify password field masking  | UI / Security         | ⏳ Planned     |

## Approach

**Stable selectors.** I select elements with `data-test` attributes (e.g. `[data-test="signin-username"]`) instead of CSS classes, IDs or HTML structure. These attributes exist only for testing, so the tests don't break when the design changes. I also keep selectors as simple as possible (no `> div` chains).

**Every test must be able to fail.** For each assertion I ask: *"If the application were broken, would this test turn red?"* I verify this by breaking the test on purpose. For example, I run the valid-login test with a wrong password and confirm that it fails. This is how I caught an early assertion (`cy.url().should('include', '/')`) that always passed, because every URL contains `/`.

**Assert what the user sees.** I don't rely only on the URL. After a successful login I check that the user's username is visible in the side navigation and shows the correct user (`@Heath93`), which only appears for an authenticated user.

**Check both sides.** Negative tests prove the user stayed out: the URL still contains `/signin`, the error message is visible, and elements that only exist for logged-in users (like `sidenav-username`) do not exist (`not.exist`).

**Choosing the right assertion.** I learned to tell apart similar checks:
- `not.be.visible`: the element exists but is hidden
- `not.exist`: the element is not in the page at all
- `contain` checks text content, while `have.value` checks what is typed in an input field

**Security awareness.** AUTH-002 (wrong username) and AUTH-003 (wrong password) both expect the **same** generic message: *"Username or password is invalid"*. A different message for each case would let an attacker discover which accounts exist (*user enumeration*), so the identical message is itself a security check.

## What I learned

- How to map manual test steps to Cypress commands (`cy.visit`, `cy.get`, `.type`, `.click`, `.should`)
- How `cypress.config.ts` works, and the difference between **E2E** and **component** testing
- How to read glob patterns such as `cypress/tests/**/*.spec.{js,jsx,ts,tsx}`
- That a passing test isn't automatically a useful test, and how to test my tests
- How to troubleshoot the local environment (e.g. a port already in use)

## Next steps

- Finish AUTH-003 and the validation tests AUTH-004 to AUTH-006
- Create a custom command `cy.login()` to remove repeated login steps
- Use `beforeEach` for shared setup
- Continue with Registration, Money Transfers and the other modules from the workbook
- Use `cy.intercept()` and `cy.request()` for API-level checks
