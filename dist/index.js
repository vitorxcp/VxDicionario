const cheerio_1 = require("cheerio");
const fetch = require('node-fetch');

var __importDefault = (this && this.__importDefault) || function (mod) {return (mod && mod.__esModule) ? mod : { "default": mod };};
var desacentuador_1 = __importDefault(require("desacentuador"));

function camelCase(string) {
    string = (0, desacentuador_1.default)(string);
    const parts = string.split(" ");
    if (!parts.length || parts.length === 1)
        return string.toLowerCase();
    let result = parts.shift().toLowerCase();
    for (const part of parts)
        result += part[0].toUpperCase() + part.slice(1).toLowerCase();
    return result;
}

function arrayToObject(arr) {
    const obj = {};
    for (let i = 0; i < arr.length; i += 2) {
        Object.assign(obj, { [camelCase(arr[i])]: arr[i + 1] });
    }
    return obj;
}

const defaults = Object.freeze({
    version: require("../package.json").version,
    etimologia: null,
    frases: null,
    plural: null,
    separacaoSilabica: null,
    sinonimos: null,
    antonimos: null
});

module.exports = async (termo) => {
  try{
    const colors = require("colors")
    if(!termo) return console.log(colors.red("Defina uma palavra para pesquisar!"))
    time_1 = Date.now()
    time_2 = null
    const req = await fetch(`https://dicio.com.br/${(0, desacentuador_1.default)(termo.replace(/ +/g, "-"))}`).then(e => {
        time_2 = Date.now()
        return e.text()
    });
    const $ = (0, cheerio_1.load)(req, { lowerCaseTags: true }, true);
    if ($("title").text() === "Ocorreu um Erro")
        return Object.assign({}, {httpsResponse: "0ms", status: 404, data: [{classe: null, significados: null}] }, defaults);
    else {
        const result = Object.assign({}, {httpsResponse:""+(time_2-time_1)+"ms", status: 200, data: [] }, defaults);
        result.frases = null;
        result.separacaoSilabica = [];
        result.sinonimos = null;
        result.antonimos = null;
        $("p[itemprop=description]")
        .children()
        .each((_, el) => {
            if ($(el).hasClass("etim")) result.etimologia = $(el).text().split(". ")[1];
            else if ($(el).hasClass("cl")) result.data.unshift({ classe: $(el).text().trim(), significados: [] });
            else result.data[0]?result.data[0].significados.push($(el).text()):null;
        });
        result.data.reverse();
        $(".wrap-section")
        .children()
        .each((_, el) => {
            if(el.tagName === "p") {
                let sino = $(el).text().replace(/ +/g, " ")
                if(sino.includes("Classe")||sino.includes("Possui")||sino.includes("escrita")) sino = null
                if((sino?sino:"a").includes("sinônimo")) result.sinonimos = sino.replaceAll("\n", "")
                if((sino?sino:"a").includes("contrário")) result.antonimos = sino.replaceAll("\n", "")
            }
        });
        const defs = arrayToObject($(".tit-section + p.adicional")
            .text()
            .trim()
            .replace(/ +/g, " ")
            .split(/[:\n]+/)
            .map(e => e.trim()));
        result.plural = defs.plural || null;
        result.separacaoSilabica = defs.separacaoSilabica.replaceAll("-", " - ");
        $(".tit-frases + .frases > .frase").each((_, el) => {
            result.frases = []
            result.frases.push($(el).text().trim().split(/\n/g)[0].replace(/ +/g, " ")+""+$(el).text().trim().split(/\n/g)[1].replace(/ +/g, " ")+"");
        });
        return result;
    }
  }catch(e){
    console.log(e)
    return "Defina uma palavra para pesquisar!";
}
};
