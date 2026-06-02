// Entidad: InscripcionesPrueba
// Endpoint principal: POST /aspirantes/{idAspirante}/inscripciones
//   body: { pruebaAdmision: { idPruebaAdmision: UUID } }  → 201
// Consulta:           GET /inscripciones_prueba/{idInscripcion}
//                     GET /inscripciones_prueba?idPrueba=UUID&estado=INSCRITO
// Campos reales del backend (getters → JSON):
//   idInscripcionPrueba (UUID), aspiranteDato (nested AspirantesDato),
//   pruebaAdmision (nested PruebasAdmision), estado (String)
// NOTA: no existe campo turnoId en la entidad.
//       El turno/aula se asigna vía AsignacionAulaAspirante (proceso administrativo).
export default class InscripcionPrueba {
    constructor(data = {}) {
        // PK: backend usa idInscripcionPrueba, tests usan id
        this.idInscripcionPrueba = data.idInscripcionPrueba ?? data.id ?? null;
        this.id                  = data.idInscripcionPrueba ?? data.id ?? null;

        // Relaciones anidadas (vienen cargadas por JOIN FETCH)
        this.aspiranteDato  = data.aspiranteDato  ?? null;
        this.pruebaAdmision = data.pruebaAdmision ?? null;

        // Campos planos derivados (para compatibilidad con tests y controladores)
        this.aspiranteId = data.aspiranteId
            ?? data.aspiranteDato?.id
            ?? null;
        this.pruebaAdmisionId = data.pruebaAdmisionId
            ?? data.pruebaAdmision?.idPruebaAdmision
            ?? null;

        // turnoId no existe en la entidad backend; se mantiene por mocks existentes
        this.turnoId = data.turnoId ?? null;

        this.estado = data.estado ?? 'INSCRITO';
    }
}
