// Entidad: TurnosExamen
// Endpoint: GET /turnos
// Campos reales del backend (getters → JSON):
//   idTurnoExamen (UUID), nombreTurno, fecha, horaInicio, horaFin, pruebaAdmision (nested)
export default class Turno {
    constructor(data = {}) {
        // PK: backend usa idTurnoExamen, tests usan id
        this.idTurnoExamen = data.idTurnoExamen ?? data.id ?? null;
        this.id            = data.idTurnoExamen ?? data.id ?? null;

        // Nombre: backend usa nombreTurno, tests usan nombre
        this.nombreTurno = data.nombreTurno ?? data.nombre ?? '';
        this.nombre      = data.nombreTurno ?? data.nombre ?? '';

        // Fecha y horario (solo en el backend real)
        this.fecha     = data.fecha     ?? null;
        this.horaInicio = data.horaInicio ?? data.horario ?? '';
        this.horaFin   = data.horaFin   ?? '';

        // Relación anidada (viene cargada por JOIN FETCH cuando se usa findByIdConRelacion)
        this.pruebaAdmision = data.pruebaAdmision ?? null;
    }
}
