// Entidad: RespuestaExamen
// Endpoint individual: POST /respuestas_examen
//   body: { examenRealizado: { idExamenRealizado: UUID }, preguntaOpcion: { idPreguntaOpcion: UUID } }
// Endpoint lote:       POST /respuestas_examen/lote
//   body: { idExamen: UUID, opcionesSeleccionadas: [UUID] }
// Consulta por examen: GET /respuestas_examen/examen/{idExamen}
// Campos reales de la respuesta JSON (getters → JSON):
//   idRespuestaExamen (UUID), examenRealizado (nested), preguntaOpcion (nested)
export default class RespuestaExamen {
    constructor(data = {}) {
        // PK: backend usa idRespuestaExamen, tests usan id
        this.idRespuestaExamen = data.idRespuestaExamen ?? data.id ?? null;
        this.id                = data.idRespuestaExamen ?? data.id ?? null;

        // Relaciones anidadas
        this.examenRealizado = data.examenRealizado ?? null;
        this.preguntaOpcion  = data.preguntaOpcion  ?? null;

        // Campos planos derivados (compatibilidad con controladores y tests)
        this.examenId = data.examenId
            ?? data.examenRealizado?.idExamenRealizado
            ?? null;
        this.preguntaId = data.preguntaId
            ?? data.preguntaOpcion?.bancoPregunta?.idBancoPregunta
            ?? null;

        // guardado: campo de confirmación usado en tests, no viene del backend real
        this.guardado = data.guardado ?? true;
    }
}
