// Entidad: Aula
// Endpoint: GET /aulas
// Campos reales del backend (getters → JSON):
//   idAula (UUID), codigoAulaApi (String), capacidadFisica (Integer),
//   accesibleSillaRuedas (Boolean)
export default class Aula {
    constructor(data = {}) {
        this.idAula    = data.idAula ?? data.id ?? null;
        this.id        = data.idAula ?? data.id ?? null;

        this.codigoAulaApi       = data.codigoAulaApi       ?? data.codigo ?? '';
        this.capacidadFisica     = data.capacidadFisica     ?? data.capacidad ?? 0;
        this.accesibleSillaRuedas = data.accesibleSillaRuedas ?? false;
    }
}
