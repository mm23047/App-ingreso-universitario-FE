// BE: DisponibilidadAulaTurno  @Table(name="disponibilidad_aula_turno")
// PK compuesta (@EmbeddedId): idDisponibilidadAulaTurno { idAula: UUID, idTurno: UUID }
// Relaciones:
//   aula        @ManyToOne Aula         (NOT NULL, LAZY → JOIN FETCH)
//   turnoExamen @ManyToOne TurnosExamen (NOT NULL, LAZY → JOIN FETCH)
// Endpoint: GET  /aulas_turnos/disponibilidad
//           POST /aulas_turnos/aulas/{idAula}/disponibilidad/{idTurno}
//           DELETE /aulas_turnos/aulas/{idAula}/disponibilidad/{idTurno}
class DisponibilidadAulaTurno {
    constructor(idDisponibilidadAulaTurno, aula, turnoExamen) {
        this.idDisponibilidadAulaTurno = idDisponibilidadAulaTurno;
        this.aula                      = aula;
        this.turnoExamen               = turnoExamen;
    }
}

export default DisponibilidadAulaTurno;
