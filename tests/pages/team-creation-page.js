/**
 * Page Object for Team Creation Page
 * Centralizes browser queries and manipulations for team creation functionality
 */
export class TeamCreationPage {
  constructor(page) {
    this.page = page
  }

  /**
   * Navigate to the team creation page from landing page
   */
  async navigateFromLanding() {
    await this.page.goto('http://localhost:8080')
    await this.page.click('[data-testid="create-team-button"]')
  }

  /**
   * Navigate directly to the team creation page
   */
  async goto() {
    await this.page.goto('http://localhost:8080/create-team')
  }

  /**
   * Enter team name in the input field
   * @param {string} teamName - The name of the team
   */
  async enterTeamName(teamName) {
    await this.page.fill('[data-testid="team-name-input"]', teamName)
  }

  /**
   * Add a member to the team
   * @param {string} memberName - The name of the member to add
   */
  async addMember(memberName) {
    await this.page.fill('[data-testid="add-member-input"]', memberName)
    await this.page.click('[data-testid="add-member-button"]')
  }

  /**
   * Create the team by clicking the submit button
   */
  async createTeam() {
    await this.page.click('[data-testid="create-team-submit"]')
  }

  /**
   * Get the error message if present
   * @returns {Promise<string|null>} The error message text or null if no error
   */
  async getErrorMessage() {
    const errorElement = this.page.locator('.text-red-700')
    if (await errorElement.isVisible()) {
      return await errorElement.textContent()
    }
    return null
  }

  /**
   * Check if the create team button is enabled
   * @returns {Promise<boolean>} True if the button is enabled
   */
  async isCreateTeamButtonEnabled() {
    return await this.page.locator('[data-testid="create-team-submit"]').isEnabled()
  }

  /**
   * Get the current member count displayed
   * @returns {Promise<number>} Number of members currently added
   */
  async getMemberCount() {
    const memberInputs = this.page.locator('[data-testid^="member-input-"]')
    return await memberInputs.count()
  }
}