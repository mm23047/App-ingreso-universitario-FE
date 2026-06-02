import InscripcionesDao from './inscripciones_dao.js';
import { store } from '../infra/app_state.js';

class InscripcionesController {
    constructor() {
        this.inscripcionesDao = new InscripcionesDao();
    }

    /**
     * Inscribe al aspirante activo (store.aspirante) en la prueba indicada.
     * El turno y el aula son asignados por el sistema en una etapa posterior.
     * @param {string} pruebaAdmisionId UUID de la PruebasAdmision activa
     */
    async inscribir(pruebaAdmisionId) {
        const aspiranteId = store.aspirante?.id;

        if (!aspiranteId) {
            const msg = 'Debe registrarse antes de inscribirse';
            document.querySelector('app-toast')?.show(msg, 4000, 'warning');
            throw new Error(msg);
        }
        if (!pruebaAdmisionId) {
            const msg = 'Debe especificar la prueba de admisión';
            document.querySelector('app-toast')?.show(msg, 4000, 'warning');
            throw new Error(msg);
        }

        store.loading = true;
        try {
            const inscripcion = await this.inscripcionesDao.inscribir(aspiranteId, pruebaAdmisionId);
            store.inscripcionActiva = inscripcion;
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
