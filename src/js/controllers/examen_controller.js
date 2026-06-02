import ExamenDao from '../dao/examen_dao.js';
import PreguntasDao from '../dao/preguntas_dao.js';
import { store } from '../state/app_state.js';
import { navigate } from '../router.js';

class ExamenController {
    constructor() {
        this.examenDao   = new ExamenDao();
        this.preguntasDao = new PreguntasDao();
    }

    /**
     * Inicia el examen para el aspirante registrado en el store.
     * POST /examen_realizado
     */
    async iniciar(pruebaId) {
        if (!store.aspirante) {
            const msg = 'Debe registrarse antes de iniciar el examen';
            document.querySelector('app-toast')?.show(msg, 4000, 'warning');
            throw new Error(msg);
        }
        if (!pruebaId) {
            const msg = 'No se ha especificado la prueba de admisión';
            document.querySelector('app-toast')?.show(msg, 4000, 'warning');
            throw new Error(msg);
        }

        store.loading = true;
        try {
            const examen = await this.examenDao.iniciarExamen(
                store.aspirante.id,
                pruebaId
            );
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
     * Carga las preguntas de una prueba y las guarda en el store.
     * NOTA: el backend actual no filtra por pruebaId en GET /preguntas.
     * Ajusta la ruta cuando el backend lo soporte.
     */
    async cargarPreguntas(pruebaId) {
        if (!pruebaId) {
            const msg = 'Se necesita el ID de la prueba para cargar preguntas';
            document.querySelector('app-toast')?.show(msg, 4000, 'warning');
            throw new Error(msg);
        }

        store.loading = true;
        try {
            const preguntas = await this.preguntasDao.obtenerPorPrueba(pruebaId);
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
     * Envía las respuestas del examen activo.
     * respuestas: [{ preguntaId, opcionId }, ...]
     */
    async enviarRespuestas(respuestas) {
        if (!store.examenActivo) {
            const msg = 'No hay examen activo';
            document.querySelector('app-toast')?.show(msg, 4000, 'warning');
            throw new Error(msg);
        }
        if (!respuestas || respuestas.length === 0) {
            const msg = 'Debe responder al menos una pregunta';
            document.querySelector('app-toast')?.show(msg, 3000, 'warning');
            throw new Error(msg);
        }

        store.loading = true;
        try {
            const resultado = await this.examenDao.enviarRespuestas(
                store.examenActivo.id,
                respuestas
            );
            const puntaje = this._calcularPuntaje(respuestas);
            store.examenActivo = {
                ...store.examenActivo,
                puntaje,
                completado: true,
                respuestasEnviadas: respuestas
            };
            document.querySelector('app-toast')?.show(
                `Examen enviado. Puntaje estimado: ${puntaje}%`, 5000, 'success'
            );
            navigate('/resultados');
            return resultado;
        } catch (error) {
            console.error('Error al enviar respuestas:', error);
            document.querySelector('app-toast')?.show(
                `Error al enviar respuestas: ${error.message}`, 5000, 'error'
            );
            throw error;
        } finally {
            store.loading = false;
        }
    }

    /**
     * Cálculo de puntaje en el cliente (provisional).
     * El puntaje real es calculado por el backend con las claves de examen.
     */
    _calcularPuntaje(respuestas) {
        const total = store.preguntas.length;
        if (total === 0) return 0;
        return Math.round((respuestas.length / total) * 100);
    }
}

export default ExamenController;
