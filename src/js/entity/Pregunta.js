// BE: BancoPregunta  @Table(name="banco_pregunta")
// PK: UUID idBancoPregunta  (columna id_pregunta)
// Relaciones:
//   tema @ManyToOne Tema (NOT NULL, LAZY → viene con JOIN FETCH en findByTema)
// NOTA: las opciones (PreguntaOpcion) NO forman parte de esta entidad.
//       Se obtienen con GET /preguntas/{id}/opciones → devuelve Opcion[]
class Pregunta {
    constructor(idBancoPregunta, enunciado, tema) {
        this.idBancoPregunta = idBancoPregunta;
        this.enunciado       = enunciado;
        this.tema            = tema;
    }
}

export default Pregunta;
