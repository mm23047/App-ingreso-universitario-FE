import DefaultDao from './default_dao.js';
import AreaConocimiento from '../entity/AreaConocimiento.js';
import Tema from '../entity/Tema.js';

// Resource: AreasConocimientoResource  @Path("areas")
// GET /areas?first=0&max=100
// GET /areas/{idArea}/temas
//
// Jerarquía disponible en la API:
//   AreaConocimiento → Tema[]  (lista plana — idTemaPadre es @JsonbTransient, no llega en JSON)
class AreasConocimientoDao extends DefaultDao {
    constructor() {
        super();
        this._raiz    = this.BASE_URL;          // .../v1/
        this.BASE_URL += 'areas';               // .../v1/areas
    }

    _mapear(data) {
        return new AreaConocimiento(
            data.idAreaConocimiento ?? null,
            data.nombreArea          ?? ''
        );
    }

    _mapearTema(data) {
        return new Tema(
            data.idTema   ?? null,
            data.nombreTema ?? '',
            data.areaConocimiento
                ? new AreaConocimiento(
                    data.areaConocimiento.idAreaConocimiento ?? null,
                    data.areaConocimiento.nombreArea         ?? ''
                  )
                : null
        );
    }

    async obtenerTodas(first = 0, max = 100) {
        return (await this._get(`${this.BASE_URL}?first=${first}&max=${max}`)).map(d => this._mapear(d));
    }

    async obtenerTemasPorArea(idArea) {
        if (!idArea) throw new Error('El ID del área es requerido');
        return (await this._get(`${this.BASE_URL}/${idArea}/temas`)).map(d => this._mapearTema(d));
    }

    // GET /pruebas_admision/{idPrueba}/areas
    // Retorna [{idAreaConocimiento, nombreArea, temas:[{idTema, nombreTema}]}]
    // filtrado y ordenado por el backend — no requiere llamadas adicionales.
    async obtenerAreasPorPrueba(idPrueba) {
        if (!idPrueba) throw new Error('El ID de la prueba es requerido');
        return this._get(`${this._raiz}pruebas_admision/${idPrueba}/areas`);
    }
}

export default AreasConocimientoDao;
