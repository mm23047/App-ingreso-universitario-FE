/**
 * LOCAL STORAGE DAO
 * 
 * Responsabilidades:
 * 1. Guardar SOLO códigos/IDs de entidades
 * 2. NO guardar datos completos
 * 3. Actuar como caché local
 * 4. Mantener referencias a entidades para futuras consultas
 * 
 * Según instrucción del ingeniero:
 * "Aunque obtengas el recurso completo para mostrarlo en la interfaz,
 *  al momento de guardar la transacción en tu base de datos,
 *  lo único que se almacena es el código de referencia."
 */
class LocalStorageDao {
    /**
     * Clave para almacenar jornadas seleccionadas en localStorage
     */
    static JORNADAS_KEY = 'app_jornadas_seleccionadas';
    
    /**
     * Clave para almacenar carreras en localStorage
     */
    static CARRERAS_KEY = 'app_carreras_seleccionadas';

    // ============================================
    // MÉTODOS GENÉRICOS (evita repetición)
    // ============================================

    /**
     * Método genérico para guardar un ID a una colección
     * @private
     */
    static _guardarId(id, collectionKey) {
        if (!id) {
            throw new Error(`El ID es requerido para ${collectionKey}`);
        }

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

    /**
     * Método genérico para obtener todos los IDs de una colección
     * @private
     */
    static _obtenerTodos(collectionKey) {
        try {
            const datos = localStorage.getItem(collectionKey);
            return datos ? JSON.parse(datos) : [];
        } catch (error) {
            console.error(`Error al obtener ${collectionKey}:`, error);
            return [];
        }
    }

    /**
     * Método genérico para obtener el ID actual
     * @private
     */
    static _obtenerActual(key) {
        try {
            const datos = localStorage.getItem(key);
            return datos ? parseInt(datos) : null;
        } catch (error) {
            console.error(`Error al obtener ${key}:`, error);
            return null;
        }
    }

    /**
     * Método genérico para establecer el ID actual
     * @private
     */
    static _establecerActual(id, key) {
        if (!id) {
            throw new Error(`El ID es requerido para ${key}`);
        }

        try {
            localStorage.setItem(key, id);
            return true;
        } catch (error) {
            console.error(`Error al establecer ${key}:`, error);
            throw error;
        }
    }

    // ============================================
    // MÉTODOS PÚBLICOS - JORNADAS
    // ============================================

    /**
     * Guarda SOLO el código (ID) de una jornada
     * @param {number} jornadaId - El código/ID de la jornada
     */
    static guardarJornada(jornadaId) {
        return this._guardarId(jornadaId, this.JORNADAS_KEY);
    }

    /**
     * Obtiene todos los IDs de jornadas guardadas
     * @returns {number[]} Array de IDs
     */
    static obtenerTodasLasJornadas() {
        return this._obtenerTodos(this.JORNADAS_KEY);
    }

    /**
     * Obtiene la jornada seleccionada actualmente (solo el ID)
     * @returns {number|null} El código de la jornada o null
     */
    static obtenerJornadaActual() {
        return this._obtenerActual('jornadaActual');
    }

    /**
     * Establece la jornada actual (solo guarda el ID)
     * @param {number} jornadaId - El código/ID de la jornada
     */
    static establecerJornadaActual(jornadaId) {
        return this._establecerActual(jornadaId, 'jornadaActual');
    }

    // ============================================
    // MÉTODOS PÚBLICOS - CARRERAS
    // ============================================

    /**
     * Guarda SOLO el código (ID) de una carrera
     * @param {number} carreraId - El código/ID de la carrera
     */
    static guardarCarrera(carreraId) {
        return this._guardarId(carreraId, this.CARRERAS_KEY);
    }

    /**
     * Obtiene todos los IDs de carreras guardadas
     * @returns {number[]} Array de IDs
     */
    static obtenerTodasLasCarreras() {
        return this._obtenerTodos(this.CARRERAS_KEY);
    }

    /**
     * Obtiene la carrera seleccionada actualmente (solo el ID)
     * @returns {number|null} El código de la carrera o null
     */
    static obtenerCarreraActual() {
        return this._obtenerActual('carreraActual');
    }

    /**
     * Establece la carrera actual (solo guarda el ID)
     * @param {number} carreraId - El código/ID de la carrera
     */
    static establecerCarreraActual(carreraId) {
        return this._establecerActual(carreraId, 'carreraActual');
    }

    // ============================================
    // MÉTODOS PÚBLICOS - UTILIDADES
    // ============================================

    /**
     * Verifica si existe un ID guardado localmente
     * @param {string} key - La clave a verificar
     * @returns {boolean}
     */
    static existe(key) {
        return localStorage.getItem(key) !== null;
    }

    /**
     * Limpia todos los datos locales de la aplicación
     */
    static limpiarTodo() {
        try {
            localStorage.removeItem(this.JORNADAS_KEY);
            localStorage.removeItem(this.CARRERAS_KEY);
            localStorage.removeItem('jornadaActual');
            localStorage.removeItem('carreraActual');
            return true;
        } catch (error) {
            console.error('Error al limpiar datos locales:', error);
            throw error;
        }
    }

    /**
     * Obtiene un resumen de datos guardados localmente
     * @returns {object} Objeto con resumen de datos
     */
    static obtenerResumen() {
        return {
            jornadasGuardadas: this.obtenerTodasLasJornadas(),
            jornadaActual: this.obtenerJornadaActual(),
            carrerasGuardadas: this.obtenerTodasLasCarreras(),
            carreraActual: this.obtenerCarreraActual()
        };
    }
}

export default LocalStorageDao;
