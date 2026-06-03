import ExamenRealizadoDao from './examen_realizado_dao.js';
import RespuestaExamenDao from './respuesta_examen_dao.js';
import PreguntasDao from './preguntas_dao.js';
import { store } from '../infra/app_state.js';
import { navigate } from '../infra/router.js';

class ExamenController {
    constructor() {
        this.examenRealizadoDao = new ExamenRealizadoDao();
        this.respuestaExamenDao = new RespuestaExamenDao();
        this.preguntasDao       = new PreguntasDao();
    }

    async iniciar() {
        const inscripcionId = store.inscripcionActiva?.idInscripcionPrueba;
        const etapaId       = store.etapa?.idEtapaAdmision;

        if (!inscripcionId) {
            const msg = 'Debe completar la inscripción antes de iniciar el examen';
            document.querySelector('app-toast')?.show(msg, 4000, 'warning');
            throw new Error(msg);
        }
        if (!etapaId) {
            const msg = 'No se ha determinado la etapa de admisión activa';
            document.querySelector('app-toast')?.show(msg, 4000, 'warning');
            throw new Error(msg);
        }

        store.loading = true;
        try {
            const examen = await this.examenRealizadoDao.iniciarExamen(inscripcionId, etapaId);
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

    async cargarPreguntas() {
        const examenId = store.examenActivo?.idExamenRealizado;
        if (!examenId) {
            const msg = 'No hay examen activo para cargar preguntas';
            document.querySelector('app-toast')?.show(msg, 4000, 'warning');
            throw new Error(msg);
        }

        store.loading = true;
        try {
            const preguntas = await this.examenRealizadoDao.obtenerPreguntas(examenId);

            await Promise.all(
                preguntas.map(async (pxc) => {
                    const idPregunta = pxc.bancoPregunta?.idBancoPregunta;
                    if (idPregunta) {
                        try {
                            pxc.opciones = await this.preguntasDao.obtenerOpcionesDePregunta(idPregunta);
                        } catch {
                            pxc.opciones = [];
                        }
                    } else {
                        pxc.opciones = [];
                    }
                })
            );

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

    async guardarRespuesta(opcionId) {
        const examenId = store.examenActivo?.idExamenRealizado;
        if (!examenId) throw new Error('No hay examen activo');
        try {
            return await this.respuestaExamenDao.enviarRespuesta(examenId, opcionId);
        } catch (error) {
            console.error('Error al guardar respuesta:', error);
            throw error;
        }
    }

    async entregar(opcionesIds) {
        const examenId = store.examenActivo?.idExamenRealizado;

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
            await this.respuestaExamenDao.enviarLote(examenId, opcionesIds);
            store.examenActivo = { ...store.examenActivo, completado: true };
            document.querySelector('app-toast')?.show(
                'Examen entregado. El puntaje será calculado por el sistema.', 5000, 'success'
            );
            navigate('/resultado');
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

    async consultarResultados(aspiranteId) {
        if (!aspiranteId) throw new Error('El ID del aspirante es requerido');
        store.loading = true;
        try {
            return await this.examenRealizadoDao.obtenerPorAspirante(aspiranteId);
        } catch (error) {
            console.error('Error al consultar resultados del aspirante:', error);
            document.querySelector('app-toast')?.show(
                `Error al consultar resultados: ${error.message}`, 4000, 'error'
            );
            throw error;
        } finally {
            store.loading = false;
        }
    }

    async recuperarRespuestas() {
        const examenId = store.examenActivo?.idExamenRealizado;
        if (!examenId) return [];
        try {
            return await this.respuestaExamenDao.obtenerPorExamen(examenId);
        } catch (error) {
            console.error('Error al recuperar respuestas:', error);
            return [];
        }
    }
}

export default ExamenController;
