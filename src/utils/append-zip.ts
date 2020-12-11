// require modules
const fs = require('fs')
const fsp = fs.promises
const archiver = require('archiver')
const extract = require('extract-zip')

async function appendZip(this: any, source: string, callback: Function) {
  try {
    const tempDir = source + '-temp'

    // create temp dir (folder must exist)
    await fsp.mkdir(tempDir, {recursive: true})

    // extract to folder
    await extract(source, {dir: tempDir})

    // delete original zip
    await fsp.unlink(source)

    // recreate zip file to stream archive data to
    const output = fs.createWriteStream(source)
    const archive = archiver('zip', {zlib: {level: 9}})

    // pipe archive data to the file
    archive.pipe(output)

    // append files from temp directory at the root of archive
    archive.directory(tempDir, false)

    // callback to add extra files
    callback.call(this, archive)

    // finalize the archive
    await archive.finalize()

    // delete temp folder
    fs.rmdirSync(tempDir, {recursive: true})
    // eslint-disable-next-line unicorn/catch-error-name
  } catch (err) {
    // handle any errors
    // eslint-disable-next-line no-console
    throw err
  }
}

module.exports = appendZip
