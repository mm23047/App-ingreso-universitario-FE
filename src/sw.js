const CACHE_NAME = 'ingreso-universitario-v7';
const OFFLINE_URL = '/offline.html';

/*
 * Assets que se pre-cachean en la instalación del SW.
 * Todas las rutas son relativas a la raíz del servidor (src/).
 * Los fragmentos de vista *.html y las imágenes NO están aquí:
 *  - HTML de vistas → se sirven con Network-First (siempre frescos)
 *  - Imágenes       → se cachean dinámicamente la primera vez que se piden
 */
const ASSETS_ESTATICOS = [
    '/pwa.html',
    '/offline.html',
    '/css/global.css',
    '/css/grid-layout.css',
    '/css/responsive.css',
    '/js/infra/app_state.js',
    '/js/infra/router.js',
    '/js/infra/utils/worker-helper.js',
    '/js/boundary/components/notificacion-toast.js',
    '/js/boundary/components/contador.js',
    '/manifest.json',
    '/img/iconos/logo_192_192.png',
    '/img/iconos/logo_512_512.png',
    '/img/screenshots/captura-escritorio.png',
    '/img/screenshots/captura-movil.png'
];

/* Detecta llamadas a la API del backend */
const API_PATTERN = /(localhost|host\.docker\.internal):9080/;
const _esLlamadaAPI = (url) => API_PATTERN.test(url);

/* Detecta archivos HTML: navegaciones directas O fetch() hacia .html */
const _esHTML = (request) => {
    try {
        const url = new URL(request.url);
        return request.mode === 'navigate' || url.pathname.endsWith('.html');
    } catch {
        return false;
    }
};

/*
 * Pre-cachea archivo por archivo para poder detectar exactamente
 * cuál falla sin abortar toda la instalación.
 */
const _precachear = async (cache) => {
    const resultados = await Promise.allSettled(
        ASSETS_ESTATICOS.map(async (ruta) => {
            try {
                await cache.add(ruta);
                console.log('[SW] Cacheado:', ruta);
            } catch (err) {
                console.error('[SW] Falló al cachear:', ruta, '→', err.message);
                throw err;
            }
        })
    );

    const fallidos = resultados
        .map((r, i) => ({ ruta: ASSETS_ESTATICOS[i], result: r }))
        .filter(({ result }) => result.status === 'rejected');

    if (fallidos.length > 0) {
        console.warn('[SW] Archivos que no pudieron cachearse:',
            fallidos.map(f => f.ruta));
    } else {
        console.log('[SW] Pre-caché completado sin errores.');
    }
};

/* ── INSTALL ── */
self.addEventListener('install', (event) => {
    console.log('[SW] Instalando versión:', CACHE_NAME);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => _precachear(cache))
            .then(() => {
                console.log('[SW] Instalación completada → activando con skipWaiting');
                return self.skipWaiting();
            })
            .catch(err => console.warn('[SW] Error en instalación:', err))
    );
});

/* ── ACTIVATE ── */
self.addEventListener('activate', (event) => {
    console.log('[SW] Activando versión:', CACHE_NAME);
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys
                    .filter(k => k !== CACHE_NAME)
                    .map(k => {
                        console.log('[SW] Eliminando caché antigua:', k);
                        return caches.delete(k);
                    })
            ))
            .then(() => {
                console.log('[SW] Todas las cachés antiguas eliminadas. clients.claim()');
                return self.clients.claim();
            })
    );
});

/* ── FETCH ── */
self.addEventListener('fetch', (event) => {
    const { request } = event;

    if (request.method !== 'GET') return;

    /* ① API backend → Network-first con actualización de caché */
    if (_esLlamadaAPI(request.url)) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                    }
                    return response;
                })
                .catch(() => caches.match(request).then(cached => cached || new Response(null, { status: 503, statusText: 'Service Unavailable' })))
        );
        return;
    }

    /*
     * ② HTML (pwa.html y todos los fragmentos de vista *.html)
     *    → Network-first: garantiza que el navegador siempre obtenga
     *      la versión más reciente sin necesitar Ctrl+Shift+R.
     *      El caché actúa solo como fallback offline.
     */
    if (_esHTML(request)) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                    }
                    return response;
                })
                .catch(() =>
                    caches.match(request)
                        .then(cached => cached || caches.match(OFFLINE_URL))
                )
        );
        return;
    }

    /* ③ CSS, JS e imágenes → Cache-first con fallback a network */
    event.respondWith(
        caches.match(request).then(cached => {
            if (cached) return cached;
            return fetch(request)
                .then(response => {
                    if (!response || response.status !== 200 || response.type === 'opaque') {
                        return response;
                    }
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                    return response;
                })
                .catch(() => new Response(null, { status: 503, statusText: 'Service Unavailable' }));
        })
    );
});

/* ── MENSAJE desde el cliente: forzar activación inmediata ── */
self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') {
        console.log('[SW] SKIP_WAITING recibido → activando ahora');
        self.skipWaiting();
    }
});
