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
            const respuesta = await fetch(this.BASE_URL, {
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
            throw new Error(`Error HTTP: ${respuesta.status}`);
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
            const respuesta = await fetch(`${this.BASE_URL}/lote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idExamen: examenId, opcionesSeleccionadas: opcionesIds })
            });
            if (respuesta.status === 201) return true;
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al enviar lote de respuestas:', error);
            throw error;
        }
    }

    async obtenerPorExamen(examenId) {
        if (!examenId) throw new Error('El ID del examen es requerido');
        try {
            const respuesta = await fetch(`${this.BASE_URL}/examen/${examenId}`, { method: 'GET' });
            if (respuesta.status === 200) {
                return (await respuesta.json()).map(d => this._mapear(d));
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener respuestas del examen:', error);
            throw error;
        }
    }
}

export default RespuestaExamenDao;
