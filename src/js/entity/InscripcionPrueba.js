// BE: InscripcionesPrueba  @Table(name="inscripcion_prueba")
// PK: UUID idInscripcionPrueba  (columna id_inscripcion)
// Relaciones:
//   aspiranteDato  @ManyToOne AspirantesDato (NOT NULL, LAZY → viene con JOIN FETCH)
//   pruebaAdmision @ManyToOne PruebasAdmision (NOT NULL, LAZY → viene con JOIN FETCH)
// NOTA: NO existe campo turnoId — el turno se asigna via AsignacionAulaAspirante (proceso admin)
class InscripcionPrueba {
    constructor(idInscripcionPrueba, aspiranteDato, pruebaAdmision, estado) {
        this.idInscripcionPrueba = idInscripcionPrueba;
        this.aspiranteDato       = aspiranteDato;
        this.pruebaAdmision      = pruebaAdmision;
        this.estado              = estado;
    }
}

export default InscripcionPrueba;
