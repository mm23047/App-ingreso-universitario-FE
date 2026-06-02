import DefaultDao from '../control/default_dao.js';
import InscripcionPrueba from '../entity/InscripcionPrueba.js';

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
                const data = await respuesta.json();
                return new InscripcionPrueba(data);
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al inscribir aspirante:', error);
            throw error;
        }
    }
}

export default InscripcionesDao;
