import AspirantesDao from './aspirantes_dao.js';
import { store }     from '../infra/app_state.js';
import { notificar } from '../infra/notificaciones.js';

const CAMPOS_REQUERIDOS = ['nombres', 'apellidos', 'dui', 'fechaNacimiento', 'correo'];

class AspirantesController {
    constructor() {
        this.aspirantesDao = new AspirantesDao();
    }

    validarDatos(data) {
        for (const campo of CAMPOS_REQUERIDOS) {
            if (!data[campo] || String(data[campo]).trim() === '') {
                return { valido: false, mensaje: `El campo "${campo}" es requerido` };
            }
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.correo)) {
            return { valido: false, mensaje: 'El correo electrónico no tiene un formato válido' };
        }
        if (!/^\d{8}-\d$/.test(data.dui)) {
            return { valido: false, mensaje: 'El DUI debe tener el formato 00000000-0' };
        }
        const _fechaNac = new Date(data.fechaNacimiento + 'T00:00:00');
        if (isNaN(_fechaNac.getTime())) {
            return { valido: false, mensaje: 'La fecha de nacimiento no es válida' };
        }
        const _hoy = new Date();
        if (_fechaNac > _hoy) {
            return { valido: false, mensaje: 'La fecha de nacimiento no puede ser una fecha futura' };
        }
        if (_hoy.getFullYear() - _fechaNac.getFullYear() > 100) {
            return { valido: false, mensaje: 'La fecha de nacimiento ingresada no es válida' };
        }
        return { valido: true };
    }

    async registrar(data) {
        const validacion = this.validarDatos(data);
        if (!validacion.valido) {
            notificar(validacion.mensaje, 4000, 'warning');
            throw new Error(validacion.mensaje);
        }

        store.loading = true;
        try {
            const aspirante = await this.aspirantesDao.crear({
                ...data,
                usaSillaRuedas: data.usaSillaRuedas ?? false
            });
            store.aspirante = aspirante;
            notificar('Registro exitoso. ¡Bienvenido!', 3000, 'success');
            return aspirante;
        } catch (error) {
            console.error('Error al registrar aspirante:', error);
            // Si el backend devolvió un ErrorNegocioDTO estructurado, usar su mensaje directo
            const msg = error.mensajeNegocio ?? `Error al registrar: ${error.message}`;
            notificar(msg, 5000, 'error');
            throw error;
        } finally {
            store.loading = false;
        }
    }
}

export default AspirantesController;
