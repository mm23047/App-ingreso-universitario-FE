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
        try {
            const respuesta = await fetch(`${this.BASE_URL}/activas`, { method: 'GET' });
            if (respuesta.status === 200) {
                return (await respuesta.json()).map(d => this._mapear(d));
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener pruebas activas:', error);
            throw error;
        }
    }

    async obtenerPorId(id) {
        if (!id) throw new Error('El ID de la prueba es requerido');
        try {
            const respuesta = await fetch(`${this.BASE_URL}/${id}`, { method: 'GET' });
            if (respuesta.status === 200) return this._mapear(await respuesta.json());
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener prueba de admisión:', error);
            throw error;
        }
    }

    async obtenerTodas(first = 0, max = 50, buscar = '') {
        try {
            const params = new URLSearchParams({ first, max });
            if (buscar.trim()) params.append('buscar', buscar.trim());
            const respuesta = await fetch(`${this.BASE_URL}?${params}`, { method: 'GET' });
            if (respuesta.status === 200) {
                return (await respuesta.json()).map(d => this._mapear(d));
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener pruebas de admisión:', error);
            throw error;
        }
    }
}

export default PruebasAdmisionDao;
