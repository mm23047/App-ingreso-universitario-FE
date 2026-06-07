import CarrerasDao  from './carreras_dao.js';
import { store }    from '../infra/app_state.js';
import { notificar } from '../infra/notificaciones.js';

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
            notificar(
                `Error al cargar carreras: ${error.message}`, 4000, 'error'
            );
            throw error;
        } finally {
            store.loading = false;
        }
    }

    seleccionarCarrera(idCarrera) {
        const carrera = store.carreras.find(c => c.idCarrera === idCarrera);
        if (!carrera) {
            notificar('Carrera no encontrada', 3000, 'warning');
            return null;
        }
        store.carreraSeleccionada = carrera;
        notificar(
            `Carrera seleccionada: ${carrera.nombreCatalogoCarrera}`, 2500, 'success'
        );
        return carrera;
    }
}

export default CarrerasController;
