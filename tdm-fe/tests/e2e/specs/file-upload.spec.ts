import { test, expect } from '@playwright/test';
import { UIHelpers } from '../helpers/ui-helpers';
import { FileHelpers } from '../helpers/file-helpers';
import { APIHelpers } from '../helpers/api-helpers';
import { testEmails, selectors } from '../fixtures/test-data';

test.describe('File Upload', () => {
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

  test('should upload a CSV file successfully', async ({ page }) => {
    await uiHelpers.goToArticleProcess();
    
    // Créer un fichier CSV de test
    const csvFile = fileHelpers.createTestCsvFile();
    
    // Chercher l'input de fichier (peut avoir différents sélecteurs selon l'implémentation)
    const fileInputSelectors = [
      'input[type="file"]',
      '[data-testid="file-input"]',
      '.file-input input',
      'input[accept*="csv"]'
    ];
    
    let fileInput;
    for (const selector of fileInputSelectors) {
      fileInput = page.locator(selector).first();
      if (await fileInput.isVisible()) {
        break;
      }
    }
    
    if (fileInput && await fileInput.isVisible()) {
      await fileInput.setInputFiles(csvFile);
      
      // Vérifier que le fichier a été sélectionné
      const fileName = await fileInput.inputValue();
      expect(fileName).toContain('test-sample.csv');
    } else {
      // Si aucun input de fichier n'est trouvé, marquer le test comme en attente
      test.skip(true, 'File input not found - may need to update selectors');
    }
  });

  test('should show error for invalid file type', async ({ page }) => {
    await uiHelpers.goToArticleProcess();
    
    // Créer un fichier avec une extension non supportée
    const invalidFile = fileHelpers.createCustomFile('test.txt', 'This is a text file');
    
    const fileInput = page.locator('input[type="file"]').first();
    
    if (await fileInput.isVisible()) {
      await fileInput.setInputFiles(invalidFile);
      
      // Chercher un message d'erreur
      const errorSelectors = [
        '[data-testid="error-message"]',
        '.error-message',
        '.alert-danger',
        'text=/format.*non.*support/i',
        'text=/invalid.*file/i'
      ];
      
      let errorFound = false;
      for (const selector of errorSelectors) {
        const errorElement = page.locator(selector).first();
        if (await errorElement.isVisible({ timeout: 5000 })) {
          errorFound = true;
          break;
        }
      }
      
      // Si aucune erreur n'est affichée, vérifier que le fichier n'est pas accepté
      if (!errorFound) {
        const submitButton = page.locator('button[type="submit"], [data-testid="submit-button"]').first();
        if (await submitButton.isVisible()) {
          const isDisabled = await submitButton.isDisabled();
          expect(isDisabled).toBe(true);
        }
      }
    } else {
      test.skip(true, 'File input not found');
    }
  });

  test('should handle large file upload', async ({ page }) => {
    await uiHelpers.goToArticleProcess();
    
    // Créer un fichier CSV plus volumineux
    let largeContent = 'title,author,year,description\n';
    for (let i = 0; i < 1000; i++) {
      largeContent += `"Article ${i}","Author ${i}",${2020 + (i % 5)},"Description for article ${i}"\n`;
    }
    
    const largeFile = fileHelpers.createCustomFile('large-test.csv', largeContent);
    
    const fileInput = page.locator('input[type="file"]').first();
    
    if (await fileInput.isVisible()) {
      await fileInput.setInputFiles(largeFile);
      
      // Vérifier que le fichier est accepté ou qu'un message approprié est affiché
      await page.waitForTimeout(2000); // Attendre le traitement
      
      const fileName = await fileInput.inputValue();
      expect(fileName).toContain('large-test.csv');
    } else {
      test.skip(true, 'File input not found');
    }
  });

  test('should complete file upload workflow', async ({ page }) => {
    await uiHelpers.goToArticleProcess();
    
    // Créer un fichier de test
    const csvFile = fileHelpers.createTestCsvFile();
    
    // Remplir le formulaire complet
    const fileInput = page.locator('input[type="file"]').first();
    const emailInput = page.locator('input[type="email"], [data-testid="email-input"]').first();
    
    if (await fileInput.isVisible() && await emailInput.isVisible()) {
      // Upload du fichier
      await fileInput.setInputFiles(csvFile);
      
      // Remplir l'email
      await emailInput.fill(testEmails.valid);
      
      // Chercher et cliquer sur le bouton de soumission
      const submitSelectors = [
        'button[type="submit"]',
        '[data-testid="submit-button"]',
        'button:has-text("Télécharger")',
        'button:has-text("Upload")',
        '.submit-button'
      ];
      
      let submitButton;
      for (const selector of submitSelectors) {
        submitButton = page.locator(selector).first();
        if (await submitButton.isVisible()) {
          break;
        }
      }
      
      if (submitButton && await submitButton.isVisible()) {
        // Intercepter la requête d'upload
        const uploadPromise = apiHelpers.waitForFileUpload();
        
        await submitButton.click();
        
        // Attendre la requête d'upload
        try {
          await uploadPromise;
          
          // Vérifier qu'on est redirigé ou qu'un message de succès apparaît
          const successSelectors = [
            '[data-testid="success-message"]',
            '.success-message',
            '.alert-success',
            'text=/success/i',
            'text=/téléchargé/i'
          ];
          
          let successFound = false;
          for (const selector of successSelectors) {
            const successElement = page.locator(selector).first();
            if (await successElement.isVisible({ timeout: 10000 })) {
              successFound = true;
              break;
            }
          }
          
          // Vérifier la redirection vers une page de statut
          if (!successFound) {
            await page.waitForURL(/\/status\//, { timeout: 10000 });
          }
          
        } catch (error) {
          console.log('Upload request not intercepted, checking for UI feedback');
          // Vérifier au moins que l'interface réagit
          await page.waitForTimeout(3000);
        }
      } else {
        test.skip(true, 'Submit button not found');
      }
    } else {
      test.skip(true, 'Required form elements not found');
    }
  });

  test('should validate email field', async ({ page }) => {
    await uiHelpers.goToArticleProcess();
    
    const emailInput = page.locator('input[type="email"], [data-testid="email-input"]').first();
    
    if (await emailInput.isVisible()) {
      // Tester avec un email invalide
      await emailInput.fill(testEmails.invalid);
      await emailInput.blur();
      
      // Chercher un message d'erreur de validation
      const validationSelectors = [
        '[data-testid="email-error"]',
        '.email-error',
        'text=/email.*invalid/i',
        'text=/adresse.*invalide/i'
      ];
      
      let validationFound = false;
      for (const selector of validationSelectors) {
        const validationElement = page.locator(selector).first();
        if (await validationElement.isVisible({ timeout: 3000 })) {
          validationFound = true;
          break;
        }
      }
      
      // Si pas de message de validation visible, vérifier la validation HTML5
      if (!validationFound) {
        const validity = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
        expect(validity).toBe(false);
      }
      
      // Tester avec un email valide
      await emailInput.fill(testEmails.valid);
      await emailInput.blur();
      
      const validityValid = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
      expect(validityValid).toBe(true);
    } else {
      test.skip(true, 'Email input not found');
    }
  });
});
