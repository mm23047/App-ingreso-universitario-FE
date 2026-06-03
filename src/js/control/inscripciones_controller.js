import AspirantesDao from './aspirantes_dao.js';
import CarrerasElegidaDao from './carreras_elegida_dao.js';
import { store } from '../infra/app_state.js';

class InscripcionesController {
    constructor() {
        this.aspirantesDao      = new AspirantesDao();
        this.carrerasElegidaDao = new CarrerasElegidaDao();
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
            document.querySelector('app-toast')?.show(msg, 4000, 'warning');
            throw new Error(msg);
        }
        if (!pruebaAdmisionId) {
            const msg = 'No hay prueba de admisión activa disponible';
            document.querySelector('app-toast')?.show(msg, 4000, 'warning');
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

            document.querySelector('app-toast')?.show('Inscripción realizada con éxito', 3000, 'success');
            return inscripcion;

        } catch (error) {
            console.error('Error al inscribir:', error);
            const msg = error.message.includes('409')
                ? 'Ya se encuentra inscrito en esta prueba'
                : `Error al inscribir: ${error.message}`;
            document.querySelector('app-toast')?.show(msg, 5000, 'error');
            throw error;
        } finally {
            store.loading = false;
        }
    }
}

export default InscripcionesController;
