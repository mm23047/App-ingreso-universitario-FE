/*
 * Web Worker — Procesamiento de peticiones en segundo plano.
 * Recibe: { id, url, method?, body? }
 * Responde: { id, success, data?, error? }
 */

self.onmessage = async ({ data }) => {
    const { id, url, method = 'GET', body } = data;

    try {
        const options = { method };

        if (body !== undefined && body !== null) {
            options.headers = { 'Content-Type': 'application/json' };
            options.body    = JSON.stringify(body);
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        self.postMessage({ id, success: true, data: result });

    } catch (error) {
        self.postMessage({ id, success: false, error: error.message });
    }
};
