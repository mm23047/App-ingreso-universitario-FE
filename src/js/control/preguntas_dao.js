import DefaultDao from './default_dao.js';
import Pregunta from '../entity/Pregunta.js';
import Opcion from '../entity/Opcion.js';
import BancoRespuesta from '../entity/BancoRespuesta.js';

// Resource: BancoPreguntaResource  @Path("preguntas")
// GET /preguntas?first=0&max=50
// GET /preguntas/{id}/opciones   → PreguntaOpcion[]  (con idRespuestaGlobal JOIN FETCH)
class PreguntasDao extends DefaultDao {
    constructor() {
        super();
        this.BASE_URL += 'preguntas';
    }

    _mapear(data) {
        return new Pregunta(
            data.idBancoPregunta ?? null,
            data.enunciado       ?? '',
            data.tema            ?? null
        );
    }

    _mapearOpcion(data) {
        return new Opcion(
            data.idPreguntaOpcion ?? null,
            data.bancoPregunta    ?? null,
            data.idRespuestaGlobal
                ? new BancoRespuesta(
                    data.idRespuestaGlobal.idBancoRespuesta ?? null,
                    data.idRespuestaGlobal.textoRespuesta   ?? '',
                    data.idRespuestaGlobal.areaConocimiento ?? null
                )
                : null,
            data.esCorrecta ?? false
        );
    }

    async obtenerTodas(first = 0, max = 50) {
        try {
            const respuesta = await fetch(`${this.BASE_URL}?first=${first}&max=${max}`, { method: 'GET' });
            if (respuesta.status === 200) {
                return (await respuesta.json()).map(d => this._mapear(d));
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener preguntas:', error);
            throw error;
        }
    }

    async obtenerOpcionesDePregunta(idPregunta) {
        if (!idPregunta) throw new Error('El ID de la pregunta es requerido');
        try {
            const respuesta = await fetch(`${this.BASE_URL}/${idPregunta}/opciones`, { method: 'GET' });
            if (respuesta.status === 200) {
                return (await respuesta.json()).map(d => this._mapearOpcion(d));
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener opciones de la pregunta:', error);
            throw error;
        }
    }
}

export default PreguntasDao;
