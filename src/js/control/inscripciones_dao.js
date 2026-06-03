import DefaultDao from './default_dao.js';
import InscripcionPrueba from '../entity/InscripcionPrueba.js';

// Resource: InscripcionesPruebaResource  @Path("inscripciones_prueba")
// GET /inscripciones_prueba/{idInscripcion}
// PUT /inscripciones_prueba/{idInscripcion}
// DELETE /inscripciones_prueba/{idInscripcion}
// NOTA: POST (inscribir aspirante) pertenece a AspirantesDatoResource → ver AspirantesDao.crearInscripcion()
class InscripcionesDao extends DefaultDao {
    constructor() {
        super();
        this.BASE_URL += 'inscripciones_prueba';
    }

    _mapear(data) {
        return new InscripcionPrueba(
            data.idInscripcionPrueba ?? null,
            data.aspiranteDato       ?? null,
            data.pruebaAdmision      ?? null,
            data.estado              ?? 'INSCRITO'
        );
    }

    async obtenerPorId(id) {
        if (!id) throw new Error('El ID de la inscripción es requerido');
        try {
            const respuesta = await fetch(`${this.BASE_URL}/${id}`, { method: 'GET' });
            if (respuesta.status === 200) return this._mapear(await respuesta.json());
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener inscripción:', error);
            throw error;
        }
    }
}

export default InscripcionesDao;
