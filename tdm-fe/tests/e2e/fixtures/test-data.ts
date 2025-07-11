/**
 * Données de test pour les tests end-to-end
 */

export const testFiles = {
  // Fichier CSV de test pour les traitements
  csvSample: {
    name: 'test-sample.csv',
    content: `title,author,year
"Test Article 1","John Doe",2023
"Test Article 2","Jane Smith",2024
"Test Article 3","Bob Johnson",2022`,
    mimeType: 'text/csv'
  },
  
  // Fichier XML de test
  xmlSample: {
    name: 'test-sample.xml',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<articles>
  <article>
    <title>Test Article XML</title>
    <author>XML Author</author>
    <year>2023</year>
  </article>
</articles>`,
    mimeType: 'application/xml'
  }
};

export const testEmails = {
  valid: 'test@example.com',
  invalid: 'invalid-email'
};

export const testFlows = {
  // IDs de flux de test basés sur la configuration
  csvToEnrichment: 'csv-enrichment-flow',
  xmlToWrapper: 'xml-wrapper-flow'
};

export const testUrls = {
  home: '/',
  processArticle: '/process/article',
  processCorpus: '/process/corpus',
  privacyPolicy: '/privacy-policy'
};

export const selectors = {
  // Sélecteurs pour les éléments de l'interface
  fileInput: '[data-testid="file-input"]',
  emailInput: '[data-testid="email-input"]',
  submitButton: '[data-testid="submit-button"]',
  processButton: '[data-testid="process-button"]',
  statusMessage: '[data-testid="status-message"]',
  errorMessage: '[data-testid="error-message"]',
  successMessage: '[data-testid="success-message"]',
  
  // Navigation
  homeLink: '[data-testid="home-link"]',
  articleProcessLink: '[data-testid="article-process-link"]',
  corpusProcessLink: '[data-testid="corpus-process-link"]',
  
  // Formulaires
  flowSelect: '[data-testid="flow-select"]',
  wrapperSelect: '[data-testid="wrapper-select"]',
  enrichmentSelect: '[data-testid="enrichment-select"]',
  
  // Résultats
  resultContainer: '[data-testid="result-container"]',
  downloadLink: '[data-testid="download-link"]',
  statusIndicator: '[data-testid="status-indicator"]'
};

export const expectedTexts = {
  pageTitle: 'TDM Factory',
  uploadSuccess: 'Fichier téléchargé avec succès',
  processStarted: 'Traitement démarré',
  invalidEmail: 'Adresse email invalide',
  fileRequired: 'Fichier requis',
  processingComplete: 'Traitement terminé'
};
