import DefaultDao from './default_dao.js';
import Carrera from '../entity/Carrera.js';

// Endpoint: GET /carreras, GET /carreras/{idCarrera}
// Campos: idCarrera (String max 10), nombreCatalogoCarrera (String max 100)
class CarrerasDao extends DefaultDao {
    constructor() {
        super();
        this.BASE_URL += 'carreras';
    }

    async obtenerTodas() {
        try {
            const respuesta = await fetch(this.BASE_URL, { method: 'GET' });
            if (respuesta.status === 200) {
                const data = await respuesta.json();
                return data.map(item => new Carrera(item));
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener carreras:', error);
            throw error;
        }
    }

    async obtenerPorId(id) {
        if (!id) {
            throw new Error('El ID de la carrera es requerido');
        }
        try {
            const respuesta = await fetch(`${this.BASE_URL}/${id}`, { method: 'GET' });
            if (respuesta.status === 200) {
                const data = await respuesta.json();
                return new Carrera(data);
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener carrera:', error);
            throw error;
        }
    }
}

export default CarrerasDao;
