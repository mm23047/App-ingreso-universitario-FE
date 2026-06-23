// Shims para APIs de browser requeridas por la suite de tests
'use strict';

global.window = global;

// Event/CustomEvent/EventTarget ya existen nativamente en Node.js v22 — se
// delega en un EventTarget real para que addEventListener/dispatchEvent
// (incluyendo soporte de { once: true }) se comporten como en el navegador.
const _eventTarget = new EventTarget();
global.addEventListener    = _eventTarget.addEventListener.bind(_eventTarget);
global.removeEventListener = _eventTarget.removeEventListener.bind(_eventTarget);
global.dispatchEvent       = _eventTarget.dispatchEvent.bind(_eventTarget);

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
    set hash(v) {
        const value = String(v);
        this._hash = value === '' || value.startsWith('#') ? value : `#${value}`;
    }
};

// window.APP_CONFIG — mismo mecanismo que src/env.js / docker-entrypoint.d/40-env-config.sh,
// para que Jenkins pueda apuntar las suites de integración (server-off/server-on) a un
// backend distinto sin tocar código, vía las variables de entorno BACKEND_HOST/PORT/PATH.
global.window.APP_CONFIG = {
    ...(process.env.BACKEND_HOST && { BACKEND_HOST: process.env.BACKEND_HOST }),
    ...(process.env.BACKEND_PORT && { BACKEND_PORT: process.env.BACKEND_PORT }),
    ...(process.env.BACKEND_PATH && { BACKEND_PATH: process.env.BACKEND_PATH })
};

// fetch ya existe en Node.js v22 — no hay que polyfillarlo
// sinon.stub(window, 'fetch') lo reemplazará en cada test
