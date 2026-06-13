import DefaultDao from './default_dao.js';
import Aspirante from '../entity/Aspirante.js';
import InscripcionPrueba from '../entity/InscripcionPrueba.js';

// Resource: AspirantesDatoResource  @Path("aspirantes")
// POST   /aspirantes                              body: { nombres, apellidos, fechaNacimiento, dui, correo, usaSillaRuedas }
// GET    /aspirantes/{id}
// PUT    /aspirantes/{id}                         body: mismo que POST
// DELETE /aspirantes/{id}                         → 204; 409 si tiene inscripciones
// GET    /aspirantes/{idAspirante}/inscripciones
// POST   /aspirantes/{idAspirante}/inscripciones  body: { pruebaAdmision: { idPruebaAdmision } }
class AspirantesDao extends DefaultDao {
    constructor() {
        super();
        this.BASE_URL += 'aspirantes';
    }

    _mapear(data) {
        return new Aspirante(
            data.id                  ?? null,
            data.nombres             ?? '',
            data.apellidos           ?? '',
            data.fechaNacimiento     ?? null,
            data.dui                 ?? '',
            data.correo              ?? '',
            data.fechaCreacionPerfil ?? null,
            data.usaSillaRuedas      ?? false
        );
    }

    async crear(aspiranteData) {
        if (!aspiranteData) throw new Error('Los datos del aspirante son requeridos');
        try {
            const respuesta = await this._fetch(this.BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(aspiranteData)
            });
            if (respuesta.status === 201) return this._mapear(await respuesta.json());

            // Parsear ErrorNegocioDTO estructurado del backend para extraer tipo y mensaje de negocio.
            let errorData = null;
            try {
                const cuerpo = await respuesta.text();
                if (cuerpo) {
                    try { errorData = JSON.parse(cuerpo); } catch { errorData = { mensaje: cuerpo }; }
                }
            } catch { /* ignorar fallos en lectura del body */ }

            const err = new Error(`Error HTTP: ${respuesta.status}`);
            err.httpStatus       = respuesta.status;
            err.tipo             = errorData?.tipo    ?? null;   // 'EDAD_MINIMA' | 'DUI_DUPLICADO' | 'CORREO_DUPLICADO'
            err.mensajeNegocio   = errorData?.mensaje ?? null;
            throw err;
        } catch (error) {
            console.error('Error al crear aspirante:', error);
            throw error;
        }
    }

    async obtenerPorId(id) {
        if (!id) throw new Error('El ID del aspirante es requerido');
        return this._mapear(await this._get(`${this.BASE_URL}/${id}`));
    }

    async obtenerInscripciones(aspiranteId) {
        if (!aspiranteId) throw new Error('El ID del aspirante es requerido');
        try {
            // Caso especial: 404 significa sin inscripciones, no es un error de uso.
            const respuesta = await this._fetch(`${this.BASE_URL}/${aspiranteId}/inscripciones`, { method: 'GET' });
            if (respuesta.status === 200) {
                return (await respuesta.json()).map(data => new InscripcionPrueba(
                    data.idInscripcionPrueba ?? null,
                    data.aspiranteDato       ?? null,
                    data.pruebaAdmision      ?? null,
                    data.estado              ?? 'INSCRITO'
                ));
            }
            if (respuesta.status === 404) return [];
            const err = new Error(`Error HTTP: ${respuesta.status}`);
            err.httpStatus = respuesta.status;
            throw err;
        } catch (error) {
            console.error('Error al obtener inscripciones del aspirante:', error);
            throw error;
        }
    }

    async eliminar(id) {
        if (!id) throw new Error('El ID del aspirante es requerido');
        return this._delete(`${this.BASE_URL}/${id}`);
    }

    async buscarPorCriterio(paramName, criterio) {
        if (!paramName || !criterio) throw new Error('El criterio de búsqueda es requerido');
        try {
            // Caso especial: non-ok se trata como sin resultados (comportamiento original).
            const r = await this._fetch(`${this.BASE_URL}?${paramName}=${encodeURIComponent(criterio)}`);
            if (r.ok) return r.json();
            return [];
        } catch (error) {
            console.error('Error al buscar aspirante por criterio:', error);
            throw error;
        }
    }

    async crearInscripcion(aspiranteId, pruebaAdmisionId) {
        if (!aspiranteId || !pruebaAdmisionId) {
            throw new Error('El ID del aspirante y el ID de la prueba son requeridos');
        }
        const data = await this._post(`${this.BASE_URL}/${aspiranteId}/inscripciones`, {
            pruebaAdmision: { idPruebaAdmision: pruebaAdmisionId }
        });
        return new InscripcionPrueba(
            data.idInscripcionPrueba ?? null,
            data.aspiranteDato       ?? null,
            data.pruebaAdmision      ?? null,
            data.estado              ?? 'INSCRITO'
        );
    }
}

export default AspirantesDao;
