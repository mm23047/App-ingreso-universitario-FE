import { expect } from './lib/chai/index.js';
import sinon from './lib/sinon/sinon.js';
import AreasController from '../../js/control/areas_controller.js';
import AreasConocimientoDao from '../../js/control/areas_dao.js';
import AreaConocimiento from '../../js/entity/AreaConocimiento.js';
import Tema from '../../js/entity/Tema.js';
import { store, resetStore } from '../../js/infra/app_state.js';

describe('AreasController - Pruebas Unitarias', () => {
    let ctrl;

    const mockAreas = [
        new AreaConocimiento('uuid-a1', 'Matemáticas'),
        new AreaConocimiento('uuid-a2', 'Ciencias')
    ];

    const mockTemas = [
        new Tema('uuid-t1', 'Álgebra', new AreaConocimiento('uuid-a1', 'Matemáticas')),
        new Tema('uuid-t2', 'Geometría', new AreaConocimiento('uuid-a1', 'Matemáticas'))
    ];

    const mockArbolPrueba = [
        {
            idAreaConocimiento: 'uuid-a1',
            nombreArea: 'Matemáticas',
            temas: [
                { idTema: 'uuid-t1', nombreTema: 'Álgebra' },
                { idTema: 'uuid-t2', nombreTema: 'Geometría' }
            ]
        },
        {
            idAreaConocimiento: 'uuid-a2',
            nombreArea: 'Ciencias',
            temas: [
                { idTema: 'uuid-t3', nombreTema: 'Física' }
            ]
        }
    ];

    beforeEach(() => {
        ctrl = new AreasController();
        sinon.restoreAll();
        resetStore();
    });

    afterEach(() => {
        sinon.restoreAll();
        resetStore();
    });

    // ── Constructor ──────────────────────────────────────────────────────────
    describe('Constructor', () => {
        it('debe crear una instancia de AreasController', () => {
            expect(ctrl).to.be.instanceOf(AreasController);
        });
        it('debe inicializar areasDao', () => {
            expect(ctrl.areasDao).to.be.instanceOf(AreasConocimientoDao);
        });
    });

    // ── cargarTodas ──────────────────────────────────────────────────────────
    describe('cargarTodas', () => {
        it('debe retornar el array de AreaConocimiento del DAO', async () => {
            sinon.stub(ctrl.areasDao, 'obtenerTodas').resolves(mockAreas);

            const resultado = await ctrl.cargarTodas();

            expect(resultado).to.deep.equal(mockAreas);
        });

        it('debe llamar a obtenerTodas exactamente una vez', async () => {
            let callCount = 0;
            ctrl.areasDao.obtenerTodas = () => { callCount++; return Promise.resolve(mockAreas); };

            await ctrl.cargarTodas();

            expect(callCount).to.equal(1);
        });

        it('debe propagar error del DAO', async () => {
            sinon.stub(ctrl.areasDao, 'obtenerTodas')
                .rejects(new Error('Error HTTP: 500'));

            try {
                await ctrl.cargarTodas();
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
            }
        });

        it('debe restablecer store.loading a false incluso cuando el DAO falla', async () => {
            sinon.stub(ctrl.areasDao, 'obtenerTodas')
                .rejects(new Error('Error HTTP: 500'));

            try { await ctrl.cargarTodas(); } catch { /* esperado */ }

            expect(store.loading).to.be.false;
        });

        it('debe retornar array vacío si no hay áreas', async () => {
            sinon.stub(ctrl.areasDao, 'obtenerTodas').resolves([]);

            const resultado = await ctrl.cargarTodas();

            expect(resultado).to.be.an('array');
            expect(resultado.length).to.equal(0);
        });
    });

    // ── cargarTemasPorArea ───────────────────────────────────────────────────
    describe('cargarTemasPorArea', () => {
        it('debe lanzar error si no se proporciona idArea', async () => {
            try {
                await ctrl.cargarTemasPorArea();
                expect.fail();
            } catch (e) {
                expect(e.message).to.include('requerido');
            }
        });

        it('debe llamar a obtenerTemasPorArea con el idArea correcto', async () => {
            let capturedId;
            ctrl.areasDao.obtenerTemasPorArea = (id) => { capturedId = id; return Promise.resolve(mockTemas); };

            await ctrl.cargarTemasPorArea('uuid-a1');

            expect(capturedId).to.equal('uuid-a1');
        });

        it('debe retornar el array de temas del DAO', async () => {
            sinon.stub(ctrl.areasDao, 'obtenerTemasPorArea').resolves(mockTemas);

            const resultado = await ctrl.cargarTemasPorArea('uuid-a1');

            expect(resultado).to.deep.equal(mockTemas);
        });

        it('debe propagar error del DAO', async () => {
            sinon.stub(ctrl.areasDao, 'obtenerTemasPorArea')
                .rejects(new Error('Error HTTP: 404'));

            try {
                await ctrl.cargarTemasPorArea('uuid-no-existe');
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
            }
        });
    });

    // ── cargarPorPrueba — árbol de conocimiento ──────────────────────────────
    describe('cargarPorPrueba — árbol de áreas y temas de una prueba', () => {
        it('debe lanzar error si no se proporciona idPrueba', async () => {
            try {
                await ctrl.cargarPorPrueba();
                expect.fail();
            } catch (e) {
                expect(e.message).to.include('requerido');
            }
        });

        it('debe llamar a obtenerAreasPorPrueba con el idPrueba correcto', async () => {
            let capturedId;
            ctrl.areasDao.obtenerAreasPorPrueba = (id) => { capturedId = id; return Promise.resolve(mockArbolPrueba); };

            await ctrl.cargarPorPrueba('uuid-prueba-1');

            expect(capturedId).to.equal('uuid-prueba-1');
        });

        it('debe retornar el árbol área→temas tal como lo entrega el DAO', async () => {
            sinon.stub(ctrl.areasDao, 'obtenerAreasPorPrueba').resolves(mockArbolPrueba);

            const resultado = await ctrl.cargarPorPrueba('uuid-prueba-1');

            expect(resultado).to.be.an('array');
            expect(resultado.length).to.equal(2);
            expect(resultado[0].idAreaConocimiento).to.equal('uuid-a1');
            expect(resultado[0].temas).to.be.an('array');
            expect(resultado[0].temas.length).to.equal(2);
        });

        it('debe preservar la estructura anidada de temas sin modificarla', async () => {
            sinon.stub(ctrl.areasDao, 'obtenerAreasPorPrueba').resolves(mockArbolPrueba);

            const resultado = await ctrl.cargarPorPrueba('uuid-prueba-1');

            expect(resultado[1].temas[0].idTema).to.equal('uuid-t3');
            expect(resultado[1].temas[0].nombreTema).to.equal('Física');
        });

        it('debe retornar array vacío si la prueba no tiene áreas asignadas', async () => {
            sinon.stub(ctrl.areasDao, 'obtenerAreasPorPrueba').resolves([]);

            const resultado = await ctrl.cargarPorPrueba('uuid-prueba-1');

            expect(resultado).to.deep.equal([]);
        });

        it('debe propagar error cuando el DAO falla', async () => {
            sinon.stub(ctrl.areasDao, 'obtenerAreasPorPrueba')
                .rejects(new Error('Error HTTP: 500'));

            try {
                await ctrl.cargarPorPrueba('uuid-prueba-1');
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
            }
        });

        it('debe restablecer store.loading a false incluso cuando el DAO falla', async () => {
            sinon.stub(ctrl.areasDao, 'obtenerAreasPorPrueba')
                .rejects(new Error('Error HTTP: 500'));

            try { await ctrl.cargarPorPrueba('uuid-prueba-1'); } catch { /* esperado */ }

            expect(store.loading).to.be.false;
        });
    });
});
