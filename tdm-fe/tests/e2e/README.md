# Tests End-to-End avec Playwright

Ce répertoire contient les tests end-to-end (E2E) pour l'application TDM Factory frontend.

## Vue d'ensemble

Les tests E2E utilisent Playwright pour simuler les interactions utilisateur réelles avec l'application web. Ils testent l'ensemble du workflow depuis l'interface utilisateur jusqu'aux interactions avec le backend.

## Structure des fichiers

```
tests/e2e/
├── fixtures/
│   └── test-data.ts           # Données de test, sélecteurs, URLs
├── helpers/
│   ├── api-helpers.ts         # Helpers pour les interactions API
│   ├── file-helpers.ts        # Helpers pour la gestion des fichiers
│   └── ui-helpers.ts          # Helpers pour les interactions UI
├── specs/
│   ├── navigation.spec.ts     # Tests de navigation et responsive
│   ├── file-upload.spec.ts    # Tests d'upload et validation
│   ├── processing-workflow.spec.ts # Tests du workflow complet
│   └── admin-interface.spec.ts # Tests de l'interface admin
├── global-setup.ts            # Configuration globale avant tests
├── global-teardown.ts         # Nettoyage global après tests
└── README.md                  # Cette documentation
```

## Fixtures et données de test

### `fixtures/test-data.ts`

Contient toutes les données de test réutilisables :

- **testFiles** : Fichiers CSV et XML de test
- **testEmails** : Adresses email valides et invalides
- **selectors** : Sélecteurs CSS pour les éléments UI
- **expectedTexts** : Textes attendus dans l'interface
- **testUrls** : URLs de test pour la navigation

## Helpers

### `helpers/ui-helpers.ts`

Classe `UIHelpers` pour les interactions avec l'interface utilisateur :

- Navigation entre les pages
- Remplissage des formulaires
- Vérification des messages d'erreur/succès
- Gestion des captures d'écran

### `helpers/file-helpers.ts`

Classe `FileHelpers` pour la gestion des fichiers de test :

- Création de fichiers CSV/XML temporaires
- Upload de fichiers via l'interface
- Nettoyage des fichiers temporaires

### `helpers/api-helpers.ts`

Classe `APIHelpers` pour les interactions avec les APIs :

- Interception des requêtes réseau
- Mock des réponses API
- Vérification des appels API
- Simulation d'erreurs réseau

## Tests spécifiques

### `navigation.spec.ts`

Tests de navigation et d'interface :

- Chargement de la page d'accueil
- Navigation entre les pages
- Gestion des erreurs 404
- Tests responsive sur différentes tailles d'écran
- Chargement des ressources statiques

### `file-upload.spec.ts`

Tests d'upload de fichiers :

- Upload de fichiers CSV valides
- Validation des types de fichiers
- Gestion des fichiers volumineux
- Validation des champs email
- Workflow complet d'upload

### `processing-workflow.spec.ts`

Tests du workflow de traitement :

- Processus complet article/corpus
- Affichage du statut de traitement
- Gestion des traitements terminés
- Gestion des erreurs de traitement
- Validation des champs requis

### `admin-interface.spec.ts`

Tests de l'interface d'administration :

- Authentification requise
- Accès avec identifiants valides
- Affichage du dashboard
- Gestion de la base de données
- Consultation des logs
- Gestion des fichiers

## Utilisation des helpers

### Exemple d'utilisation dans un test

```typescript
import { test, expect } from '@playwright/test';
import { UIHelpers } from '../helpers/ui-helpers';
import { FileHelpers } from '../helpers/file-helpers';
import { APIHelpers } from '../helpers/api-helpers';

test('Mon test E2E', async ({ page }) => {
  const uiHelpers = new UIHelpers(page);
  const fileHelpers = new FileHelpers();
  const apiHelpers = new APIHelpers(page);

  // Navigation
  await uiHelpers.goToArticleProcess();
  
  // Upload de fichier
  const csvFile = fileHelpers.createTestCsvFile();
  await fileHelpers.uploadFile(page, csvFile);
  
  // Vérification API
  await apiHelpers.waitForFileUpload();
  
  // Nettoyage
  fileHelpers.cleanup();
});
```

## Bonnes pratiques

### Sélecteurs

Utilisez les sélecteurs définis dans `test-data.ts` plutôt que des sélecteurs codés en dur :

```typescript
// ✅ Bon
await page.locator(selectors.fileInput).setInputFiles(file);

// ❌ Éviter
await page.locator('input[type="file"]').setInputFiles(file);
```

### Attentes et timeouts

Utilisez des attentes explicites avec des timeouts appropriés :

```typescript
// ✅ Bon
await expect(page.locator(selectors.successMessage)).toBeVisible({ timeout: 10000 });

// ❌ Éviter
await page.waitForTimeout(5000);
```

### Nettoyage

Toujours nettoyer les ressources dans `afterEach` :

```typescript
test.afterEach(async () => {
  fileHelpers.cleanup();
  await apiHelpers.clearMocks();
});
```

### Gestion des erreurs

Utilisez `test.skip()` pour les tests qui ne peuvent pas s'exécuter :

```typescript
if (!await element.isVisible()) {
  test.skip(true, 'Element not found - may need selector update');
}
```

## Débogage

### Mode debug

```bash
npm run test:e2e:debug
```

### Captures d'écran manuelles

```typescript
await uiHelpers.takeScreenshot('debug-screenshot');
```

### Logs de débogage

```typescript
console.log('Debug info:', await page.locator(selector).textContent());
```

## Maintenance

### Mise à jour des sélecteurs

Si l'interface change, mettez à jour les sélecteurs dans `fixtures/test-data.ts`.

### Ajout de nouveaux tests

1. Créez un nouveau fichier `.spec.ts`
2. Utilisez les helpers existants
3. Ajoutez de nouvelles données dans `test-data.ts` si nécessaire
4. Documentez les nouveaux tests dans ce README

### Optimisation des performances

- Utilisez `fullyParallel: true` pour les tests indépendants
- Groupez les tests liés dans le même fichier
- Réutilisez les helpers pour éviter la duplication de code
