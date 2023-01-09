[![version][version-img]][version-url]
[![downloads][downloads-mes-img]][donwloads-url]
[![MIT][licence-img]][licence-url]
[![Website][website-img]][website-url]

# Donate:
- Caso você queira nos ajudar de forma monetaria, [clique aqui para mais detalhes](https://link.mercadopago.com.br/counting)!
# VxDicionario:
  
Este pacote foi criado e desenvolvido para pegar as informações de https://www.dicio.com.br/ e formatadas para json, sendo assim isto fica muito mais fácil de usar em qualquer aplicação.

# Versão do package 1.3.0.
# O que foi alterado?
> Deixamos o projeto muito mais rápido.

> Compactamos todas as linhas para uma melhor performace.
  
> Agora e possivel saber quanto tempo demorou para pegar as informações do dicionario.

# Como funciona?
Primeiro antes de tudo, vamos começar definindo a nossa dependencia utilizada.
```js
const VXDicionario = require("vxdicionario")
```
Após isto, iremos pegar uma palavra aleatoria e consultar a sua informação.

```js
var palavra = await VXDicionario("projeto")
```
Após isto, iremos agora pegar todas as informações em html e formatalas para texto, assim iremos conseguir formatar ela para typescript ou json.
```js
console.log(palavra)
```
> Resultado:
```js
{
  httpsResponse: '2351ms',
  status: 200,
  data: [ { classe: 'substantivo masculino', significados: [
  'Plano; planejamento que se faz com a intenção de realizar ou desenvolver alguma coisa: projeto de lei.',
  'Esquema; noção inicial, escrita e detalhada, do que se pretende desenvolver; aquilo que se pretende realizar, de acordo com esse esquema: projeto de pesquisa; projeto de limpeza do Rio Tietê.',
  '[Arquitetura] Plano que se faz antes do início de uma obra, com as descrições, cálculos, orçamento: o projeto de uma igreja.',
  'Escritura provisória de um texto.'
] } ],
  version: '1.2.5',
  etimologia: 'Do latim projectus.us.',
  frases: null,
  plural: 'projetos',
  separacaoSilabica: 'pro - je - to',
  sinonimos: ' Projeto é sinônimo de: esquema, planta, programa, programação, esboço, plano, traço, traçado, prospecto ',
  antonimos: null
}
```

# **Caso tenha alguma duvida, então entre em contato via Discord de `vitor_xp#1958`.**



[version-img]: https://img.shields.io/npm/v/vxdicionario
[version-url]: https://www.npmjs.com/package/vxdicionario
[donwloads-img]: https://img.shields.io/npm/dt/vxdicionario
[licence-url]: https://github.com/vitorxcp/VxDicionario/blob/HEAD/LICENSE
[donwloads-url]: https://npmcharts.com/compare/vxdicionario?minimal=true
[downloads-mes-img]: https://img.shields.io/npm/dm/vxdicionario
[licence-img]: https://img.shields.io/npm/l/vxdicionario?color=blue
[website-img]: https://img.shields.io/website?down_color=vitorxp.squareweb.app&down_message=vitorxp.squareweb.app&up_message=vitorxp.squareweb.app&url=https%3A%2F%2Fvitorxp.squareweb.app
[website-url]: https://vitorxp.squareweb.app/