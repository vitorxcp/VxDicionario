import test from "node:test"
import assert from "node:assert/strict"
import VxDicionario from "../dist/index.js"

test("search projeto returns meanings", async () => {
  const r = await VxDicionario("projeto")
  assert.equal(r.status, 200)
  assert.ok(Array.isArray(r.data))
  assert.equal(r.data[0].classe, "substantivo masculino")
  assert.ok(r.data[0].significados.length >= 3)
  assert.equal(r.plural, "projetos")
  assert.equal(r.separacaoSilabica, "pro-je-to")
  assert.ok(r.sinonimos && r.sinonimos.includes("esquema"))
  assert.ok(r.outrasInformacoes && r.outrasInformacoes.letras === 7)
})

test("search 404", async () => {
  const r = await VxDicionario("xyznaoexiste123")
  assert.equal(r.status, 404)
  assert.equal(r.data, null)
})

test("invalid input", async () => {
  const r = await VxDicionario("")
  assert.equal(r.status, 400)
})

test("searchMany", async () => {
  const rs = await VxDicionario.searchMany(["casa", "amar"])
  assert.equal(rs.length, 2)
  assert.equal(rs[0].status, 200)
  assert.equal(rs[1].status, 200)
})

test("suggest", async () => {
  const s = await VxDicionario.suggest("projto")
  assert.ok(Array.isArray(s))
  assert.ok(s.includes("projeto"))
})

test("wordOfDay", async () => {
  const r = await VxDicionario.wordOfDay()
  assert.ok(r === null || r.status === 200)
})

test("randomWord", async () => {
  const r = await VxDicionario.randomWord()
  assert.ok(r === null || r.status === 200)
})

test("clearCache", () => {
  VxDicionario.clearCache()
  assert.ok(true)
})
