ost-generator
=============

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/ost-generator.svg)](https://npmjs.org/package/ost-generator)
[![Downloads/week](https://img.shields.io/npm/dw/ost-generator.svg)](https://npmjs.org/package/ost-generator)
[![License](https://img.shields.io/npm/l/ost-generator.svg)](https://github.com/https://github.com/cesarParra/https://github.com/cesarParra/blob/master/package.json)

Illuminated Cloud users developing 2GP Apex development for a single namespace using multiple repositories might have run into
the limitation of not having code-completion when calling `@NamespaceAccessible` code between the different namespaces. This is
due to the fact that IC's Offline Symbol Table cannot pick up Namespace Accessible classes, as Salesforce obfuscates any
code that is not global.

This tool is intended to provide a workaround, by updating the Offline Symbol Table using the local source files for the
repository that contains the code for which auto-completion is required.

# Install

```
npm install --global ost-generator
```

<!-- toc -->
* [Install](#install)
* [Usage](#usage)
<!-- tocstop -->
# Usage

Imagine you have two 2GP packages, Package A and Package B. Package A contains `@NamespaceAccessible` methods that you
wish to reference from Package B and get IC auto-completion.

You can achieve this as follows:
1. Clone Package A locally
2. Clone Package B locally
3. `cd` into the root of Package B and run the following:

```
generate-ost 
    -namespace "abc" \
    -src "../Package_A/src" \
    --ostPath "IlluminatedCloud/PackageB/OfflineSymbolTable.zip"
```

WARNING: You might need to close IC while executing this command, because the OfflineSymbolTable might
be locked by the OS when IC is open, and will not be modifiable.

Note that if you rebuild the Offline Symbol Table through IC, you will lose the updates 
and will need to re-run the command.

## Arguments

`namespace`: The namespace that the packages share between them.
`src`: The source directory with Apex code for which you wish to update the OST
`ostPath`: The path to the Offline Symbol Table zip file that you wish had the `src` auto-completion.

<!-- usage -->
```sh-session
$ npm install -g ost-generator
$ generate-ost COMMAND
running command...
$ generate-ost (-v|--version|version)
ost-generator/1.0.1 win32-x64 node-v12.17.0
$ generate-ost --help [COMMAND]
USAGE
  $ generate-ost COMMAND
...
```
<!-- usagestop -->
