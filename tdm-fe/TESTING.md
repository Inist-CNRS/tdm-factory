# Guide des Tests End-to-End

## 🚀 Démarrage rapide

### 1. Installation

```bash
# Les dépendances Playwright sont déjà installées
# Installer les navigateurs
npx playwright install
```

### 2. Lancement des tests

```bash
# Tests sur Chromium et Firefox (recommandé)
npm run test:e2e

# Test d'exemple pour vérifier l'installation
npm run test:e2e -- tests/e2e/specs/example.spec.ts

# Voir le rapport HTML
npm run test:e2e:report
```

## 📋 Commandes disponibles

| Commande | Description |
|----------|-------------|
| `npm run test:e2e` | Tests sur Chromium et Firefox |
| `npm run test:e2e:all` | Tests sur tous les navigateurs |
| `npm run test:e2e:ui` | Interface graphique Playwright |
| `npm run test:e2e:debug` | Mode debug pas à pas |
| `npm run test:e2e:chromium` | Tests Chromium uniquement |
| `npm run test:e2e:firefox` | Tests Firefox uniquement |
| `npm run test:e2e:report` | Afficher le rapport HTML |

## 🎯 Tests disponibles

### Tests de base

- **example.spec.ts** : Test de validation de l'installation
- **navigation.spec.ts** : Navigation et responsive design
- **file-upload.spec.ts** : Upload de fichiers et validation
- **processing-workflow.spec.ts** : Workflow complet de traitement
- **admin-interface.spec.ts** : Interface d'administration

### Helpers disponibles

- **UIHelpers** : Interactions avec l'interface utilisateur
- **FileHelpers** : Gestion des fichiers de test
- **APIHelpers** : Interactions avec les APIs et mocks

## 🔧 Configuration

### Navigateurs supportés

- ✅ **Chromium** : Entièrement supporté
- ✅ **Firefox** : Entièrement supporté  
- ⚠️ **WebKit/Safari** : Nécessite `sudo npx playwright install-deps`
- ✅ **Mobile Chrome** : Supporté
- ⚠️ **Mobile Safari** : Nécessite les dépendances WebKit

### Ports utilisés

- **Frontend** : <http://localhost:5173> (Vite dev server)
- **Backend** : <http://localhost:3000> (Express server)
- **Maildev** : <http://localhost:1080> (Service de messagerie pour les tests)

## 🐛 Résolution des problèmes

### Erreur "Host system is missing dependencies"

```bash
sudo npx playwright install-deps
```

### Tests qui échouent

1. Vérifiez que le backend est démarré
2. Vérifiez les captures d'écran dans le rapport
3. Utilisez le mode debug : `npm run test:e2e:debug`

### Serveur non accessible

```bash
cd ../
make run-dev
```

## 📝 Écriture de nouveaux tests

### Structure recommandée

```typescript
import { test, expect } from '@playwright/test';
import { UIHelpers } from '../helpers/ui-helpers';

test.describe('Mon nouveau test', () => {
  let uiHelpers: UIHelpers;

  test.beforeEach(async ({ page }) => {
    uiHelpers = new UIHelpers(page);
  });

  test('should do something', async ({ page }) => {
    await uiHelpers.goToHome();
    // Votre test ici
  });
});
```

### Bonnes pratiques

- Utilisez les helpers existants
- Ajoutez des sélecteurs dans `test-data.ts`
- Nettoyez les ressources dans `afterEach`
- Utilisez des attentes explicites avec timeouts

## 📊 Rapports

Les rapports HTML sont générés automatiquement et incluent :

- Captures d'écran des échecs
- Vidéos des tests (si activées)
- Traces détaillées des actions
- Métriques de performance

Accédez au rapport avec : `npm run test:e2e:report`

## 🔄 Intégration continue

Les tests sont configurés pour :

- Retry automatique en cas d'échec (CI uniquement)
- Exécution séquentielle en CI
- Génération de rapports HTML
- Captures d'écran automatiques des échecs

## 💡 Conseils

- Utilisez `test.skip()` pour les tests non applicables
- Préférez les sélecteurs `data-testid` aux sélecteurs CSS
- Testez sur différentes tailles d'écran
- Mockez les APIs externes pour des tests stables
- Documentez les nouveaux helpers et fixtures
