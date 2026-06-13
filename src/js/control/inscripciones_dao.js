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
        return this._mapear(await this._get(`${this.BASE_URL}/${id}`));
    }

    async eliminar(id) {
        if (!id) throw new Error('El ID de la inscripción es requerido');
        return this._delete(`${this.BASE_URL}/${id}`);
    }
}

export default InscripcionesDao;
