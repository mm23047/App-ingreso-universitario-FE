import DefaultDao from './default_dao.js';
import Aspirante from '../entity/Aspirante.js';
import InscripcionPrueba from '../entity/InscripcionPrueba.js';

// Resource: AspirantesDatoResource  @Path("aspirantes")
// POST /aspirantes  body: { nombres, apellidos, fechaNacimiento, dui, correo, usaSillaRuedas }
// GET  /aspirantes/{id}
// GET  /aspirantes/{idAspirante}/inscripciones
// POST /aspirantes/{idAspirante}/inscripciones  body: { pruebaAdmision: { idPruebaAdmision } }
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
            const respuesta = await fetch(this.BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(aspiranteData)
            });
            if (respuesta.status === 201) return this._mapear(await respuesta.json());

            // Intentar parsear ErrorNegocioDTO estructurado del backend
            let errorData = null;
            try {
                const cuerpo = await respuesta.text();
                if (cuerpo) {
                    try { errorData = JSON.parse(cuerpo); } catch { errorData = { mensaje: cuerpo }; }
                }
            } catch { /* ignorar fallos en lectura del body */ }

            const err = new Error(`Error HTTP: ${respuesta.status}`);
            err.httpStatus  = respuesta.status;
            err.tipo        = errorData?.tipo    ?? null;   // 'EDAD_MINIMA' | 'DUI_DUPLICADO' | 'CORREO_DUPLICADO' | null
            err.mensajeNegocio = errorData?.mensaje ?? null;
            throw err;
        } catch (error) {
            console.error('Error al crear aspirante:', error);
            throw error;
        }
    }

    async obtenerPorId(id) {
        if (!id) throw new Error('El ID del aspirante es requerido');
        try {
            const respuesta = await fetch(`${this.BASE_URL}/${id}`, { method: 'GET' });
            if (respuesta.status === 200) return this._mapear(await respuesta.json());
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al obtener aspirante:', error);
            throw error;
        }
    }

    async crearInscripcion(aspiranteId, pruebaAdmisionId) {
        if (!aspiranteId || !pruebaAdmisionId) {
            throw new Error('El ID del aspirante y el ID de la prueba son requeridos');
        }
        try {
            const respuesta = await fetch(`${this.BASE_URL}/${aspiranteId}/inscripciones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pruebaAdmision: { idPruebaAdmision: pruebaAdmisionId } })
            });
            if (respuesta.status === 201) {
                const data = await respuesta.json();
                return new InscripcionPrueba(
                    data.idInscripcionPrueba ?? null,
                    data.aspiranteDato       ?? null,
                    data.pruebaAdmision      ?? null,
                    data.estado              ?? 'INSCRITO'
                );
            }
            throw new Error(`Error HTTP: ${respuesta.status}`);
        } catch (error) {
            console.error('Error al inscribir aspirante:', error);
            throw error;
        }
    }
}

export default AspirantesDao;
