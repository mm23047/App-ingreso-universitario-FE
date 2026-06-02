// Responsabilidad: guardar SOLO códigos/IDs de entidades en localStorage.
// Principio: nunca guardar objetos completos, solo referencias (UUIDs o IDs).
class LocalStorageDao {
    static TURNOS_KEY   = 'app_turnos_seleccionados';
    static CARRERAS_KEY = 'app_carreras_seleccionadas';

    // ── Métodos genéricos privados ──────────────────────────────────────

    static _guardarId(id, collectionKey) {
        if (!id) throw new Error(`El ID es requerido para ${collectionKey}`);
        try {
            const items = this._obtenerTodos(collectionKey);
            if (!items.includes(id)) {
                items.push(id);
                localStorage.setItem(collectionKey, JSON.stringify(items));
            }
            return true;
        } catch (error) {
            console.error(`Error al guardar en ${collectionKey}:`, error);
            throw error;
        }
    }

    static _obtenerTodos(collectionKey) {
        try {
            const datos = localStorage.getItem(collectionKey);
            return datos ? JSON.parse(datos) : [];
        } catch (error) {
            console.error(`Error al obtener ${collectionKey}:`, error);
            return [];
        }
    }

    static _obtenerActual(key) {
        try {
            const datos = localStorage.getItem(key);
            return datos ? datos : null;
        } catch (error) {
            console.error(`Error al obtener ${key}:`, error);
            return null;
        }
    }

    static _establecerActual(id, key) {
        if (!id) throw new Error(`El ID es requerido para ${key}`);
        try {
            localStorage.setItem(key, id);
            return true;
        } catch (error) {
            console.error(`Error al establecer ${key}:`, error);
            throw error;
        }
    }

    // ── Turnos ──────────────────────────────────────────────────────────

    static guardarTurno(turnoId) {
        return this._guardarId(turnoId, this.TURNOS_KEY);
    }

    static obtenerTodosLosTurnos() {
        return this._obtenerTodos(this.TURNOS_KEY);
    }

    static obtenerTurnoActual() {
        return this._obtenerActual('turnoActual');
    }

    static establecerTurnoActual(turnoId) {
        return this._establecerActual(turnoId, 'turnoActual');
    }

    // ── Carreras ────────────────────────────────────────────────────────

    static guardarCarrera(carreraId) {
        return this._guardarId(carreraId, this.CARRERAS_KEY);
    }

    static obtenerTodasLasCarreras() {
        return this._obtenerTodos(this.CARRERAS_KEY);
    }

    static obtenerCarreraActual() {
        return this._obtenerActual('carreraActual');
    }

    static establecerCarreraActual(carreraId) {
        return this._establecerActual(carreraId, 'carreraActual');
    }

    // ── Utilidades ──────────────────────────────────────────────────────

    static existe(key) {
        return localStorage.getItem(key) !== null;
    }

    static limpiarTodo() {
        try {
            localStorage.removeItem(this.TURNOS_KEY);
            localStorage.removeItem(this.CARRERAS_KEY);
            localStorage.removeItem('turnoActual');
            localStorage.removeItem('carreraActual');
            return true;
        } catch (error) {
            console.error('Error al limpiar datos locales:', error);
            throw error;
        }
    }

    static obtenerResumen() {
        return {
            turnosGuardados:   this.obtenerTodosLosTurnos(),
            turnoActual:       this.obtenerTurnoActual(),
            carrerasGuardadas: this.obtenerTodasLasCarreras(),
            carreraActual:     this.obtenerCarreraActual()
        };
    }
}

export default LocalStorageDao;
