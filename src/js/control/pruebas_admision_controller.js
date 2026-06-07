import PruebasAdmisionDao from './pruebas_admision_dao.js';
import { store }          from '../infra/app_state.js';
import { notificar }      from '../infra/notificaciones.js';

class PruebasAdmisionController {
    constructor() {
        this.pruebasDao = new PruebasAdmisionDao();
    }

    async cargarPruebaActiva() {
        store.loading = true;
        try {
            const pruebas = await this.pruebasDao.obtenerActivas();
            if (!pruebas || pruebas.length === 0) {
                notificar(
                    'No hay prueba de admisión activa en este momento', 5000, 'warning'
                );
                store.prueba = null;
                return null;
            }
            store.prueba = pruebas[0];
            return pruebas[0];
        } catch (error) {
            console.error('Error al cargar prueba activa:', error);
            notificar(
                `Error al cargar la prueba activa: ${error.message}`, 4000, 'error'
            );
            throw error;
        } finally {
            store.loading = false;
        }
    }

    async cargarPorId(id) {
        if (!id) throw new Error('El ID de la prueba es requerido');
        store.loading = true;
        try {
            const prueba = await this.pruebasDao.obtenerPorId(id);
            store.prueba = prueba;
            return prueba;
        } catch (error) {
            console.error('Error al cargar prueba de admisión:', error);
            throw error;
        } finally {
            store.loading = false;
        }
    }

    async cargarTodas(first = 0, max = 50, buscar = '', silencioso = false) {
        if (!silencioso) store.loading = true;
        try {
            return await this.pruebasDao.obtenerTodas(first, max, buscar);
        } catch (error) {
            console.error('Error al cargar pruebas de admisión:', error);
            notificar(
                `Error al cargar procesos: ${error.message}`, 4000, 'error'
            );
            throw error;
        } finally {
            if (!silencioso) store.loading = false;
        }
    }
}

export default PruebasAdmisionController;
