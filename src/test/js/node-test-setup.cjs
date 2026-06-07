// Shims para APIs de browser requeridas por la suite de tests
'use strict';

global.window = global;
global.dispatchEvent = () => {};
global.addEventListener = () => {};
global.removeEventListener = () => {};

global.CustomEvent = class CustomEvent {
    constructor(type, opts = {}) {
        this.type   = type;
        this.bubbles = opts.bubbles ?? false;
        this.detail  = opts.detail  ?? null;
    }
};

// localStorage en memoria (se limpia entre archivos via localStorage.clear())
const _storage = new Map();
global.localStorage = {
    getItem:    (key)   => _storage.has(key) ? _storage.get(key) : null,
    setItem:    (key, v) => { _storage.set(key, String(v)); },
    removeItem: (key)   => { _storage.delete(key); },
    clear:      ()      => { _storage.clear(); },
    get length()        { return _storage.size; },
    key:        (i)     => ([..._storage.keys()][i] ?? null)
};

// document stub: los controllers usan document.querySelector('app-toast')?.show(...)
global.document = {
    querySelector: () => null,
    getElementById: () => null
};

// navigate puede ser llamado por controllers que hacen router redirect
global.navigate = () => {};

// window.location es usado por router.js en navigate() y por DefaultDao para construir BASE_URL
global.location = {
    hostname: 'localhost',
    _hash: '',
    get hash() { return this._hash; },
    set hash(v) { this._hash = String(v); }
};

// fetch ya existe en Node.js v22 — no hay que polyfillarlo
// sinon.stub(window, 'fetch') lo reemplazará en cada test
