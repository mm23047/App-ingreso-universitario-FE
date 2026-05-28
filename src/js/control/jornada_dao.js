import DefaultDao from './default_dao.js';

class JornadaDao extends DefaultDao {
    constructor() {
        super();
        this.BASE_URL += 'jornada';
    }

    async obtenerJornadas() {
        try {
            const respuesta = await fetch(this.BASE_URL, { method: 'GET' });
            if (respuesta.status === 200) {
                return await respuesta.json();
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener jornadas:', error);
            throw error;
        }
    }

    async obtenerJornadaPorId(id) {
        if (!id) {
            throw new Error('El ID de la jornada es requerido');
        }
        try {
            const respuesta = await fetch(`${this.BASE_URL}/${id}`, { method: 'GET' });
            if (respuesta.status === 200) {
                return await respuesta.json();
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener jornada:', error);
            throw error;
        }
    }
}

export default JornadaDao;
