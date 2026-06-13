import DefaultDao from './default_dao.js';
import Carrera from '../entity/Carrera.js';

// Resource: CatalogoCarreraResource  @Path("carreras")
// GET /carreras
// GET /carreras/{idCarrera}
class CarrerasDao extends DefaultDao {
    constructor() {
        super();
        this.BASE_URL += 'carreras';
    }

    _mapear(data) {
        return new Carrera(
            data.idCarrera             ?? '',
            data.nombreCatalogoCarrera ?? ''
        );
    }

    async obtenerTodas() {
        return (await this._get(this.BASE_URL)).map(d => this._mapear(d));
    }

    async obtenerPorId(id) {
        if (!id) throw new Error('El ID de la carrera es requerido');
        return this._mapear(await this._get(`${this.BASE_URL}/${id}`));
    }
}

export default CarrerasDao;
