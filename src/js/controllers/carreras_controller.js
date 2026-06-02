import CarrerasDao from '../dao/carreras_dao.js';
import { store } from '../state/app_state.js';

class CarrerasController {
    constructor() {
        this.carrerasDao = new CarrerasDao();
    }

    async cargarTodas() {
        store.loading = true;
        try {
            const carreras = await this.carrerasDao.obtenerTodas();
            store.carreras = carreras;
            return carreras;
        } catch (error) {
            console.error('Error al cargar carreras:', error);
            document.querySelector('app-toast')?.show(
                `Error al cargar carreras: ${error.message}`, 4000, 'error'
            );
            throw error;
        } finally {
            store.loading = false;
        }
    }

    seleccionarCarrera(id) {
        // Buscar en el store para no relanzar una petición de red
        const carrera = store.carreras.find(c => c.idCarrera === id);
        if (!carrera) {
            document.querySelector('app-toast')?.show(
                'Carrera no encontrada', 3000, 'warning'
            );
            return null;
        }
        store.carreraSeleccionada = carrera;
        document.querySelector('app-toast')?.show(
            `Carrera seleccionada: ${carrera.nombreCatalogoCarrera}`, 2500, 'success'
        );
        return carrera;
    }
}

export default CarrerasController;
