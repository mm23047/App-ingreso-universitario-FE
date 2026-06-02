// Entidad: Tema
// Endpoint: GET /temas, GET /areas/{idArea}/temas
// Campos reales del backend (getters → JSON):
//   idTema (UUID), areaConocimiento (nested AreasConocimiento), nombreTema (String)
// NOTA: idTemaPadre tiene @JsonbTransient — NO viene serializado en el JSON.
//       subtemas es LAZY y tampoco viene.
export default class Tema {
    constructor(data = {}) {
        this.idTema = data.idTema ?? data.id ?? null;
        this.id     = data.idTema ?? data.id ?? null;

        this.nombreTema = data.nombreTema ?? data.nombre ?? '';
        this.nombre     = data.nombreTema ?? data.nombre ?? '';

        // Relación anidada (viene cargada por JOIN FETCH en los named queries)
        this.areaConocimiento = data.areaConocimiento ?? null;
    }
}
