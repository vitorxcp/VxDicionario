"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slugify = slugify;
exports.fetchHtml = fetchHtml;
const USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0",
];
function slugify(term) {
    return term
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
}
async function fetchHtml(url, opts = {}) {
    const timeout = opts.timeout ?? 10000;
    const retries = opts.retries ?? 2;
    const started = Date.now();
    let lastErr;
    for (let attempt = 0; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        try {
            const res = await fetch(url, {
                signal: controller.signal,
                headers: {
                    "User-Agent": opts.userAgent || USER_AGENTS[attempt % USER_AGENTS.length],
                    Accept: "text/html,application/xhtml+xml",
                    "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
                },
                redirect: "follow",
            });
            clearTimeout(timer);
            const html = await res.text();
            return { html, status: res.status, elapsed: Date.now() - started };
        }
        catch (err) {
            clearTimeout(timer);
            lastErr = err;
            if (attempt < retries)
                await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
        }
    }
    throw lastErr;
}
