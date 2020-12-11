import {CharStreams, CommonTokenStream, ParserRuleContext} from 'antlr4ts'
import {ApexLexer} from '../parsers/base/ApexLexer'
import {
  ApexParser,
  ClassBodyContext,
  ClassDeclarationContext,
  ConstructorDeclarationContext,
  EnumDeclarationContext,
  FieldDeclarationContext,
  FormalParameterListContext,
  FormalParametersContext,
  InterfaceBodyContext,
  InterfaceDeclarationContext,
  InterfaceMethodDeclarationContext,
  MethodDeclarationContext,
  ModifierContext,
  PropertyDeclarationContext,
} from '../parsers/base/ApexParser'
import {ApexParserListener} from '../parsers/base/ApexParserListener'
import {ErrorNode, ParseTreeWalker, TerminalNode} from 'antlr4ts/tree'
import * as prettier from 'prettier'

class ApexCodeListener implements ApexParserListener {
  visitTerminal?: (node: TerminalNode) => void;

  visitErrorNode?: (node: ErrorNode) => void;

  enterEveryRule?: (ctx: ParserRuleContext) => void;

  exitEveryRule?: (ctx: ParserRuleContext) => void;

  ostContents = '';

  enterModifier(ctx: ModifierContext): void {
    if (ctx.text.toLowerCase() === 'withsharing') {
      this.ostContents += 'with sharing '
      return
    }

    if (ctx.text.toLowerCase() === 'withouthsaring') {
      this.ostContents += 'without sharing '
      return
    }
    this.ostContents += ctx.text + ' '
  }

  enterClassDeclaration(ctx: ClassDeclarationContext): void {
    this.ostContents += 'class ' + ctx.id().text
    this.ostContents += ' '
    // eslint-disable-next-line new-cap
    if (ctx.EXTENDS()) {
      // eslint-disable-next-line new-cap
      this.ostContents += ctx.EXTENDS()?.text + ' ' + ctx.typeRef()?.text
      this.ostContents += ' '
    }
    // eslint-disable-next-line new-cap
    if (ctx.IMPLEMENTS()) {
      // eslint-disable-next-line new-cap
      this.ostContents += ctx.IMPLEMENTS()?.text + ' ' + ctx.typeList()?.text
      this.ostContents += ' '
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  enterClassBody(ctx: ClassBodyContext): void {
    this.ostContents += '{ '
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  exitClassBody(ctx: ClassBodyContext): void {
    this.ostContents += '}'
  }

  enterMethodDeclaration(ctx: MethodDeclarationContext): void {
    if (ctx.typeRef()) {
      this.ostContents += ctx.typeRef()?.text
    }
    if (ctx.VOID()) {
      this.ostContents += ctx.VOID()?.text
    }
    this.ostContents += ' '
    this.ostContents += ctx.id().text
    this.ostContents += ' '
  }

  enterFormalParameters(ctx: FormalParametersContext): void {
    this.ostContents += '('
  }

  exitFormalParameters(ctx: FormalParametersContext): void {
    this.ostContents += ')'
  }

  enterFormalParameterList(ctx: FormalParameterListContext): void {
    ctx.formalParameter().forEach(parameter => {
      this.ostContents += parameter.typeRef().text + ' ' + parameter.id().text + ','
    })
    this.ostContents = this.ostContents.substring(0, this.ostContents.length - 1) // removing trailing comma
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  exitMethodDeclaration(ctx: MethodDeclarationContext): void {
    this.ostContents += ' { '
    this.ostContents += ' } '
  }

  enterFieldDeclaration(ctx: FieldDeclarationContext): void {
    this.ostContents += ctx.typeRef().text + ' '
    ctx.variableDeclarators().variableDeclarator().forEach(variableDeclarator => {
      this.ostContents += variableDeclarator.text + ','
    })
    this.ostContents = this.ostContents.substring(0, this.ostContents.length - 1) // removing trailing comma
    this.ostContents += ';'
  }

  enterPropertyDeclaration(ctx: PropertyDeclarationContext): void {
    this.ostContents += ctx.typeRef().text + ' ' + ctx.id().text + ' { get; set; }'
  }

  enterConstructorDeclaration(ctx: ConstructorDeclarationContext): void {
    this.ostContents += ctx.qualifiedName().text
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  exitConstructorDeclaration(ctx: ConstructorDeclarationContext): void {
    this.ostContents += ' { '
    this.ostContents += ' } '
  }

  enterEnumDeclaration(ctx: EnumDeclarationContext): void {
    this.ostContents += 'enum ' + ctx.id().text + '{'
    if (ctx.enumConstants()) {
      this.ostContents += ctx.enumConstants()?.text
    }
    this.ostContents += '}'
  }

  enterInterfaceDeclaration(ctx: InterfaceDeclarationContext): void {
    this.ostContents += 'interface ' + ctx.id().text + ' '
    if (ctx.typeList()) {
      this.ostContents += 'extends '
      this.ostContents += ctx.typeList()?.text
    }
  }

  enterInterfaceBody(ctx: InterfaceBodyContext): void {
    this.ostContents += '{'
  }

  exitInterfaceBody(ctx: InterfaceBodyContext): void {
    this.ostContents += '}'
  }

  enterInterfaceMethodDeclaration(ctx: InterfaceMethodDeclarationContext): void {
    if (ctx.typeRef()) {
      this.ostContents += ctx.typeRef()?.text + ' '
    }
    if (ctx.VOID()) {
      this.ostContents += 'void '
    }
    this.ostContents += ctx.id().text
  }

  exitInterfaceMethodDeclaration(ctx: InterfaceMethodDeclarationContext): void {
    this.ostContents += ';'
  }
}

export default class OstContentCreator {
  public static create(contents: string): string {
    try {
      const inputStream = CharStreams.fromString(contents)
      const lexer = new ApexLexer(inputStream)
      const tokenStream = new CommonTokenStream(lexer)
      const parser = new ApexParser(tokenStream)

      // `compilationUnit` is the entry point for class files.
      const tree = parser.compilationUnit()
      const codeListener = new ApexCodeListener()
      ParseTreeWalker.DEFAULT.walk(codeListener, tree)

      // // This only works when we passed in valid apex code, otherwise it fails silently
      // const ostContents = prettier.format(codeListener.ostContents, {
      //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment,@typescript-eslint/ban-ts-ignore
      //   // @ts-ignore
      //   parser: 'apex',
      // })

      return codeListener.ostContents
    } catch (error) {
      return ''
    }
  }
}
