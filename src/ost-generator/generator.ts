import FileReader from '../utils/file-reader'
import File from '../model/file'
import OstContentCreator from './ost-content-creator'
import * as path from 'path'
import * as readline from 'readline'
// eslint-disable-next-line node/no-missing-require
const appendZip = require('../utils/append-zip')
import {Archiver} from 'archiver'

export default class Generator {
  static currentFrame = -1

  static frames = [
    '⠋',
    '⠙',
    '⠹',
    '⠸',
    '⠼',
    '⠴',
    '⠦',
    '⠧',
    '⠇',
    '⠏',
  ]

  public static execute(namespace: string, src: string, outputDir: string): void {
    // eslint-disable-next-line no-console
    this.updateLog('Initializing...')
    const ostFiles = FileReader.read(src).map(
      file => {
        return this.generate(file)
      }
    )

    this.createOST(outputDir, namespace, ostFiles)
  }

  private static generate(file: File): File {
    this.updateLog(`Generating OST file for: ${file.name}`)
    return {
      name: file.name,
      body: OstContentCreator.create(file.body),
      extension: 'cls',
      directory: '',
    }
  }

  private static createOST(outputDir: string, namespace: string, ostFiles: File[]): void {
    // TODO: Move to file-writer
    this.updateLog('Updating Offline Symbol Table...', false)
    const ostPath = path.resolve(outputDir)
    appendZip(ostPath, (archive: Archiver) => {
      ostFiles.forEach(file => {
        const fileName = `${namespace}/${file.name}.${file.extension}`
        archive.append(file.body, {name: fileName})
      })
    }).then(() => {
      // eslint-disable-next-line no-console
      this.updateLog('Done!', false)
      // eslint-disable-next-line unicorn/catch-error-name
    }).catch((e: any) => {
      // eslint-disable-next-line no-console
      console.error('An error occurred', e)
    })
  }

  private static updateLog(text: string, showSpinner = true) {
    readline.clearLine(process.stdout, 0)
    readline.cursorTo(process.stdout, 0)
    if (this.currentFrame > 9) {
      this.currentFrame = 0
    }
    const spinner = showSpinner ? `${this.frames[this.currentFrame++]}` : ''
    process.stdout.write(`${spinner} ${text}`)
  }
}
