import AreasConocimientoDao from './areas_dao.js';
import { store } from '../infra/app_state.js';

// Resource: AreasConocimientoResource  @Path("areas")
class AreasController {
    constructor() {
        this.areasDao = new AreasConocimientoDao();
    }

    async cargarTodas() {
        store.loading = true;
        try {
            return await this.areasDao.obtenerTodas();
        } catch (error) {
            console.error('Error al cargar áreas de conocimiento:', error);
            document.querySelector('app-toast')?.show(
                `Error al cargar áreas: ${error.message}`, 4000, 'error'
            );
            throw error;
        } finally {
            store.loading = false;
        }
    }

    async cargarTemasPorArea(idArea) {
        if (!idArea) throw new Error('El ID del área es requerido');
        try {
            return await this.areasDao.obtenerTemasPorArea(idArea);
        } catch (error) {
            console.error('Error al cargar temas del área:', error);
            throw error;
        }
    }

    async cargarPorPrueba(idPrueba) {
        if (!idPrueba) throw new Error('El ID de la prueba es requerido');
        store.loading = true;
        try {
            return await this.areasDao.obtenerAreasPorPrueba(idPrueba);
        } catch (error) {
            console.error('Error al cargar áreas por prueba:', error);
            document.querySelector('app-toast')?.show(
                `Error al cargar áreas: ${error.message}`, 4000, 'error'
            );
            throw error;
        } finally {
            store.loading = false;
        }
    }
}

export default AreasController;
