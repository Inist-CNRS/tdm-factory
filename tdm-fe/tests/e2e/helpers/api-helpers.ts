import { Page, expect } from '@playwright/test';

/**
 * Helper pour les interactions avec les APIs et les requêtes réseau
 */
export class APIHelpers {
  constructor(private page: Page) {}

  /**
   * Attend une requête API spécifique
   */
  async waitForAPICall(urlPattern: string | RegExp, method = 'GET') {
    return await this.page.waitForRequest(request => {
      const url = request.url();
      const requestMethod = request.method();
      
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern) && requestMethod === method;
      } else {
        return urlPattern.test(url) && requestMethod === method;
      }
    });
  }

  /**
   * Attend une réponse API spécifique
   */
  async waitForAPIResponse(urlPattern: string | RegExp, expectedStatus = 200) {
    const response = await this.page.waitForResponse(response => {
      const url = response.url();
      
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      } else {
        return urlPattern.test(url);
      }
    });

    expect(response.status()).toBe(expectedStatus);
    return response;
  }

  /**
   * Mock une réponse API
   */
  async mockAPIResponse(urlPattern: string | RegExp, responseData: any, status = 200) {
    await this.page.route(urlPattern, route => {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(responseData)
      });
    });
  }

  /**
   * Vérifie qu'une requête d'upload a été faite
   */
  async waitForFileUpload() {
    return await this.waitForAPICall('/api/traitment/upload', 'POST');
  }

  /**
   * Vérifie qu'une requête de démarrage de traitement a été faite
   */
  async waitForProcessStart() {
    return await this.waitForAPICall('/api/traitment/start', 'POST');
  }

  /**
   * Vérifie le statut d'un traitement
   */
  async waitForStatusCheck(processingId: string) {
    return await this.waitForAPIResponse(`/api/traitment/status?id=${processingId}`);
  }

  /**
   * Mock la liste des wrappers
   */
  async mockWrappersList(wrappers: any[]) {
    await this.mockAPIResponse('/api/data-wrappers/list', wrappers);
  }

  /**
   * Mock la liste des enrichissements
   */
  async mockEnrichmentsList(enrichments: any[]) {
    await this.mockAPIResponse('/api/data-enrichments/list', enrichments);
  }

  /**
   * Mock la configuration statique
   */
  async mockStaticConfig(config: any) {
    await this.mockAPIResponse('/config-static', config);
  }

  /**
   * Intercepte et vérifie les données d'une requête POST
   */
  async interceptPostData(urlPattern: string | RegExp): Promise<any> {
    return new Promise((resolve) => {
      this.page.route(urlPattern, route => {
        const postData = route.request().postData();
        resolve(postData ? JSON.parse(postData) : null);
        route.continue();
      });
    });
  }

  /**
   * Simule une erreur réseau
   */
  async simulateNetworkError(urlPattern: string | RegExp) {
    await this.page.route(urlPattern, route => {
      route.abort('failed');
    });
  }

  /**
   * Simule une réponse lente
   */
  async simulateSlowResponse(urlPattern: string | RegExp, delay = 5000) {
    await this.page.route(urlPattern, async route => {
      await new Promise(resolve => setTimeout(resolve, delay));
      route.continue();
    });
  }

  /**
   * Nettoie tous les mocks
   */
  async clearMocks() {
    await this.page.unrouteAll();
  }
}
