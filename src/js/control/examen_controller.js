import ExamenDao from './examen_dao.js';
import { store } from '../infra/app_state.js';
import { navigate } from '../infra/router.js';

class ExamenController {
    constructor() {
        this.examenDao = new ExamenDao();
    }

    /**
     * Inicia el examen para la inscripción activa en la etapa dada.
     * El backend asigna automáticamente la clave de examen.
     * @param {string} etapaId UUID de la EtapaAdmision activa
     */
    async iniciar(etapaId) {
        const inscripcionId = store.inscripcionActiva?.id;

        if (!inscripcionId) {
            const msg = 'Debe completar la inscripción antes de iniciar el examen';
            document.querySelector('app-toast')?.show(msg, 4000, 'warning');
            throw new Error(msg);
        }
        if (!etapaId) {
            const msg = 'No se ha especificado la etapa de admisión';
            document.querySelector('app-toast')?.show(msg, 4000, 'warning');
            throw new Error(msg);
        }

        store.loading = true;
        try {
            const examen = await this.examenDao.iniciarExamen(inscripcionId, etapaId);
            store.examenActivo = examen;
            return examen;
        } catch (error) {
            console.error('Error al iniciar examen:', error);
            document.querySelector('app-toast')?.show(
                `Error al iniciar el examen: ${error.message}`, 5000, 'error'
            );
            throw error;
        } finally {
            store.loading = false;
        }
    }

    /**
     * Carga las preguntas del examen activo usando la clave asignada por el backend.
     * Requiere que store.examenActivo esté definido.
     */
    async cargarPreguntas() {
        const examenId = store.examenActivo?.id;
        if (!examenId) {
            const msg = 'No hay examen activo para cargar preguntas';
            document.querySelector('app-toast')?.show(msg, 4000, 'warning');
            throw new Error(msg);
        }

        store.loading = true;
        try {
            const preguntas = await this.examenDao.obtenerPreguntasDelExamen(examenId);
            store.preguntas = preguntas;
            return preguntas;
        } catch (error) {
            console.error('Error al cargar preguntas:', error);
            document.querySelector('app-toast')?.show(
                `Error al cargar preguntas: ${error.message}`, 5000, 'error'
            );
            throw error;
        } finally {
            store.loading = false;
        }
    }

    /**
     * Guarda una respuesta individual (autoguardado por pregunta).
     * @param {string} opcionId UUID de la PreguntaOpcion seleccionada
     */
    async guardarRespuesta(opcionId) {
        const examenId = store.examenActivo?.id;
        if (!examenId) {
            throw new Error('No hay examen activo');
        }
        try {
            return await this.examenDao.enviarRespuesta(examenId, opcionId);
        } catch (error) {
            console.error('Error al guardar respuesta:', error);
            throw error;
        }
    }

    /**
     * Envía todas las respuestas seleccionadas y navega a resultados.
     * @param {string[]} opcionesIds Lista de UUIDs de PreguntaOpcion seleccionadas
     */
    async entregar(opcionesIds) {
        const examenId = store.examenActivo?.id;

        if (!examenId) {
            const msg = 'No hay examen activo';
            document.querySelector('app-toast')?.show(msg, 4000, 'warning');
            throw new Error(msg);
        }
        if (!opcionesIds || opcionesIds.length === 0) {
            const msg = 'Debe responder al menos una pregunta';
            document.querySelector('app-toast')?.show(msg, 3000, 'warning');
            throw new Error(msg);
        }

        store.loading = true;
        try {
            await this.examenDao.enviarRespuestasLote(examenId, opcionesIds);
            store.examenActivo = { ...store.examenActivo, completado: true };
            document.querySelector('app-toast')?.show(
                'Examen entregado. El puntaje será calculado por el sistema.', 5000, 'success'
            );
            navigate('/resultados');
        } catch (error) {
            console.error('Error al entregar examen:', error);
            document.querySelector('app-toast')?.show(
                `Error al entregar el examen: ${error.message}`, 5000, 'error'
            );
            throw error;
        } finally {
            store.loading = false;
        }
    }

    /**
     * Recupera respuestas guardadas (útil si el aspirante recarga la página).
     */
    async recuperarRespuestas() {
        const examenId = store.examenActivo?.id;
        if (!examenId) return [];
        try {
            return await this.examenDao.obtenerRespuestasGuardadas(examenId);
        } catch (error) {
            console.error('Error al recuperar respuestas:', error);
            return [];
        }
    }
}

export default ExamenController;
