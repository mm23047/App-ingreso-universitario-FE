import DefaultDao from './default_dao.js';
import ExamenRealizado from '../entity/ExamenRealizado.js';
import PreguntasPorClave from '../entity/PreguntasPorClave.js';
import Pregunta from '../entity/Pregunta.js';

// Resource: ExamenRealizadoResource  @Path("examen_realizado")
// POST /examen_realizado                       body: { idInscripcion: UUID, idEtapa: UUID }  → 201
// GET  /examen_realizado/{id}
// GET  /examen_realizado/{id}/preguntas        → PreguntasPorClave[] con bancoPregunta
// POST /examen_realizado/{id}/calificar        (proceso admin)
// GET  /examen_realizado/aspirante/{idAspirante} → ExamenRealizado[] del aspirante
class ExamenRealizadoDao extends DefaultDao {
    constructor() {
        super();
        this.BASE_URL += 'examen_realizado';
    }

    _mapear(data) {
        const obj = new ExamenRealizado(
            data.idExamenRealizado   ?? null,
            data.inscripcionesPrueba ?? null,
            data.claveExamen         ?? null,
            data.etapaAdmision       ?? null,
            data.puntajeFinal        ?? null,
            data.fechaRealizacion    ?? null
        );
        obj.estadoAdmision  = data.estadoAdmision  ?? null;
        obj.carreraAsignada = data.carreraAsignada ?? null;
        return obj;
    }

    _mapearPreguntaPorClave(data) {
        return new PreguntasPorClave(
            data.idPreguntaPorClave ?? null,
            data.claveExamen        ?? null,
            data.bancoPregunta
                ? new Pregunta(
                    data.bancoPregunta.idBancoPregunta ?? null,
                    data.bancoPregunta.enunciado       ?? '',
                    data.bancoPregunta.tema            ?? null
                )
                : null
        );
    }

    async iniciarExamen(inscripcionId, etapaId) {
        if (!inscripcionId || !etapaId) {
            throw new Error('El ID de la inscripción y el ID de la etapa son requeridos');
        }
        return this._mapear(await this._post(this.BASE_URL, { idInscripcion: inscripcionId, idEtapa: etapaId }));
    }

    async obtenerPorId(id) {
        if (!id) throw new Error('El ID del examen es requerido');
        return this._mapear(await this._get(`${this.BASE_URL}/${id}`));
    }

    async obtenerPorAspirante(aspiranteId) {
        if (!aspiranteId) throw new Error('El ID del aspirante es requerido');
        try {
            const respuesta = await this._fetch(`${this.BASE_URL}/aspirante/${aspiranteId}`, { method: 'GET' });
            if (respuesta.status === 200) {
                return (await respuesta.json()).map(d => this._mapear(d));
            }
            if (respuesta.status === 400) throw new Error('ID de aspirante con formato inválido');
            if (respuesta.status === 404) return [];
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener exámenes del aspirante:', error);
            throw error;
        }
    }

    async buscarPorCriterio(paramName, criterio) {
        if (!paramName || !criterio) throw new Error('El criterio de búsqueda es requerido');
        try {
            const urlBase = this.BASE_URL.endsWith('/') ? this.BASE_URL : this.BASE_URL + '/';
            const r = await this._fetch(`${urlBase}buscar?${paramName}=${encodeURIComponent(criterio)}`);
            if (!r.ok) throw new Error('Error en el servidor al procesar la búsqueda.');
            return r.json();
        } catch (error) {
            console.error('Error al buscar exámenes por criterio:', error);
            throw error;
        }
    }

    async obtenerPreguntas(examenId) {
        if (!examenId) throw new Error('El ID del examen es requerido');
        return (await this._get(`${this.BASE_URL}/${examenId}/preguntas`)).map(d => this._mapearPreguntaPorClave(d));
    }
}

export default ExamenRealizadoDao;
