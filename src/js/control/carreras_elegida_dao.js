import DefaultDao from './default_dao.js';
import CarrerasElegida from '../entity/CarrerasElegida.js';

// Resource: CarrerasElegidaResource  @Path("inscripciones_prueba/{idInscripcion}/carreras")
// GET    /inscripciones_prueba/{id}/carreras
// POST   /inscripciones_prueba/{id}/carreras     body: { catalogoCarrera:{idCarrera}, prioridad }
// PUT    /inscripciones_prueba/{id}/carreras/{idCarrera}   body: { prioridad }
// DELETE /inscripciones_prueba/{id}/carreras/{idCarrera}
// GET    /inscripciones_prueba/{id}/carreras/primera-opcion
// PATCH  /inscripciones_prueba/{id}/carreras/reordenar    body: ["IC","IS",...]
class CarrerasElegidaDao extends DefaultDao {
    constructor() {
        super();
        this.inscripcionesUrl = this.BASE_URL + 'inscripciones_prueba';
    }

    _urlBase(inscripcionId) {
        return `${this.inscripcionesUrl}/${inscripcionId}/carreras`;
    }

    _mapear(data) {
        return new CarrerasElegida(
            data.idCarreraElegida    ?? null,
            data.inscripcionesPrueba ?? null,
            data.catalogoCarrera     ?? null,
            data.prioridad           ?? null
        );
    }

    async obtenerPorInscripcion(inscripcionId) {
        if (!inscripcionId) throw new Error('El ID de la inscripción es requerido');
        return (await this._get(this._urlBase(inscripcionId))).map(d => this._mapear(d));
    }

    async agregarCarrera(inscripcionId, idCarrera, prioridad = 1) {
        if (!inscripcionId || !idCarrera) {
            throw new Error('El ID de la inscripción y el ID de la carrera son requeridos');
        }
        return this._mapear(await this._post(this._urlBase(inscripcionId), { catalogoCarrera: { idCarrera }, prioridad }));
    }

    async actualizarPrioridad(inscripcionId, idCarrera, nuevaPrioridad) {
        if (!inscripcionId || !idCarrera || nuevaPrioridad == null) {
            throw new Error('ID de inscripción, carrera y nueva prioridad son requeridos');
        }
        return this._mapear(await this._put(`${this._urlBase(inscripcionId)}/${idCarrera}`, { prioridad: nuevaPrioridad }));
    }

    async eliminarCarrera(inscripcionId, idCarrera) {
        if (!inscripcionId || !idCarrera) {
            throw new Error('El ID de la inscripción y el ID de la carrera son requeridos');
        }
        await this._delete(`${this._urlBase(inscripcionId)}/${idCarrera}`);
        return true;
    }

    async obtenerPrimeraOpcion(inscripcionId) {
        if (!inscripcionId) throw new Error('El ID de la inscripción es requerido');
        try {
            // Caso especial: 404 significa "sin primera opción", no es un error de uso.
            const respuesta = await this._fetch(`${this._urlBase(inscripcionId)}/primera-opcion`, { method: 'GET' });
            if (respuesta.status === 200) return this._mapear(await respuesta.json());
            if (respuesta.status === 404) return null;
            const err = new Error(`Error HTTP: ${respuesta.status}`);
            err.httpStatus = respuesta.status;
            throw err;
        } catch (error) {
            console.error('Error al obtener primera opción de carrera:', error);
            throw error;
        }
    }

    async reordenar(inscripcionId, nuevoOrdenIds) {
        if (!inscripcionId || !nuevoOrdenIds || nuevoOrdenIds.length === 0) {
            throw new Error('El ID de la inscripción y el nuevo orden son requeridos');
        }
        try {
            // PATCH — no tiene helper genérico; el body es un array, no un objeto.
            const respuesta = await this._fetch(`${this._urlBase(inscripcionId)}/reordenar`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoOrdenIds)
            });
            if (respuesta.status === 200) {
                return (await respuesta.json()).map(d => this._mapear(d));
            }
            const err = new Error(`Error HTTP: ${respuesta.status}`);
            err.httpStatus = respuesta.status;
            throw err;
        } catch (error) {
            console.error('Error al reordenar carreras elegidas:', error);
            throw error;
        }
    }
}

export default CarrerasElegidaDao;
