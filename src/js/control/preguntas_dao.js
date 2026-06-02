import DefaultDao from './default_dao.js';

// Endpoint: GET /preguntas, GET /preguntas/{id}/opciones
// Entidad backend: BancoPregunta + PreguntaOpcion
// Campos pregunta: idBancoPregunta (UUID), textoPregunta (String)
// Campos opción:   idPreguntaOpcion (UUID), textoRespuesta (via BancoRespuesta)
//
// NOTA: El backend soporta GET /preguntas con paginación (?first=0&max=50).
// El parámetro ?pruebaId= NO está implementado en el backend actual.
// Para obtener preguntas de una prueba real debes navegar:
//   /claves_examen → /preguntas_por_clave → /preguntas/{id}
// obtenerPorPrueba se implementa como GET /preguntas?pruebaId=... para uso futuro;
// ajusta la URL si el backend implementa ese filtro.
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
                return await respuesta.json();
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
                return await respuesta.json();
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener opciones de la pregunta:', error);
            throw error;
        }
    }
}

export default PreguntasDao;
