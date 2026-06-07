import ExamenRealizadoDao from './examen_realizado_dao.js';
import RespuestaExamenDao from './respuesta_examen_dao.js';
import PreguntasDao       from './preguntas_dao.js';
import AspirantesDao      from './aspirantes_dao.js';
import { store }          from '../infra/app_state.js';
import { navigate }       from '../infra/router.js';
import { notificar }      from '../infra/notificaciones.js';

class ExamenController {
    constructor() {
        this.examenRealizadoDao = new ExamenRealizadoDao();
        this.respuestaExamenDao = new RespuestaExamenDao();
        this.preguntasDao       = new PreguntasDao();
        this.aspirantesDao      = new AspirantesDao();
    }

    async iniciar() {
        const inscripcionId = store.inscripcionActiva?.idInscripcionPrueba;
        const etapaId       = store.etapa?.idEtapaAdmision;

        if (!inscripcionId) {
            const msg = 'Debe completar la inscripción antes de iniciar el examen';
            notificar(msg, 4000, 'warning');
            throw new Error(msg);
        }
        if (!etapaId) {
            const msg = 'No se ha determinado la etapa de admisión activa';
            notificar(msg, 4000, 'warning');
            throw new Error(msg);
        }

        store.loading = true;
        try {
            const examen = await this.examenRealizadoDao.iniciarExamen(inscripcionId, etapaId);
            store.examenActivo = examen;
            return examen;
        } catch (error) {
            console.error('Error al iniciar examen:', error);
            notificar(
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
            notificar(msg, 4000, 'warning');
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
            notificar(
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
            notificar(msg, 4000, 'warning');
            throw new Error(msg);
        }
        if (!opcionesIds || opcionesIds.length === 0) {
            const msg = 'Debe responder al menos una pregunta';
            notificar(msg, 3000, 'warning');
            throw new Error(msg);
        }

        store.loading = true;
        try {
            await this.respuestaExamenDao.enviarLote(examenId, opcionesIds);
            store.examenActivo = { ...store.examenActivo, completado: true };
            notificar(
                'Examen entregado. El puntaje será calculado por el sistema.', 5000, 'success'
            );
            navigate('/resultado');
        } catch (error) {
            console.error('Error al entregar examen:', error);
            notificar(
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
            notificar(
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

    async consultarInscripciones(aspiranteId) {
        if (!aspiranteId) throw new Error('El ID del aspirante es requerido');
        store.loading = true;
        try {
            return await this.aspirantesDao.obtenerInscripciones(aspiranteId);
        } catch (error) {
            console.error('Error al consultar inscripciones del aspirante:', error);
            throw error;
        } finally {
            store.loading = false;
        }
    }

    async consultarEstadoAspirante(aspiranteId) {
        if (!aspiranteId) throw new Error('El ID del aspirante es requerido');
        store.loading = true;
        try {
            const examenes = await this.examenRealizadoDao.obtenerPorAspirante(aspiranteId);
            if (examenes.length) return { tipo: 'examenes', datos: examenes };

            const inscripciones = await this.aspirantesDao.obtenerInscripciones(aspiranteId);
            if (inscripciones.length) return { tipo: 'inscripciones', datos: inscripciones };

            return { tipo: 'nada', datos: [] };
        } catch (error) {
            console.error('Error al consultar estado del aspirante:', error);
            throw error;
        } finally {
            store.loading = false;
        }
    }

}

export default ExamenController;
