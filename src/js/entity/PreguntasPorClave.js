// BE: PreguntasPorClave  @Table(name="preguntas_por_clave")
// PK compuesta (@EmbeddedId): idPreguntaPorClave { idClave: UUID, idPregunta: UUID }
// Relaciones:
//   claveExamen  @ManyToOne ClavesExamen  (NOT NULL, LAZY)
//   bancoPregunta @ManyToOne BancoPregunta (NOT NULL, LAZY → viene con JOIN FETCH en findPreguntasByClave)
// Devuelta por: GET /examen_realizado/{id}/preguntas  y  GET /claves/{id}/preguntas
// NOTA para vistas: el texto de la pregunta está en bancoPregunta.enunciado
//                   las opciones se cargan con GET /preguntas/{bancoPregunta.idBancoPregunta}/opciones
class PreguntasPorClave {
    constructor(idPreguntaPorClave, claveExamen, bancoPregunta) {
        this.idPreguntaPorClave = idPreguntaPorClave;
        this.claveExamen        = claveExamen;
        this.bancoPregunta      = bancoPregunta;
    }
}

export default PreguntasPorClave;
