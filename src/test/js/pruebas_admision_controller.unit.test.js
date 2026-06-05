import { expect } from './lib/chai/index.js';
import sinon from './lib/sinon/sinon.js';
import PruebasAdmisionController from '../../js/control/pruebas_admision_controller.js';
import PruebasAdmisionDao from '../../js/control/pruebas_admision_dao.js';
import PruebaAdmision from '../../js/entity/PruebaAdmision.js';
import { store, resetStore } from '../../js/infra/app_state.js';

describe('PruebasAdmisionController - Pruebas Unitarias', () => {
    let ctrl;

    const mockPrueba2026 = new PruebaAdmision('uuid-p1', 'Proceso 2026', 2026, true);
    const mockPrueba2025 = new PruebaAdmision('uuid-p2', 'Proceso 2025', 2025, false);

    beforeEach(() => {
        ctrl = new PruebasAdmisionController();
        sinon.restoreAll();
        resetStore();
    });

    afterEach(() => {
        sinon.restoreAll();
        resetStore();
    });

    // ── Constructor ──────────────────────────────────────────────────────────
    describe('Constructor', () => {
        it('debe crear una instancia de PruebasAdmisionController', () => {
            expect(ctrl).to.be.instanceOf(PruebasAdmisionController);
        });
        it('debe inicializar un PruebasAdmisionDao', () => {
            expect(ctrl.pruebasDao).to.be.instanceOf(PruebasAdmisionDao);
        });
    });

    // ── cargarPruebaActiva ───────────────────────────────────────────────────
    describe('cargarPruebaActiva', () => {
        it('debe guardar pruebas[0] en store.prueba y retornarla', async () => {
            sinon.stub(ctrl.pruebasDao, 'obtenerActivas').resolves([mockPrueba2026]);

            const resultado = await ctrl.cargarPruebaActiva();

            expect(store.prueba).to.equal(mockPrueba2026);
            expect(resultado).to.equal(mockPrueba2026);
        });

        it('debe tomar SOLO la primera cuando el DAO devuelve varias pruebas activas', async () => {
            const otraPrueba = new PruebaAdmision('uuid-p3', 'Segunda', 2026, true);
            sinon.stub(ctrl.pruebasDao, 'obtenerActivas').resolves([mockPrueba2026, otraPrueba]);

            await ctrl.cargarPruebaActiva();

            expect(store.prueba.idPruebaAdmision).to.equal('uuid-p1');
        });

        it('debe limpiar store.prueba y retornar null si no hay pruebas activas', async () => {
            store.prueba = mockPrueba2026;
            sinon.stub(ctrl.pruebasDao, 'obtenerActivas').resolves([]);

            const resultado = await ctrl.cargarPruebaActiva();

            expect(resultado).to.be.null;
            expect(store.prueba).to.be.null;
        });

        it('debe propagar el error del DAO y NO modificar store.prueba', async () => {
            sinon.stub(ctrl.pruebasDao, 'obtenerActivas')
                .rejects(new Error('Error HTTP: 500'));

            try {
                await ctrl.cargarPruebaActiva();
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
                expect(store.prueba).to.be.null;
            }
        });

        it('debe restablecer store.loading a false incluso cuando el DAO falla', async () => {
            sinon.stub(ctrl.pruebasDao, 'obtenerActivas')
                .rejects(new Error('Error HTTP: 500'));

            try { await ctrl.cargarPruebaActiva(); } catch { /* esperado */ }

            expect(store.loading).to.be.false;
        });
    });

    // ── cargarPorId ──────────────────────────────────────────────────────────
    describe('cargarPorId', () => {
        it('debe lanzar error si el ID no se proporciona', async () => {
            try {
                await ctrl.cargarPorId();
                expect.fail();
            } catch (e) {
                expect(e.message).to.include('requerido');
            }
        });

        it('debe guardar la prueba cargada en store.prueba', async () => {
            sinon.stub(ctrl.pruebasDao, 'obtenerPorId').resolves(mockPrueba2026);

            await ctrl.cargarPorId('uuid-p1');

            expect(store.prueba).to.equal(mockPrueba2026);
        });

        it('debe retornar la prueba cargada', async () => {
            sinon.stub(ctrl.pruebasDao, 'obtenerPorId').resolves(mockPrueba2026);

            const resultado = await ctrl.cargarPorId('uuid-p1');

            expect(resultado).to.equal(mockPrueba2026);
        });

        it('debe propagar error 404 del DAO', async () => {
            sinon.stub(ctrl.pruebasDao, 'obtenerPorId')
                .rejects(new Error('Error HTTP: 404'));

            try {
                await ctrl.cargarPorId('uuid-no-existe');
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
            }
        });
    });

    // ── cargarTodas — filtrado por nombre o año ──────────────────────────────
    describe('cargarTodas — consulta de procesos con filtro', () => {
        it('debe pasar first=0 y max=50 por defecto al DAO', async () => {
            let capturedArgs;
            ctrl.pruebasDao.obtenerTodas = (...args) => { capturedArgs = args; return Promise.resolve([]); };

            await ctrl.cargarTodas();

            expect(capturedArgs[0]).to.equal(0);
            expect(capturedArgs[1]).to.equal(50);
        });

        it('debe pasar buscar vacío al DAO cuando no hay término de búsqueda', async () => {
            let capturedArgs;
            ctrl.pruebasDao.obtenerTodas = (...args) => { capturedArgs = args; return Promise.resolve([]); };

            await ctrl.cargarTodas();

            expect(capturedArgs[2]).to.equal('');
        });

        it('debe pasar el texto de búsqueda exacto al DAO', async () => {
            let capturedArgs;
            ctrl.pruebasDao.obtenerTodas = (...args) => { capturedArgs = args; return Promise.resolve([mockPrueba2026]); };

            await ctrl.cargarTodas(0, 50, 'Proceso 2026');

            expect(capturedArgs[2]).to.equal('Proceso 2026');
        });

        it('debe pasar el año como string al DAO (el DAO filtra por nombre O año exacto)', async () => {
            let capturedArgs;
            ctrl.pruebasDao.obtenerTodas = (...args) => { capturedArgs = args; return Promise.resolve([mockPrueba2026]); };

            await ctrl.cargarTodas(0, 50, '2026');

            expect(capturedArgs[2]).to.equal('2026');
        });

        it('debe respetar first y max personalizados', async () => {
            let capturedArgs;
            ctrl.pruebasDao.obtenerTodas = (...args) => { capturedArgs = args; return Promise.resolve([]); };

            await ctrl.cargarTodas(10, 25, '');

            expect(capturedArgs[0]).to.equal(10);
            expect(capturedArgs[1]).to.equal(25);
        });

        it('en modo silencioso NO debe cambiar store.loading', async () => {
            sinon.stub(ctrl.pruebasDao, 'obtenerTodas').resolves([]);
            store.loading = false;

            await ctrl.cargarTodas(0, 50, '', true);

            expect(store.loading).to.be.false;
        });

        it('en modo no-silencioso debe activar store.loading durante la petición', async () => {
            const loadingDurantePeticion = [];
            ctrl.pruebasDao.obtenerTodas = () => {
                loadingDurantePeticion.push(store.loading);
                return Promise.resolve([]);
            };

            await ctrl.cargarTodas(0, 50, '', false);

            expect(loadingDurantePeticion[0]).to.be.true;
            expect(store.loading).to.be.false;
        });

        it('debe retornar el array de pruebas tal como lo devuelve el DAO', async () => {
            sinon.stub(ctrl.pruebasDao, 'obtenerTodas')
                .resolves([mockPrueba2026, mockPrueba2025]);

            const resultado = await ctrl.cargarTodas();

            expect(resultado.length).to.equal(2);
            expect(resultado[0]).to.equal(mockPrueba2026);
        });

        it('debe propagar error del DAO', async () => {
            sinon.stub(ctrl.pruebasDao, 'obtenerTodas')
                .rejects(new Error('Error HTTP: 500'));

            try {
                await ctrl.cargarTodas();
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
            }
        });
    });
});
