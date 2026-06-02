import DefaultDao from './default_dao.js';

// Endpoint: POST /aspirantes, GET /aspirantes/{id}
// Entidad backend: AspirantesDato
// Campos reales del POST: nombres (String), apellidos (String),
//   fechaNacimiento (String YYYY-MM-DD), dui (String max 12),
//   correo (String), usaSillaRuedas (Boolean, default false)
// El backend genera: id (UUID), fechaCreacionPerfil (LocalDate)
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
                return await respuesta.json();
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
                return await respuesta.json();
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener aspirante:', error);
            throw error;
        }
    }
}

export default AspirantesDao;
