import { expect } from './lib/chai/index.js';
import sinon from './lib/sinon/sinon.js';
import EtapasController from '../../js/control/etapas_controller.js';
import EtapasDao from '../../js/control/etapas_dao.js';
import EtapasAdmision from '../../js/entity/EtapasAdmision.js';
import { store, resetStore } from '../../js/infra/app_state.js';

describe('EtapasController - Pruebas Unitarias', () => {
    let ctrl;

    const mockEtapa1 = new EtapasAdmision('uuid-e1', 'Primera ronda', 0, 100, 'Ronda inicial', 30);
    const mockEtapa2 = new EtapasAdmision('uuid-e2', 'Segunda ronda', 0, 100, 'Ronda final', 20);

    beforeEach(() => {
        ctrl = new EtapasController();
        sinon.restoreAll();
        resetStore();
    });

    afterEach(() => {
        sinon.restoreAll();
        resetStore();
    });

    // ── Constructor ──────────────────────────────────────────────────────────
    describe('Constructor', () => {
        it('debe crear una instancia de EtapasController', () => {
            expect(ctrl).to.be.instanceOf(EtapasController);
        });
        it('debe inicializar etapasDao', () => {
            expect(ctrl.etapasDao).to.be.instanceOf(EtapasDao);
        });
    });

    // ── cargarTodas ──────────────────────────────────────────────────────────
    describe('cargarTodas', () => {
        it('debe retornar el array de etapas del DAO', async () => {
            sinon.stub(ctrl.etapasDao, 'obtenerTodas').resolves([mockEtapa1, mockEtapa2]);

            const resultado = await ctrl.cargarTodas();

            expect(resultado).to.deep.equal([mockEtapa1, mockEtapa2]);
        });

        it('debe llamar a obtenerTodas exactamente una vez', async () => {
            let callCount = 0;
            ctrl.etapasDao.obtenerTodas = () => { callCount++; return Promise.resolve([mockEtapa1]); };

            await ctrl.cargarTodas();

            expect(callCount).to.equal(1);
        });

        it('debe retornar array vacío si no hay etapas', async () => {
            sinon.stub(ctrl.etapasDao, 'obtenerTodas').resolves([]);

            const resultado = await ctrl.cargarTodas();

            expect(resultado).to.be.an('array');
            expect(resultado.length).to.equal(0);
        });

        it('debe propagar error del DAO', async () => {
            sinon.stub(ctrl.etapasDao, 'obtenerTodas')
                .rejects(new Error('Error HTTP: 500'));

            try {
                await ctrl.cargarTodas();
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
            }
        });

        it('debe restablecer store.loading a false incluso cuando el DAO falla', async () => {
            sinon.stub(ctrl.etapasDao, 'obtenerTodas')
                .rejects(new Error('Error HTTP: 500'));

            try { await ctrl.cargarTodas(); } catch { /* esperado */ }

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

        it('debe llamar a obtenerPorId con el ID correcto', async () => {
            let capturedId;
            ctrl.etapasDao.obtenerPorId = (id) => { capturedId = id; return Promise.resolve(mockEtapa1); };

            await ctrl.cargarPorId('uuid-e1');

            expect(capturedId).to.equal('uuid-e1');
        });

        it('debe escribir la etapa cargada en store.etapa', async () => {
            sinon.stub(ctrl.etapasDao, 'obtenerPorId').resolves(mockEtapa1);

            await ctrl.cargarPorId('uuid-e1');

            expect(store.etapa).to.equal(mockEtapa1);
        });

        it('debe retornar la etapa cargada', async () => {
            sinon.stub(ctrl.etapasDao, 'obtenerPorId').resolves(mockEtapa1);

            const resultado = await ctrl.cargarPorId('uuid-e1');

            expect(resultado).to.equal(mockEtapa1);
        });

        it('debe propagar error 404 del DAO', async () => {
            sinon.stub(ctrl.etapasDao, 'obtenerPorId')
                .rejects(new Error('Error HTTP: 404'));

            try {
                await ctrl.cargarPorId('uuid-no-existe');
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
            }
        });

        it('debe restablecer store.loading a false incluso cuando el DAO falla', async () => {
            sinon.stub(ctrl.etapasDao, 'obtenerPorId')
                .rejects(new Error('Error HTTP: 500'));

            try { await ctrl.cargarPorId('uuid-e1'); } catch { /* esperado */ }

            expect(store.loading).to.be.false;
        });
    });

    // ── seleccionarEtapa ─────────────────────────────────────────────────────
    describe('seleccionarEtapa', () => {
        it('debe escribir la etapa en store.etapa y retornarla', () => {
            const resultado = ctrl.seleccionarEtapa(mockEtapa1);

            expect(resultado).to.equal(mockEtapa1);
            expect(store.etapa).to.equal(mockEtapa1);
        });

        it('debe retornar null si la etapa no tiene idEtapaAdmision', () => {
            const etapaInvalida = { nombre: 'Sin ID' };

            const resultado = ctrl.seleccionarEtapa(etapaInvalida);

            expect(resultado).to.be.null;
        });

        it('debe retornar null si se pasa null como etapa', () => {
            const resultado = ctrl.seleccionarEtapa(null);

            expect(resultado).to.be.null;
        });

        it('debe retornar null si se pasa undefined como etapa', () => {
            const resultado = ctrl.seleccionarEtapa(undefined);

            expect(resultado).to.be.null;
        });

        it('NO debe modificar store.etapa cuando la etapa es inválida', () => {
            store.etapa = mockEtapa1;

            ctrl.seleccionarEtapa({ nombre: 'Sin ID' });

            expect(store.etapa).to.equal(mockEtapa1);
        });

        it('debe permitir cambiar la etapa seleccionada por otra válida', () => {
            store.etapa = mockEtapa1;

            const resultado = ctrl.seleccionarEtapa(mockEtapa2);

            expect(resultado).to.equal(mockEtapa2);
            expect(store.etapa).to.equal(mockEtapa2);
        });
    });
});
