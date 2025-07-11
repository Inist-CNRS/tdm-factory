import { Page } from '@playwright/test';
import { testFiles, selectors } from '../fixtures/test-data';
import path from 'path';
import fs from 'fs';

/**
 * Helper pour créer des fichiers de test temporaires
 */
export class FileHelpers {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(process.cwd(), 'tests/e2e/temp');
    this.ensureTempDir();
  }

  private ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Crée un fichier CSV de test
   */
  createTestCsvFile(): string {
    const filePath = path.join(this.tempDir, testFiles.csvSample.name);
    fs.writeFileSync(filePath, testFiles.csvSample.content);
    return filePath;
  }

  /**
   * Crée un fichier XML de test
   */
  createTestXmlFile(): string {
    const filePath = path.join(this.tempDir, testFiles.xmlSample.name);
    fs.writeFileSync(filePath, testFiles.xmlSample.content);
    return filePath;
  }

  /**
   * Upload un fichier via l'interface utilisateur
   */
  async uploadFile(page: Page, filePath: string) {
    const fileInput = page.locator(selectors.fileInput);
    await fileInput.setInputFiles(filePath);
  }

  /**
   * Nettoie les fichiers temporaires
   */
  cleanup() {
    if (fs.existsSync(this.tempDir)) {
      fs.rmSync(this.tempDir, { recursive: true, force: true });
    }
  }

  /**
   * Crée un fichier avec un contenu personnalisé
   */
  createCustomFile(filename: string, content: string): string {
    const filePath = path.join(this.tempDir, filename);
    fs.writeFileSync(filePath, content);
    return filePath;
  }

  /**
   * Vérifie si un fichier existe
   */
  fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }
}
