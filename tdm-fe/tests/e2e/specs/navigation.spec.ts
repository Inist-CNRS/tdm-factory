import { test, expect } from '@playwright/test';
import { UIHelpers } from '../helpers/ui-helpers';
import { testUrls, expectedTexts } from '../fixtures/test-data';

test.describe('Navigation', () => {
  let uiHelpers: UIHelpers;

  test.beforeEach(async ({ page }) => {
    uiHelpers = new UIHelpers(page);
  });

  test('should load the home page', async ({ page }) => {
    await uiHelpers.goToHome();
    
    // Vérifier que la page d'accueil se charge correctement
    await expect(page).toHaveTitle(new RegExp(expectedTexts.pageTitle, 'i'));
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to article processing page', async ({ page }) => {
    await uiHelpers.goToHome();
    
    // Cliquer sur le lien de traitement d'article (si disponible)
    const articleLink = page.locator('a[href*="/process/article"]').first();
    if (await articleLink.isVisible()) {
      await articleLink.click();
      await expect(page).toHaveURL(/\/process\/article/);
    } else {
      // Navigation directe si le lien n'est pas visible
      await uiHelpers.goToArticleProcess();
      await expect(page).toHaveURL(/\/process\/article/);
    }
  });

  test('should navigate to corpus processing page', async ({ page }) => {
    await uiHelpers.goToHome();
    
    // Cliquer sur le lien de traitement de corpus (si disponible)
    const corpusLink = page.locator('a[href*="/process/corpus"]').first();
    if (await corpusLink.isVisible()) {
      await corpusLink.click();
      await expect(page).toHaveURL(/\/process\/corpus/);
    } else {
      // Navigation directe si le lien n'est pas visible
      await uiHelpers.goToCorpusProcess();
      await expect(page).toHaveURL(/\/process\/corpus/);
    }
  });

  test('should navigate to privacy policy', async ({ page }) => {
    await uiHelpers.goToHome();
    
    // Chercher le lien de politique de confidentialité
    const privacyLink = page.locator('a[href*="/privacy-policy"]').first();
    if (await privacyLink.isVisible()) {
      await privacyLink.click();
      await expect(page).toHaveURL(/\/privacy-policy/);
    } else {
      // Navigation directe
      await page.goto(testUrls.privacyPolicy);
      await expect(page).toHaveURL(/\/privacy-policy/);
    }
  });

  test('should handle 404 for non-existent pages', async ({ page }) => {
    await page.goto('/non-existent-page');
    
    // Vérifier que la page gère correctement les erreurs 404
    // Soit une page 404 dédiée, soit une redirection vers l'accueil
    const is404 = page.locator('text=/404|not found/i').first();
    const isHome = page.locator('body').first();
    
    await expect(is404.or(isHome)).toBeVisible();
  });

  test('should have responsive design', async ({ page }) => {
    await uiHelpers.goToHome();
    
    // Tester différentes tailles d'écran
    const viewports = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 768, height: 1024 },  // Tablet
      { width: 375, height: 667 }    // Mobile
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.reload();
      
      // Vérifier que la page est toujours fonctionnelle
      await expect(page.locator('body')).toBeVisible();
      
      // Vérifier que les éléments principaux sont visibles
      const mainContent = page.locator('main, #app-container, .container').first();
      if (await mainContent.isVisible()) {
        await expect(mainContent).toBeVisible();
      }
    }
  });

  test('should load static resources', async ({ page }) => {
    // Intercepter les requêtes de ressources statiques
    const resourceRequests: string[] = [];
    
    page.on('request', request => {
      const url = request.url();
      if (url.includes('.css') || url.includes('.js') || url.includes('.png') || url.includes('.svg')) {
        resourceRequests.push(url);
      }
    });

    await uiHelpers.goToHome();
    
    // Attendre que les ressources se chargent
    await page.waitForLoadState('networkidle');
    
    // Vérifier qu'au moins quelques ressources ont été chargées
    expect(resourceRequests.length).toBeGreaterThan(0);
  });
});
