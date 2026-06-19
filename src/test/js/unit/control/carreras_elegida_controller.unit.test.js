import { expect } from '../../lib/chai/index.js';
import sinon from '../../lib/sinon/sinon.js';
import CarrerasElegidaController from '../../../../js/control/carreras_elegida_controller.js';
import CarrerasElegidaDao from '../../../../js/control/carreras_elegida_dao.js';
import CarrerasElegida from '../../../../js/entity/CarrerasElegida.js';
import { store, resetStore } from '../../../../js/infra/app_state.js';

describe('CarrerasElegidaController - Pruebas Unitarias', () => {
    let ctrl;

    const mockElegida1 = new CarrerasElegida(
        { idInscripcion: 'uuid-insc-1', idCarrera: 'IC' }, null,
        { idCarrera: 'IC', nombreCatalogoCarrera: 'Ingeniería Civil' }, 1
    );
    const mockElegida2 = new CarrerasElegida(
        { idInscripcion: 'uuid-insc-1', idCarrera: 'IS' }, null,
        { idCarrera: 'IS', nombreCatalogoCarrera: 'Ing. Sistemas' }, 2
    );

    beforeEach(() => {
        ctrl = new CarrerasElegidaController();
        sinon.restoreAll();
        resetStore();
    });

    afterEach(() => {
        sinon.restoreAll();
        resetStore();
    });

    // ── Constructor ──────────────────────────────────────────────────────────
    describe('Constructor', () => {
        it('debe crear una instancia de CarrerasElegidaController', () => {
            expect(ctrl).to.be.instanceOf(CarrerasElegidaController);
        });
        it('debe inicializar carrerasElegidaDao', () => {
            expect(ctrl.carrerasElegidaDao).to.be.instanceOf(CarrerasElegidaDao);
        });
    });

    // ── agregarCarrera ───────────────────────────────────────────────────────
    describe('agregarCarrera', () => {
        it('debe lanzar error si no se proporciona inscripcionId', async () => {
            try {
                await ctrl.agregarCarrera(null, 'IC', 1);
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
            }
        });

        it('debe lanzar error si no se proporciona idCarrera', async () => {
            try {
                await ctrl.agregarCarrera('uuid-insc-1', null, 1);
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
            }
        });

        it('debe llamar a DAO.agregarCarrera con los parámetros correctos', async () => {
            let capturedArgs;
            ctrl.carrerasElegidaDao.agregarCarrera = (...args) => { capturedArgs = args; return Promise.resolve(mockElegida1); };

            await ctrl.agregarCarrera('uuid-insc-1', 'IC', 1);

            expect(capturedArgs[0]).to.equal('uuid-insc-1');
            expect(capturedArgs[1]).to.equal('IC');
            expect(capturedArgs[2]).to.equal(1);
        });

        it('debe usar prioridad 1 por defecto', async () => {
            let capturedArgs;
            ctrl.carrerasElegidaDao.agregarCarrera = (...args) => { capturedArgs = args; return Promise.resolve(mockElegida1); };

            await ctrl.agregarCarrera('uuid-insc-1', 'IC');

            expect(capturedArgs[2]).to.equal(1);
        });

        it('debe añadir la nueva carrera elegida al array store.carrerasElegidas existente', async () => {
            store.carrerasElegidas = [mockElegida1];
            sinon.stub(ctrl.carrerasElegidaDao, 'agregarCarrera').resolves(mockElegida2);

            await ctrl.agregarCarrera('uuid-insc-1', 'IS', 2);

            expect(store.carrerasElegidas.length).to.equal(2);
            expect(store.carrerasElegidas[1]).to.equal(mockElegida2);
        });

        it('debe inicializar store.carrerasElegidas con la primera carrera si estaba vacío', async () => {
            sinon.stub(ctrl.carrerasElegidaDao, 'agregarCarrera').resolves(mockElegida1);

            await ctrl.agregarCarrera('uuid-insc-1', 'IC', 1);

            expect(store.carrerasElegidas).to.be.an('array');
            expect(store.carrerasElegidas.length).to.equal(1);
        });

        it('debe retornar la carrera elegida creada', async () => {
            sinon.stub(ctrl.carrerasElegidaDao, 'agregarCarrera').resolves(mockElegida1);

            const resultado = await ctrl.agregarCarrera('uuid-insc-1', 'IC', 1);

            expect(resultado).to.equal(mockElegida1);
        });

        it('debe propagar error del DAO con httpStatus 409 (409 carrera duplicada)', async () => {
            const errorConflicto = new Error('Error HTTP: 409');
            errorConflicto.httpStatus = 409;
            sinon.stub(ctrl.carrerasElegidaDao, 'agregarCarrera').rejects(errorConflicto);

            try {
                await ctrl.agregarCarrera('uuid-insc-1', 'IC', 1);
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
                expect(e.httpStatus).to.equal(409);
            }
        });

        it('debe restablecer store.loading a false incluso cuando el DAO falla', async () => {
            sinon.stub(ctrl.carrerasElegidaDao, 'agregarCarrera')
                .rejects(new Error('Error HTTP: 409'));

            try { await ctrl.agregarCarrera('uuid-insc-1', 'IC', 1); } catch { /* esperado */ }

            expect(store.loading).to.be.false;
        });
    });

    // ── eliminarCarrera ──────────────────────────────────────────────────────
    describe('eliminarCarrera', () => {
        it('debe lanzar error si no se proporciona inscripcionId', async () => {
            try {
                await ctrl.eliminarCarrera(null, 'IC');
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
            }
        });

        it('debe lanzar error si no se proporciona idCarrera', async () => {
            try {
                await ctrl.eliminarCarrera('uuid-insc-1', null);
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
            }
        });

        it('debe llamar a DAO.eliminarCarrera con los IDs correctos', async () => {
            store.carrerasElegidas = [mockElegida1, mockElegida2];
            let capturedArgs;
            ctrl.carrerasElegidaDao.eliminarCarrera = (...args) => { capturedArgs = args; return Promise.resolve(); };

            await ctrl.eliminarCarrera('uuid-insc-1', 'IC');

            expect(capturedArgs[0]).to.equal('uuid-insc-1');
            expect(capturedArgs[1]).to.equal('IC');
        });

        it('debe eliminar la carrera del array store.carrerasElegidas filtrando por idCarreraElegida.idCarrera', async () => {
            store.carrerasElegidas = [mockElegida1, mockElegida2];
            sinon.stub(ctrl.carrerasElegidaDao, 'eliminarCarrera').resolves();

            await ctrl.eliminarCarrera('uuid-insc-1', 'IC');

            expect(store.carrerasElegidas.length).to.equal(1);
            expect(store.carrerasElegidas[0]).to.equal(mockElegida2);
        });

        it('debe propagar error del DAO y restablecer store.loading', async () => {
            store.carrerasElegidas = [mockElegida1];
            sinon.stub(ctrl.carrerasElegidaDao, 'eliminarCarrera')
                .rejects(new Error('Error HTTP: 404'));

            try {
                await ctrl.eliminarCarrera('uuid-insc-1', 'IC');
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
                expect(store.loading).to.be.false;
            }
        });
    });

    // ── cargarPorInscripcion ─────────────────────────────────────────────────
    describe('cargarPorInscripcion', () => {
        it('debe lanzar error si inscripcionId no se proporciona', async () => {
            try {
                await ctrl.cargarPorInscripcion(null);
                expect.fail();
            } catch (e) {
                expect(e.message).to.include('requerido');
            }
        });

        it('debe llamar a DAO.obtenerPorInscripcion con el ID correcto', async () => {
            let capturedId;
            ctrl.carrerasElegidaDao.obtenerPorInscripcion = (id) => { capturedId = id; return Promise.resolve([mockElegida1]); };

            await ctrl.cargarPorInscripcion('uuid-insc-1');

            expect(capturedId).to.equal('uuid-insc-1');
        });

        it('debe escribir los resultados en store.carrerasElegidas', async () => {
            sinon.stub(ctrl.carrerasElegidaDao, 'obtenerPorInscripcion')
                .resolves([mockElegida1, mockElegida2]);

            await ctrl.cargarPorInscripcion('uuid-insc-1');

            expect(store.carrerasElegidas).to.deep.equal([mockElegida1, mockElegida2]);
        });

        it('debe retornar el array de carreras elegidas', async () => {
            sinon.stub(ctrl.carrerasElegidaDao, 'obtenerPorInscripcion')
                .resolves([mockElegida1]);

            const resultado = await ctrl.cargarPorInscripcion('uuid-insc-1');

            expect(resultado).to.deep.equal([mockElegida1]);
        });

        it('debe propagar error del DAO', async () => {
            sinon.stub(ctrl.carrerasElegidaDao, 'obtenerPorInscripcion')
                .rejects(new Error('Error HTTP: 404'));

            try {
                await ctrl.cargarPorInscripcion('uuid-insc-1');
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
            }
        });
    });

    // ── reordenar ────────────────────────────────────────────────────────────
    describe('reordenar', () => {
        it('debe llamar a DAO.reordenar con el ID y el nuevo orden', async () => {
            const nuevoOrden = ['IC', 'IS'];
            let capturedArgs;
            ctrl.carrerasElegidaDao.reordenar = (...args) => { capturedArgs = args; return Promise.resolve([mockElegida2, mockElegida1]); };

            await ctrl.reordenar('uuid-insc-1', nuevoOrden);

            expect(capturedArgs[0]).to.equal('uuid-insc-1');
            expect(capturedArgs[1]).to.deep.equal(nuevoOrden);
        });

        it('debe actualizar store.carrerasElegidas con el orden devuelto por el DAO', async () => {
            sinon.stub(ctrl.carrerasElegidaDao, 'reordenar')
                .resolves([mockElegida2, mockElegida1]);

            await ctrl.reordenar('uuid-insc-1', ['IS', 'IC']);

            expect(store.carrerasElegidas[0]).to.equal(mockElegida2);
            expect(store.carrerasElegidas[1]).to.equal(mockElegida1);
        });

        it('debe retornar el array reordenado', async () => {
            sinon.stub(ctrl.carrerasElegidaDao, 'reordenar')
                .resolves([mockElegida2, mockElegida1]);

            const resultado = await ctrl.reordenar('uuid-insc-1', ['IS', 'IC']);

            expect(resultado).to.deep.equal([mockElegida2, mockElegida1]);
        });

        it('debe propagar error del DAO y restablecer store.loading', async () => {
            sinon.stub(ctrl.carrerasElegidaDao, 'reordenar')
                .rejects(new Error('Error HTTP: 500'));

            try {
                await ctrl.reordenar('uuid-insc-1', ['IC']);
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
                expect(store.loading).to.be.false;
            }
        });
    });
});
