"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCached = getCached;
exports.setCached = setCached;
exports.clearCache = clearCache;
const cache = new Map();
function getCached(key) {
    const entry = cache.get(key);
    if (!entry)
        return undefined;
    if (Date.now() > entry.expires) {
        cache.delete(key);
        return undefined;
    }
    return entry.value;
}
function setCached(key, value, ttl) {
    cache.set(key, { value, expires: Date.now() + ttl });
}
function clearCache() {
    cache.clear();
}
