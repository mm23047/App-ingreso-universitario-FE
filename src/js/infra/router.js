import { store } from './app_state.js';

export const RUTAS = {
    '/':          'home',
    '/carreras':  'carreras',
    '/registro':  'registro',
    '/procesos':  'procesos',
    '/areas':     'areas',
    '/resultado': 'resultado',
};

const _obtenerHashActual = () => {
    const hash = window.location.hash.replace('#', '').trim();
    return (hash && RUTAS[hash]) ? hash : '/';
};

const _manejarCambioRuta = () => {
    const ruta = _obtenerHashActual();
    const nombre = RUTAS[ruta];
    store.route = ruta;
    window.dispatchEvent(new CustomEvent('route-changed', {
        detail: { ruta, nombre }
    }));
};

export const navigate = (ruta) => {
    if (!RUTAS[ruta]) {
        console.warn(`Ruta desconocida: ${ruta}. Redirigiendo a /`);
        window.location.hash = '/';
        return;
    }
    window.location.hash = ruta;
};

export const getCurrentRoute = () => _obtenerHashActual();

window.addEventListener('hashchange', _manejarCambioRuta);
window.addEventListener('load', _manejarCambioRuta);

export default { navigate, getCurrentRoute, RUTAS };
