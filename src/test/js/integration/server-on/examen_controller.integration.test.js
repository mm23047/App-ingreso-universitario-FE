import { expect }          from '../../lib/chai/index.js';
import ExamenController    from '../../../../js/control/examen_controller.js';
import AspirantesDao       from '../../../../js/control/aspirantes_dao.js';
import PruebasAdmisionDao  from '../../../../js/control/pruebas_admision_dao.js';
import Aspirante           from '../../../../js/entity/Aspirante.js';
import InscripcionPrueba   from '../../../../js/entity/InscripcionPrueba.js';
import { store, resetStore } from '../../../../js/infra/app_state.js';

// UUID con formato válido pero garantizado inexistente en la BD de test
const UUID_INEXISTENTE = '00000000-dead-beef-dead-000000000000';

function generarDatos(prefijo = 'examen') {
    const n = Math.floor(Math.random() * 99999999);
    const d = Math.floor(Math.random() * 9);
    return {
        nombres:         'Test Examen Ctrl',
        apellidos:       'Integración',
        dui:             `${String(n).padStart(8, '0')}-${d}`,
        fechaNacimiento: '2001-06-15',
        correo:          `${prefijo}.ctrl.on.${Date.now()}.${n}@tpi-test.sv`,
        usaSillaRuedas:  false
    };
}

