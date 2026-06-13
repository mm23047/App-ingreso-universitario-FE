class DefaultDao {
    constructor() {
        const backendHost = window.location.hostname;
        this.BASE_URL = `http://${backendHost}:9080/IngresoUniversitarioTPI135-1.0-SNAPSHOT/resources/v1/`;
    }

    getBaseUrl() {
        return this.BASE_URL;
    }

    // Punto único donde se llama a fetch() en todo el proyecto.
    async _fetch(url, options = {}) {
        return fetch(url, options);
    }

    // GET → 200 → json, cualquier otro status lanza Error con httpStatus adjunto.
    async _get(url, signal = null) {
        const options = { method: 'GET' };
        if (signal) options.signal = signal;
        const r = await this._fetch(url, options);
        if (r.status === 200) return r.json();
        const err = new Error(`Error HTTP: ${r.status}`);
        err.httpStatus = r.status;
        throw err;
    }

    // POST con JSON body → expectedStatus → json, cualquier otro status lanza Error con httpStatus adjunto.
    async _post(url, body, expectedStatus = 201) {
        const r = await this._fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (r.status === expectedStatus) return r.json();
        const err = new Error(`Error HTTP: ${r.status}`);
        err.httpStatus = r.status;
        throw err;
    }

    // PUT con JSON body → 200 → json, cualquier otro status lanza Error con httpStatus adjunto.
    async _put(url, body) {
        const r = await this._fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (r.status === 200) return r.json();
        const err = new Error(`Error HTTP: ${r.status}`);
        err.httpStatus = r.status;
        throw err;
    }

    // DELETE → 204 → void, cualquier otro status lanza Error con httpStatus adjunto.
    async _delete(url) {
        const r = await this._fetch(url, { method: 'DELETE' });
        if (r.status === 204) return;
        const err = new Error(`Error HTTP: ${r.status}`);
        err.httpStatus = r.status;
        throw err;
    }
}

export default DefaultDao;
