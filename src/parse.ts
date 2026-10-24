import { SearchResult, WordData, OtherInfo } from "./types"

import * as cheerio from "cheerio"

export function parseHtml(html: string, term: string, elapsed: number, version: string): SearchResult {
  const $ = cheerio.load(html)

  const result: SearchResult = {
    status: 200,
    httpsResponse: `${elapsed}ms`,
    data: [],
    version,
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
  }

  if ($("title").text() === "Ocorreu um Erro") {
    result.status = 404
    result.data = null
    result.error = "Palavra não encontrada"
    return result
  }

  const sig = $(".significado.textonovo").first()
  if (sig.length) {
    const classe = sig.find(".cl").first().text().trim() || null
    const meanings: string[] = []
    sig.children("span").each((_: any, el: any) => {
      const $el = $(el)
      if ($el.hasClass("cl") || $el.hasClass("etim")) return
      const txt = $el.text().trim()
      if (txt) meanings.push(txt)
    })
    const data: WordData = { classe, significados: meanings.length ? meanings : null }
    result.data = [data]

    const etim = sig.find(".etim").first().text().trim()
    if (etim) {
      const parts = etim.split(". ")
      result.etimologia = parts.length > 1 ? parts.slice(1).join(". ").trim() : etim
    }
  } else {
    // fallback for older markup
    const legacy = $("p[itemprop=description]")
    if (legacy.length) {
      const data: WordData = { classe: null, significados: [] }
      legacy.children().each((_: any, el: any) => {
        if ($(el).hasClass("etim")) result.etimologia = $(el).text().split(". ")[1] || null
        else if ($(el).hasClass("cl")) data.classe = $(el).text().trim()
        else if (data.significados) data.significados.push($(el).text())
      })
      if (!data.significados || !data.significados.length) data.significados = null
      result.data = [data]
    }
  }

  if (!result.data || !result.data.length) result.data = null

  // synonyms
  $(".wrap-section").each((_: any, sec: any) => {
    const $sec = $(sec)
    const title = $sec.find("h2,h3").first().text().trim().toLowerCase()
    if (title.includes("sinônimo")) {
      const txt = $sec.find("p").first().text().replace(/\s+/g, " ").trim()
      if (txt) result.sinonimos = txt
    }
    if (title.includes("antônimo") || title.includes("contrário")) {
      const txt = $sec.find("p").first().text().replace(/\s+/g, " ").trim()
      if (txt) result.antonimos = txt
    }
  })

  // also handle top-level synonym block (older)
  if (!result.sinonimos) {
    $(".wrap-section").children("p").each((_: any, el: any) => {
      const txt = $(el).text().replace(/\s+/g, " ").trim()
      if (txt.includes("sinônimo")) result.sinonimos = txt
      if (txt.includes("contrário")) result.antonimos = txt
    })
  }

  // definitions
  let defSource = $(".tit-section + p.adicional").text().replace(/\s+/g, " ").trim()
  if (!defSource.includes("Classe gramatical")) {
    $("p.adicional").each((_: any, p: any) => {
      const t = $(p).text().replace(/\s+/g, " ").trim()
      if (t.includes("Classe gramatical")) defSource = t
    })
  }

  const extract = (label: string): string | null => {
    const labels = ["Classe gramatical", "Flexão do verbo", "Separação silábica", "Plural"]
    const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const lookahead = labels.filter((l) => l !== label).map(esc).join("|")
    const re = new RegExp(esc(label) + "\\s*:?\\s*(.*?)(?=\\s+(?:" + lookahead + ")|$)", "i")
    const m = defSource.match(re)
    return m ? m[1].trim() : null
  }

  result.classeGramatical = extract("Classe gramatical")
  result.flexao = extract("Flexão do verbo")
  result.separacaoSilabica = extract("Separação silábica")
  result.plural = extract("Plural")

  // frases
  const frases: string[] = []
  $(".frases > .frase").each((_: any, el: any) => {
    const txt = $(el).text().replace(/\s+/g, " ").trim()
    if (txt) frases.push(txt)
  })
  result.frases = frases.length ? frases : null

  // other info
  let infoSrc = ""
  $("p.adicional").each((_: any, p: any) => {
    const t = $(p).text().replace(/\s+/g, " ").trim()
    if (t.includes("Possui")) infoSrc += " " + t
  })
  const letrasM = infoSrc.match(/Possui (\d+) letras/i)
  const vogaisM = infoSrc.match(/Possui (?:as )?vogais?:\s*(.+?)(?=Possui|$)/i)
  const consM = infoSrc.match(/Possui (?:as )?consoantes?:\s*(.+?)(?=A palavra|$)/i)
  const revM = infoSrc.match(/ao contrário:\s*(.+?)$/i)
  const other: OtherInfo = {
    letras: letrasM ? parseInt(letrasM[1], 10) : null,
    vogais: vogaisM ? vogaisM[1].trim() : null,
    consoantes: consM ? consM[1].trim() : null,
    reverso: revM ? revM[1].trim() : null,
  }
  if (other.letras || other.vogais || other.consoantes || other.reverso) result.outrasInformacoes = other

  // imagem
  const img =
    $("img[src*='s.dicio.com.br']").first().attr("src") ||
    $("meta[property='og:image']").attr("content") ||
    null
  result.imagem = img || null

  return result
}