describe('ExamenController — Integración con backend', () => {
    let ctrl;
    let aspirantesDao;
    let pruebasDao;

    // Pares { aspiranteId, inscripcionId } creados por cada test; drenados en afterEach.
    const creados = [];

    beforeEach(() => {
        ctrl          = new ExamenController();
        aspirantesDao = new AspirantesDao();
        pruebasDao    = new PruebasAdmisionDao();
        resetStore();
    });

    afterEach(async function () {
        this.timeout(10000);
        resetStore();
        while (creados.length > 0) {
            const { aspiranteId } = creados.pop();
            if (aspiranteId) {
                try {
                    await aspirantesDao.eliminar(aspiranteId);
                } catch (e) {
                    console.warn(`[cleanup] No se pudo eliminar aspirante ${aspiranteId}: ${e.message}`);
                }
            }
        }
    });

    // ── consultarEstadoAspirante — CASO A (UUID) ──────────────────────────────

    describe('consultarEstadoAspirante() — CASO A (UUID)', () => {

        it('debe retornar { tipo:"nada" } para UUID totalmente desconocido en la BD', async function () {
            this.timeout(8000);

            const resultado = await ctrl.consultarEstadoAspirante(UUID_INEXISTENTE);

            expect(resultado).to.have.property('tipo', 'nada');
            expect(resultado.datos).to.deep.equal([]);
        });

        it('debe retornar { tipo:"solo_registrado" } para aspirante recién creado sin exámenes ni inscripciones', async function () {
            this.timeout(12000);

            const aspirante = await aspirantesDao.crear(generarDatos('solo'));
            creados.push({ aspiranteId: aspirante.id });

            const resultado = await ctrl.consultarEstadoAspirante(aspirante.id);

            expect(resultado).to.have.property('tipo', 'solo_registrado');
            expect(resultado.datos).to.not.be.null;
        });

        it('debe retornar { tipo:"inscripciones" } para aspirante con inscripción activa', async function () {
            this.timeout(15000);

            const pruebas = await pruebasDao.obtenerActivas();
            if (pruebas.length === 0) {
                this.skip(); // Sin proceso activo no hay inscripción posible
                return;
            }

            const aspirante = await aspirantesDao.crear(generarDatos('insc'));
            creados.push({ aspiranteId: aspirante.id });

            await aspirantesDao.crearInscripcion(aspirante.id, pruebas[0].idPruebaAdmision);

            const resultado = await ctrl.consultarEstadoAspirante(aspirante.id);

            expect(resultado).to.have.property('tipo', 'inscripciones');
            expect(resultado.datos).to.be.an('array').with.lengthOf.above(0);
            expect(resultado.datos[0]).to.be.instanceOf(InscripcionPrueba);
        });

        it('debe dejar store.loading en false al terminar con éxito', async function () {
            this.timeout(8000);

            await ctrl.consultarEstadoAspirante(UUID_INEXISTENTE);

            expect(store.loading).to.be.false;
        });
    });

    // ── consultarEstadoAspirante — CASO B (DUI / correo) ─────────────────────

    describe('consultarEstadoAspirante() — CASO B (DUI/correo)', () => {

        it('debe retornar { tipo:"nada" } para DUI que no existe en la BD', async function () {
            this.timeout(8000);

            const DUI_INEXISTENTE = '00000000-9';
            let resultado;

            try {
                resultado = await ctrl.consultarEstadoAspirante(DUI_INEXISTENTE);
            } catch (e) {
                // Si el endpoint GET /examen_realizado/buscar?dui= no está implementado
                // en el backend, el controller lanza error de servidor — skip legítimo.
                if (e.message?.includes('servidor')) {
                    this.skip();
                    return;
                }
                throw e;
            }

            expect(resultado).to.have.property('tipo', 'nada');
            expect(resultado.datos).to.deep.equal([]);
        });

        it('debe retornar { tipo:"solo_registrado" } para DUI de aspirante recién creado sin inscripciones', async function () {
            this.timeout(15000);

            const datos     = generarDatos('dui');
            const aspirante = await aspirantesDao.crear(datos);
            creados.push({ aspiranteId: aspirante.id });

            let resultado;
            try {
                resultado = await ctrl.consultarEstadoAspirante(datos.dui);
            } catch (e) {
                if (e.message?.includes('servidor')) {
                    this.skip();
                    return;
                }
                throw e;
            }

            expect(resultado).to.have.property('tipo', 'solo_registrado');
        });

        it('debe dejar store.loading en false al terminar (endpoint disponible o skip)', async function () {
            this.timeout(8000);

            try {
                await ctrl.consultarEstadoAspirante('00000000-9');
            } catch (e) {
                if (e.message?.includes('servidor')) {
                    this.skip();
                    return;
                }
                throw e;
            }

            expect(store.loading).to.be.false;
        });
    });

    // ── consultarInscripciones ────────────────────────────────────────────────

    describe('consultarInscripciones(aspiranteId)', () => {

        it('debe retornar array vacío para aspirante recién creado sin inscripciones', async function () {
            this.timeout(10000);

            const aspirante = await aspirantesDao.crear(generarDatos('insc'));
            creados.push({ aspiranteId: aspirante.id });

            const resultado = await ctrl.consultarInscripciones(aspirante.id);

            expect(resultado).to.be.an('array');
            expect(resultado).to.have.lengthOf(0);
        });

        it('debe retornar InscripcionPrueba[] para aspirante con inscripción activa', async function () {
            this.timeout(15000);

            const pruebas = await pruebasDao.obtenerActivas();
            if (pruebas.length === 0) {
                this.skip();
                return;
            }

            const aspirante = await aspirantesDao.crear(generarDatos('insc2'));
            creados.push({ aspiranteId: aspirante.id });

            await aspirantesDao.crearInscripcion(aspirante.id, pruebas[0].idPruebaAdmision);

            const resultado = await ctrl.consultarInscripciones(aspirante.id);

            expect(resultado).to.be.an('array').with.lengthOf.above(0);
            expect(resultado[0]).to.be.instanceOf(InscripcionPrueba);
        });

        it('debe dejar store.loading en false al terminar con éxito', async function () {
            this.timeout(10000);

            const aspirante = await aspirantesDao.crear(generarDatos('load'));
            creados.push({ aspiranteId: aspirante.id });

            await ctrl.consultarInscripciones(aspirante.id);

            expect(store.loading).to.be.false;
        });
    });

    // ── consultarResultados ───────────────────────────────────────────────────

    describe('consultarResultados(aspiranteId)', () => {

        it('debe retornar array vacío para aspirante sin exámenes realizados', async function () {
            this.timeout(10000);

            const aspirante = await aspirantesDao.crear(generarDatos('res'));
            creados.push({ aspiranteId: aspirante.id });

            const resultado = await ctrl.consultarResultados(aspirante.id);

            expect(resultado).to.be.an('array');
            expect(resultado).to.have.lengthOf(0);
        });

        it('debe dejar store.loading en false al terminar con éxito', async function () {
            this.timeout(8000);

            const aspirante = await aspirantesDao.crear(generarDatos('rload'));
            creados.push({ aspiranteId: aspirante.id });

            await ctrl.consultarResultados(aspirante.id);

            expect(store.loading).to.be.false;
        });
    });
});
