import InscripcionesDao from '../dao/inscripciones_dao.js';
import { store } from '../state/app_state.js';

class InscripcionesController {
    constructor() {
        this.inscripcionesDao = new InscripcionesDao();
    }

    /**
     * Inscribe al aspirante en una prueba de admisión.
     * Si no se pasan los IDs explícitamente, los toma del store.
     *
     * Campos reales del backend (InscripcionesPrueba):
     *   aspiranteId, pruebaAdmisionId, turnoId
     */
    async inscribir(aspiranteId, carreraId, turnoId, pruebaId) {
        const _aspiranteId = aspiranteId ?? store.aspirante?.id;
        const _turnoId     = turnoId     ?? store.turnoSeleccionado?.id;
        const _carreraId   = carreraId   ?? store.carreraSeleccionada?.idCarrera;

        if (!_aspiranteId || !_turnoId) {
            const msg = 'Debe completar el registro y seleccionar un turno antes de inscribirse';
            document.querySelector('app-toast')?.show(msg, 4000, 'warning');
            throw new Error(msg);
        }

        store.loading = true;
        try {
            const datos = {
                aspiranteId:     _aspiranteId,
                turnoId:         _turnoId
            };
            if (_carreraId) datos.carreraId      = _carreraId;
            if (pruebaId)   datos.pruebaAdmisionId = pruebaId;

            const inscripcion = await this.inscripcionesDao.inscribir(datos);
            document.querySelector('app-toast')?.show(
                'Inscripción realizada con éxito', 3000, 'success'
            );
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
