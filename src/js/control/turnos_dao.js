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
        try {
            const respuesta = await fetch(this.BASE_URL, { method: 'GET' });
            if (respuesta.status === 200) {
                return (await respuesta.json()).map(d => this._mapear(d));
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener turnos:', error);
            throw error;
        }
    }

    async obtenerTurnoPorId(id) {
        if (!id) throw new Error('El ID del turno es requerido');
        try {
            const respuesta = await fetch(`${this.BASE_URL}/${id}`, { method: 'GET' });
            if (respuesta.status === 200) return this._mapear(await respuesta.json());
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener turno:', error);
            throw error;
        }
    }
}

export default TurnosDao;
