import { expect }        from '../../lib/chai/index.js';
import CarrerasElegidaDao from '../../../../js/control/carreras_elegida_dao.js';
import InscripcionesDao   from '../../../../js/control/inscripciones_dao.js';
import AspirantesDao      from '../../../../js/control/aspirantes_dao.js';
import PruebasAdmisionDao from '../../../../js/control/pruebas_admision_dao.js';
import CarrerasDao        from '../../../../js/control/carreras_dao.js';
import CarrerasElegida    from '../../../../js/entity/CarrerasElegida.js';

// Genera un aspirante de prueba con DUI y correo únicos.
function generarDatos() {
    const n = Math.floor(Math.random() * 99999999);
    const d = Math.floor(Math.random() * 9);
    return {
        nombres:         'Test CarreraEleg',
        apellidos:       'Elegida Prueba',
        dui:             `${String(n).padStart(8, '0')}-${d}`,
        fechaNacimiento: '2001-06-15',
        correo:          `celegida.int.${Date.now()}.${n}@tpi-test.sv`,
        usaSillaRuedas:  false
    };
}

describe('CarrerasElegidaDao — Integración con backend', () => {
    let carrerasElegidaDao;
    let aspirantesDao;
    let inscripcionesDao;
    let pruebasDao;
    let carrerasDao;

    // Pares { aspiranteId, inscripcionId, carrerasIds: string[] } para limpieza FK en afterEach.
    // Orden de borrado: carrera_elegida → inscripcion → aspirante.
    const creados = [];

    beforeEach(() => {
        carrerasElegidaDao = new CarrerasElegidaDao();
        aspirantesDao      = new AspirantesDao();
        inscripcionesDao   = new InscripcionesDao();
        pruebasDao         = new PruebasAdmisionDao();
        carrerasDao        = new CarrerasDao();
    });

    afterEach(async function () {
        this.timeout(15000);
        while (creados.length > 0) {
            const { aspiranteId, inscripcionId, carrerasIds } = creados.pop();
            for (const idCarrera of (carrerasIds ?? [])) {
                try { await carrerasElegidaDao.eliminarCarrera(inscripcionId, idCarrera); }
                catch (e) { console.warn(`[cleanup] carrera ${idCarrera}: ${e.message}`); }
            }
            if (inscripcionId) {
                try { await inscripcionesDao.eliminar(inscripcionId); }
                catch (e) { console.warn(`[cleanup] inscripcion ${inscripcionId}: ${e.message}`); }
            }
            if (aspiranteId) {
                try { await aspirantesDao.eliminar(aspiranteId); }
                catch (e) { console.warn(`[cleanup] aspirante ${aspiranteId}: ${e.message}`); }
            }
        }
    });

    // ── POST /inscripciones_prueba/{id}/carreras ──────────────────────────────

    describe('POST /inscripciones_prueba/{id}/carreras — agregar carrera elegida', () => {

        it('debe retornar CarrerasElegida mapeada con prioridad 1 cuando el backend responde 201', async function () {
            this.timeout(20000);

            const pruebas = await pruebasDao.obtenerActivas();
            if (pruebas.length === 0) { this.skip(); return; }

            const carreras = await carrerasDao.obtenerTodas();
            if (carreras.length === 0) { this.skip(); return; }

            const aspirante   = await aspirantesDao.crear(generarDatos());
            const registro    = { aspiranteId: aspirante.id, inscripcionId: null, carrerasIds: [] };
            creados.push(registro);

            const inscripcion = await aspirantesDao.crearInscripcion(aspirante.id, pruebas[0].idPruebaAdmision);
            registro.inscripcionId = inscripcion.idInscripcionPrueba;

            const idCarrera   = carreras[0].idCarrera;
            const elegida     = await carrerasElegidaDao.agregarCarrera(inscripcion.idInscripcionPrueba, idCarrera, 1);
            registro.carrerasIds.push(idCarrera);

            expect(elegida).to.be.instanceOf(CarrerasElegida);
            expect(elegida.prioridad).to.equal(1);
            expect(elegida.catalogoCarrera).to.not.be.null;
        });
    });

    // ── GET /inscripciones_prueba/{id}/carreras ───────────────────────────────

    describe('GET /inscripciones_prueba/{id}/carreras — obtener carreras de la inscripción', () => {

        it('debe retornar un array que incluya la carrera recién agregada', async function () {
            this.timeout(20000);

            const pruebas = await pruebasDao.obtenerActivas();
            if (pruebas.length === 0) { this.skip(); return; }

            const carreras = await carrerasDao.obtenerTodas();
            if (carreras.length === 0) { this.skip(); return; }

            const aspirante   = await aspirantesDao.crear(generarDatos());
            const registro    = { aspiranteId: aspirante.id, inscripcionId: null, carrerasIds: [] };
            creados.push(registro);

            const inscripcion = await aspirantesDao.crearInscripcion(aspirante.id, pruebas[0].idPruebaAdmision);
            registro.inscripcionId = inscripcion.idInscripcionPrueba;

            const idCarrera   = carreras[0].idCarrera;
            await carrerasElegidaDao.agregarCarrera(inscripcion.idInscripcionPrueba, idCarrera, 1);
            registro.carrerasIds.push(idCarrera);

            const resultado = await carrerasElegidaDao.obtenerPorInscripcion(inscripcion.idInscripcionPrueba);

            expect(resultado).to.be.an('array').with.length.at.least(1);
            expect(resultado[0]).to.be.instanceOf(CarrerasElegida);
            const idsObtenidos = resultado.map(e => e.catalogoCarrera?.idCarrera);
            expect(idsObtenidos).to.include(idCarrera);
        });
    });
});
