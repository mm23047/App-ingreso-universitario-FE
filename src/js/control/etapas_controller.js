import EtapasDao from './etapas_dao.js';
import { store } from '../infra/app_state.js';

class EtapasController {
    constructor() {
        this.etapasDao = new EtapasDao();
    }

    async cargarTodas() {
        store.loading = true;
        try {
            return await this.etapasDao.obtenerTodas();
        } catch (error) {
            console.error('Error al cargar etapas:', error);
            document.querySelector('app-toast')?.show(
                `Error al cargar etapas: ${error.message}`, 4000, 'error'
            );
            throw error;
        } finally {
            store.loading = false;
        }
    }

    async cargarPorId(id) {
        if (!id) throw new Error('El ID de la etapa es requerido');
        store.loading = true;
        try {
            const etapa = await this.etapasDao.obtenerPorId(id);
            store.etapa = etapa;
            return etapa;
        } catch (error) {
            console.error('Error al cargar etapa:', error);
            document.querySelector('app-toast')?.show(
                `Error al cargar etapa: ${error.message}`, 4000, 'error'
            );
            throw error;
        } finally {
            store.loading = false;
        }
    }

    seleccionarEtapa(etapa) {
        if (!etapa?.idEtapaAdmision) {
            document.querySelector('app-toast')?.show('Etapa inválida', 3000, 'warning');
            return null;
        }
        store.etapa = etapa;
        return etapa;
    }
}

export default EtapasController;
