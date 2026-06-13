import DefaultDao from './default_dao.js';
import PruebaAdmision from '../entity/PruebaAdmision.js';

// Resource: PruebasAdmisionResource  @Path("pruebas_admision")
// GET /pruebas_admision?first=0&max=50
// GET /pruebas_admision/activas   → lista de pruebas con activa=true
// GET /pruebas_admision/{id}
class PruebasAdmisionDao extends DefaultDao {
    constructor() {
        super();
        this.BASE_URL += 'pruebas_admision';
    }

    _mapear(data) {
        return new PruebaAdmision(
            data.idPruebaAdmision ?? null,
            data.nombrePrueba     ?? '',
            data.anio             ?? null,
            data.activa           ?? false
        );
    }

    async obtenerActivas() {
        return (await this._get(`${this.BASE_URL}/activas`)).map(d => this._mapear(d));
    }

    async obtenerPorId(id) {
        if (!id) throw new Error('El ID de la prueba es requerido');
        return this._mapear(await this._get(`${this.BASE_URL}/${id}`));
    }

    async obtenerTodas(first = 0, max = 50, buscar = '', signal = null) {
        const params = new URLSearchParams({ first, max });
        if (buscar.trim()) params.append('buscar', buscar.trim());
        return (await this._get(`${this.BASE_URL}?${params}`, signal)).map(d => this._mapear(d));
    }
}

export default PruebasAdmisionDao;
