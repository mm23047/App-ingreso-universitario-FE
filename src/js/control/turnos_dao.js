import DefaultDao from './default_dao.js';
import Turno from '../entity/Turno.js';

// Resource: TurnosExamanResource  @Path("turnos")
// GET /turnos
// GET /turnos/{idTurno}
class TurnosDao extends DefaultDao {
    constructor() {
        super();
        this.BASE_URL += 'turnos';
    }

    _mapear(data) {
        return new Turno(
            data.idTurnoExamen  ?? null,
            data.nombreTurno    ?? '',
            data.fecha          ?? null,
            data.horaInicio     ?? null,
            data.horaFin        ?? null,
            data.pruebaAdmision ?? null
        );
    }

    async obtenerTurnos() {
        return (await this._get(this.BASE_URL)).map(d => this._mapear(d));
    }

    async obtenerTurnoPorId(id) {
        if (!id) throw new Error('El ID del turno es requerido');
        return this._mapear(await this._get(`${this.BASE_URL}/${id}`));
    }
}

export default TurnosDao;
