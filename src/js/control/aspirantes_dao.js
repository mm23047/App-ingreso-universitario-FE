import DefaultDao from './default_dao.js';
import Aspirante from '../entity/Aspirante.js';

// Endpoint: POST /aspirantes, GET /aspirantes/{id}
// Campos POST: nombres, apellidos, fechaNacimiento (YYYY-MM-DD), dui (00000000-0),
//              correo, usaSillaRuedas (Boolean, default false)
// Respuesta 201: id (UUID), fechaCreacionPerfil (LocalDate) + campos enviados
class AspirantesDao extends DefaultDao {
    constructor() {
        super();
        this.BASE_URL += 'aspirantes';
    }

    async crear(aspiranteData) {
        if (!aspiranteData) {
            throw new Error('Los datos del aspirante son requeridos');
        }
        try {
            const respuesta = await fetch(this.BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(aspiranteData)
            });
            if (respuesta.status === 201) {
                const data = await respuesta.json();
                return new Aspirante(data);
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al crear aspirante:', error);
            throw error;
        }
    }

    async obtenerPorId(id) {
        if (!id) {
            throw new Error('El ID del aspirante es requerido');
        }
        try {
            const respuesta = await fetch(`${this.BASE_URL}/${id}`, { method: 'GET' });
            if (respuesta.status === 200) {
                const data = await respuesta.json();
                return new Aspirante(data);
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener aspirante:', error);
            throw error;
        }
    }
}

export default AspirantesDao;
