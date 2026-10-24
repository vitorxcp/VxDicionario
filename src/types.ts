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
