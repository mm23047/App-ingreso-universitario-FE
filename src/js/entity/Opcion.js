// BE: PreguntaOpcion  @Table(name="pregunta_opcion")
// PK: UUID idPreguntaOpcion  (columna id_pregunta_opcion)
// Relaciones:
//   bancoPregunta     @ManyToOne BancoPregunta  (NOT NULL, LAZY → JOIN FETCH en findByPregunta)
//   idRespuestaGlobal @ManyToOne BancoRespuesta (NOT NULL, LAZY → JOIN FETCH en findByPregunta)
// El texto visible de la opción está en: idRespuestaGlobal.textoRespuesta
class Opcion {
    constructor(idPreguntaOpcion, bancoPregunta, idRespuestaGlobal, esCorrecta) {
        this.idPreguntaOpcion  = idPreguntaOpcion;
        this.bancoPregunta     = bancoPregunta;
        this.idRespuestaGlobal = idRespuestaGlobal;
        this.esCorrecta        = esCorrecta;
    }
}

export default Opcion;
