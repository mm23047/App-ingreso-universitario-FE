// BE: AsignacionAulaAspirante  @Table(name="asignacion_aula_aspirante")
// PK: UUID idAsignacionAulaAspirante  (columna id_asignacion)
// Unique constraint: (id_inscripcion, id_turno)
// Relaciones:
//   inscripcionPrueba @ManyToOne InscripcionesPrueba    (NOT NULL, LAZY → JOIN FETCH)
//   disponibilidad    @ManyToOne DisponibilidadAulaTurno (NOT NULL, LAZY → @JoinColumns doble)
// @Transient aulaDetalle  → disponibilidad.aula   (conveniencia en BE, viene en JSON como nested)
// @Transient turnoDetalle → disponibilidad.turnoExamen
// Endpoint: POST /asignaciones_aula/inscripciones/{idInscripcion}
//           GET  /asignaciones_aula/disponibilidad/{idAula}/{idTurno}
//           DELETE /asignaciones_aula/{idAsignacion}
class AsignacionAulaAspirante {
    constructor(idAsignacionAulaAspirante, inscripcionPrueba, disponibilidad) {
        this.idAsignacionAulaAspirante = idAsignacionAulaAspirante;
        this.inscripcionPrueba         = inscripcionPrueba;
        this.disponibilidad            = disponibilidad;
    }
}

export default AsignacionAulaAspirante;
