import { test, expect } from '@playwright/test';

/**
 * Test d'exemple simple pour vérifier que Playwright fonctionne
 * Ce test peut être utilisé pour valider l'installation et la configuration
 */
test.describe('Test d\'exemple', () => {
  test('should load the application', async ({ page }) => {
    // Aller à la page d'accueil
    await page.goto('/');
    
    // Vérifier que la page se charge
    await expect(page.locator('body')).toBeVisible();
    
    // Vérifier que le titre contient quelque chose de pertinent
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    
    console.log('✅ Application chargée avec succès');
    console.log('📄 Titre de la page:', title);
  });

  test('should have basic HTML structure', async ({ page }) => {
    await page.goto('/');
    
    // Vérifier la présence d'éléments HTML de base
    await expect(page.locator('html')).toBeVisible();
    await expect(page.locator('head')).toBeAttached();
    await expect(page.locator('body')).toBeVisible();
    
    console.log('✅ Structure HTML de base présente');
  });

  test('should respond to different viewport sizes', async ({ page }) => {
    // Tester différentes tailles d'écran
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      
      // Vérifier que la page est toujours visible
      await expect(page.locator('body')).toBeVisible();
      
      console.log(`✅ ${viewport.name} (${viewport.width}x${viewport.height}) fonctionne`);
    }
  });
});
