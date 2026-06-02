import DefaultDao from './default_dao.js';
import Pregunta from '../entity/Pregunta.js';
import Opcion from '../entity/Opcion.js';

// Endpoint: GET /preguntas  (listado general, sin filtro por prueba en el backend actual)
//           GET /preguntas/{id}/opciones
// Para obtener las preguntas de un examen específico usar:
//   ExamenDao.obtenerPreguntasDelExamen(examenId)
//   → GET /examen_realizado/{id}/preguntas (devuelve PreguntasPorClave de la clave asignada)
class PreguntasDao extends DefaultDao {
    constructor() {
        super();
        this.BASE_URL += 'preguntas';
    }

    async obtenerTodas(first = 0, max = 50) {
        try {
            const respuesta = await fetch(`${this.BASE_URL}?first=${first}&max=${max}`, { method: 'GET' });
            if (respuesta.status === 200) {
                const data = await respuesta.json();
                return data.map(item => new Pregunta(item));
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener preguntas:', error);
            throw error;
        }
    }

    async obtenerOpcionesDePregunta(idPregunta) {
        if (!idPregunta) {
            throw new Error('El ID de la pregunta es requerido');
        }
        try {
            const respuesta = await fetch(`${this.BASE_URL}/${idPregunta}/opciones`, { method: 'GET' });
            if (respuesta.status === 200) {
                const data = await respuesta.json();
                return data.map(item => new Opcion(item));
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener opciones de la pregunta:', error);
            throw error;
        }
    }
}

export default PreguntasDao;
