export interface WordData {
  classe: string | null
  significados: string[] | null
}

export interface OtherInfo {
  letras: number | null
  vogais: string | null
  consoantes: string | null
  reverso: string | null
}

export interface SearchResult {
  status: number
  httpsResponse: string
  data: WordData[] | null
  version: string
  etimologia: string | null
  frases: string[] | null
  plural: string | null
  separacaoSilabica: string | null
  sinonimos: string | null
  antonimos: string | null
  outrasInformacoes: OtherInfo | null
  imagem: string | null
  audio: string | null
  flexao: string | null
  classeGramatical: string | null
  error?: string | null
  sugestoes?: string[] | null
}

export interface SearchOptions {
  timeout?: number
  retries?: number
  cache?: boolean
  cacheTTL?: number
  userAgent?: string
}

export declare function search(term: string, options?: SearchOptions): Promise<SearchResult>
export declare function searchMany(terms: string[], options?: SearchOptions): Promise<SearchResult[]>
export declare function suggest(term: string, options?: SearchOptions): Promise<string[]>
export declare function wordOfDay(options?: SearchOptions): Promise<SearchResult | null>
export declare function randomWord(options?: SearchOptions): Promise<SearchResult | null>
export declare function clearCache(): void

declare const vxDicionario: typeof search & {
  search: typeof search
  searchMany: typeof searchMany
  suggest: typeof suggest
  wordOfDay: typeof wordOfDay
  randomWord: typeof randomWord
  clearCache: typeof clearCache
}

export default vxDicionario
