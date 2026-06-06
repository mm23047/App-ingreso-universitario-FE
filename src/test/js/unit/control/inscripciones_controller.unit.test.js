import { expect } from '../../lib/chai/index.js';
import sinon from '../../lib/sinon/sinon.js';
import InscripcionesController from '../../../../js/control/inscripciones_controller.js';
import AspirantesDao from '../../../../js/control/aspirantes_dao.js';
import CarrerasElegidaDao from '../../../../js/control/carreras_elegida_dao.js';
import PruebasAdmisionDao from '../../../../js/control/pruebas_admision_dao.js';
import InscripcionPrueba from '../../../../js/entity/InscripcionPrueba.js';
import CarrerasElegida from '../../../../js/entity/CarrerasElegida.js';
import PruebaAdmision from '../../../../js/entity/PruebaAdmision.js';
import { store, resetStore } from '../../../../js/infra/app_state.js';

describe('InscripcionesController - Pruebas Unitarias', () => {
    let ctrl;

    const mockInscripcion = new InscripcionPrueba('uuid-insc-1', null, null, 'INSCRITO');
    const mockPrueba      = new PruebaAdmision('uuid-prueba-1', 'Proceso 2026', 2026, true);
    const mockElegida     = new CarrerasElegida(
        { idInscripcion: 'uuid-insc-1', idCarrera: 'IC' }, null,
        { idCarrera: 'IC', nombreCatalogoCarrera: 'Ingeniería Civil' }, 1
    );

    beforeEach(() => {
        ctrl = new InscripcionesController();
        sinon.restoreAll();
        resetStore();
    });

    afterEach(() => {
        sinon.restoreAll();
        resetStore();
    });

    // ── Constructor ──────────────────────────────────────────────────────────
    describe('Constructor', () => {
        it('debe crear una instancia de InscripcionesController', () => {
            expect(ctrl).to.be.instanceOf(InscripcionesController);
        });
        it('debe inicializar aspirantesDao', () => {
            expect(ctrl.aspirantesDao).to.be.instanceOf(AspirantesDao);
        });
        it('debe inicializar carrerasElegidaDao', () => {
            expect(ctrl.carrerasElegidaDao).to.be.instanceOf(CarrerasElegidaDao);
        });
        it('debe inicializar pruebasDao', () => {
            expect(ctrl.pruebasDao).to.be.instanceOf(PruebasAdmisionDao);
        });
    });

    // ── inscribir — validaciones de store ────────────────────────────────────
    describe('inscribir — validaciones de estado del store', () => {
        it('debe lanzar error si store.aspirante es null', async () => {
            store.prueba = mockPrueba;
            try {
                await ctrl.inscribir();
                expect.fail();
            } catch (e) {
                expect(e.message).to.include('registrarse');
            }
        });

        it('debe lanzar error si store.prueba es null', async () => {
            store.aspirante = { id: 'uuid-aspirante-1' };
            try {
                await ctrl.inscribir();
                expect.fail();
            } catch (e) {
                expect(e.message).to.include('prueba');
            }
        });

        it('debe lanzar error si store.aspirante existe pero id es null', async () => {
            store.aspirante = { id: null };
            store.prueba    = mockPrueba;
            try {
                await ctrl.inscribir();
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
            }
        });
    });

    // ── inscribir — flujo sin carrera seleccionada ───────────────────────────
    describe('inscribir — flujo exitoso sin carreraSeleccionada', () => {
        beforeEach(() => {
            store.aspirante = { id: 'uuid-aspirante-1' };
            store.prueba    = mockPrueba;
        });

        it('debe llamar a crearInscripcion con aspiranteId y pruebaAdmisionId del store', async () => {
            let capturedArgs;
            ctrl.aspirantesDao.crearInscripcion = (...args) => { capturedArgs = args; return Promise.resolve(mockInscripcion); };

            await ctrl.inscribir();

            expect(capturedArgs[0]).to.equal('uuid-aspirante-1');
            expect(capturedArgs[1]).to.equal('uuid-prueba-1');
        });

        it('debe guardar la inscripción en store.inscripcionActiva', async () => {
            sinon.stub(ctrl.aspirantesDao, 'crearInscripcion').resolves(mockInscripcion);

            await ctrl.inscribir();

            expect(store.inscripcionActiva).to.equal(mockInscripcion);
        });

        it('debe retornar la inscripción creada', async () => {
            sinon.stub(ctrl.aspirantesDao, 'crearInscripcion').resolves(mockInscripcion);

            const resultado = await ctrl.inscribir();

            expect(resultado).to.equal(mockInscripcion);
        });

        it('NO debe llamar a agregarCarrera si no hay carreraSeleccionada', async () => {
            sinon.stub(ctrl.aspirantesDao, 'crearInscripcion').resolves(mockInscripcion);
            let wasCalled = false;
            ctrl.carrerasElegidaDao.agregarCarrera = () => { wasCalled = true; return Promise.resolve(mockElegida); };

            await ctrl.inscribir();

            expect(wasCalled).to.be.false;
        });
    });

    // ── inscribir — flujo con carrera seleccionada ───────────────────────────
    describe('inscribir — flujo exitoso con carreraSeleccionada en el store', () => {
        beforeEach(() => {
            store.aspirante           = { id: 'uuid-aspirante-1' };
            store.prueba              = mockPrueba;
            store.carreraSeleccionada = { idCarrera: 'IC', nombreCatalogoCarrera: 'Ingeniería Civil' };
        });

        it('debe agregar la carrera seleccionada con prioridad 1 tras inscribir', async () => {
            sinon.stub(ctrl.aspirantesDao, 'crearInscripcion').resolves(mockInscripcion);
            let capturedArgs;
            ctrl.carrerasElegidaDao.agregarCarrera = (...args) => { capturedArgs = args; return Promise.resolve(mockElegida); };

            await ctrl.inscribir();

            expect(capturedArgs[0]).to.equal('uuid-insc-1');
            expect(capturedArgs[1]).to.equal('IC');
            expect(capturedArgs[2]).to.equal(1);
        });

        it('debe guardar la carrera elegida en store.carrerasElegidas', async () => {
            sinon.stub(ctrl.aspirantesDao, 'crearInscripcion').resolves(mockInscripcion);
            sinon.stub(ctrl.carrerasElegidaDao, 'agregarCarrera').resolves(mockElegida);

            await ctrl.inscribir();

            expect(store.carrerasElegidas).to.deep.equal([mockElegida]);
        });
    });

    // ── inscribir — error DAO ────────────────────────────────────────────────
    describe('inscribir — errores del DAO', () => {
        it('debe propagar error del DAO y restablecer store.loading', async () => {
            store.aspirante = { id: 'uuid-aspirante-1' };
            store.prueba    = mockPrueba;
            sinon.stub(ctrl.aspirantesDao, 'crearInscripcion')
                .rejects(new Error('Error HTTP: 409'));

            try {
                await ctrl.inscribir();
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
                expect(store.loading).to.be.false;
            }
        });

        it('NO debe actualizar store.inscripcionActiva cuando el DAO falla', async () => {
            store.aspirante = { id: 'uuid-aspirante-1' };
            store.prueba    = mockPrueba;
            sinon.stub(ctrl.aspirantesDao, 'crearInscripcion')
                .rejects(new Error('Error HTTP: 409'));

            try { await ctrl.inscribir(); } catch { /* esperado */ }

            expect(store.inscripcionActiva).to.be.null;
        });
    });

    // ── inscribirConCarreras ─────────────────────────────────────────────────
    describe('inscribirConCarreras', () => {
        it('debe lanzar error si aspiranteId es null', async () => {
            try {
                await ctrl.inscribirConCarreras(null, [{ idCarrera: 'IC', prioridad: 1 }]);
                expect.fail();
            } catch (e) {
                expect(e.message).to.include('requerido');
            }
        });

        it('debe lanzar error si la lista de carreras está vacía', async () => {
            try {
                await ctrl.inscribirConCarreras('uuid-aspirante-1', []);
                expect.fail();
            } catch (e) {
                expect(e.message).to.include('carrera');
            }
        });

        it('debe retornar null si no hay prueba activa disponible', async () => {
            sinon.stub(ctrl.pruebasDao, 'obtenerActivas').resolves([]);

            const resultado = await ctrl.inscribirConCarreras('uuid-aspirante-1', [
                { idCarrera: 'IC', prioridad: 1 }
            ]);

            expect(resultado).to.be.null;
        });

        it('debe crear inscripción en la prueba activa obtenida por el DAO', async () => {
            sinon.stub(ctrl.pruebasDao, 'obtenerActivas').resolves([mockPrueba]);
            let capturedArgs;
            ctrl.aspirantesDao.crearInscripcion = (...args) => { capturedArgs = args; return Promise.resolve(mockInscripcion); };
            sinon.stub(ctrl.carrerasElegidaDao, 'agregarCarrera').resolves(mockElegida);

            await ctrl.inscribirConCarreras('uuid-aspirante-1', [{ idCarrera: 'IC', prioridad: 1 }]);

            expect(capturedArgs[0]).to.equal('uuid-aspirante-1');
            expect(capturedArgs[1]).to.equal('uuid-prueba-1');
        });

        it('debe registrar cada carrera con su prioridad correcta', async () => {
            sinon.stub(ctrl.pruebasDao, 'obtenerActivas').resolves([mockPrueba]);
            sinon.stub(ctrl.aspirantesDao, 'crearInscripcion').resolves(mockInscripcion);
            const calls = [];
            ctrl.carrerasElegidaDao.agregarCarrera = (...args) => { calls.push(args); return Promise.resolve(mockElegida); };

            await ctrl.inscribirConCarreras('uuid-aspirante-1', [
                { idCarrera: 'IC', prioridad: 1 },
                { idCarrera: 'IS', prioridad: 2 }
            ]);

            expect(calls).to.have.length(2);
            expect(calls[0][1]).to.equal('IC');
            expect(calls[0][2]).to.equal(1);
            expect(calls[1][1]).to.equal('IS');
            expect(calls[1][2]).to.equal(2);
        });

        it('debe continuar registrando las demás carreras aunque una falle con 409', async () => {
            sinon.stub(ctrl.pruebasDao, 'obtenerActivas').resolves([mockPrueba]);
            sinon.stub(ctrl.aspirantesDao, 'crearInscripcion').resolves(mockInscripcion);
            const calls = [];
            ctrl.carrerasElegidaDao.agregarCarrera = (...args) => {
                calls.push(args);
                if (calls.length === 1) return Promise.reject(new Error('Error HTTP: 409'));
                return Promise.resolve(mockElegida);
            };

            const resultado = await ctrl.inscribirConCarreras('uuid-aspirante-1', [
                { idCarrera: 'IC', prioridad: 1 },
                { idCarrera: 'IS', prioridad: 2 }
            ]);

            expect(calls).to.have.length(2);
            expect(resultado).to.not.be.null;
        });

        it('debe guardar en store.carrerasElegidas SOLO las carreras registradas con éxito', async () => {
            sinon.stub(ctrl.pruebasDao, 'obtenerActivas').resolves([mockPrueba]);
            sinon.stub(ctrl.aspirantesDao, 'crearInscripcion').resolves(mockInscripcion);
            const calls = [];
            ctrl.carrerasElegidaDao.agregarCarrera = (...args) => {
                calls.push(args);
                if (calls.length === 1) return Promise.reject(new Error('Error HTTP: 409'));
                return Promise.resolve(mockElegida);
            };

            await ctrl.inscribirConCarreras('uuid-aspirante-1', [
                { idCarrera: 'IC', prioridad: 1 },
                { idCarrera: 'IS', prioridad: 2 }
            ]);

            expect(store.carrerasElegidas).to.deep.equal([mockElegida]);
        });

        it('debe guardar la inscripción en store.inscripcionActiva', async () => {
            sinon.stub(ctrl.pruebasDao, 'obtenerActivas').resolves([mockPrueba]);
            sinon.stub(ctrl.aspirantesDao, 'crearInscripcion').resolves(mockInscripcion);
            sinon.stub(ctrl.carrerasElegidaDao, 'agregarCarrera').resolves(mockElegida);

            await ctrl.inscribirConCarreras('uuid-aspirante-1', [{ idCarrera: 'IC', prioridad: 1 }]);

            expect(store.inscripcionActiva).to.equal(mockInscripcion);
        });

        it('debe guardar la prueba activa en store.prueba', async () => {
            sinon.stub(ctrl.pruebasDao, 'obtenerActivas').resolves([mockPrueba]);
            sinon.stub(ctrl.aspirantesDao, 'crearInscripcion').resolves(mockInscripcion);
            sinon.stub(ctrl.carrerasElegidaDao, 'agregarCarrera').resolves(mockElegida);

            await ctrl.inscribirConCarreras('uuid-aspirante-1', [{ idCarrera: 'IC', prioridad: 1 }]);

            expect(store.prueba).to.equal(mockPrueba);
        });

        it('debe retornar { inscripcion, carreras } al completar', async () => {
            sinon.stub(ctrl.pruebasDao, 'obtenerActivas').resolves([mockPrueba]);
            sinon.stub(ctrl.aspirantesDao, 'crearInscripcion').resolves(mockInscripcion);
            sinon.stub(ctrl.carrerasElegidaDao, 'agregarCarrera').resolves(mockElegida);

            const resultado = await ctrl.inscribirConCarreras('uuid-aspirante-1', [
                { idCarrera: 'IC', prioridad: 1 }
            ]);

            expect(resultado).to.have.property('inscripcion', mockInscripcion);
            expect(resultado.carreras).to.be.an('array');
        });

        it('debe propagar error cuando crearInscripcion falla y restablecer store.loading', async () => {
            sinon.stub(ctrl.pruebasDao, 'obtenerActivas').resolves([mockPrueba]);
            sinon.stub(ctrl.aspirantesDao, 'crearInscripcion')
                .rejects(new Error('Error HTTP: 500'));

            try {
                await ctrl.inscribirConCarreras('uuid-aspirante-1', [{ idCarrera: 'IC', prioridad: 1 }]);
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
                expect(store.loading).to.be.false;
            }
        });
    });
});
