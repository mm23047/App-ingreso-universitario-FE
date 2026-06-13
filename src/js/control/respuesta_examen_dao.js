import DefaultDao from './default_dao.js';
import RespuestaExamen from '../entity/RespuestaExamen.js';

// Resource: RespuestaExamenResource  @Path("respuestas_examen")
// POST /respuestas_examen
//   body: { examenRealizado: { idExamenRealizado: UUID }, preguntaOpcion: { idPreguntaOpcion: UUID } }
// POST /respuestas_examen/lote
//   body: { idExamen: UUID, opcionesSeleccionadas: [UUID] }  (RespuestasLoteDTO)
// GET  /respuestas_examen/examen/{idExamen}
// GET  /respuestas_examen/{idRespuesta}
class RespuestaExamenDao extends DefaultDao {
    constructor() {
        super();
        this.BASE_URL += 'respuestas_examen';
    }

    _mapear(data) {
        return new RespuestaExamen(
            data.idRespuestaExamen ?? null,
            data.examenRealizado   ?? null,
            data.preguntaOpcion    ?? null
        );
    }

    async enviarRespuesta(examenId, opcionId) {
        if (!examenId || !opcionId) {
            throw new Error('El ID del examen y el ID de la opción son requeridos');
        }
        try {
            // El backend acepta 200 y 201 indistintamente en este endpoint.
            const respuesta = await this._fetch(this.BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    examenRealizado: { idExamenRealizado: examenId },
                    preguntaOpcion:  { idPreguntaOpcion:  opcionId  }
                })
            });
            if (respuesta.status === 201 || respuesta.status === 200) {
                return this._mapear(await respuesta.json());
            }
            const err = new Error(`Error HTTP: ${respuesta.status}`);
            err.httpStatus = respuesta.status;
            throw err;
        } catch (error) {
            console.error('Error al enviar respuesta:', error);
            throw error;
        }
    }

    async enviarLote(examenId, opcionesIds) {
        if (!examenId || !opcionesIds || opcionesIds.length === 0) {
            throw new Error('El ID del examen y al menos una opción son requeridos');
        }
        try {
            // El backend retorna 201 con cuerpo vacío — usamos _fetch directamente.
            const respuesta = await this._fetch(`${this.BASE_URL}/lote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idExamen: examenId, opcionesSeleccionadas: opcionesIds })
            });
            if (respuesta.status === 201) return true;
            const err = new Error(`Error HTTP: ${respuesta.status}`);
            err.httpStatus = respuesta.status;
            throw err;
        } catch (error) {
            console.error('Error al enviar lote de respuestas:', error);
            throw error;
        }
    }

    async obtenerPorExamen(examenId) {
        if (!examenId) throw new Error('El ID del examen es requerido');
        return (await this._get(`${this.BASE_URL}/examen/${examenId}`)).map(d => this._mapear(d));
    }
}

export default RespuestaExamenDao;
