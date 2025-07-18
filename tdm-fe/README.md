# TDM Frontend React.js Application

This project is a React.js application built to provide TDM application.

## Getting Started

To get started with this project, follow these steps:

### Prerequisites

Make sure you have the following installed on your machine:

- Node.js (v18 or higher)
- npm (Node Package Manager)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Inist-CNRS/tdm-factory.git
   ```

2. Navigate to the project directory:

   ```bash
   cd tdm-factory/tdm-fe
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

### Running the Application

To start the development server:

```bash
npm run dev
```

The application will run on `http://localhost:5173` by default. Open this URL in your browser to view it.

## Folder Structure

The project structure is organized as follows:

- `public/`: Contains the public assets, HTML template, and favicon.
- `src/`: Contains the source code of the React application.
  - `app/`:
    - `components/`: Reusable UI components.
    - `globals.css`: Global CSS of the application.
    - `page.tsx`: Main component where components are assembled.
    - `layout.tsx`: Entry point of the application.

## Available Scripts

In the project directory, you can run the following scripts:

- `npm run dev`: Runs the app in development mode.
- `npm run build`: Builds the app for production to the `dist` folder.
- `npm run test:e2e`: Runs end-to-end tests with Playwright.
- `npm run test:e2e:ui`: Runs end-to-end tests with Playwright UI mode.
- `npm run test:e2e:debug`: Runs end-to-end tests in debug mode.
- `npm run test:e2e:report`: Shows the test report after running tests.

## Static config

You can use this service in any React component, for example, the
`tdm-fe/src/app/components/MyComponent.tsx` file:

````typescript
import { useQuery } from '@tanstack/react-query';
import { getStaticConfig } from '~/app/services/config';

export const MyComponent = () => {
    const { data: config, isLoading, error } = useQuery({
        queryKey: ['static-config'],
        queryFn: getStaticConfig
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading configuration</div>;

    return (
        <div>
            <h2>Configuration</h2>
            <pre>{JSON.stringify(config, null, 2)}</pre>
        </div>
    );
};
````

Static config contains `flows`.

## Tests End-to-End avec Playwright

Ce projet utilise Playwright pour les tests end-to-end (E2E) qui testent l'interface utilisateur complète de l'application.

### Prérequis pour les tests E2E

Les tests end-to-end nécessitent que les services web soient accessibles depuis votre machine locale, car ils ne sont disponibles que depuis certaines adresses IP spécifiques.

### Installation de Playwright

Playwright est déjà inclus dans les dépendances de développement. Pour installer les navigateurs nécessaires :

```bash
npx playwright install
```

Si vous rencontrez des problèmes de dépendances système, installez-les avec :

```bash
sudo npx playwright install-deps
```

### Configuration des tests

Les tests sont configurés dans `playwright.config.ts` et utilisent les paramètres suivants :

- **URL de base** : `http://localhost:5173` (serveur de développement Vite)
- **Navigateurs testés** : Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Parallélisation** : Tests exécutés en parallèle pour plus de rapidité
- **Captures d'écran** : Prises automatiquement en cas d'échec
- **Vidéos** : Enregistrées en cas d'échec pour le débogage

### Lancement des tests E2E

#### 1. Démarrer l'environnement de test

Avant de lancer les tests, assurez-vous que le backend est démarré :

```bash
# Dans le répertoire tdm-be
cd ../tdm-be
npm run dev
```

Le frontend sera automatiquement démarré par Playwright lors des tests.

#### 2. Exécuter les tests

```bash
# Tests en mode headless (sans interface graphique)
npm run test:e2e

# Tests avec interface graphique Playwright
npm run test:e2e:ui

# Tests en mode debug (pas à pas)
npm run test:e2e:debug

# Afficher le rapport après les tests
npm run test:e2e:report
```

### Structure des tests

```
tests/e2e/
├── fixtures/          # Données de test et configurations
│   └── test-data.ts   # Données de test réutilisables
├── helpers/           # Fonctions utilitaires pour les tests
│   ├── api-helpers.ts # Helpers pour les interactions API
│   ├── file-helpers.ts # Helpers pour la gestion des fichiers
│   └── ui-helpers.ts  # Helpers pour les interactions UI
├── specs/             # Tests spécifiques
│   ├── navigation.spec.ts        # Tests de navigation
│   ├── file-upload.spec.ts       # Tests d'upload de fichiers
│   ├── processing-workflow.spec.ts # Tests du workflow complet
│   └── admin-interface.spec.ts   # Tests de l'interface admin
├── screenshots/       # Captures d'écran des échecs
└── temp/             # Fichiers temporaires de test
```

### Types de tests inclus

1. **Tests de navigation** : Vérification des routes et de la navigation
2. **Tests d'upload** : Upload de fichiers CSV/XML et validation
3. **Tests de workflow** : Processus complet de traitement des données
4. **Tests d'administration** : Interface d'administration et authentification
5. **Tests de responsive** : Vérification sur différentes tailles d'écran

### Conseils pour les tests E2E

- **Exécution locale uniquement** : Les tests sont conçus pour être exécutés localement car les services web ne sont accessibles que depuis certaines IP
- **Données de test** : Utilisez les fixtures dans `tests/e2e/fixtures/` pour des données cohérentes
- **Débogage** : Utilisez `npm run test:e2e:debug` pour déboguer les tests pas à pas
- **Captures d'écran** : Les captures d'écran des échecs sont sauvegardées dans `tests/e2e/screenshots/`
- **Rapports** : Les rapports HTML détaillés sont générés automatiquement

### Résolution des problèmes

Si les tests échouent :

1. Vérifiez que le backend est démarré sur `http://localhost:3000`
2. Vérifiez que les services web sont accessibles depuis votre IP
3. Consultez les captures d'écran et vidéos dans les rapports
4. Utilisez le mode debug pour identifier les problèmes

### Ajout de nouveaux tests

Pour ajouter de nouveaux tests :

1. Créez un nouveau fichier `.spec.ts` dans `tests/e2e/specs/`
2. Utilisez les helpers existants pour les interactions communes
3. Ajoutez de nouvelles données de test dans `fixtures/test-data.ts` si nécessaire
4. Suivez les conventions de nommage et la structure existante
