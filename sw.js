const CACHE_NAME = 'ingreso-universitario-v1';

const ASSETS_ESTATICOS = [
    '/src/index.html',
    '/src/css/global.css',
    '/src/css/grid-layout.css',
    '/src/css/responsive.css',
    '/src/js/infra/app_state.js',
    '/src/js/infra/router.js',
    '/src/js/boundary/components/notificacion-toast.js',
    '/src/js/boundary/components/contador.js',
    '/manifest.json'
];

const API_PATTERN = /localhost:9080/;
const API_PATHS = [
    '/aspirantes',
    '/carreras',
    '/turnos',
    '/inscripciones_prueba',
    '/preguntas',
    '/opciones',
    '/examen_realizado',
    '/respuestas_examen',
    '/pruebas_admision',
    '/etapas'
];

const _esLlamadaAPI = (url) =>
    API_PATTERN.test(url) || API_PATHS.some(p => url.includes(p));

/* ── INSTALL: pre-cachear assets estáticos ── */
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS_ESTATICOS))
            .then(() => self.skipWaiting())
            .catch(err => console.warn('[SW] Error al cachear assets:', err))
    );
});

/* ── ACTIVATE: limpiar caches antiguas ── */
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys
                    .filter(k => k !== CACHE_NAME)
                    .map(k => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

/* ── FETCH: estrategia por tipo de recurso ── */
self.addEventListener('fetch', (event) => {
    const { request } = event;

    if (request.method !== 'GET') return;

    if (_esLlamadaAPI(request.url)) {
        /* Network-first para APIs: datos frescos, fallback a caché */
        event.respondWith(
            fetch(request)
                .catch(() => caches.match(request))
        );
        return;
    }

    /* Cache-first para assets estáticos */
    event.respondWith(
        caches.match(request).then(cached => {
            if (cached) return cached;
            return fetch(request).then(response => {
                if (!response || response.status !== 200 || response.type === 'opaque') {
                    return response;
                }
                const clonad = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(request, clonad));
                return response;
            });
        })
    );
});

/* ── MENSAJE desde el cliente ── */
self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
