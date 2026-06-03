import AspirantesDao from './aspirantes_dao.js';
import { store } from '../infra/app_state.js';

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
        return { valido: true };
    }

    async registrar(data) {
        const validacion = this.validarDatos(data);
        if (!validacion.valido) {
            document.querySelector('app-toast')?.show(validacion.mensaje, 4000, 'warning');
            throw new Error(validacion.mensaje);
        }

        store.loading = true;
        try {
            const aspirante = await this.aspirantesDao.crear({
                ...data,
                usaSillaRuedas: data.usaSillaRuedas ?? false
            });
            store.aspirante = aspirante;
            document.querySelector('app-toast')?.show('Registro exitoso. ¡Bienvenido!', 3000, 'success');
            return aspirante;
        } catch (error) {
            console.error('Error al registrar aspirante:', error);
            let msg;
            if (error.message.includes('409')) {
                const partes = error.message.split(' - ');
                msg = partes.length > 1
                    ? partes.slice(1).join(' - ').trim()
                    : 'Ya existe un registro con ese DUI o correo';
            } else {
                msg = `Error al registrar: ${error.message}`;
            }
            document.querySelector('app-toast')?.show(msg, 5000, 'error');
            throw error;
        } finally {
            store.loading = false;
        }
    }
}

export default AspirantesController;
