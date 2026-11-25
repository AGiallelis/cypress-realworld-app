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
| AUTH-003 | Login with invalid password    | Negative / Functional | ✅ Automated   |
| AUTH-004 | Login with empty username      | Validation            | ✅ Automated   |
| AUTH-005 | Login with empty password      | Validation            | ❌ Failed – [BUG-001](#defects-found) (test skipped) |
| AUTH-006 | Login with both fields empty   | Validation            | ✅ Automated (password message check pending [BUG-001](#defects-found)) |
| AUTH-007 | Logout from application        | Positive / Functional | ✅ Automated   |
| AUTH-008 | Open protected page after logout | Security            | 🚧 In progress |
| AUTH-009 | Refresh page after login       | Session               | ⏳ Planned     |
| AUTH-010 | Verify password field masking  | UI / Security         | ⏳ Planned     |

### Extra tests (not in the original workbook)

I added these boundary tests after noticing the rule *"Password must contain at least 4 characters"*. They use their own IDs so they don't get mixed up with the workbook's test case IDs.

| Test ID        | Scenario                                      | Type     | Status       |
|----------------|-----------------------------------------------|----------|--------------|
| AUTH-EXTRA-001 | Password with 3 characters is rejected        | Boundary | ✅ Automated |
| AUTH-EXTRA-002 | Password with exactly 4 characters is accepted | Boundary | ✅ Automated |

## Defects found

### BUG-001: No validation message shown for empty password on Sign In page

| Field       | Details |
|-------------|---------|
| Test case   | AUTH-005 |
| Severity    | Low (no functional or security impact; the Sign In button stays disabled) |
| Environment | Local (`http://localhost:3000`) |

**Steps to reproduce**
1. Open `http://localhost:3000/signin`
2. Enter `Heath93` in the Username field
3. Click inside the Password field
4. Without typing anything, click outside the Password field

**Expected result:** a required-field validation message is shown below the Password field, consistent with the Username field ("Username is required").

**Actual result:** no validation message is shown below the Password field. The Sign In button is disabled with no explanation to the user.

**Automation:** reproduced by test AUTH-005, which is marked `it.skip` with a reference to BUG-001 until the defect is fixed. The test asserts the *expected* behavior, so it was not changed to pass.

## Approach

**Stable selectors.** I prefer `data-test` attributes (e.g. `[data-test="signin-username"]`) over CSS classes or HTML structure. These attributes exist only for testing, so the tests don't break when the design changes. I also keep selectors as simple as possible (no `> div` chains).

**Know which element you are selecting.** In this app the `data-test` attribute of a form field sits on the wrapper `<div>`, not on the `<input>` itself. `.type()` still works (Cypress clicks the wrapper, which focuses the input), but `.focus()` fails on a `<div>`, and `have.value` on a `<div>` is always empty. For these cases I target the input directly by its stable id (e.g. `#username`, `#password`), and the validation messages by their ids (e.g. `#username-helper-text`).

**Every test must be able to fail.** For each assertion I ask: *"If the application were broken, would this test turn red?"* I verify this by breaking the test on purpose. For example, I run the valid-login test with a wrong password and confirm that it fails. This is how I caught an early assertion (`cy.url().should('include', '/')`) that always passed, because every URL contains `/`.

**Assert what the user sees.** I don't rely only on the URL. After a successful login I check that the user's username is visible in the side navigation and shows the correct user (`@Heath93`), which only appears for an authenticated user.

**Check both sides.** Negative tests prove the user stayed out: the URL still contains `/signin`, the error message is visible, and elements that only exist for logged-in users (like `sidenav-username`) do not exist (`not.exist`).

**Choosing the right assertion.** I learned to tell apart similar checks:
- `not.be.visible`: the element exists but is hidden
- `not.exist`: the element is not in the page at all
- `contain` checks text content, while `have.value` checks what is typed in an input field

**Disabled is not the same as "looks grey".** For validation tests I don't click the Sign In button. Cypress cannot click a disabled element, and the real requirement is that the user *cannot* submit. So I assert `be.disabled`, plus the exact validation message below the field.

**Boundary Value Analysis.** Bugs often hide exactly at limits (e.g. `> 4` instead of `>= 4`). For the 4-character password rule I test both sides of the boundary: 3 characters must be rejected, and exactly 4 must be accepted.

**Tests describe expected behavior, not current behavior.** When the app didn't match the workbook (AUTH-005), I didn't change the test to make it pass. I kept the expected assertion, logged a defect, and skipped the test with a comment that references the bug.

**Reuse the team's commands, and only for setup.** Before writing a custom command I check `cypress/support/commands.ts`. The team already has `cy.login()` and `cy.getBySel()`, so I reuse them instead of creating duplicates (a second `login` command would also overwrite theirs). I use `cy.login()` only where login is a setup step, such as AUTH-007 (Logout). Where the login form itself is under test (AUTH-001 to AUTH-006), I keep the steps visible in the test. `cy.login()` waits for the login API response but doesn't assert success, so my tests still check it.

**Shared setup with `beforeEach`.** Every authentication test starts on `/signin`, so `cy.visit('/signin')` lives in a `beforeEach` instead of being repeated in every test.

**Keep known gaps visible.** AUTH-006 checks everything that works today (username message, disabled button). The password-message assertion is left out with a `TODO` comment that references BUG-001, so it isn't forgotten.

**Security awareness.** AUTH-002 (wrong username) and AUTH-003 (wrong password) both expect the **same** generic message: *"Username or password is invalid"*. A different message for each case would let an attacker discover which accounts exist (*user enumeration*), so the identical message is itself a security check.

## What I learned

- How to map manual test steps to Cypress commands (`cy.visit`, `cy.get`, `.type`, `.click`, `.should`)
- How `cypress.config.ts` works, and the difference between **E2E** and **component** testing
- How to read glob patterns such as `cypress/tests/**/*.spec.{js,jsx,ts,tsx}`
- That a passing test isn't automatically a useful test, and how to test my tests
- How to troubleshoot the local environment (e.g. a port already in use)
- How to inspect the DOM to find the right element, and why the wrapper vs. input difference matters
- How to test validation with `.focus()` / `.blur()`, `be.disabled` and helper-text messages
- Boundary Value Analysis, and keeping test IDs traceable to the original test cases
- How to write a clear, reproducible bug report, and the difference between severity and priority
- How to read existing team code (custom commands, `cy.intercept` / `cy.wait`) before writing my own
- That a click alone proves nothing: after an action (e.g. logout), the test must check the result from both sides (sign-in form visible **and** logged-in elements gone)
- Useful runner tools: `it.only` to focus on one test while working, `it.skip` to park a test with a reason

## Next steps

- Finish AUTH-008 (protected page after logout), then AUTH-009 and AUTH-010
- Review the `have.value` assertions in AUTH-002/003 so they target the `<input>` elements (`#username`, `#password`)
- Re-enable AUTH-005 once BUG-001 is fixed
- Reuse the team's existing custom commands from `cypress/support/commands.ts` instead of duplicating them: `cy.login(username, password)` for tests where login is only the setup step (e.g. AUTH-007 Logout), and `cy.getBySel(value)` for `data-test` selectors. I checked the existing code before writing my own. `cy.login()` already waits for the login API response (`cy.intercept` + `cy.wait`), but it does not assert that login succeeded, so my tests still do that themselves.
- Use `beforeEach` for shared setup
- Continue with Registration, Money Transfers and the other modules from the workbook
- Use `cy.intercept()` and `cy.request()` for API-level checks
