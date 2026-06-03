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
        try {
            const respuesta = await fetch(this.BASE_URL, { method: 'GET' });
            if (respuesta.status === 200) {
                return (await respuesta.json()).map(d => this._mapear(d));
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener carreras:', error);
            throw error;
        }
    }

    async obtenerPorId(id) {
        if (!id) throw new Error('El ID de la carrera es requerido');
        try {
            const respuesta = await fetch(`${this.BASE_URL}/${id}`, { method: 'GET' });
            if (respuesta.status === 200) return this._mapear(await respuesta.json());
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener carrera:', error);
            throw error;
        }
    }
}

export default CarrerasDao;
