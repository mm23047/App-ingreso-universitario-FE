import AspirantesDao      from './aspirantes_dao.js';
import CarrerasElegidaDao from './carreras_elegida_dao.js';
import PruebasAdmisionDao from './pruebas_admision_dao.js';
import { store }          from '../infra/app_state.js';
import { notificar }      from '../infra/notificaciones.js';

class InscripcionesController {
    constructor() {
        this.aspirantesDao      = new AspirantesDao();
        this.carrerasElegidaDao = new CarrerasElegidaDao();
        this.pruebasDao         = new PruebasAdmisionDao();
    }

    /**
     * Inscribe al aspirante activo en la prueba activa.
     * Si hay carreraSeleccionada en el store, la registra como primera opción.
     *
     * Lee del store: store.aspirante.id, store.prueba.idPruebaAdmision, store.carreraSeleccionada
     * Escribe en el store: store.inscripcionActiva, store.carrerasElegidas
     */
    async inscribir() {
        const aspiranteId      = store.aspirante?.id;
        const pruebaAdmisionId = store.prueba?.idPruebaAdmision;

        if (!aspiranteId) {
            const msg = 'Debe registrarse antes de inscribirse';
            notificar(msg, 4000, 'warning');
            throw new Error(msg);
        }
        if (!pruebaAdmisionId) {
            const msg = 'No hay prueba de admisión activa disponible';
            notificar(msg, 4000, 'warning');
            throw new Error(msg);
        }

        store.loading = true;
        try {
            const inscripcion = await this.aspirantesDao.crearInscripcion(aspiranteId, pruebaAdmisionId);
            store.inscripcionActiva = inscripcion;

            const carrera = store.carreraSeleccionada;
            if (carrera?.idCarrera && inscripcion.idInscripcionPrueba) {
                const elegida = await this.carrerasElegidaDao.agregarCarrera(
                    inscripcion.idInscripcionPrueba,
                    carrera.idCarrera,
                    1
                );
                store.carrerasElegidas = [elegida];
            }

            notificar('Inscripción realizada con éxito', 3000, 'success');
            return inscripcion;

        } catch (error) {
            console.error('Error al inscribir:', error);
            const msg = error.message.includes('409')
                ? 'Ya se encuentra inscrito en esta prueba'
                : `Error al inscribir: ${error.message}`;
            notificar(msg, 5000, 'error');
            throw error;
        } finally {
            store.loading = false;
        }
    }

    /**
     * Inscribe al aspirante en la prueba activa y registra hasta 3 carreras de interés.
     *
     * @param {string} aspiranteId  UUID del aspirante ya creado en el backend
     * @param {Array<{idCarrera:string, prioridad:number}>} carrerasConPrioridad
     *        Array ordenado de carreras a registrar. Prioridad 1 = primera opción.
     * @returns {{ inscripcion, carreras } | null}  null si no hay prueba activa
     */
    async inscribirConCarreras(aspiranteId, carrerasConPrioridad) {
        if (!aspiranteId) throw new Error('El ID del aspirante es requerido');
        if (!carrerasConPrioridad || carrerasConPrioridad.length === 0) {
            throw new Error('Debes seleccionar al menos una carrera de primera preferencia');
        }

        store.loading = true;
        try {
            // 1. Obtener la prueba activa
            const pruebas = await this.pruebasDao.obtenerActivas();
            const prueba  = pruebas?.[0] ?? null;

            if (!prueba) {
                notificar(
                    'No hay proceso de admisión activo. Tu perfil fue creado, pero no se pudo generar inscripción.',
                    6000, 'warning'
                );
                return null;
            }

            // 2. Crear inscripción en esa prueba
            const inscripcion = await this.aspirantesDao.crearInscripcion(
                aspiranteId,
                prueba.idPruebaAdmision
            );
            store.inscripcionActiva = inscripcion;
            store.prueba = prueba;

            // 3. Registrar cada carrera con su prioridad
            const carrerasGuardadas = [];
            for (const { idCarrera, prioridad } of carrerasConPrioridad) {
                try {
                    const elegida = await this.carrerasElegidaDao.agregarCarrera(
                        inscripcion.idInscripcionPrueba, idCarrera, prioridad
                    );
                    carrerasGuardadas.push(elegida);
                } catch (errCarrera) {
                    // 409 = carrera o prioridad duplicada; continúa con las demás
                    console.warn(`No se pudo registrar carrera ${idCarrera} (prioridad ${prioridad}):`, errCarrera.message);
                }
            }
            store.carrerasElegidas = carrerasGuardadas;

            return { inscripcion, carreras: carrerasGuardadas };

        } catch (error) {
            console.error('Error en inscribirConCarreras:', error);
            const msg = error.message.includes('409')
                ? 'Ya tienes una inscripción activa para este proceso'
                : `Error al completar el registro: ${error.message}`;
            notificar(msg, 5000, 'error');
            throw error;
        } finally {
            store.loading = false;
        }
    }
}

export default InscripcionesController;
