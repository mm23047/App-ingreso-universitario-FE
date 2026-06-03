import TurnosDao from './turnos_dao.js';
import LocalStorageDao from './local_storage_dao.js';
import { store } from '../infra/app_state.js';

class TurnosController {
    constructor() {
        this.turnosDao = new TurnosDao();
        this.turnosEnMemoria = [];
    }

    async cargarTodosLosTurnos() {
        store.loading = true;
        try {
            const turnos = await this.turnosDao.obtenerTurnos();
            this.turnosEnMemoria = turnos;
            store.turnos = turnos;
            return turnos;
        } catch (error) {
            console.error('Error al cargar turnos:', error);
            document.querySelector('app-toast')?.show(
                `Error al cargar turnos: ${error.message}`, 4000, 'error'
            );
            throw error;
        } finally {
            store.loading = false;
        }
    }

    async obtenerTurnoPorId(id) {
        try {
            return await this.turnosDao.obtenerTurnoPorId(id);
        } catch (error) {
            console.error('Error al obtener turno:', error);
            throw error;
        }
    }

    seleccionarTurno(idTurnoExamen) {
        const turno = this.buscarTurnoEnMemoria(idTurnoExamen);
        if (!turno) {
            document.querySelector('app-toast')?.show('Turno no encontrado', 3000, 'warning');
            return null;
        }
        store.turnoSeleccionado = turno;
        this.guardarSeleccionTurno(idTurnoExamen);
        document.querySelector('app-toast')?.show(
            `Turno seleccionado: ${turno.nombreTurno}`, 2500, 'success'
        );
        return turno;
    }

    guardarSeleccionTurno(turnoId) {
        try {
            LocalStorageDao.establecerTurnoActual(turnoId);
            return true;
        } catch (error) {
            console.error('Error al guardar turno:', error);
            return false;
        }
    }

    obtenerTurnoGuardado() {
        return LocalStorageDao.obtenerTurnoActual();
    }

    limpiarSeleccion() {
        LocalStorageDao.limpiarTodo();
        store.turnoSeleccionado = null;
    }

    getTurnosEnMemoria() {
        return this.turnosEnMemoria;
    }

    buscarTurnoEnMemoria(idTurnoExamen) {
        return this.turnosEnMemoria.find(t => t.idTurnoExamen === idTurnoExamen);
    }
}

export default TurnosController;
