// BE: RespuestaExamen  @Table(name="respuesta_examen")
// PK: UUID idRespuestaExamen  (columna id_respuesta_aspirante)
// Relaciones:
//   examenRealizado @ManyToOne ExamenRealizado (NOT NULL, LAZY → JOIN FETCH)
//   preguntaOpcion  @ManyToOne PreguntaOpcion  (NOT NULL, LAZY → JOIN FETCH)
class RespuestaExamen {
    constructor(idRespuestaExamen, examenRealizado, preguntaOpcion) {
        this.idRespuestaExamen = idRespuestaExamen;
        this.examenRealizado   = examenRealizado;
        this.preguntaOpcion    = preguntaOpcion;
    }
}

export default RespuestaExamen;
