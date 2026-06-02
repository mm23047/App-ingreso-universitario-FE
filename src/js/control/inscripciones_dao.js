import DefaultDao from './default_dao.js';
import InscripcionPrueba from '../entity/InscripcionPrueba.js';

// Endpoint principal de inscripción:
//   POST /aspirantes/{idAspirante}/inscripciones
//   Body: { pruebaAdmision: { idPruebaAdmision: UUID } }
//   Respuesta 201: InscripcionesPrueba completa con aspiranteDato + pruebaAdmision
//
// Endpoint de consulta:
//   GET /inscripciones_prueba/{idInscripcion}
//   GET /inscripciones_prueba?idPrueba=UUID&estado=INSCRITO
class InscripcionesDao extends DefaultDao {
    constructor() {
        super();
        this.aspirantesUrl    = this.BASE_URL + 'aspirantes';
        this.inscripcionesUrl = this.BASE_URL + 'inscripciones_prueba';
        this.BASE_URL         = this.inscripcionesUrl;
    }

    /**
     * Inscribe a un aspirante en una prueba de admisión.
     * Usa el endpoint anidado del recurso aspirantes.
     * @param {string} aspiranteId UUID del aspirante (de store.aspirante.id)
     * @param {string} pruebaAdmisionId UUID de la prueba activa
     * @returns {Promise<InscripcionPrueba>}
     */
    async inscribir(aspiranteId, pruebaAdmisionId) {
        if (!aspiranteId || !pruebaAdmisionId) {
            throw new Error('El ID del aspirante y el ID de la prueba son requeridos');
        }
        try {
            const url = `${this.aspirantesUrl}/${aspiranteId}/inscripciones`;
            const respuesta = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pruebaAdmision: { idPruebaAdmision: pruebaAdmisionId }
                })
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

    async obtenerPorId(id) {
        if (!id) {
            throw new Error('El ID de la inscripción es requerido');
        }
        try {
            const respuesta = await fetch(`${this.inscripcionesUrl}/${id}`, { method: 'GET' });
            if (respuesta.status === 200) {
                const data = await respuesta.json();
                return new InscripcionPrueba(data);
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener inscripción:', error);
            throw error;
        }
    }
}

export default InscripcionesDao;
