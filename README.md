# VxDicionario

[![npm version](https://img.shields.io/npm/v/vxdicionario)](https://www.npmjs.com/package/vxdicionario)
[![license](https://img.shields.io/npm/l/vxdicionario)](./LICENSE)
[![node](https://img.shields.io/node/v/vxdicionario)](https://nodejs.org/)

Biblioteca Node.js para consultar o [Dicio](https://www.dicio.com.br/) e retornar as informações de uma palavra em JSON, de forma simples, tipada e pronta para uso em aplicações, bots, CLIs e scripts.

## Sumário

- [VxDicionario](#vxdicionario)
  - [Sumário](#sumário)
  - [O que a biblioteca faz](#o-que-a-biblioteca-faz)
  - [Instalação](#instalação)
  - [Requisitos](#requisitos)
  - [Uso rápido](#uso-rápido)
  - [Como funciona](#como-funciona)
  - [API](#api)
    - [`VxDicionario(termo, options?)`](#vxdicionariotermo-options)
    - [`VxDicionario.search(termo, options?)`](#vxdicionariosearchtermo-options)
    - [`VxDicionario.searchMany(termos, options?)`](#vxdicionariosearchmanytermos-options)
    - [`VxDicionario.suggest(termo, options?)`](#vxdicionariosuggesttermo-options)
    - [`VxDicionario.wordOfDay(options?)`](#vxdicionariowordofdayoptions)
    - [`VxDicionario.randomWord(options?)`](#vxdicionariorandomwordoptions)
    - [`VxDicionario.clearCache()`](#vxdicionarioclearcache)
  - [Opções](#opções)
  - [Formato da resposta](#formato-da-resposta)
  - [Tratamento de erros](#tratamento-de-erros)
  - [Cache](#cache)
  - [Busca em lote](#busca-em-lote)
  - [Sugestões](#sugestões)
  - [Palavra do dia e palavra aleatória](#palavra-do-dia-e-palavra-aleatória)
  - [CLI](#cli)
  - [TypeScript](#typescript)
  - [O que mudou na 2.0.0](#o-que-mudou-na-200)
  - [Doação](#doação)
  - [Licença](#licença)

## O que a biblioteca faz

A partir de um termo em português, a biblioteca:

1. Normaliza o termo (remove acentos e espaços extras).
2. Monta a URL da página correspondente no Dicio.
3. Baixa o HTML com timeout, retry e rotação de User-Agent.
4. Faz o parse do HTML com Cheerio.
5. Retorna um objeto JSON com classe gramatical, significados, etimologia, plural, separação silábica, sinônimos, antônimos, exemplos/frases, informações extras, imagem e metadados.

Tudo isso sem depender de uma API oficial: a fonte de dados é o próprio site do Dicio.

## Instalação

```bash
npm install vxdicionario
```

Também funciona com yarn, pnpm ou bun:

```bash
yarn add vxdicionario
pnpm add vxdicionario
bun add vxdicionario
```

## Requisitos

- Node.js 18 ou superior (usa `fetch` nativo).
- Conexão com a internet para consultar o Dicio.

## Uso rápido

CommonJS:

```js
const VxDicionario = require("vxdicionario")

async function main() {
  const palavra = await VxDicionario("projeto")
  console.log(palavra.status)
  console.log(palavra.data?.[0]?.significados)
}

main()
```

ESM:

```js
import VxDicionario from "vxdicionario"

const palavra = await VxDicionario("projeto")
console.log(palavra)
```

TypeScript:

```ts
import VxDicionario, { SearchResult, SearchOptions } from "vxdicionario"

const options: SearchOptions = { timeout: 8000, retries: 1 }
const palavra: SearchResult = await VxDicionario("projeto", options)
```

## Como funciona

Fluxo interno de uma busca:

```text
termo do usuário
  -> normalização (slug)
  -> requisição HTTP com retry/timeout
  -> parse HTML (Cheerio)
  -> objeto JSON padronizado
  -> cache em memória (opcional)
```

Pontos importantes:

- A normalização remove acentos e converte espaços em hífens, então `árvore` vira `arvore`.
- A página do Dicio é identificada pelo slug na URL (`https://www.dicio.com.br/projeto/`).
- Se a página retornar o título "Ocorreu um Erro", a biblioteca trata como `404`.
- O tempo de resposta (`httpsResponse`) é medido do início da requisição até o fim da leitura do HTML.
- O cache é por termo normalizado e evita requisições repetidas.

## API

### `VxDicionario(termo, options?)`

Busca uma palavra no Dicio.

```js
const resultado = await VxDicionario("casa")
```

### `VxDicionario.search(termo, options?)`

Alias explícito da função principal.

```js
const resultado = await VxDicionario.search("casa")
```

### `VxDicionario.searchMany(termos, options?)`

Busca várias palavras com concorrência limitada (3 requisições por vez) e pequeno atraso entre chamadas, para ser mais educado com o servidor.

```js
const resultados = await VxDicionario.searchMany(["casa", "amar", "projeto"])

resultados.forEach((r) => {
  console.log(r.status, r.data?.[0]?.classe)
})
```

### `VxDicionario.suggest(termo, options?)`

Retorna sugestões quando a palavra não é encontrada ou para termos próximos.

```js
const sugestoes = await VxDicionario.suggest("projto")
// ["projeto", "pronto", "proto", ...]
```

### `VxDicionario.wordOfDay(options?)`

Retorna a palavra do dia do Dicio.

```js
const palavraDoDia = await VxDicionario.wordOfDay()
```

### `VxDicionario.randomWord(options?)`

Retorna uma palavra aleatória a partir da lista de palavras mais buscadas do Dicio.

```js
const aleatoria = await VxDicionario.randomWord()
```

### `VxDicionario.clearCache()`

Limpa o cache em memória.

```js
VxDicionario.clearCache()
```

## Opções

Todas as funções de busca aceitam um objeto de opções:

| Opção | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `timeout` | `number` | `10000` | Timeout da requisição em milissegundos. |
| `retries` | `number` | `2` | Tentativas extras em caso de falha de rede. |
| `cache` | `boolean` | `true` | Habilita o cache em memória. |
| `cacheTTL` | `number` | `1800000` | Tempo de vida do cache em milissegundos (30 min). |
| `userAgent` | `string` | rotação automática | User-Agent usado na requisição. |

Exemplo:

```js
const resultado = await VxDicionario("projeto", {
  timeout: 8000,
  retries: 1,
  cache: false,
})
```

## Formato da resposta

Exemplo resumido de retorno para uma busca com sucesso:

```json
{
  "status": 200,
  "httpsResponse": "1200ms",
  "data": [
    {
      "classe": "substantivo masculino",
      "significados": [
        "Plano; planejamento que se faz com a intenção de realizar ou desenvolver alguma coisa: projeto de lei.",
        "Esquema; noção inicial, escrita e detalhada..."
      ]
    }
  ],
  "version": "2.0.0",
  "etimologia": "Do latim projectus.us.",
  "frases": [
    "A Assembleia Nacional da Venezuela aprovou..."
  ],
  "plural": "projetos",
  "separacaoSilabica": "pro-je-to",
  "sinonimos": "Projeto é sinônimo de: esquema, planta, programa...",
  "antonimos": null,
  "outrasInformacoes": {
    "letras": 7,
    "vogais": "e o",
    "consoantes": "j p r t",
    "reverso": "otejorp"
  },
  "imagem": "https://s.dicio.com.br/projeto.jpg",
  "audio": null,
  "flexao": "Flexão do verbo projetar na: ...",
  "classeGramatical": "substantivo masculino"
}
```

Campos principais:

- `status`: status HTTP ou código interno (`400`, `0` em erro de rede).
- `httpsResponse`: tempo total da requisição.
- `data`: lista de acepções da palavra, com `classe` e `significados`.
- `etimologia`: origem da palavra, quando disponível.
- `frases`: exemplos e frases com a palavra.
- `plural`: forma no plural.
- `separacaoSilabica`: separação por sílabas.
- `sinonimos`: texto com sinônimos.
- `antonimos`: texto com antônimos, quando disponível.
- `outrasInformacoes`: letras, vogais, consoantes e palavra ao contrário.
- `imagem`: URL da imagem associada à palavra.
- `audio`: reservado para áudio, quando disponível.
- `flexao`: flexão verbal/adjetival, quando disponível.
- `classeGramatical`: classe gramatical extraída da definição.

## Tratamento de erros

A biblioteca não usa `console.log` nem lança exceções em fluxo normal. Erros são retornados no próprio objeto:

Palavra não encontrada:

```json
{
  "status": 404,
  "data": null,
  "error": "Palavra não encontrada"
}
```

Entrada inválida:

```json
{
  "status": 400,
  "data": null,
  "error": "Defina uma palavra para pesquisar!"
}
```

Falha HTTP:

```json
{
  "status": 500,
  "data": null,
  "error": "Falha HTTP 500"
}
```

Erro de rede:

```json
{
  "status": 0,
  "data": null,
  "error": "Erro de rede"
}
```

## Cache

O cache é em memória, por termo normalizado, com TTL padrão de 30 minutos. Ele evita requisições repetidas para a mesma palavra.

```js
await VxDicionario("projeto") // consulta o Dicio
await VxDicionario("projeto") // usa o cache

VxDicionario.clearCache() // limpa tudo
```

Para desativar o cache em uma chamada:

```js
await VxDicionario("projeto", { cache: false })
```

## Busca em lote

Use `searchMany` para consultar várias palavras sem sobrecarregar o servidor:

```js
const palavras = ["casa", "amar", "projeto", "feliz"]
const resultados = await VxDicionario.searchMany(palavras)

resultados.forEach((r, i) => {
  console.log(palavras[i], r.status)
})
```

## Sugestões

Quando o termo não existe, `suggest` pode ajudar a encontrar palavras próximas:

```js
const sugestoes = await VxDicionario.suggest("projto")
console.log(sugestoes)
```

## Palavra do dia e palavra aleatória

```js
const doDia = await VxDicionario.wordOfDay()
const aleatoria = await VxDicionario.randomWord()

console.log(doDia?.data?.[0]?.classe)
console.log(aleatoria?.data?.[0]?.significados?.[0])
```

## CLI

Após instalar, você pode consultar diretamente pelo terminal:

```bash
npx vxdicionario projeto
```

Ou, se instalado globalmente:

```bash
npm install -g vxdicionario
vxdicionario projeto
```

A saída é o JSON completo da consulta.

## TypeScript

Os tipos estão disponíveis em `types/index.d.ts` e são carregados automaticamente pelo campo `types` do `package.json`.

Funções e interfaces exportadas:

- `search`
- `searchMany`
- `suggest`
- `wordOfDay`
- `randomWord`
- `clearCache`
- `SearchResult`
- `SearchOptions`
- `WordData`
- `OtherInfo`

## O que mudou na 2.0.0

Correções:

- Parser reescrito para o markup atual do Dicio; antes `data` voltava vazio.
- `separacaoSilabica` não quebra mais quando não há definição.
- Respostas de erro consistentes: 404, HTTP e rede retornam objeto em vez de string ou `console.log`.
- Removidas variáveis globais de tempo.
- Removidas dependências problemáticas: `colors`, `e`, `desacentuador` e a dependência circular `vxdicionario`.
- Normalização de acentos feita com `String.prototype.normalize` e `encodeURIComponent`.

Melhorias:

- Novos campos: `outrasInformacoes`, `imagem`, `flexao`, `classeGramatical`.
- Novas funções: `searchMany`, `suggest`, `wordOfDay`, `randomWord`, `clearCache`.
- Cache em memória com TTL.
- Timeout, retry e rotação de User-Agent.
- Fonte TypeScript em `src/`.
- Tipos atualizados para refletir o runtime.
- Suporte a CommonJS e ESM.
- CLI disponível via `npx`.
- Testes automatizados e CI com GitHub Actions.

## Doação

Se este projeto te ajudou, considere apoiar o desenvolvimento:

- [Buy Me a Coffee](https://buymeacoffee.com/vitorxp)

## Licença

MIT
