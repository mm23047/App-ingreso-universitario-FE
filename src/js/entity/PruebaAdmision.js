// Entidad: PruebasAdmision
// Endpoint: GET /pruebas_admision
// Campos reales del backend (getters → JSON):
//   idPruebaAdmision (UUID), nombrePrueba, anio (Integer), activa (Boolean)
export default class PruebaAdmision {
    constructor(data = {}) {
        // PK
        this.idPruebaAdmision = data.idPruebaAdmision ?? data.id ?? null;
        this.id               = data.idPruebaAdmision ?? data.id ?? null;

        this.nombrePrueba = data.nombrePrueba ?? data.nombre ?? '';
        this.nombre       = data.nombrePrueba ?? data.nombre ?? '';
        this.anio         = data.anio   ?? null;
        this.activa       = data.activa ?? false;
    }
}
