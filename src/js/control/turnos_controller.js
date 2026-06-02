import TurnosDao from './turnos_dao.js';
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
            this.turnosEnMemoria = this.procesarTurnos(turnos);
            store.turnos = this.turnosEnMemoria;
            return this.turnosEnMemoria;
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
            const turno = await this.turnosDao.obtenerTurnoPorId(id);
            return this.procesarTurno(turno);
        } catch (error) {
            console.error('Error al obtener turno:', error);
            throw error;
        }
    }

    seleccionarTurno(id) {
        const turno = this.buscarTurnoEnMemoria(id);
        if (!turno) {
            document.querySelector('app-toast')?.show('Turno no encontrado', 3000, 'warning');
            return null;
        }
        store.turnoSeleccionado = turno;
        this.guardarSeleccionTurno(id);
        document.querySelector('app-toast')?.show(
            `Turno seleccionado: ${turno.nombre ?? turno.id}`, 2500, 'success'
        );
        return turno;
    }

    procesarTurnos(turnos) {
        return turnos.map(turno => this.procesarTurno(turno));
    }

    procesarTurno(turno) {
        return {
            ...turno,
            etiqueta: `${turno.nombre} - ${turno.horaInicio ?? turno.horario ?? ''}`,
            esValida: this.validarTurno(turno),
            formateada: this.formatearTurno(turno)
        };
    }

    validarTurno(turno) {
        return turno && turno.id && turno.nombre;
    }

    formatearTurno(turno) {
        return {
            codigo: turno.id,
            titulo: turno.nombre.toUpperCase(),
            descripcion: `Turno: ${turno.nombre}`
        };
    }

    guardarSeleccionTurno(turnoId) {
        try {
            localStorage.setItem('turnoSeleccionado', turnoId);
            return true;
        } catch (error) {
            console.error('Error al guardar turno:', error);
            return false;
        }
    }

    obtenerTurnoGuardado() {
        const turnoId = localStorage.getItem('turnoSeleccionado');
        return turnoId ? parseInt(turnoId) : null;
    }

    limpiarSeleccion() {
        localStorage.removeItem('turnoSeleccionado');
        store.turnoSeleccionado = null;
    }

    getTurnosEnMemoria() {
        return this.turnosEnMemoria;
    }

    buscarTurnoEnMemoria(id) {
        return this.turnosEnMemoria.find(t => t.id === id);
    }
}

export default TurnosController;
