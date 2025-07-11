import { chromium, FullConfig } from '@playwright/test';

/**
 * Configuration globale pour les tests end-to-end
 * Exécutée une seule fois avant tous les tests
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Démarrage de la configuration globale des tests E2E');

  // Vérifier que le serveur de développement est accessible
  const baseURL = config.projects[0].use.baseURL || 'http://localhost:5173';
  
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    console.log(`📡 Vérification de l'accessibilité du serveur: ${baseURL}`);
    
    // Essayer de se connecter au serveur avec un timeout
    await page.goto(baseURL, { timeout: 30000 });
    
    // Vérifier que la page se charge correctement
    await page.waitForSelector('body', { timeout: 10000 });
    
    console.log('✅ Serveur accessible et fonctionnel');
    
    await browser.close();
  } catch (error) {
    console.error('❌ Erreur lors de la vérification du serveur:', error);
    console.log('💡 Assurez-vous que le serveur de développement est démarré avec: npm run dev');
    throw new Error(`Le serveur n'est pas accessible à l'adresse ${baseURL}`);
  }

  // Créer les répertoires nécessaires pour les tests
  const fs = require('fs');
  const path = require('path');
  
  const directories = [
    'tests/e2e/temp',
    'tests/e2e/screenshots',
    'test-results'
  ];

  for (const dir of directories) {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`📁 Répertoire créé: ${dir}`);
    }
  }

  console.log('🎯 Configuration globale terminée avec succès');
}

export default globalSetup;
