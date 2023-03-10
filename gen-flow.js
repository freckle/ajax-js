const {beautify, compiler} = require('flowgen')
const fs = require('fs')
const glob = require('glob')
const path = require('path')

glob(`dist/**/*.d.ts`, {}, async (err, files) => {
  if (err) console.error(err)
  await Promise.all(files.map(process))
})


const process = f =>
  new Promise((resolve, reject) => {
    const flowdef = beautify(compiler.compileDefinitionFile(f, {inexact: false}))
    const p = path.parse(f)
    const name = /(.*).d/.exec(p.name)[1]
    const filename = `${p.dir}/${name}.js.flow`
    fs.writeFile(
      filename,
      `// @flow
${flowdef}`,
      e => {
        if (e) reject(e)
        else resolve()
      }
    )
  })
