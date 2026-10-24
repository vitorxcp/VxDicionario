#!/usr/bin/env node
const VxDicionario = require("../dist/index.js")

async function main() {
  const term = process.argv.slice(2).join(" ").trim()
  if (!term) {
    console.log("Uso: vxdicionario <palavra>")
    process.exit(1)
  }
  const res = await VxDicionario(term)
  console.log(JSON.stringify(res, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
