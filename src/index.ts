import { SearchResult, SearchOptions } from "./types"
import { slugify, fetchHtml } from "./http"
import { parseHtml } from "./parse"
import { getCached, setCached, clearCache } from "./cache"
import * as cheerio from "cheerio"
import pkg from "../package.json"

const VERSION = pkg.version

const DEFAULT_TIMEOUT = 10000
const DEFAULT_RETRIES = 2
const DEFAULT_CACHE_TTL = 1000 * 60 * 30

async function search(term: string, options: SearchOptions = {}): Promise<SearchResult> {
  if (typeof term !== "string" || !term.trim()) {
    return {
      status: 400,
      httpsResponse: "0ms",
      data: null,
      version: VERSION,
      etimologia: null,
      frases: null,
      plural: null,
      separacaoSilabica: null,
      sinonimos: null,
      antonimos: null,
      outrasInformacoes: null,
      imagem: null,
      audio: null,
      flexao: null,
      classeGramatical: null,
      error: "Defina uma palavra para pesquisar!",
    }
  }

  const cacheEnabled = options.cache !== false
  const cacheKey = term.trim().toLowerCase()
  if (cacheEnabled) {
    const cached = getCached(cacheKey)
    if (cached) return cached
  }

  const url = `https://www.dicio.com.br/${slugify(term)}/`
  try {
    const { html, status, elapsed } = await fetchHtml(url, {
      timeout: options.timeout ?? DEFAULT_TIMEOUT,
      retries: options.retries ?? DEFAULT_RETRIES,
      userAgent: options.userAgent,
    })

    if (status === 404) {
      const res: SearchResult = {
        status: 404,
        httpsResponse: `${elapsed}ms`,
        data: null,
        version: VERSION,
        etimologia: null,
        frases: null,
        plural: null,
        separacaoSilabica: null,
        sinonimos: null,
        antonimos: null,
        outrasInformacoes: null,
        imagem: null,
        audio: null,
        flexao: null,
        classeGramatical: null,
        error: "Palavra não encontrada",
      }
      if (cacheEnabled) setCached(cacheKey, res, options.cacheTTL ?? DEFAULT_CACHE_TTL)
      return res
    }

    if (status < 200 || status >= 400) {
      const res: SearchResult = {
        status,
        httpsResponse: `${elapsed}ms`,
        data: null,
        version: VERSION,
        etimologia: null,
        frases: null,
        plural: null,
        separacaoSilabica: null,
        sinonimos: null,
        antonimos: null,
        outrasInformacoes: null,
        imagem: null,
        audio: null,
        flexao: null,
        classeGramatical: null,
        error: `Falha HTTP ${status}`,
      }
      return res
    }

    const res = parseHtml(html, term, elapsed, VERSION)
    if (cacheEnabled) setCached(cacheKey, res, options.cacheTTL ?? DEFAULT_CACHE_TTL)
    return res
  } catch (err: any) {
    return {
      status: 0,
      httpsResponse: "0ms",
      data: null,
      version: VERSION,
      etimologia: null,
      frases: null,
      plural: null,
      separacaoSilabica: null,
      sinonimos: null,
      antonimos: null,
      outrasInformacoes: null,
      imagem: null,
      audio: null,
      flexao: null,
      classeGramatical: null,
      error: err?.message || "Erro de rede",
    }
  }
}

async function searchMany(terms: string[], options: SearchOptions = {}): Promise<SearchResult[]> {
  const concurrency = 3
  const out: SearchResult[] = new Array(terms.length)
  let cursor = 0
  async function worker() {
    while (true) {
      const i = cursor++
      if (i >= terms.length) return
      out[i] = await search(terms[i], options)
      // small delay to be polite
      await new Promise((r) => setTimeout(r, 150))
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, terms.length) }, () => worker()))
  return out
}

async function suggest(term: string, options: SearchOptions = {}): Promise<string[]> {
  const url = `https://www.dicio.com.br/pesquisa.php?q=${encodeURIComponent(term)}`
  try {
    const { html } = await fetchHtml(url, {
      timeout: options.timeout ?? DEFAULT_TIMEOUT,
      retries: 1,
      userAgent: options.userAgent,
    })
    const $ = cheerio.load(html)
    const slug = slugify(term)
    const links = $("a")
      .map((_: any, el: any) => $(el).attr("href"))
      .get()
      .filter((h: any) => typeof h === "string" && /^\/[a-z0-9-]+\/$/.test(h))
    const skip = new Set([
      "/cata-letras/",
      "/jogo-conexoes/",
      "/jogos-caca-palavras/",
      "/palavras-mais-buscadas/",
      "/exemplos-de-palavras/",
      "/curiosidades-da-lingua-portuguesa/",
      "/palavra-do-dia/",
      "/duvidas-da-lingua-portuguesa/",
      "/sinonimos-e-antonimos/",
      "/como-escrever-numeros-por-extenso/",
    ])
    const seen = new Set<string>()
    const out: string[] = []
    for (const h of links) {
      if (skip.has(h)) continue
      const w = h.replace(/^\//, "").replace(/\/$/, "")
      if (w === slug) continue
      if (seen.has(w)) continue
      seen.add(w)
      out.push(w)
      if (out.length >= 8) break
    }
    return out
  } catch {
    return []
  }
}

async function wordOfDay(options: SearchOptions = {}): Promise<SearchResult | null> {
  try {
    const { html } = await fetchHtml("https://www.dicio.com.br/palavra-do-dia/", {
      timeout: options.timeout ?? DEFAULT_TIMEOUT,
      retries: options.retries ?? DEFAULT_RETRIES,
      userAgent: options.userAgent,
    })
    const $ = cheerio.load(html)
    const m = $("body").html()?.match(/Significado completo de <a[^>]*>([^<]+)<\/a>/i)
    const word = m ? m[1].trim() : null
    if (!word) return null
    return search(word, options)
  } catch {
    return null
  }
}

async function randomWord(options: SearchOptions = {}): Promise<SearchResult | null> {
  try {
    const { html } = await fetchHtml("https://www.dicio.com.br/palavras-mais-buscadas/", {
      timeout: options.timeout ?? DEFAULT_TIMEOUT,
      retries: 1,
      userAgent: options.userAgent,
    })
    const $ = cheerio.load(html)
    const links = $("a")
      .map((_: any, el: any) => $(el).attr("href"))
      .get()
      .filter((h: any) => typeof h === "string" && /^\/[a-z0-9-]+\/$/.test(h))
    const skip = new Set(["/cata-letras/", "/jogo-conexoes/", "/jogos-caca-palavras/"])
    const bad = /palavras-|exemplos|curiosidades|cata-letras|jogo|palavra-do-dia|duvidas|sinonimos-e-antonimos|como-escrever/
    const candidates = links
      .map((h: string) => h.replace(/^\//, "").replace(/\/$/, ""))
      .filter((w: string) => !skip.has(`/${w}/`) && !bad.test(w))
    if (!candidates.length) return wordOfDay(options)
    const pick = candidates[Math.floor(Math.random() * candidates.length)]
    return search(pick, options)
  } catch {
    return wordOfDay(options)
  }
}

const vxDicionario = search as any
vxDicionario.search = search
vxDicionario.searchMany = searchMany
vxDicionario.suggest = suggest
vxDicionario.wordOfDay = wordOfDay
vxDicionario.randomWord = randomWord
vxDicionario.clearCache = clearCache

export = vxDicionario
