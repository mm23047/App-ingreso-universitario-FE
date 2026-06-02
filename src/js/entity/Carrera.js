// Entidad: CatalogoCarrera
// Campos backend: idCarrera (String, max 10), nombreCatalogoCarrera (String, max 100)
export default class Carrera {
    constructor(data = {}) {
        Object.assign(this, data);
    }
}
