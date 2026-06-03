// BE: TurnosExamen  @Table(name="turno_examen")
// PK: UUID idTurnoExamen  (columna id_turno)
// Relación: pruebaAdmision @ManyToOne PruebasAdmision (LAZY → viene solo con JOIN FETCH)
class Turno {
    constructor(idTurnoExamen, nombreTurno, fecha, horaInicio, horaFin, pruebaAdmision) {
        this.idTurnoExamen  = idTurnoExamen;
        this.nombreTurno    = nombreTurno;
        this.fecha          = fecha;
        this.horaInicio     = horaInicio;
        this.horaFin        = horaFin;
        this.pruebaAdmision = pruebaAdmision;
    }
}

export default Turno;
