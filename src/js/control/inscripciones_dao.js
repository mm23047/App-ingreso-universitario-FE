import DefaultDao from './default_dao.js';

// Endpoint: POST /inscripciones_prueba
// Entidad backend: InscripcionesPrueba
// Campos reales del POST: aspiranteId (UUID), pruebaAdmisionId (UUID), turnoId (UUID)
// NOTA: verifica con el backend los nombres exactos de los campos del JSON recibido
class InscripcionesDao extends DefaultDao {
    constructor() {
        super();
        this.BASE_URL += 'inscripciones_prueba';
    }

    async inscribir(datos) {
        if (!datos) {
            throw new Error('Los datos de inscripción son requeridos');
        }
        try {
            const respuesta = await fetch(this.BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            if (respuesta.status === 201) {
                return await respuesta.json();
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al inscribir aspirante:', error);
            throw error;
        }
    }
}

export default InscripcionesDao;
