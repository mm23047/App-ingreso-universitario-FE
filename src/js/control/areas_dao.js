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
        try {
            const respuesta = await fetch(`${this.BASE_URL}?first=${first}&max=${max}`, { method: 'GET' });
            if (respuesta.status === 200) {
                return (await respuesta.json()).map(d => this._mapear(d));
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener áreas de conocimiento:', error);
            throw error;
        }
    }

    async obtenerTemasPorArea(idArea) {
        if (!idArea) throw new Error('El ID del área es requerido');
        try {
            const respuesta = await fetch(`${this.BASE_URL}/${idArea}/temas`, { method: 'GET' });
            if (respuesta.status === 200) {
                return (await respuesta.json()).map(d => this._mapearTema(d));
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener temas del área:', error);
            throw error;
        }
    }

    // GET /pruebas_admision/{idPrueba}/areas
    // Retorna [{idAreaConocimiento, nombreArea, temas:[{idTema, nombreTema}]}]
    // filtrado y ordenado por el backend — no requiere llamadas adicionales.
    async obtenerAreasPorPrueba(idPrueba) {
        if (!idPrueba) throw new Error('El ID de la prueba es requerido');
        try {
            const url = `${this._raiz}pruebas_admision/${idPrueba}/areas`;
            const respuesta = await fetch(url, { method: 'GET' });
            if (respuesta.status === 200) {
                return await respuesta.json();
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener áreas por prueba:', error);
            throw error;
        }
    }
}

export default AreasConocimientoDao;
