import DefaultDao from './default_dao.js';
import ExamenRealizado from '../entity/ExamenRealizado.js';
import RespuestaExamen from '../entity/RespuestaExamen.js';

// Endpoints verificados contra el backend:
//   POST /examen_realizado      → { idInscripcion: UUID, idEtapa: UUID }  → 201 ExamenRealizado
//   GET  /examen_realizado/{id}
//   GET  /examen_realizado/{id}/preguntas → lista de PreguntasPorClave del examen
//   POST /examen_realizado/{id}/calificar → califica el examen (solo backend)
//
//   POST /respuestas_examen        → { examenRealizado: {idExamenRealizado}, preguntaOpcion: {idPreguntaOpcion} }
//   POST /respuestas_examen/lote   → { idExamen: UUID, opcionesSeleccionadas: [UUID] }
//   GET  /respuestas_examen/examen/{idExamen}
class ExamenDao extends DefaultDao {
    constructor() {
        super();
        this.examenUrl    = this.BASE_URL + 'examen_realizado';
        this.respuestasUrl = this.BASE_URL + 'respuestas_examen';
        this.BASE_URL     = this.examenUrl;
    }

    /**
     * Inicia el examen para una inscripción en una etapa dada.
     * El backend asigna automáticamente la clave de examen.
     * @param {string} inscripcionId UUID de la InscripcionPrueba activa
     * @param {string} etapaId       UUID de la EtapaAdmision activa
     */
    async iniciarExamen(inscripcionId, etapaId) {
        if (!inscripcionId || !etapaId) {
            throw new Error('El ID de la inscripción y el ID de la etapa son requeridos');
        }
        try {
            const respuesta = await fetch(this.examenUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idInscripcion: inscripcionId, idEtapa: etapaId })
            });
            if (respuesta.status === 201) {
                const data = await respuesta.json();
                return new ExamenRealizado(data);
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al iniciar examen:', error);
            throw error;
        }
    }

    async obtenerPorId(id) {
        if (!id) {
            throw new Error('El ID del examen es requerido');
        }
        try {
            const respuesta = await fetch(`${this.examenUrl}/${id}`, { method: 'GET' });
            if (respuesta.status === 200) {
                const data = await respuesta.json();
                return new ExamenRealizado(data);
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener examen:', error);
            throw error;
        }
    }

    /**
     * Obtiene las preguntas asignadas al examen (según su clave).
     * @param {string} examenId UUID del ExamenRealizado
     */
    async obtenerPreguntasDelExamen(examenId) {
        if (!examenId) {
            throw new Error('El ID del examen es requerido');
        }
        try {
            const respuesta = await fetch(`${this.examenUrl}/${examenId}/preguntas`, { method: 'GET' });
            if (respuesta.status === 200) {
                return await respuesta.json();
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener preguntas del examen:', error);
            throw error;
        }
    }

    /**
     * Envía una sola respuesta (autoguardado por pregunta).
     * @param {string} examenId  UUID del ExamenRealizado
     * @param {string} opcionId  UUID de la PreguntaOpcion seleccionada
     */
    async enviarRespuesta(examenId, opcionId) {
        if (!examenId || !opcionId) {
            throw new Error('El ID del examen y el ID de la opción son requeridos');
        }
        try {
            const respuesta = await fetch(this.respuestasUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    examenRealizado: { idExamenRealizado: examenId },
                    preguntaOpcion:  { idPreguntaOpcion:  opcionId  }
                })
            });
            if (respuesta.status === 201 || respuesta.status === 200) {
                const data = await respuesta.json();
                return new RespuestaExamen(data);
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al enviar respuesta:', error);
            throw error;
        }
    }

    /**
     * Envía todas las respuestas en un lote (botón "Entregar examen").
     * @param {string}   examenId        UUID del ExamenRealizado
     * @param {string[]} opcionesIds     Lista de UUIDs de PreguntaOpcion seleccionadas
     */
    async enviarRespuestasLote(examenId, opcionesIds) {
        if (!examenId || !opcionesIds || opcionesIds.length === 0) {
            throw new Error('El ID del examen y al menos una opción son requeridos');
        }
        try {
            const respuesta = await fetch(`${this.respuestasUrl}/lote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idExamen: examenId,
                    opcionesSeleccionadas: opcionesIds
                })
            });
            if (respuesta.status === 201) {
                return true;
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al enviar lote de respuestas:', error);
            throw error;
        }
    }

    /**
     * Recupera las respuestas guardadas de un examen (útil si el usuario recarga).
     * @param {string} examenId UUID del ExamenRealizado
     */
    async obtenerRespuestasGuardadas(examenId) {
        if (!examenId) {
            throw new Error('El ID del examen es requerido');
        }
        try {
            const respuesta = await fetch(`${this.respuestasUrl}/examen/${examenId}`, { method: 'GET' });
            if (respuesta.status === 200) {
                const data = await respuesta.json();
                return data.map(item => new RespuestaExamen(item));
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener respuestas guardadas:', error);
            throw error;
        }
    }
}

export default ExamenDao;
