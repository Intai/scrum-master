/**
 * Page Object for Team Dashboard Page
 * Centralizes browser queries and manipulations for team dashboard functionality
 */
export class TeamDashboardPage {
  constructor(page) {
    this.page = page
  }

  /**
   * Wait for the team dashboard to load
   */
  async waitForLoad() {
    await this.page.waitForSelector('[data-testid="team-name"]')
  }

  /**
   * Get the current team name displayed
   * @returns {Promise<string>} The team name
   */
  async getTeamName() {
    return await this.page.locator('[data-testid="team-name"]').textContent()
  }

  /**
   * Get all active team members
   * @returns {Promise<Array<{id: string, name: string}>>} Array of member objects
   */
  async getTeamMembers() {
    const memberElements = this.page.locator('[data-testid^="member-status-"]')
    const members = []

    const count = await memberElements.count()
    for (let i = 0; i < count; i++) {
      const element = memberElements.nth(i)
      const dataTestId = await element.getAttribute('data-testid')
      const memberId = dataTestId.replace('member-status-', '')
      const memberName = await element.locator('.font-medium').textContent()
      members.push({ id: memberId, name: memberName.trim() })
    }

    return members
  }

  /**
   * Check if a member status card exists
   * @param {string} memberName - The name of the member
   * @returns {Promise<boolean>} True if the member status card exists
   */
  async hasMember(memberName) {
    const members = await this.getTeamMembers()
    return members.some(member => member.name === memberName)
  }

  /**
   * Get the availability status of a member
   * @param {string} memberName - The name of the member
   * @returns {Promise<string>} The status text (e.g., "Available", "Out of office")
   */
  async getMemberStatus(memberName) {
    const members = await this.getTeamMembers()
    const member = members.find(m => m.name === memberName)
    if (!member) {
      throw new Error(`Member ${memberName} not found`)
    }

    const statusElement = this.page.locator(`[data-testid="member-status-${member.id}"] .text-xs`)
    return await statusElement.textContent()
  }

  /**
   * Click on a member's status card to open availability modal
   * @param {string} memberName - The name of the member
   */
  async clickMemberStatus(memberName) {
    const members = await this.getTeamMembers()
    const member = members.find(m => m.name === memberName)
    if (!member) {
      throw new Error(`Member ${memberName} not found`)
    }

    await this.page.click(`[data-testid="member-status-${member.id}"]`)
  }

  /**
   * Mark a member as available in the availability modal
   */
  async markMemberAvailable() {
    await this.page.click('[data-testid="mark-available-button"]')
  }

  /**
   * Mark a member as out of office in the availability modal
   */
  async markMemberOutOfOffice() {
    await this.page.click('[data-testid="mark-out-button"]')
  }

  /**
   * Get the current URL
   * @returns {Promise<string>} The current page URL
   */
  async getCurrentUrl() {
    return this.page.url()
  }

  /**
   * Check if the URL contains a team identifier
   * @returns {Promise<boolean>} True if URL contains '/team/'
   */
  async hasTeamUrl() {
    const url = await this.getCurrentUrl()
    return url.includes('/team/')
  }

  /**
   * Get the team member count display
   * @returns {Promise<{available: number, total: number}>} Available and total member counts
   */
  async getMemberCounts() {
    const availableText = await this.page.locator('.text-sm.text-neutral-600').first().textContent()
    const totalText = await this.page.locator('.text-sm.text-neutral-600').last().textContent()

    const available = parseInt(availableText.split(' ')[0])
    const total = parseInt(totalText.split(' ')[0])

    return { available, total }
  }
}