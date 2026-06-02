import DefaultDao from './default_dao.js';
import Turno from '../entity/Turno.js';

// Endpoint: GET /turnos, GET /turnos/{idTurno}
// Campos: idTurnoExamen (UUID), nombreTurno, fecha, horaInicio, horaFin,
//         pruebaAdmision (nested, cargado por JOIN FETCH)
class TurnosDao extends DefaultDao {
    constructor() {
        super();
        this.BASE_URL += 'turnos';
    }

    async obtenerTurnos() {
        try {
            const respuesta = await fetch(this.BASE_URL, { method: 'GET' });
            if (respuesta.status === 200) {
                const data = await respuesta.json();
                return data.map(item => new Turno(item));
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener turnos:', error);
            throw error;
        }
    }

    async obtenerTurnoPorId(id) {
        if (!id) {
            throw new Error('El ID del turno es requerido');
        }
        try {
            const respuesta = await fetch(`${this.BASE_URL}/${id}`, { method: 'GET' });
            if (respuesta.status === 200) {
                const data = await respuesta.json();
                return new Turno(data);
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener turno:', error);
            throw error;
        }
    }
}

export default TurnosDao;
