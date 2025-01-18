import * as fs from 'fs'
import * as path from 'path'

export class FolderChecker {
  /**
   * Checks if a folder with the given ID exists in the target-codebases directory.
   * @param id - The ID to check for.
   * @returns {boolean} - True if the folder exists, otherwise false.
   */
  static doesFolderExist(id: string): boolean {
    // Resolve the project path based on the given ID
    const PROJECT_PATH = path.resolve(__dirname, `../../../target-codebases/${id}`)

    try {
      // Check if the path exists and is a directory
      return fs.existsSync(PROJECT_PATH) && fs.lstatSync(PROJECT_PATH).isDirectory()
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error checking folder existence: ${error.message}`)
      } else {
        console.error('Unknown error occurred while checking folder existence')
      }
      return false
    }
  }

  /**
   * Checks if there is at least one subdirectory inside /target-codebases/{id}.
   * @param {string} id - The ID that will be used to build the directory path.
   * @returns {boolean} - True if there's at least one subfolder, otherwise false.
   */
  static doesFolderWithinFolderExist(id: string): boolean {
    const PROJECT_PATH = path.resolve(__dirname, `../../../target-codebases/${id}`)

    try {
      // First, check that the project path exists and is a directory
      if (!fs.existsSync(PROJECT_PATH) || !fs.lstatSync(PROJECT_PATH).isDirectory()) {
        return false
      }

      // Read all entries (files/folders) within the directory
      const entries = fs.readdirSync(PROJECT_PATH)

      // Return true if at least one entry is itself a directory
      return entries.some((entry) => {
        const entryPath = path.join(PROJECT_PATH, entry)
        return fs.lstatSync(entryPath).isDirectory()
      })
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Error checking if any folder exists: ${error.message}`)
      } else {
        console.error('Unknown error occurred while checking folder existence')
      }
      return false
    }
  }
}
