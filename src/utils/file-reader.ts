import * as fs from 'fs'
import * as path from 'path'
import File from '../model/file'

const apexExtension = '.cls'

export default class FileReader {
  public static read(sourceDirectory: string): File[] {
    const files: File[] = []
    const directoryContents = fs.readdirSync(sourceDirectory)
    directoryContents.forEach(currentFile => {
      const currentPath = path.join(sourceDirectory, currentFile);
      if (fs.statSync(currentPath).isDirectory()) {
        files.push(...this.read(currentPath))
      }

      if (!currentFile.endsWith(apexExtension)) {
        return
      }

      const rawFile = fs.readFileSync(currentPath)
      files.push({
        name: currentFile.replace(apexExtension, ''),
        body: rawFile.toString(),
        extension: apexExtension,
        directory: sourceDirectory.replace(
          sourceDirectory,
          ''
        ),
      })
    })

    return files
  }
}
