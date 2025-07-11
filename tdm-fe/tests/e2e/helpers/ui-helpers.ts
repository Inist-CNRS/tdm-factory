import { Page, expect } from '@playwright/test';
import { selectors, testUrls, expectedTexts } from '../fixtures/test-data';

/**
 * Helper pour les interactions avec l'interface utilisateur
 */
export class UIHelpers {
  constructor(private page: Page) {}

  /**
   * Navigue vers la page d'accueil
   */
  async goToHome() {
    await this.page.goto(testUrls.home);
    await expect(this.page).toHaveTitle(new RegExp(expectedTexts.pageTitle, 'i'));
  }

  /**
   * Navigue vers la page de traitement d'article
   */
  async goToArticleProcess() {
    await this.page.goto(testUrls.processArticle);
  }

  /**
   * Navigue vers la page de traitement de corpus
   */
  async goToCorpusProcess() {
    await this.page.goto(testUrls.processCorpus);
  }

  /**
   * Remplit le champ email
   */
  async fillEmail(email: string) {
    const emailInput = this.page.locator(selectors.emailInput);
    await emailInput.fill(email);
  }

  /**
   * Sélectionne un flux de traitement
   */
  async selectFlow(flowId: string) {
    const flowSelect = this.page.locator(selectors.flowSelect);
    await flowSelect.selectOption(flowId);
  }

  /**
   * Sélectionne un wrapper
   */
  async selectWrapper(wrapperUrl: string) {
    const wrapperSelect = this.page.locator(selectors.wrapperSelect);
    await wrapperSelect.selectOption(wrapperUrl);
  }

  /**
   * Sélectionne un enrichissement
   */
  async selectEnrichment(enrichmentUrl: string) {
    const enrichmentSelect = this.page.locator(selectors.enrichmentSelect);
    await enrichmentSelect.selectOption(enrichmentUrl);
  }

  /**
   * Clique sur le bouton de soumission
   */
  async clickSubmit() {
    const submitButton = this.page.locator(selectors.submitButton);
    await submitButton.click();
  }

  /**
   * Clique sur le bouton de traitement
   */
  async clickProcess() {
    const processButton = this.page.locator(selectors.processButton);
    await processButton.click();
  }

  /**
   * Attend et vérifie un message de succès
   */
  async waitForSuccessMessage(expectedMessage?: string) {
    const successMessage = this.page.locator(selectors.successMessage);
    await expect(successMessage).toBeVisible();
    
    if (expectedMessage) {
      await expect(successMessage).toContainText(expectedMessage);
    }
  }

  /**
   * Attend et vérifie un message d'erreur
   */
  async waitForErrorMessage(expectedMessage?: string) {
    const errorMessage = this.page.locator(selectors.errorMessage);
    await expect(errorMessage).toBeVisible();
    
    if (expectedMessage) {
      await expect(errorMessage).toContainText(expectedMessage);
    }
  }

  /**
   * Vérifie le statut du traitement
   */
  async checkProcessingStatus(expectedStatus: string) {
    const statusIndicator = this.page.locator(selectors.statusIndicator);
    await expect(statusIndicator).toContainText(expectedStatus);
  }

  /**
   * Attend qu'un élément soit visible
   */
  async waitForElement(selector: string, timeout = 30000) {
    await this.page.locator(selector).waitFor({ state: 'visible', timeout });
  }

  /**
   * Vérifie qu'un lien de téléchargement est disponible
   */
  async checkDownloadLink() {
    const downloadLink = this.page.locator(selectors.downloadLink);
    await expect(downloadLink).toBeVisible();
    await expect(downloadLink).toHaveAttribute('href');
  }

  /**
   * Attend la navigation vers une page de statut
   */
  async waitForStatusPage() {
    await this.page.waitForURL(/\/status\/[a-zA-Z0-9-]+/);
  }

  /**
   * Vérifie que la page contient un texte spécifique
   */
  async checkPageContainsText(text: string) {
    await expect(this.page.locator('body')).toContainText(text);
  }

  /**
   * Prend une capture d'écran pour le débogage
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `tests/e2e/screenshots/${name}.png` });
  }
}
