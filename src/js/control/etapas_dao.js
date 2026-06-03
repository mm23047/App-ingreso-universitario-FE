import DefaultDao from './default_dao.js';
import EtapasAdmision from '../entity/EtapasAdmision.js';

// Resource: EtapasAdmisionResource  @Path("etapas")
// GET /etapas?first=0&max=50
// GET /etapas/{idEtapa}
class EtapasDao extends DefaultDao {
    constructor() {
        super();
        this.BASE_URL += 'etapas';
    }

    _mapear(data) {
        return new EtapasAdmision(
            data.idEtapaAdmision             ?? null,
            data.nombre                      ?? '',
            data.puntajeMinimo               ?? null,
            data.puntajeMaximo               ?? null,
            data.descripcion                 ?? null,
            data.cantidadPreguntasRequeridas ?? null
        );
    }

    async obtenerTodas(first = 0, max = 50) {
        try {
            const respuesta = await fetch(`${this.BASE_URL}?first=${first}&max=${max}`, { method: 'GET' });
            if (respuesta.status === 200) {
                return (await respuesta.json()).map(d => this._mapear(d));
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener etapas de admisión:', error);
            throw error;
        }
    }

    async obtenerPorId(id) {
        if (!id) throw new Error('El ID de la etapa es requerido');
        try {
            const respuesta = await fetch(`${this.BASE_URL}/${id}`, { method: 'GET' });
            if (respuesta.status === 200) return this._mapear(await respuesta.json());
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener etapa de admisión:', error);
            throw error;
        }
    }
}

export default EtapasDao;
