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
        try {
            const respuesta = await fetch(this._urlBase(inscripcionId), { method: 'GET' });
            if (respuesta.status === 200) {
                return (await respuesta.json()).map(d => this._mapear(d));
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener carreras elegidas:', error);
            throw error;
        }
    }

    async agregarCarrera(inscripcionId, idCarrera, prioridad = 1) {
        if (!inscripcionId || !idCarrera) {
            throw new Error('El ID de la inscripción y el ID de la carrera son requeridos');
        }
        try {
            const respuesta = await fetch(this._urlBase(inscripcionId), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ catalogoCarrera: { idCarrera }, prioridad })
            });
            if (respuesta.status === 201) return this._mapear(await respuesta.json());
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al agregar carrera elegida:', error);
            throw error;
        }
    }

    async actualizarPrioridad(inscripcionId, idCarrera, nuevaPrioridad) {
        if (!inscripcionId || !idCarrera || nuevaPrioridad == null) {
            throw new Error('ID de inscripción, carrera y nueva prioridad son requeridos');
        }
        try {
            const respuesta = await fetch(`${this._urlBase(inscripcionId)}/${idCarrera}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prioridad: nuevaPrioridad })
            });
            if (respuesta.status === 200) return this._mapear(await respuesta.json());
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al actualizar prioridad de carrera:', error);
            throw error;
        }
    }

    async eliminarCarrera(inscripcionId, idCarrera) {
        if (!inscripcionId || !idCarrera) {
            throw new Error('El ID de la inscripción y el ID de la carrera son requeridos');
        }
        try {
            const respuesta = await fetch(`${this._urlBase(inscripcionId)}/${idCarrera}`, {
                method: 'DELETE'
            });
            if (respuesta.status === 204) return true;
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al eliminar carrera elegida:', error);
            throw error;
        }
    }

    async obtenerPrimeraOpcion(inscripcionId) {
        if (!inscripcionId) throw new Error('El ID de la inscripción es requerido');
        try {
            const respuesta = await fetch(`${this._urlBase(inscripcionId)}/primera-opcion`, { method: 'GET' });
            if (respuesta.status === 200) return this._mapear(await respuesta.json());
            if (respuesta.status === 404) return null;
            throw new Error(`Error HTTP: ${respuesta.status}`);
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
            const respuesta = await fetch(`${this._urlBase(inscripcionId)}/reordenar`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoOrdenIds)
            });
            if (respuesta.status === 200) {
                return (await respuesta.json()).map(d => this._mapear(d));
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al reordenar carreras elegidas:', error);
            throw error;
        }
    }
}

export default CarrerasElegidaDao;
