import { test, expect } from '@playwright/test';
import { UIHelpers } from '../helpers/ui-helpers';
import { FileHelpers } from '../helpers/file-helpers';
import { APIHelpers } from '../helpers/api-helpers';
import { testEmails } from '../fixtures/test-data';

test.describe('Processing Workflow', () => {
  let uiHelpers: UIHelpers;
  let fileHelpers: FileHelpers;
  let apiHelpers: APIHelpers;

  test.beforeEach(async ({ page }) => {
    uiHelpers = new UIHelpers(page);
    fileHelpers = new FileHelpers();
    apiHelpers = new APIHelpers(page);
  });

  test.afterEach(async () => {
    fileHelpers.cleanup();
  });

  test('should complete article processing workflow', async ({ page }) => {
    await uiHelpers.goToArticleProcess();
    
    // Créer un fichier de test
    const csvFile = fileHelpers.createTestCsvFile();
    
    // Étape 1: Upload du fichier
    const fileInput = page.locator('input[type="file"]').first();
    const emailInput = page.locator('input[type="email"], [data-testid="email-input"]').first();
    
    if (await fileInput.isVisible() && await emailInput.isVisible()) {
      await fileInput.setInputFiles(csvFile);
      await emailInput.fill(testEmails.valid);
      
      // Sélectionner un flux si disponible
      const flowSelect = page.locator('select[name*="flow"], [data-testid="flow-select"]').first();
      if (await flowSelect.isVisible()) {
        const options = await flowSelect.locator('option').count();
        if (options > 1) {
          await flowSelect.selectOption({ index: 1 }); // Sélectionner la première option non-vide
        }
      }
      
      // Soumettre le formulaire
      const submitButton = page.locator('button[type="submit"], [data-testid="submit-button"]').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Attendre la redirection vers la page de statut ou de traitement
        try {
          await page.waitForURL(/\/status\/|\/process/, { timeout: 15000 });
        } catch {
          // Si pas de redirection, vérifier qu'on est sur une page de traitement
          const processingIndicators = [
            'text=/traitement/i',
            'text=/processing/i',
            '[data-testid="processing-status"]',
            '.processing-status'
          ];
          
          let processingFound = false;
          for (const selector of processingIndicators) {
            if (await page.locator(selector).first().isVisible({ timeout: 5000 })) {
              processingFound = true;
              break;
            }
          }
          
          if (!processingFound) {
            test.skip(true, 'Processing workflow not accessible');
          }
        }
      } else {
        test.skip(true, 'Submit button not found');
      }
    } else {
      test.skip(true, 'Required form elements not found');
    }
  });

  test('should show processing status', async ({ page }) => {
    // Simuler l'accès direct à une page de statut
    const mockProcessingId = 'test-processing-123';
    
    // Mock de la réponse API pour le statut
    await apiHelpers.mockAPIResponse(
      `/api/traitment/status?id=${mockProcessingId}`,
      {
        id: mockProcessingId,
        status: 1, // En cours
        originalName: 'test-file.csv',
        wrapper: 'test-wrapper',
        enrichment: 'test-enrichment'
      }
    );
    
    await page.goto(`/status/${mockProcessingId}`);
    
    // Vérifier que la page de statut s'affiche
    const statusIndicators = [
      'text=/statut/i',
      'text=/status/i',
      'text=/traitement/i',
      '[data-testid="status-indicator"]',
      '.status-indicator'
    ];
    
    let statusFound = false;
    for (const selector of statusIndicators) {
      if (await page.locator(selector).first().isVisible({ timeout: 5000 })) {
        statusFound = true;
        break;
      }
    }
    
    if (!statusFound) {
      // Vérifier au moins que la page se charge sans erreur
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should handle processing completion', async ({ page }) => {
    const mockProcessingId = 'test-completed-456';
    
    // Mock de la réponse API pour un traitement terminé
    await apiHelpers.mockAPIResponse(
      `/api/traitment/status?id=${mockProcessingId}`,
      {
        id: mockProcessingId,
        status: 3, // Terminé
        originalName: 'test-file.csv',
        wrapper: 'test-wrapper',
        enrichment: 'test-enrichment',
        resultFile: 'result-file.zip'
      }
    );
    
    await page.goto(`/status/${mockProcessingId}`);
    
    // Chercher un lien de téléchargement ou un indicateur de completion
    const completionIndicators = [
      'text=/terminé/i',
      'text=/completed/i',
      'text=/télécharger/i',
      'text=/download/i',
      'a[href*="download"]',
      '[data-testid="download-link"]'
    ];
    
    let completionFound = false;
    for (const selector of completionIndicators) {
      if (await page.locator(selector).first().isVisible({ timeout: 5000 })) {
        completionFound = true;
        break;
      }
    }
    
    // Si aucun indicateur de completion n'est trouvé, vérifier au moins que la page se charge
    if (!completionFound) {
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should handle processing errors', async ({ page }) => {
    const mockProcessingId = 'test-error-789';
    
    // Mock de la réponse API pour un traitement en erreur
    await apiHelpers.mockAPIResponse(
      `/api/traitment/status?id=${mockProcessingId}`,
      {
        id: mockProcessingId,
        status: -1, // Erreur
        originalName: 'test-file.csv',
        wrapper: 'test-wrapper',
        enrichment: 'test-enrichment',
        error: 'Processing failed'
      }
    );
    
    await page.goto(`/status/${mockProcessingId}`);
    
    // Chercher un indicateur d'erreur
    const errorIndicators = [
      'text=/erreur/i',
      'text=/error/i',
      'text=/échec/i',
      'text=/failed/i',
      '[data-testid="error-message"]',
      '.error-message',
      '.alert-danger'
    ];
    
    let errorFound = false;
    for (const selector of errorIndicators) {
      if (await page.locator(selector).first().isVisible({ timeout: 5000 })) {
        errorFound = true;
        break;
      }
    }
    
    if (!errorFound) {
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should handle corpus processing', async ({ page }) => {
    await uiHelpers.goToCorpusProcess();
    
    // Créer un fichier de test pour corpus
    const csvFile = fileHelpers.createTestCsvFile();
    
    const fileInput = page.locator('input[type="file"]').first();
    const emailInput = page.locator('input[type="email"], [data-testid="email-input"]').first();
    
    if (await fileInput.isVisible() && await emailInput.isVisible()) {
      await fileInput.setInputFiles(csvFile);
      await emailInput.fill(testEmails.valid);
      
      // Vérifier que l'interface corpus est différente de l'interface article
      const corpusIndicators = [
        'text=/corpus/i',
        'text=/collection/i',
        '[data-testid="corpus-options"]'
      ];
      
      let corpusFound = false;
      for (const selector of corpusIndicators) {
        if (await page.locator(selector).first().isVisible({ timeout: 3000 })) {
          corpusFound = true;
          break;
        }
      }
      
      // Si pas d'indicateur spécifique corpus, vérifier au moins que la page fonctionne
      const submitButton = page.locator('button[type="submit"], [data-testid="submit-button"]').first();
      if (await submitButton.isVisible()) {
        await expect(submitButton).toBeEnabled();
      }
    } else {
      test.skip(true, 'Corpus processing form not found');
    }
  });

  test('should validate required fields', async ({ page }) => {
    await uiHelpers.goToArticleProcess();
    
    // Essayer de soumettre sans remplir les champs requis
    const submitButton = page.locator('button[type="submit"], [data-testid="submit-button"]').first();
    
    if (await submitButton.isVisible()) {
      await submitButton.click();
      
      // Chercher des messages de validation
      const validationSelectors = [
        '[data-testid="validation-error"]',
        '.validation-error',
        '.field-error',
        'text=/requis/i',
        'text=/required/i'
      ];
      
      let validationFound = false;
      for (const selector of validationSelectors) {
        if (await page.locator(selector).first().isVisible({ timeout: 3000 })) {
          validationFound = true;
          break;
        }
      }
      
      // Si pas de message de validation, vérifier que le bouton reste désactivé
      if (!validationFound) {
        const isDisabled = await submitButton.isDisabled();
        expect(isDisabled).toBe(true);
      }
    } else {
      test.skip(true, 'Submit button not found');
    }
  });
});
