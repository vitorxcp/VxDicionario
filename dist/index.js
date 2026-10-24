"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const http_1 = require("./http");
const parse_1 = require("./parse");
const cache_1 = require("./cache");
const cheerio = __importStar(require("cheerio"));
const package_json_1 = __importDefault(require("../package.json"));
const VERSION = package_json_1.default.version;
const DEFAULT_TIMEOUT = 10000;
const DEFAULT_RETRIES = 2;
const DEFAULT_CACHE_TTL = 1000 * 60 * 30;
async function search(term, options = {}) {
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
        };
    }
    const cacheEnabled = options.cache !== false;
    const cacheKey = term.trim().toLowerCase();
    if (cacheEnabled) {
        const cached = (0, cache_1.getCached)(cacheKey);
        if (cached)
            return cached;
    }
    const url = `https://www.dicio.com.br/${(0, http_1.slugify)(term)}/`;
    try {
        const { html, status, elapsed } = await (0, http_1.fetchHtml)(url, {
            timeout: options.timeout ?? DEFAULT_TIMEOUT,
            retries: options.retries ?? DEFAULT_RETRIES,
            userAgent: options.userAgent,
        });
        if (status === 404) {
            const res = {
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
            };
            if (cacheEnabled)
                (0, cache_1.setCached)(cacheKey, res, options.cacheTTL ?? DEFAULT_CACHE_TTL);
            return res;
        }
        if (status < 200 || status >= 400) {
            const res = {
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
            };
            return res;
        }
        const res = (0, parse_1.parseHtml)(html, term, elapsed, VERSION);
        if (cacheEnabled)
            (0, cache_1.setCached)(cacheKey, res, options.cacheTTL ?? DEFAULT_CACHE_TTL);
        return res;
    }
    catch (err) {
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
        };
    }
}
async function searchMany(terms, options = {}) {
    const concurrency = 3;
    const out = new Array(terms.length);
    let cursor = 0;
    async function worker() {
        while (true) {
            const i = cursor++;
            if (i >= terms.length)
                return;
            out[i] = await search(terms[i], options);
            // small delay to be polite
            await new Promise((r) => setTimeout(r, 150));
        }
    }
    await Promise.all(Array.from({ length: Math.min(concurrency, terms.length) }, () => worker()));
    return out;
}
async function suggest(term, options = {}) {
    const url = `https://www.dicio.com.br/pesquisa.php?q=${encodeURIComponent(term)}`;
    try {
        const { html } = await (0, http_1.fetchHtml)(url, {
            timeout: options.timeout ?? DEFAULT_TIMEOUT,
            retries: 1,
            userAgent: options.userAgent,
        });
        const $ = cheerio.load(html);
        const slug = (0, http_1.slugify)(term);
        const links = $("a")
            .map((_, el) => $(el).attr("href"))
            .get()
            .filter((h) => typeof h === "string" && /^\/[a-z0-9-]+\/$/.test(h));
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
        ]);
        const seen = new Set();
        const out = [];
        for (const h of links) {
            if (skip.has(h))
                continue;
            const w = h.replace(/^\//, "").replace(/\/$/, "");
            if (w === slug)
                continue;
            if (seen.has(w))
                continue;
            seen.add(w);
            out.push(w);
            if (out.length >= 8)
                break;
        }
        return out;
    }
    catch {
        return [];
    }
}
async function wordOfDay(options = {}) {
    try {
        const { html } = await (0, http_1.fetchHtml)("https://www.dicio.com.br/palavra-do-dia/", {
            timeout: options.timeout ?? DEFAULT_TIMEOUT,
            retries: options.retries ?? DEFAULT_RETRIES,
            userAgent: options.userAgent,
        });
        const $ = cheerio.load(html);
        const m = $("body").html()?.match(/Significado completo de <a[^>]*>([^<]+)<\/a>/i);
        const word = m ? m[1].trim() : null;
        if (!word)
            return null;
        return search(word, options);
    }
    catch {
        return null;
    }
}
async function randomWord(options = {}) {
    try {
        const { html } = await (0, http_1.fetchHtml)("https://www.dicio.com.br/palavras-mais-buscadas/", {
            timeout: options.timeout ?? DEFAULT_TIMEOUT,
            retries: 1,
            userAgent: options.userAgent,
        });
        const $ = cheerio.load(html);
        const links = $("a")
            .map((_, el) => $(el).attr("href"))
            .get()
            .filter((h) => typeof h === "string" && /^\/[a-z0-9-]+\/$/.test(h));
        const skip = new Set(["/cata-letras/", "/jogo-conexoes/", "/jogos-caca-palavras/"]);
        const bad = /palavras-|exemplos|curiosidades|cata-letras|jogo|palavra-do-dia|duvidas|sinonimos-e-antonimos|como-escrever/;
        const candidates = links
            .map((h) => h.replace(/^\//, "").replace(/\/$/, ""))
            .filter((w) => !skip.has(`/${w}/`) && !bad.test(w));
        if (!candidates.length)
            return wordOfDay(options);
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        return search(pick, options);
    }
    catch {
        return wordOfDay(options);
    }
}
const vxDicionario = search;
vxDicionario.search = search;
vxDicionario.searchMany = searchMany;
vxDicionario.suggest = suggest;
vxDicionario.wordOfDay = wordOfDay;
vxDicionario.randomWord = randomWord;
vxDicionario.clearCache = cache_1.clearCache;
module.exports = vxDicionario;
