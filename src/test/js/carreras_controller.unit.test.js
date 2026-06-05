import { expect } from './lib/chai/index.js';
import sinon from './lib/sinon/sinon.js';
import CarrerasController from '../../js/control/carreras_controller.js';
import CarrerasDao from '../../js/control/carreras_dao.js';
import Carrera from '../../js/entity/Carrera.js';
import { store, resetStore } from '../../js/infra/app_state.js';

describe('CarrerasController - Pruebas Unitarias', () => {
    let ctrl;

    const mockCarreras = [
        new Carrera('IC', 'Ingeniería Civil'),
        new Carrera('IS', 'Ingeniería de Sistemas'),
        new Carrera('MED', 'Medicina')
    ];

    beforeEach(() => {
        ctrl = new CarrerasController();
        sinon.restoreAll();
        resetStore();
    });

    afterEach(() => {
        sinon.restoreAll();
        resetStore();
    });

    // ── Constructor ──────────────────────────────────────────────────────────
    describe('Constructor', () => {
        it('debe crear una instancia de CarrerasController', () => {
            expect(ctrl).to.be.instanceOf(CarrerasController);
        });
        it('debe inicializar carrerasDao', () => {
            expect(ctrl.carrerasDao).to.be.instanceOf(CarrerasDao);
        });
    });

    // ── cargarTodas ──────────────────────────────────────────────────────────
    describe('cargarTodas', () => {
        it('debe guardar las carreras en store.carreras', async () => {
            sinon.stub(ctrl.carrerasDao, 'obtenerTodas').resolves(mockCarreras);

            await ctrl.cargarTodas();

            expect(store.carreras).to.deep.equal(mockCarreras);
        });

        it('debe retornar el array de carreras', async () => {
            sinon.stub(ctrl.carrerasDao, 'obtenerTodas').resolves(mockCarreras);

            const resultado = await ctrl.cargarTodas();

            expect(resultado).to.deep.equal(mockCarreras);
        });

        it('debe llamar a obtenerTodas exactamente una vez', async () => {
            let callCount = 0;
            ctrl.carrerasDao.obtenerTodas = () => { callCount++; return Promise.resolve(mockCarreras); };

            await ctrl.cargarTodas();

            expect(callCount).to.equal(1);
        });

        it('debe guardar store.carreras como array vacío si el DAO devuelve []', async () => {
            sinon.stub(ctrl.carrerasDao, 'obtenerTodas').resolves([]);

            await ctrl.cargarTodas();

            expect(store.carreras).to.be.an('array');
            expect(store.carreras.length).to.equal(0);
        });

        it('debe propagar error del DAO', async () => {
            sinon.stub(ctrl.carrerasDao, 'obtenerTodas')
                .rejects(new Error('Error HTTP: 500'));

            try {
                await ctrl.cargarTodas();
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
            }
        });

        it('debe restablecer store.loading a false incluso cuando el DAO falla', async () => {
            sinon.stub(ctrl.carrerasDao, 'obtenerTodas')
                .rejects(new Error('Error HTTP: 500'));

            try { await ctrl.cargarTodas(); } catch { /* esperado */ }

            expect(store.loading).to.be.false;
        });
    });

    // ── seleccionarCarrera ───────────────────────────────────────────────────
    describe('seleccionarCarrera', () => {
        beforeEach(() => {
            store.carreras = mockCarreras;
        });

        it('debe retornar la carrera encontrada y guardarla en store.carreraSeleccionada', () => {
            const resultado = ctrl.seleccionarCarrera('IS');

            expect(resultado).to.equal(mockCarreras[1]);
            expect(store.carreraSeleccionada).to.equal(mockCarreras[1]);
        });

        it('debe retornar null si el idCarrera no existe en store.carreras', () => {
            const resultado = ctrl.seleccionarCarrera('XYZ');

            expect(resultado).to.be.null;
        });

        it('NO debe modificar store.carreraSeleccionada si la carrera no existe', () => {
            store.carreraSeleccionada = mockCarreras[0];

            ctrl.seleccionarCarrera('XYZ');

            expect(store.carreraSeleccionada).to.equal(mockCarreras[0]);
        });

        it('debe encontrar la primera carrera correctamente', () => {
            const resultado = ctrl.seleccionarCarrera('IC');

            expect(resultado.idCarrera).to.equal('IC');
        });

        it('debe encontrar la última carrera del array', () => {
            const resultado = ctrl.seleccionarCarrera('MED');

            expect(resultado.idCarrera).to.equal('MED');
            expect(resultado.nombreCatalogoCarrera).to.equal('Medicina');
        });

        it('debe retornar null si store.carreras está vacío', () => {
            store.carreras = [];

            const resultado = ctrl.seleccionarCarrera('IC');

            expect(resultado).to.be.null;
        });
    });
});
