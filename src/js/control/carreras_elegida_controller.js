import CarrerasElegidaDao from './carreras_elegida_dao.js';
import { store } from '../infra/app_state.js';

class CarrerasElegidaController {
    constructor() {
        this.carrerasElegidaDao = new CarrerasElegidaDao();
    }

    async agregarCarrera(inscripcionId, idCarrera, prioridad = 1) {
        if (!inscripcionId || !idCarrera) {
            const msg = 'Debe seleccionar una carrera para continuar';
            document.querySelector('app-toast')?.show(msg, 4000, 'warning');
            throw new Error(msg);
        }

        store.loading = true;
        try {
            const elegida = await this.carrerasElegidaDao.agregarCarrera(
                inscripcionId, idCarrera, prioridad
            );
            store.carrerasElegidas = [...(store.carrerasElegidas ?? []), elegida];
            document.querySelector('app-toast')?.show(
                `Carrera registrada como opción ${prioridad}`, 2500, 'success'
            );
            return elegida;
        } catch (error) {
            console.error('Error al agregar carrera elegida:', error);
            const msg = error.message.includes('409')
                ? 'Ya registraste esta carrera o esa prioridad está ocupada'
                : `Error al registrar carrera: ${error.message}`;
            document.querySelector('app-toast')?.show(msg, 5000, 'error');
            throw error;
        } finally {
            store.loading = false;
        }
    }

    async eliminarCarrera(inscripcionId, idCarrera) {
        if (!inscripcionId || !idCarrera) {
            throw new Error('IDs de inscripción y carrera son requeridos');
        }
        store.loading = true;
        try {
            await this.carrerasElegidaDao.eliminarCarrera(inscripcionId, idCarrera);
            store.carrerasElegidas = (store.carrerasElegidas ?? [])
                .filter(c => c.idCarreraElegida?.idCarrera !== idCarrera);
            document.querySelector('app-toast')?.show('Carrera eliminada', 2500, 'info');
        } catch (error) {
            console.error('Error al eliminar carrera elegida:', error);
            throw error;
        } finally {
            store.loading = false;
        }
    }

    async cargarPorInscripcion(inscripcionId) {
        if (!inscripcionId) throw new Error('El ID de la inscripción es requerido');
        try {
            const carreras = await this.carrerasElegidaDao.obtenerPorInscripcion(inscripcionId);
            store.carrerasElegidas = carreras;
            return carreras;
        } catch (error) {
            console.error('Error al cargar carreras elegidas:', error);
            throw error;
        }
    }

    async reordenar(inscripcionId, nuevoOrdenIds) {
        store.loading = true;
        try {
            const carreras = await this.carrerasElegidaDao.reordenar(inscripcionId, nuevoOrdenIds);
            store.carrerasElegidas = carreras;
            document.querySelector('app-toast')?.show('Orden actualizado', 2000, 'success');
            return carreras;
        } catch (error) {
            console.error('Error al reordenar carreras:', error);
            throw error;
        } finally {
            store.loading = false;
        }
    }
}

export default CarrerasElegidaController;
