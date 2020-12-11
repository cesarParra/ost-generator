import {Command, flags} from '@oclif/command'
import Generator from './ost-generator/generator'

class OstGenerator extends Command {
  static description = 'Generates an Offline Symbol Table for a 2GP namespace given a project directory.';

  static flags = {
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),
    namespace: flags.string({
      char: 'n',
      description: 'The namespace of the 2GP package for which the Offline Symbol Table will be generated.',
      required: true,
    }),
    src: flags.string({
      char: 's',
      description: 'Source directory with Apex files.',
      required: true,
    }),
    ostPath: flags.string({
      char: 'p',
      description: 'The path to the Offline Symbol Table zip file that needs to be updated. For example "IlluminatedCloud/MyProject/OfflineSymbolTable.zip"',
      required: true,
    }),
  }

  async run() {
    const {flags} = this.parse(OstGenerator)
    Generator.execute(flags.namespace, flags.src, flags.ostPath)
  }
}

export = OstGenerator
