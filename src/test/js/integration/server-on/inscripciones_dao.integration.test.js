import { expect } from '../../lib/chai/index.js';
import InscripcionesDao from '../../../../js/control/inscripciones_dao.js';
import AspirantesDao    from '../../../../js/control/aspirantes_dao.js';
import PruebasAdmisionDao from '../../../../js/control/pruebas_admision_dao.js';
import InscripcionPrueba from '../../../../js/entity/InscripcionPrueba.js';

// Genera datos únicos por llamada para evitar colisiones entre ejecuciones del test.
// Los registros creados se eliminan en el afterEach:
//   1. DELETE /inscripciones_prueba/{id}  (hijo FK — primero)
//   2. DELETE /aspirantes/{id}            (padre — después)
function generarDatos() {
    const n = Math.floor(Math.random() * 99999999);
    const d = Math.floor(Math.random() * 9);
    return {
        nombres:         'Test Insc Int',
        apellidos:       'Inscripcion Prueba',
        dui:             `${String(n).padStart(8, '0')}-${d}`,
        fechaNacimiento: '2001-06-15',
        correo:          `insc.int.${Date.now()}.${n}@tpi-test.sv`,
        usaSillaRuedas:  false
    };
}

describe('InscripcionesDao — Integración con backend', () => {
    let inscripcionesDao;
    let aspirantesDao;
    let pruebasDao;

    // Pares { aspiranteId, inscripcionId } creados por cada test; drenados en afterEach.
    // inscripcionId puede ser null si la inscripción nunca llegó a crearse.
    const creados = [];

    beforeEach(() => {
        inscripcionesDao = new InscripcionesDao();
        aspirantesDao    = new AspirantesDao();
        pruebasDao       = new PruebasAdmisionDao();
    });

    // Limpieza real vía DELETE — orden FK obligatorio:
    //   inscripciones_prueba ANTES que aspirante_datos.
    // best-effort: si el borrado falla (ej. servidor cayó tras el test), se avisa por consola
    // pero no enmascara el resultado del test ya ejecutado.
    afterEach(async function () {
        this.timeout(10000);
        while (creados.length > 0) {
            const { aspiranteId, inscripcionId } = creados.pop();
            if (inscripcionId) {
                try {
                    await inscripcionesDao.eliminar(inscripcionId);
                } catch (e) {
                    console.warn(`[cleanup] No se pudo eliminar inscripción ${inscripcionId}: ${e.message}`);
                }
            }
            if (aspiranteId) {
                try {
                    await aspirantesDao.eliminar(aspiranteId);
                } catch (e) {
                    console.warn(`[cleanup] No se pudo eliminar aspirante ${aspiranteId}: ${e.message}`);
                }
            }
        }
    });

    // ── POST /aspirantes/{id}/inscripciones ───────────────────────────────────

    describe('POST /aspirantes/{id}/inscripciones — crear inscripción', () => {

        it('debe retornar una InscripcionPrueba mapeada con id cuando el backend responde 201', async function () {
            this.timeout(15000);

            // Precondición 1: obtener prueba activa
            // Sin try/catch: TypeError si el servidor está apagado → test falla correctamente
            const pruebas = await pruebasDao.obtenerActivas();

            if (pruebas.length === 0) {
                // Precondición de datos: no hay proceso activo — skip legítimo (no es fallo del servidor)
                this.skip();
                return;
            }

            // Precondición 2: crear aspirante
            const datos = generarDatos();
            const aspirante = await aspirantesDao.crear(datos);
            creados.push({ aspiranteId: aspirante.id, inscripcionId: null }); // registrar para limpieza

            // Flujo principal: inscribir al aspirante en la prueba activa
            const pruebaId    = pruebas[0].idPruebaAdmision;
            const inscripcion = await aspirantesDao.crearInscripcion(aspirante.id, pruebaId);

            // Actualizar el registro de limpieza con el ID de inscripción
            creados[creados.length - 1].inscripcionId = inscripcion.idInscripcionPrueba;

            expect(inscripcion).to.be.instanceOf(InscripcionPrueba);
            expect(inscripcion.idInscripcionPrueba).to.be.a('string').and.not.equal('');
            expect(inscripcion.estado).to.be.a('string');
        });
    });

    // ── GET /inscripciones_prueba/{id} ────────────────────────────────────────

    describe('GET /inscripciones_prueba/{id} — obtener inscripción por ID', () => {

        it('debe retornar la misma InscripcionPrueba al consultar por el ID recién creado', async function () {
            this.timeout(15000);

            // Precondición: obtener prueba activa
            const pruebas = await pruebasDao.obtenerActivas();

            if (pruebas.length === 0) {
                this.skip();
                return;
            }

            // Precondición: crear aspirante e inscripción
            const datos      = generarDatos();
            const aspirante  = await aspirantesDao.crear(datos);
            creados.push({ aspiranteId: aspirante.id, inscripcionId: null });

            const pruebaId    = pruebas[0].idPruebaAdmision;
            const inscripcion = await aspirantesDao.crearInscripcion(aspirante.id, pruebaId);
            creados[creados.length - 1].inscripcionId = inscripcion.idInscripcionPrueba;

            // Flujo principal: obtener la inscripción por ID vía InscripcionesDao
            const resultado = await inscripcionesDao.obtenerPorId(inscripcion.idInscripcionPrueba);

            expect(resultado).to.be.instanceOf(InscripcionPrueba);
            expect(resultado.idInscripcionPrueba).to.equal(inscripcion.idInscripcionPrueba);
            expect(resultado.estado).to.be.a('string');
        });
    });
});
