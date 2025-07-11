import { FullConfig } from '@playwright/test';

/**
 * Nettoyage global après tous les tests
 * Exécuté une seule fois après tous les tests
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Démarrage du nettoyage global des tests E2E');

  const fs = require('fs');
  const path = require('path');

  // Nettoyer les fichiers temporaires
  const tempDir = path.join(process.cwd(), 'tests/e2e/temp');
  if (fs.existsSync(tempDir)) {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
      console.log('🗑️  Fichiers temporaires supprimés');
    } catch (error) {
      console.warn('⚠️  Impossible de supprimer les fichiers temporaires:', error);
    }
  }

  // Nettoyer les anciennes captures d'écran (garder seulement les plus récentes)
  const screenshotsDir = path.join(process.cwd(), 'tests/e2e/screenshots');
  if (fs.existsSync(screenshotsDir)) {
    try {
      const files = fs.readdirSync(screenshotsDir);
      const now = Date.now();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 jours en millisecondes

      for (const file of files) {
        const filePath = path.join(screenshotsDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          console.log(`🗑️  Ancienne capture supprimée: ${file}`);
        }
      }
    } catch (error) {
      console.warn('⚠️  Impossible de nettoyer les captures d\'écran:', error);
    }
  }

  console.log('✅ Nettoyage global terminé');
}

export default globalTeardown;
