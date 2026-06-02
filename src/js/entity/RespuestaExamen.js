// Entidad: RespuestaExamen
// Endpoint: /respuestas  (NO /respuestas_examen — verificar DAO)
// POST /respuestas envía { examenRealizado: { idExamenRealizado }, preguntaOpcion: { idPreguntaOpcion } }
// POST /respuestas/lote envía { idExamen: UUID, opcionesSeleccionadas: UUID[] }
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
