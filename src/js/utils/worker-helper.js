/*
 * Utilidad para comunicarse con el Web Worker de procesamiento.
 * Cada llamada a ejecutarWorker retorna una Promise que resuelve
 * o rechaza con la respuesta del worker.
 */

let _worker = null;
let _nextId  = 0;
const _pending = new Map();

function _getWorker() {
    if (!_worker) {
        _worker = new Worker(
            new URL('../workers/procesamiento.worker.js', import.meta.url),
            { type: 'module' }
        );

        _worker.addEventListener('message', ({ data }) => {
            const { id, success, data: result, error } = data;
            const handlers = _pending.get(id);
            if (!handlers) return;
            _pending.delete(id);
            success ? handlers.resolve(result) : handlers.reject(new Error(error));
        });

        _worker.addEventListener('error', (e) => {
            console.error('[Worker] Error no manejado:', e.message);
        });
    }
    return _worker;
}

/**
 * Ejecuta una petición HTTP en el Web Worker.
 * @param {string} url
 * @param {{ method?: string, body?: object }} options
 * @returns {Promise<any>}
 */
export const ejecutarWorker = (url, options = {}) => {
    return new Promise((resolve, reject) => {
        const id = ++_nextId;
        _pending.set(id, { resolve, reject });
        _getWorker().postMessage({ id, url, ...options });
    });
};

/**
 * Termina el worker. Llámalo si la SPA se desmonta o ya no lo necesitas.
 */
export const terminarWorker = () => {
    if (_worker) {
        _worker.terminate();
        _worker = null;
        _pending.clear();
    }
};
