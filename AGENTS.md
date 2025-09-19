
Build an extremely simple web application to pick today's scrum master from a fully remote team.
- Cycle through team members fairly.
- Team members can be marked as “out of office” so they’re skipped.
- Daily hint about running a successful standup, which doesn't repeat in two weeks.
- Daily pub quiz which doesn't repeat in a month.
- Create a team by entering team members' names without authentication.
- Share with team members by a url link or a short code.

## Tech Stack
### Web
- `React` for UI development.
- `Tailwind CSS` for styling.
- `ESLint` for code linting and formatting.
- `Vite` for tranpiling and bundle.
### Backend
- `Node.js` for server development.
- `PostgreSQL` for database.
### DevOps
- `Docker compose` for containers.
### QA
- `Playwright` for automation.

# Local Development
- `make dev` to start development environment with frontend on port 8080 and backend on port 3000.
- `make dev-bg` to start development environment in background.
- `make dev-stop` to stop development environment.
- `make prod` to start production environment.
- `make prod-stop` to stop production environment.

# Playwright
- While planning test scenarios, create ONLY empty test cases and detailed BDD comments. Each test case should have Given/When/Then comments describing what will be tested, but no actual implementation code. Focus on planning thorough test scenarios through comments only.
- Run Playwright `cd tests && npm test`.
- Configured by `tests/playwright.config.js`.
- Save Playwright test files in `tests/specs` folder with `.mjs` suffix.
- Save page objects in `tests/pages` folder.
- Save test results and reports in `tests/test-results` folder.
- Prioritise `data-testid` attribute over `id`, then `class` and lastly `textContent` when selecting an element.
- Leverage Playwright's auto-waiting.
- Avoid hardcoded timeouts as much as possible.
- Use page objects to centralise browser queries and manipulations. Test cases should not access dom elements directly.
- Run browsers headless for debugging by default unless specify otherwise.

# Convention
- Have design files next to relevant source code structurally in `web/docs` folder for frontend and in `server/docs` folder for backend.
  - Use markdown files for product and UX design. Do not include code blocks in product design.
  - Use static HTML files for UML diagrams.
  - Use markdown files for UI layout design in ASCII wireframe format.
  - Use static HTML files for UI design. Use `mcp__playwright__browser_navigate` and `mcp__playwright__browser_take_screenshot` to take screenshots from one iteration to be fed into the next to improve. Ask for human feedback after each iteration.
- Our own file names are in hyphenated lower case.
- Use JavaScript instead of TypeScript.
- Initialise React app files manually instead of using `npm create vite` to avoid interactive prompts and ignore existing files.
- Use `.mjs` for backend Node.js.
