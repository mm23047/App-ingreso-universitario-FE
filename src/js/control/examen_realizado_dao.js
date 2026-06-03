import DefaultDao from './default_dao.js';
import ExamenRealizado from '../entity/ExamenRealizado.js';
import PreguntasPorClave from '../entity/PreguntasPorClave.js';
import Pregunta from '../entity/Pregunta.js';

// Resource: ExamenRealizadoResource  @Path("examen_realizado")
// POST /examen_realizado                body: { idInscripcion: UUID, idEtapa: UUID }  → 201
// GET  /examen_realizado/{id}
// GET  /examen_realizado/{id}/preguntas → PreguntasPorClave[] (con bancoPregunta JOIN FETCH)
// POST /examen_realizado/{id}/calificar (proceso admin, no lo llama el aspirante)
class ExamenRealizadoDao extends DefaultDao {
    constructor() {
        super();
        this.BASE_URL += 'examen_realizado';
    }

    _mapear(data) {
        return new ExamenRealizado(
            data.idExamenRealizado   ?? null,
            data.inscripcionesPrueba ?? null,
            data.claveExamen         ?? null,
            data.etapaAdmision       ?? null,
            data.puntajeFinal        ?? null,
            data.fechaRealizacion    ?? null
        );
    }

    _mapearPreguntaPorClave(data) {
        return new PreguntasPorClave(
            data.idPreguntaPorClave ?? null,
            data.claveExamen        ?? null,
            data.bancoPregunta
                ? new Pregunta(
                    data.bancoPregunta.idBancoPregunta ?? null,
                    data.bancoPregunta.enunciado       ?? '',
                    data.bancoPregunta.tema            ?? null
                )
                : null
        );
    }

    async iniciarExamen(inscripcionId, etapaId) {
        if (!inscripcionId || !etapaId) {
            throw new Error('El ID de la inscripción y el ID de la etapa son requeridos');
        }
        try {
            const respuesta = await fetch(this.BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idInscripcion: inscripcionId, idEtapa: etapaId })
            });
            if (respuesta.status === 201) return this._mapear(await respuesta.json());
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al iniciar examen:', error);
            throw error;
        }
    }

    async obtenerPorId(id) {
        if (!id) throw new Error('El ID del examen es requerido');
        try {
            const respuesta = await fetch(`${this.BASE_URL}/${id}`, { method: 'GET' });
            if (respuesta.status === 200) return this._mapear(await respuesta.json());
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener examen:', error);
            throw error;
        }
    }

    async obtenerPreguntas(examenId) {
        if (!examenId) throw new Error('El ID del examen es requerido');
        try {
            const respuesta = await fetch(`${this.BASE_URL}/${examenId}/preguntas`, { method: 'GET' });
            if (respuesta.status === 200) {
                return (await respuesta.json()).map(d => this._mapearPreguntaPorClave(d));
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener preguntas del examen:', error);
            throw error;
        }
    }
}

export default ExamenRealizadoDao;
