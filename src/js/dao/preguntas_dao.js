import DefaultDao from '../control/default_dao.js';
import Pregunta from '../entity/Pregunta.js';
import Opcion from '../entity/Opcion.js';

class PreguntasDao extends DefaultDao {
    constructor() {
        super();
        this.BASE_URL += 'preguntas';
    }

    async obtenerPorPrueba(pruebaId) {
        if (!pruebaId) {
            throw new Error('El ID de la prueba es requerido');
        }
        try {
            const respuesta = await fetch(`${this.BASE_URL}?pruebaId=${pruebaId}`, { method: 'GET' });
            if (respuesta.status === 200) {
                const data = await respuesta.json();
                return data.map(item => new Pregunta(item));
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener preguntas de la prueba:', error);
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
