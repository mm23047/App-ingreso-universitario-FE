// Entidad: PreguntaOpcion
// Endpoint: GET /preguntas/{id}/opciones
// Campos reales del backend (getters → JSON):
//   idPreguntaOpcion (UUID)
//   idRespuestaGlobal (nested BancoRespuesta: { idBancoRespuesta, textoRespuesta })
//   bancoPregunta (nested BancoPregunta, lazy, cargado por JOIN FETCH en findByPregunta)
//   esCorrecta (Boolean)
// NOTA: textoRespuesta está en idRespuestaGlobal.textoRespuesta, NO en el primer nivel.
//       Los mocks de test enviaban textoRespuesta directamente (primer nivel) como atajo.
export default class Opcion {
    constructor(data = {}) {
        // PK
        this.idPreguntaOpcion = data.idPreguntaOpcion ?? data.id ?? null;
        this.id               = data.idPreguntaOpcion ?? data.id ?? null;

        // Texto: backend lo tiene en data.idRespuestaGlobal.textoRespuesta
        // tests lo envían directamente en data.textoRespuesta
        this.textoRespuesta = data.textoRespuesta
            ?? data.idRespuestaGlobal?.textoRespuesta
            ?? '';

        // Objeto completo del banco de respuesta (disponible en backend real)
        this.idRespuestaGlobal = data.idRespuestaGlobal ?? null;

        // Referencia a la pregunta (puede ser null si no se hace JOIN FETCH)
        this.bancoPregunta = data.bancoPregunta ?? null;

        this.esCorrecta = data.esCorrecta ?? false;
    }
}
