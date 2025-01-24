import path from 'path'
import os from 'os'
import fs from 'fs'

export class Paths {
  /**
   * Returns the base directory path for storing application data.
   * - macOS/Linux → ~/Documents/Cadmium
   * - Windows → C:\Users\YourUser\Documents\Cadmium
   */
  static getBaseDir(): string {
    const baseDir = path.join(os.homedir(), 'Documents', 'Cadmium')
    this.ensureDirectoryExists(baseDir)
    return baseDir
  }

  /**
   * Returns the path to the database file (`cadmium.db`).
   */
  static getDBPath(): string {
    const dbPath = path.join(this.getBaseDir(), 'db', 'cadmium.db')
    this.ensureDirectoryExists(path.dirname(dbPath))
    return dbPath
  }

  /**
   * Returns the path to the target codebases directory.
   */
  static getTargetCodebasesDir(): string {
    const codebasesDir = path.join(this.getBaseDir(), 'target-codebases')
    this.ensureDirectoryExists(codebasesDir)
    return codebasesDir
  }

  /**
   * Returns the full path for a specific project's codebase directory.
   * @param projectId - The unique ID of the project.
   */
  static getProjectCodebasePath(projectId: string): string {
    const projectPath = path.join(this.getTargetCodebasesDir(), projectId)
    this.ensureDirectoryExists(projectPath)
    return projectPath
  }

  /**
   * Ensures that the specified directory exists, creating it if necessary.
   * @param dirPath - The directory path to check/create.
   */
  private static ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  }
}
