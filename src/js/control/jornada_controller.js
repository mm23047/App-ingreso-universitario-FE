import JornadaDao from './jornada_dao.js';

/**
 * CONTROLADOR DE JORNADA
 * 
 * Responsabilidades:
 * 1. Procesar datos obtenidos del DAO
 * 2. Aplicar lógica de negocio
 * 3. Transformar datos para la vista
 * 4. Manejar entidades/DTO
 * 5. Persistir datos locales (solo códigos/IDs)
 */
class JornadaController {
    constructor() {
        this.jornadaDao = new JornadaDao();
        this.jornadasEnMemoria = [];
    }

    /**
     * Obtiene todas las jornadas del servicio y las almacena en memoria
     * Simula: consumir un recurso REST completo
     */
    async cargarTodasLasJornadas() {
        try {
            // 1. Consumir datos del DAO (servicio REST simulado)
            const jornadas = await this.jornadaDao.obtenerJornadas();
            
            // 2. Procesar/transformar y almacenar en memoria
            this.jornadasEnMemoria = this.procesarJornadas(jornadas);
            
            return this.jornadasEnMemoria;
        } catch (error) {
            console.error('Error al cargar jornadas:', error);
            throw error;
        }
    }

    /**
     * Obtiene una jornada específica por su ID
     */
    async obtenerJornadaPorId(id) {
        try {
            const jornada = await this.jornadaDao.obtenerJornadaPorId(id);
            
            // Procesar la jornada individual
            return this.procesarJornada(jornada);
        } catch (error) {
            console.error('Error al obtener jornada:', error);
            throw error;
        }
    }

    /**
     * LÓGICA DE NEGOCIO: Procesa múltiples jornadas
     * Aquí ocurre todo el procesamiento, NO en la vista
     */
    procesarJornadas(jornadas) {
        return jornadas.map(jornada => this.procesarJornada(jornada));
    }

    /**
     * LÓGICA DE NEGOCIO: Procesa una jornada individual
     * Transforma el objeto completo para la presentación
     */
    procesarJornada(jornada) {
        return {
            ...jornada,
            etiqueta: `${jornada.nombre} - ${jornada.horario}`,
            esValida: this.validarJornada(jornada),
            formateada: this.formatearJornada(jornada)
        };
    }

    /**
     * LÓGICA DE NEGOCIO: Valida una jornada
     */
    validarJornada(jornada) {
        return jornada && jornada.id && jornada.nombre;
    }

    /**
     * LÓGICA DE NEGOCIO: Formatea una jornada para mostrar
     */
    formatearJornada(jornada) {
        return {
            codigo: jornada.id,
            titulo: jornada.nombre.toUpperCase(),
            descripcion: `Jornada: ${jornada.nombre}`
        };
    }

    /**
     * PERSISTENCIA: Guardar una selección de jornada
     * Según instrucción del ingeniero: guardar SOLO el código (ID)
     * No guardar el objeto completo
     */
    guardarSeleccionJornada(jornadaId) {
        try {
            // Guardar SOLO el ID, no el objeto completo
            localStorage.setItem('jornadaSeleccionada', jornadaId);
            console.log(`Jornada seleccionada: ${jornadaId}`);
            return true;
        } catch (error) {
            console.error('Error al guardar jornada:', error);
            return false;
        }
    }

    /**
     * PERSISTENCIA: Obtener la jornada guardada localmente
     * Solo el código/ID se guarda
     */
    obtenerJornadaGuardada() {
        const jornadaId = localStorage.getItem('jornadaSeleccionada');
        return jornadaId ? parseInt(jornadaId) : null;
    }

    /**
     * PERSISTENCIA: Limpiar datos locales
     */
    limpiarSeleccion() {
        localStorage.removeItem('jornadaSeleccionada');
    }

    /**
     * Obtiene las jornadas en memoria (ya procesadas)
     */
    getJornadasEnMemoria() {
        return this.jornadasEnMemoria;
    }

    /**
     * Busca una jornada en memoria por ID
     */
    buscarJornadaEnMemoria(id) {
        return this.jornadasEnMemoria.find(j => j.id === id);
    }
}

export default JornadaController;
