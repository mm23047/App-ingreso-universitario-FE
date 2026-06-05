import { expect } from './lib/chai/index.js';
import sinon from './lib/sinon/sinon.js';
import RespuestaExamenDao from '../../js/control/respuesta_examen_dao.js';
import RespuestaExamen from '../../js/entity/RespuestaExamen.js';

describe('RespuestaExamenDao - Pruebas Unitarias con Stubs', () => {
    let dao;

    const EXAMEN_ID = 'uuid-examen-1';
    const OPCION_ID = 'uuid-opcion-1';

    const mockRespuesta = {
        idRespuestaExamen: 'uuid-resp-1',
        examenRealizado:   { idExamenRealizado: EXAMEN_ID },
        preguntaOpcion:    { idPreguntaOpcion:  OPCION_ID  }
    };

    beforeEach(() => {
        dao = new RespuestaExamenDao();
        sinon.restoreAll();
    });

    afterEach(() => {
        sinon.restoreAll();
    });

    // ── Constructor ──────────────────────────────────────────────────────────
    describe('Constructor', () => {
        it('debe crear una instancia de RespuestaExamenDao', () => {
            expect(dao).to.be.instanceOf(RespuestaExamenDao);
        });

        it('debe configurar BASE_URL con "respuestas_examen"', () => {
            expect(dao.BASE_URL).to.include('respuestas_examen');
        });

        it('debe incluir /v1/ en la BASE_URL', () => {
            expect(dao.BASE_URL).to.include('/v1/');
        });
    });

    // ── enviarRespuesta ──────────────────────────────────────────────────────
    describe('enviarRespuesta con Stub', () => {
        it('debe usar método POST', async () => {
            sinon.stub(window, 'fetch');
            let capturedOpts;
            window.fetch = (url, opts) => { capturedOpts = opts; return Promise.resolve({ status: 201, json: () => Promise.resolve(mockRespuesta) }); };

            await dao.enviarRespuesta(EXAMEN_ID, OPCION_ID);

            expect(capturedOpts.method).to.equal('POST');
        });

        it('debe llamar a la URL base de respuestas_examen sin segmentos adicionales', async () => {
            sinon.stub(window, 'fetch');
            let capturedUrl;
            window.fetch = (url) => { capturedUrl = url; return Promise.resolve({ status: 201, json: () => Promise.resolve(mockRespuesta) }); };

            await dao.enviarRespuesta(EXAMEN_ID, OPCION_ID);

            expect(capturedUrl).to.include('respuestas_examen');
            expect(capturedUrl).to.not.include('/lote');
            expect(capturedUrl).to.not.include('/examen/');
        });

        it('body debe contener examenRealizado.idExamenRealizado — no una clave plana examenId', async () => {
            sinon.stub(window, 'fetch');
            let capturedOpts;
            window.fetch = (url, opts) => { capturedOpts = opts; return Promise.resolve({ status: 201, json: () => Promise.resolve(mockRespuesta) }); };

            await dao.enviarRespuesta(EXAMEN_ID, OPCION_ID);

            const body = JSON.parse(capturedOpts.body);
            expect(body).to.have.property('examenRealizado');
            expect(body.examenRealizado).to.have.property('idExamenRealizado', EXAMEN_ID);
            expect(body).to.not.have.property('examenId');
        });

        it('body debe contener preguntaOpcion.idPreguntaOpcion — no una clave plana opcionId', async () => {
            sinon.stub(window, 'fetch');
            let capturedOpts;
            window.fetch = (url, opts) => { capturedOpts = opts; return Promise.resolve({ status: 201, json: () => Promise.resolve(mockRespuesta) }); };

            await dao.enviarRespuesta(EXAMEN_ID, OPCION_ID);

            const body = JSON.parse(capturedOpts.body);
            expect(body).to.have.property('preguntaOpcion');
            expect(body.preguntaOpcion).to.have.property('idPreguntaOpcion', OPCION_ID);
            expect(body).to.not.have.property('opcionId');
        });

        it('debe retornar instancia de RespuestaExamen con status 201', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 201, json: () => Promise.resolve(mockRespuesta) });

            const resultado = await dao.enviarRespuesta(EXAMEN_ID, OPCION_ID);

            expect(resultado).to.be.instanceOf(RespuestaExamen);
        });

        it('debe retornar instancia de RespuestaExamen con status 200 (el DAO acepta ambos)', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve(mockRespuesta) });

            const resultado = await dao.enviarRespuesta(EXAMEN_ID, OPCION_ID);

            expect(resultado).to.be.instanceOf(RespuestaExamen);
        });

        it('debe mapear idRespuestaExamen correctamente', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 201, json: () => Promise.resolve(mockRespuesta) });

            const resultado = await dao.enviarRespuesta(EXAMEN_ID, OPCION_ID);

            expect(resultado.idRespuestaExamen).to.equal('uuid-resp-1');
        });

        it('debe mapear examenRealizado y preguntaOpcion desde la respuesta', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 201, json: () => Promise.resolve(mockRespuesta) });

            const resultado = await dao.enviarRespuesta(EXAMEN_ID, OPCION_ID);

            expect(resultado.examenRealizado.idExamenRealizado).to.equal(EXAMEN_ID);
            expect(resultado.preguntaOpcion.idPreguntaOpcion).to.equal(OPCION_ID);
        });

        it('debe lanzar error si examenId no se proporciona', async () => {
            try {
                await dao.enviarRespuesta(null, OPCION_ID);
                expect.fail();
            } catch (e) {
                expect(e.message).to.include('requerido');
            }
        });

        it('debe lanzar error si opcionId no se proporciona', async () => {
            try {
                await dao.enviarRespuesta(EXAMEN_ID, null);
                expect.fail();
            } catch (e) {
                expect(e.message).to.include('requerido');
            }
        });

        it('debe lanzar error cuando el servidor responde 400', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 400 });

            try {
                await dao.enviarRespuesta(EXAMEN_ID, OPCION_ID);
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
            }
        });
    });

    // ── enviarLote ───────────────────────────────────────────────────────────
    describe('enviarLote con Stub', () => {
        it('debe usar método POST', async () => {
            sinon.stub(window, 'fetch');
            let capturedOpts;
            window.fetch = (url, opts) => { capturedOpts = opts; return Promise.resolve({ status: 201 }); };

            await dao.enviarLote(EXAMEN_ID, [OPCION_ID]);

            expect(capturedOpts.method).to.equal('POST');
        });

        it('URL debe incluir el segmento /lote', async () => {
            sinon.stub(window, 'fetch');
            let capturedUrl;
            window.fetch = (url) => { capturedUrl = url; return Promise.resolve({ status: 201 }); };

            await dao.enviarLote(EXAMEN_ID, [OPCION_ID]);

            expect(capturedUrl).to.include('/lote');
        });

        it('body debe contener idExamen con el UUID del examen', async () => {
            sinon.stub(window, 'fetch');
            let capturedOpts;
            window.fetch = (url, opts) => { capturedOpts = opts; return Promise.resolve({ status: 201 }); };

            await dao.enviarLote(EXAMEN_ID, [OPCION_ID]);

            const body = JSON.parse(capturedOpts.body);
            expect(body).to.have.property('idExamen', EXAMEN_ID);
        });

        it('body debe contener opcionesSeleccionadas con el array enviado', async () => {
            const opciones = [OPCION_ID, 'uuid-opcion-2', 'uuid-opcion-3'];
            sinon.stub(window, 'fetch');
            let capturedOpts;
            window.fetch = (url, opts) => { capturedOpts = opts; return Promise.resolve({ status: 201 }); };

            await dao.enviarLote(EXAMEN_ID, opciones);

            const body = JSON.parse(capturedOpts.body);
            expect(body).to.have.property('opcionesSeleccionadas');
            expect(body.opcionesSeleccionadas).to.deep.equal(opciones);
        });

        it('body NO debe usar "opciones" como clave — el contrato del backend es opcionesSeleccionadas', async () => {
            sinon.stub(window, 'fetch');
            let capturedOpts;
            window.fetch = (url, opts) => { capturedOpts = opts; return Promise.resolve({ status: 201 }); };

            await dao.enviarLote(EXAMEN_ID, [OPCION_ID]);

            const body = JSON.parse(capturedOpts.body);
            expect(body).to.not.have.property('opciones');
            expect(body).to.not.have.property('opcionesIds');
        });

        it('debe retornar true cuando el servidor responde 201', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 201 });

            const resultado = await dao.enviarLote(EXAMEN_ID, [OPCION_ID]);

            expect(resultado).to.be.true;
        });

        it('debe lanzar error con status 200 — enviarLote solo acepta 201', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 200 });

            try {
                await dao.enviarLote(EXAMEN_ID, [OPCION_ID]);
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
            }
        });

        it('debe lanzar error si examenId no se proporciona', async () => {
            try {
                await dao.enviarLote(null, [OPCION_ID]);
                expect.fail();
            } catch (e) {
                expect(e.message).to.include('requerido');
            }
        });

        it('debe lanzar error si la lista de opciones está vacía', async () => {
            try {
                await dao.enviarLote(EXAMEN_ID, []);
                expect.fail();
            } catch (e) {
                expect(e.message).to.include('requerido');
            }
        });

        it('debe lanzar error si la lista de opciones es null', async () => {
            try {
                await dao.enviarLote(EXAMEN_ID, null);
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
            }
        });

        it('debe lanzar error cuando el servidor responde 400', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 400 });

            try {
                await dao.enviarLote(EXAMEN_ID, [OPCION_ID]);
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
            }
        });
    });

    // ── obtenerPorExamen ─────────────────────────────────────────────────────
    describe('obtenerPorExamen con Stub', () => {
        it('debe usar método GET', async () => {
            sinon.stub(window, 'fetch');
            let capturedOpts;
            window.fetch = (url, opts) => { capturedOpts = opts; return Promise.resolve({ status: 200, json: () => Promise.resolve([]) }); };

            await dao.obtenerPorExamen(EXAMEN_ID);

            expect(capturedOpts.method).to.equal('GET');
        });

        it('URL debe incluir el segmento /examen/ seguido del ID', async () => {
            sinon.stub(window, 'fetch');
            let capturedUrl;
            window.fetch = (url) => { capturedUrl = url; return Promise.resolve({ status: 200, json: () => Promise.resolve([]) }); };

            await dao.obtenerPorExamen(EXAMEN_ID);

            expect(capturedUrl).to.include(`/examen/${EXAMEN_ID}`);
        });

        it('debe retornar un array de instancias de RespuestaExamen', async () => {
            sinon.stub(window, 'fetch').resolves({
                status: 200,
                json: () => Promise.resolve([mockRespuesta, mockRespuesta])
            });

            const resultado = await dao.obtenerPorExamen(EXAMEN_ID);

            expect(resultado).to.be.an('array');
            expect(resultado).to.have.lengthOf(2);
            expect(resultado[0]).to.be.instanceOf(RespuestaExamen);
        });

        it('debe mapear idRespuestaExamen, examenRealizado y preguntaOpcion de cada elemento', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve([mockRespuesta]) });

            const resultado = await dao.obtenerPorExamen(EXAMEN_ID);

            expect(resultado[0].idRespuestaExamen).to.equal('uuid-resp-1');
            expect(resultado[0].examenRealizado.idExamenRealizado).to.equal(EXAMEN_ID);
            expect(resultado[0].preguntaOpcion.idPreguntaOpcion).to.equal(OPCION_ID);
        });

        it('debe retornar array vacío si el examen aún no tiene respuestas guardadas', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve([]) });

            const resultado = await dao.obtenerPorExamen(EXAMEN_ID);

            expect(resultado).to.deep.equal([]);
        });

        it('debe lanzar error si examenId no se proporciona', async () => {
            try {
                await dao.obtenerPorExamen();
                expect.fail();
            } catch (e) {
                expect(e.message).to.include('requerido');
            }
        });

        it('debe lanzar error con status 404 — sin excepción especial (a diferencia de obtenerPrimeraOpcion)', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 404 });

            try {
                await dao.obtenerPorExamen(EXAMEN_ID);
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
            }
        });

        it('debe lanzar error cuando el servidor responde 500', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 500 });

            try {
                await dao.obtenerPorExamen(EXAMEN_ID);
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
            }
        });
    });
});
