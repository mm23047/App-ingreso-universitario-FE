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
        return (await this._get(`${this.BASE_URL}?first=${first}&max=${max}`)).map(d => this._mapear(d));
    }

    async obtenerPorId(id) {
        if (!id) throw new Error('El ID de la etapa es requerido');
        return this._mapear(await this._get(`${this.BASE_URL}/${id}`));
    }
}

export default EtapasDao;
