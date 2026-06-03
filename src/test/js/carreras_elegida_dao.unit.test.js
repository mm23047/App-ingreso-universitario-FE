import { expect } from './lib/chai/index.js';
import sinon from './lib/sinon/sinon.js';
import CarrerasElegidaDao from '../../js/control/carreras_elegida_dao.js';
import CarrerasElegida from '../../js/entity/CarrerasElegida.js';

describe('CarrerasElegidaDao - Pruebas Unitarias con Stubs', () => {
    let dao;
    const INSCRIPCION_ID = 'uuid-inscripcion-1';
    const CARRERA_ID     = 'IC';

    const mockCarreraElegida = {
        idCarrerasElegida:   'uuid-elegida-1',
        catalogoCarrera:     { idCarrera: 'IC', nombreCatalogoCarrera: 'Ingeniería Civil' },
        inscripcionesPrueba: { idInscripcionPrueba: 'uuid-inscripcion-1' },
        prioridad:           1
    };

    beforeEach(() => {
        dao = new CarrerasElegidaDao();
        sinon.restoreAll();
    });

    afterEach(() => {
        sinon.restoreAll();
    });

    describe('Constructor', () => {
        it('debe crear una instancia de CarrerasElegidaDao', () => {
            expect(dao).to.be.instanceOf(CarrerasElegidaDao);
        });

        it('debe tener inscripcionesUrl con "inscripciones_prueba"', () => {
            expect(dao.inscripcionesUrl).to.include('inscripciones_prueba');
        });
    });

    describe('obtenerPorInscripcion con Stub', () => {
        it('debe retornar instancias de CarrerasElegida', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve([mockCarreraElegida]) });

            const resultado = await dao.obtenerPorInscripcion(INSCRIPCION_ID);

            expect(resultado).to.be.an('array');
            expect(resultado[0]).to.be.instanceOf(CarrerasElegida);
        });

        it('debe llamar a la URL correcta', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve([]) });

            await dao.obtenerPorInscripcion(INSCRIPCION_ID);

            const url = window.fetch.firstCall.args[0];
            expect(url).to.include(`inscripciones_prueba/${INSCRIPCION_ID}/carreras`);
        });

        it('debe lanzar error sin inscripcionId', async () => {
            try {
                await dao.obtenerPorInscripcion();
                expect.fail();
            } catch (error) {
                expect(error.message).to.include('requerido');
            }
        });
    });

    describe('agregarCarrera con Stub', () => {
        it('debe retornar una instancia de CarrerasElegida', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 201, json: () => Promise.resolve(mockCarreraElegida) });

            const resultado = await dao.agregarCarrera(INSCRIPCION_ID, CARRERA_ID, 1);

            expect(resultado).to.be.instanceOf(CarrerasElegida);
            expect(resultado.idCarrera).to.equal('IC');
        });

        it('debe enviar catalogoCarrera e idCarrera en el body', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 201, json: () => Promise.resolve(mockCarreraElegida) });

            await dao.agregarCarrera(INSCRIPCION_ID, CARRERA_ID, 1);

            const body = JSON.parse(window.fetch.firstCall.args[1].body);
            expect(body).to.have.property('catalogoCarrera');
            expect(body.catalogoCarrera.idCarrera).to.equal(CARRERA_ID);
            expect(body.prioridad).to.equal(1);
        });

        it('debe usar método POST', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 201, json: () => Promise.resolve(mockCarreraElegida) });

            await dao.agregarCarrera(INSCRIPCION_ID, CARRERA_ID, 1);

            expect(window.fetch.firstCall.args[1].method).to.equal('POST');
        });

        it('debe lanzar error cuando se llama sin inscripcionId o carreraId', async () => {
            try {
                await dao.agregarCarrera(null, CARRERA_ID, 1);
                expect.fail();
            } catch (error) {
                expect(error.message).to.include('requerido');
            }
        });

        it('debe lanzar error cuando el servidor responde 409 (duplicado)', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 409 });

            try {
                await dao.agregarCarrera(INSCRIPCION_ID, CARRERA_ID, 1);
                expect.fail();
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });
    });

    describe('eliminarCarrera con Stub', () => {
        it('debe retornar true al eliminar exitosamente', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 204 });

            const resultado = await dao.eliminarCarrera(INSCRIPCION_ID, CARRERA_ID);
            expect(resultado).to.be.true;
        });

        it('debe usar método DELETE', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 204 });

            await dao.eliminarCarrera(INSCRIPCION_ID, CARRERA_ID);

            expect(window.fetch.firstCall.args[1].method).to.equal('DELETE');
        });

        it('debe lanzar error sin parámetros', async () => {
            try {
                await dao.eliminarCarrera();
                expect.fail();
            } catch (error) {
                expect(error.message).to.include('requerido');
            }
        });
    });

    describe('reordenar con Stub', () => {
        it('debe enviar el nuevo orden como array en el body', async () => {
            const nuevoOrden = ['IS', 'IC', 'MED'];
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve([mockCarreraElegida]) });

            await dao.reordenar(INSCRIPCION_ID, nuevoOrden);

            const body = JSON.parse(window.fetch.firstCall.args[1].body);
            expect(body).to.deep.equal(nuevoOrden);
        });

        it('debe usar método PATCH', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve([]) });

            await dao.reordenar(INSCRIPCION_ID, ['IC']);

            expect(window.fetch.firstCall.args[1].method).to.equal('PATCH');
        });
    });

    describe('Métodos disponibles', () => {
        it('debe tener obtenerPorInscripcion', () => {
            expect(typeof dao.obtenerPorInscripcion).to.equal('function');
        });

        it('debe tener agregarCarrera', () => {
            expect(typeof dao.agregarCarrera).to.equal('function');
        });

        it('debe tener actualizarPrioridad', () => {
            expect(typeof dao.actualizarPrioridad).to.equal('function');
        });

        it('debe tener eliminarCarrera', () => {
            expect(typeof dao.eliminarCarrera).to.equal('function');
        });

        it('debe tener obtenerPrimeraOpcion', () => {
            expect(typeof dao.obtenerPrimeraOpcion).to.equal('function');
        });

        it('debe tener reordenar', () => {
            expect(typeof dao.reordenar).to.equal('function');
        });
    });
});
