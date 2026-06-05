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
            sinon.stub(window, 'fetch');
            let capturedUrl;
            window.fetch = (url) => { capturedUrl = url; return Promise.resolve({ status: 200, json: () => Promise.resolve([]) }); };

            await dao.obtenerPorInscripcion(INSCRIPCION_ID);

            expect(capturedUrl).to.include(`inscripciones_prueba/${INSCRIPCION_ID}/carreras`);
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
        it('debe retornar una instancia de CarrerasElegida con la carrera correcta', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 201, json: () => Promise.resolve(mockCarreraElegida) });

            const resultado = await dao.agregarCarrera(INSCRIPCION_ID, CARRERA_ID, 1);

            expect(resultado).to.be.instanceOf(CarrerasElegida);
            // idCarrera está en catalogoCarrera, no como propiedad directa de CarrerasElegida
            expect(resultado.catalogoCarrera.idCarrera).to.equal('IC');
        });

        it('debe enviar catalogoCarrera e idCarrera en el body', async () => {
            sinon.stub(window, 'fetch');
            let capturedOpts;
            window.fetch = (url, opts) => { capturedOpts = opts; return Promise.resolve({ status: 201, json: () => Promise.resolve(mockCarreraElegida) }); };

            await dao.agregarCarrera(INSCRIPCION_ID, CARRERA_ID, 1);

            const body = JSON.parse(capturedOpts.body);
            expect(body).to.have.property('catalogoCarrera');
            expect(body.catalogoCarrera.idCarrera).to.equal(CARRERA_ID);
            expect(body.prioridad).to.equal(1);
        });

        it('debe usar método POST', async () => {
            sinon.stub(window, 'fetch');
            let capturedOpts;
            window.fetch = (url, opts) => { capturedOpts = opts; return Promise.resolve({ status: 201, json: () => Promise.resolve(mockCarreraElegida) }); };

            await dao.agregarCarrera(INSCRIPCION_ID, CARRERA_ID, 1);

            expect(capturedOpts.method).to.equal('POST');
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
            sinon.stub(window, 'fetch');
            let capturedOpts;
            window.fetch = (url, opts) => { capturedOpts = opts; return Promise.resolve({ status: 204 }); };

            await dao.eliminarCarrera(INSCRIPCION_ID, CARRERA_ID);

            expect(capturedOpts.method).to.equal('DELETE');
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
            sinon.stub(window, 'fetch');
            let capturedOpts;
            window.fetch = (url, opts) => { capturedOpts = opts; return Promise.resolve({ status: 200, json: () => Promise.resolve([mockCarreraElegida]) }); };

            await dao.reordenar(INSCRIPCION_ID, nuevoOrden);

            const body = JSON.parse(capturedOpts.body);
            expect(body).to.deep.equal(nuevoOrden);
        });

        it('debe usar método PATCH', async () => {
            sinon.stub(window, 'fetch');
            let capturedOpts;
            window.fetch = (url, opts) => { capturedOpts = opts; return Promise.resolve({ status: 200, json: () => Promise.resolve([]) }); };

            await dao.reordenar(INSCRIPCION_ID, ['IC']);

            expect(capturedOpts.method).to.equal('PATCH');
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

    // ── actualizarPrioridad con Stub ─────────────────────────────────────────
    describe('actualizarPrioridad con Stub', () => {
        const mockCarreraActualizada = {
            idCarreraElegida:    { idInscripcion: INSCRIPCION_ID, idCarrera: CARRERA_ID },
            catalogoCarrera:     { idCarrera: CARRERA_ID, nombreCatalogoCarrera: 'Ingeniería Civil' },
            inscripcionesPrueba: null,
            prioridad:           2
        };

        it('debe usar método PUT', async () => {
            sinon.stub(window, 'fetch');
            let capturedOpts;
            window.fetch = (url, opts) => { capturedOpts = opts; return Promise.resolve({ status: 200, json: () => Promise.resolve(mockCarreraActualizada) }); };

            await dao.actualizarPrioridad(INSCRIPCION_ID, CARRERA_ID, 2);

            expect(capturedOpts.method).to.equal('PUT');
        });

        it('URL debe incluir inscripciones_prueba/{inscripcionId}/carreras/{idCarrera}', async () => {
            sinon.stub(window, 'fetch');
            let capturedUrl;
            window.fetch = (url) => { capturedUrl = url; return Promise.resolve({ status: 200, json: () => Promise.resolve(mockCarreraActualizada) }); };

            await dao.actualizarPrioridad(INSCRIPCION_ID, CARRERA_ID, 2);

            expect(capturedUrl).to.include(`inscripciones_prueba/${INSCRIPCION_ID}/carreras/${CARRERA_ID}`);
        });

        it('body debe contener prioridad con la nueva prioridad solicitada', async () => {
            sinon.stub(window, 'fetch');
            let capturedOpts;
            window.fetch = (url, opts) => { capturedOpts = opts; return Promise.resolve({ status: 200, json: () => Promise.resolve(mockCarreraActualizada) }); };

            await dao.actualizarPrioridad(INSCRIPCION_ID, CARRERA_ID, 3);

            const body = JSON.parse(capturedOpts.body);
            expect(body).to.have.property('prioridad', 3);
        });

        it('debe retornar instancia de CarrerasElegida con la prioridad actualizada', async () => {
            sinon.stub(window, 'fetch').resolves({
                status: 200,
                json: () => Promise.resolve(mockCarreraActualizada)
            });

            const resultado = await dao.actualizarPrioridad(INSCRIPCION_ID, CARRERA_ID, 2);

            expect(resultado).to.be.instanceOf(CarrerasElegida);
            expect(resultado.prioridad).to.equal(2);
        });

        it('debe aceptar prioridad 0 como valor válido — la validación usa == null, no falsy', async () => {
            sinon.stub(window, 'fetch').resolves({
                status: 200,
                json: () => Promise.resolve({ ...mockCarreraActualizada, prioridad: 0 })
            });

            // prioridad = 0 debe ser aceptado (0 == null es false)
            const resultado = await dao.actualizarPrioridad(INSCRIPCION_ID, CARRERA_ID, 0);

            expect(resultado).to.be.instanceOf(CarrerasElegida);
        });

        it('debe lanzar error si inscripcionId no se proporciona', async () => {
            try {
                await dao.actualizarPrioridad(null, CARRERA_ID, 2);
                expect.fail();
            } catch (e) {
                expect(e.message).to.include('requerido');
            }
        });

        it('debe lanzar error si idCarrera no se proporciona', async () => {
            try {
                await dao.actualizarPrioridad(INSCRIPCION_ID, null, 2);
                expect.fail();
            } catch (e) {
                expect(e.message).to.include('requerido');
            }
        });

        it('debe lanzar error si nuevaPrioridad es null', async () => {
            try {
                await dao.actualizarPrioridad(INSCRIPCION_ID, CARRERA_ID, null);
                expect.fail();
            } catch (e) {
                expect(e.message).to.include('requerido');
            }
        });

        it('debe lanzar error cuando el servidor responde 404', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 404 });

            try {
                await dao.actualizarPrioridad(INSCRIPCION_ID, CARRERA_ID, 2);
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
            }
        });
    });

    // ── obtenerPrimeraOpcion con Stub ────────────────────────────────────────
    describe('obtenerPrimeraOpcion con Stub', () => {
        const mockPrimeraOpcion = {
            idCarreraElegida:    { idInscripcion: INSCRIPCION_ID, idCarrera: CARRERA_ID },
            catalogoCarrera:     { idCarrera: CARRERA_ID, nombreCatalogoCarrera: 'Ingeniería Civil' },
            inscripcionesPrueba: null,
            prioridad:           1
        };

        it('URL debe incluir /primera-opcion como segmento final', async () => {
            sinon.stub(window, 'fetch');
            let capturedUrl;
            window.fetch = (url) => { capturedUrl = url; return Promise.resolve({ status: 200, json: () => Promise.resolve(mockPrimeraOpcion) }); };

            await dao.obtenerPrimeraOpcion(INSCRIPCION_ID);

            expect(capturedUrl).to.include('/primera-opcion');
            expect(capturedUrl).to.include(`inscripciones_prueba/${INSCRIPCION_ID}`);
        });

        it('debe retornar instancia de CarrerasElegida con status 200', async () => {
            sinon.stub(window, 'fetch').resolves({
                status: 200,
                json: () => Promise.resolve(mockPrimeraOpcion)
            });

            const resultado = await dao.obtenerPrimeraOpcion(INSCRIPCION_ID);

            expect(resultado).to.be.instanceOf(CarrerasElegida);
        });

        it('debe retornar null con status 404 — comportamiento especial único en el proyecto', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 404 });

            const resultado = await dao.obtenerPrimeraOpcion(INSCRIPCION_ID);

            expect(resultado).to.be.null;
        });

        it('debe lanzar error con status 500 — otros errores no son excepción especial', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 500 });

            try {
                await dao.obtenerPrimeraOpcion(INSCRIPCION_ID);
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
            }
        });

        it('debe lanzar error si inscripcionId no se proporciona', async () => {
            try {
                await dao.obtenerPrimeraOpcion();
                expect.fail();
            } catch (e) {
                expect(e.message).to.include('requerido');
            }
        });
    });
});
