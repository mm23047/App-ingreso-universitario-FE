// Entidad: ExamenRealizado
// Endpoint: /examenes  (NO /examen_realizado — verificar DAO)
// POST /examenes espera DTO: { idInscripcion: UUID, idEtapa: UUID }
// Campos reales de la respuesta JSON (getters → JSON):
//   idExamenRealizado (UUID), inscripcionesPrueba (nested), claveExamen (nested),
//   etapaAdmision (nested), puntajeFinal (BigDecimal, null hasta calificación),
//   fechaRealizacion (OffsetDateTime ISO-8601)
export default class ExamenRealizado {
    constructor(data = {}) {
        // PK: backend usa idExamenRealizado, tests usan id
        this.idExamenRealizado = data.idExamenRealizado ?? data.id ?? null;
        this.id                = data.idExamenRealizado ?? data.id ?? null;

        // Relaciones anidadas
        this.inscripcionesPrueba = data.inscripcionesPrueba ?? null;
        this.claveExamen         = data.claveExamen         ?? null;
        this.etapaAdmision       = data.etapaAdmision       ?? null;

        // Campos escalares
        this.puntajeFinal    = data.puntajeFinal    ?? null;
        this.fechaRealizacion = data.fechaRealizacion ?? null;

        // Campos planos derivados (compatibilidad con controladores y tests)
        this.aspiranteId = data.aspiranteId
            ?? data.inscripcionesPrueba?.aspiranteDato?.id
            ?? null;
        this.pruebaId = data.pruebaId
            ?? data.inscripcionesPrueba?.pruebaAdmision?.idPruebaAdmision
            ?? null;

        // guardado: campo usado en mocks de test, no viene del backend real
        this.guardado = data.guardado ?? false;
    }
}
