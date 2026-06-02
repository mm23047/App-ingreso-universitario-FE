// Entidad: AreasConocimiento
// Endpoint: GET /areas
// Campos reales del backend (getters → JSON):
//   idAreaConocimiento (UUID), nombreArea (String)
export default class AreaConocimiento {
    constructor(data = {}) {
        this.idAreaConocimiento = data.idAreaConocimiento ?? data.id ?? null;
        this.id                 = data.idAreaConocimiento ?? data.id ?? null;

        this.nombreArea = data.nombreArea ?? data.nombre ?? '';
        this.nombre     = data.nombreArea ?? data.nombre ?? '';
    }
}
