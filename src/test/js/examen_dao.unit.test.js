import { expect } from './lib/chai/index.js';
import sinon from './lib/sinon/sinon.js';
import ExamenRealizadoDao from '../../js/control/examen_realizado_dao.js';
import RespuestaExamenDao from '../../js/control/respuesta_examen_dao.js';
import ExamenRealizado from '../../js/entity/ExamenRealizado.js';
import RespuestaExamen from '../../js/entity/RespuestaExamen.js';

// ExamenRealizadoDao   → Resource @Path("examen_realizado")
// RespuestaExamenDao   → Resource @Path("respuestas_examen")

describe('ExamenRealizadoDao - Pruebas Unitarias', () => {
    let dao;

    beforeEach(() => {
        dao = new ExamenRealizadoDao();
        sinon.restoreAll();
    });

    afterEach(() => {
        sinon.restoreAll();
    });

    describe('Constructor', () => {
        it('debe crear una instancia de ExamenRealizadoDao', () => {
            expect(dao).to.be.instanceOf(ExamenRealizadoDao);
        });

        it('debe tener BASE_URL que incluya "examen_realizado"', () => {
            expect(dao.BASE_URL).to.include('examen_realizado');
        });

        it('debe incluir /v1/ en la URL', () => {
            expect(dao.BASE_URL).to.include('/v1/');
        });
    });

    describe('iniciarExamen con Stub', () => {
        it('debe retornar una instancia de ExamenRealizado', async () => {
            const mockData = { idExamenRealizado: 'uuid-examen-1' };
            sinon.stub(window, 'fetch').resolves({ status: 201, json: () => Promise.resolve(mockData) });

            const resultado = await dao.iniciarExamen('uuid-inscripcion-1', 'uuid-etapa-1');

            expect(resultado).to.be.instanceOf(ExamenRealizado);
            expect(resultado.idExamenRealizado).to.equal('uuid-examen-1');
        });

        it('debe enviar body con idInscripcion e idEtapa', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 201, json: () => Promise.resolve({}) });

            await dao.iniciarExamen('uuid-inscripcion-1', 'uuid-etapa-1');

            const body = JSON.parse(window.fetch.firstCall.args[1].body);
            expect(body.idInscripcion).to.equal('uuid-inscripcion-1');
            expect(body.idEtapa).to.equal('uuid-etapa-1');
        });

        it('debe lanzar error si falta inscripcionId o etapaId', async () => {
            try {
                await dao.iniciarExamen(null, 'uuid-etapa-1');
                expect.fail();
            } catch (e) {
                expect(e.message).to.include('requerido');
            }
        });

        it('debe lanzar error cuando el servidor responde 409', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 409 });
            try {
                await dao.iniciarExamen('uuid-i', 'uuid-e');
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
            }
        });
    });

    describe('obtenerPorId con Stub', () => {
        it('debe retornar una instancia de ExamenRealizado', async () => {
            const mockData = { idExamenRealizado: 'uuid-examen-1', puntajeFinal: null };
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve(mockData) });

            const resultado = await dao.obtenerPorId('uuid-examen-1');

            expect(resultado).to.be.instanceOf(ExamenRealizado);
            expect(resultado.idExamenRealizado).to.equal('uuid-examen-1');
        });

        it('debe lanzar error sin id', async () => {
            try {
                await dao.obtenerPorId();
                expect.fail();
            } catch (e) {
                expect(e.message).to.include('requerido');
            }
        });
    });

    describe('obtenerPreguntas con Stub', () => {
        it('debe retornar un array con PreguntasPorClave', async () => {
            const mockData = [
                { idPreguntaPorClave: { idClave: 'uuid-c', idPregunta: 'uuid-p1' },
                  bancoPregunta: { idBancoPregunta: 'uuid-p1', enunciado: '¿Pregunta 1?' } }
            ];
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve(mockData) });

            const resultado = await dao.obtenerPreguntas('uuid-examen-1');

            expect(resultado).to.be.an('array');
            expect(resultado.length).to.equal(1);
            expect(resultado[0].bancoPregunta.idBancoPregunta).to.equal('uuid-p1');
        });

        it('debe lanzar error sin examenId', async () => {
            try {
                await dao.obtenerPreguntas();
                expect.fail();
            } catch (e) {
                expect(e.message).to.include('requerido');
            }
        });
    });
});

describe('RespuestaExamenDao - Pruebas Unitarias', () => {
    let dao;

    beforeEach(() => {
        dao = new RespuestaExamenDao();
        sinon.restoreAll();
    });

    afterEach(() => {
        sinon.restoreAll();
    });

    describe('Constructor', () => {
        it('debe crear una instancia de RespuestaExamenDao', () => {
            expect(dao).to.be.instanceOf(RespuestaExamenDao);
        });

        it('debe tener BASE_URL que incluya "respuestas_examen"', () => {
            expect(dao.BASE_URL).to.include('respuestas_examen');
        });
    });

    describe('enviarRespuesta con Stub', () => {
        it('debe enviar body con examenRealizado y preguntaOpcion', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 201, json: () => Promise.resolve({}) });

            await dao.enviarRespuesta('uuid-examen-1', 'uuid-opcion-1');

            const body = JSON.parse(window.fetch.firstCall.args[1].body);
            expect(body.examenRealizado.idExamenRealizado).to.equal('uuid-examen-1');
            expect(body.preguntaOpcion.idPreguntaOpcion).to.equal('uuid-opcion-1');
        });

        it('debe retornar una instancia de RespuestaExamen', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 201, json: () => Promise.resolve({ idRespuestaExamen: 'uuid-r' }) });

            const resultado = await dao.enviarRespuesta('uuid-examen-1', 'uuid-opcion-1');

            expect(resultado).to.be.instanceOf(RespuestaExamen);
        });

        it('debe lanzar error si faltan parámetros', async () => {
            try {
                await dao.enviarRespuesta(null, 'uuid-opcion-1');
                expect.fail();
            } catch (e) {
                expect(e.message).to.include('requerido');
            }
        });
    });

    describe('enviarLote con Stub', () => {
        it('debe enviar body con idExamen y opcionesSeleccionadas', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 201, json: () => Promise.resolve('ok') });

            await dao.enviarLote('uuid-examen-1', ['uuid-o1', 'uuid-o2']);

            const body = JSON.parse(window.fetch.firstCall.args[1].body);
            expect(body.idExamen).to.equal('uuid-examen-1');
            expect(body.opcionesSeleccionadas).to.deep.equal(['uuid-o1', 'uuid-o2']);
        });

        it('debe retornar true al enviar exitosamente', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 201, json: () => Promise.resolve('ok') });
            const resultado = await dao.enviarLote('uuid-examen-1', ['uuid-o1']);
            expect(resultado).to.be.true;
        });

        it('debe lanzar error con lista vacía', async () => {
            try {
                await dao.enviarLote('uuid-examen-1', []);
                expect.fail();
            } catch (e) {
                expect(e.message).to.include('requerido');
            }
        });
    });

    describe('obtenerPorExamen con Stub', () => {
        it('debe retornar instancias de RespuestaExamen', async () => {
            const mockData = [{ idRespuestaExamen: 'uuid-r1' }, { idRespuestaExamen: 'uuid-r2' }];
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve(mockData) });

            const resultado = await dao.obtenerPorExamen('uuid-examen-1');

            expect(resultado).to.be.an('array');
            expect(resultado[0]).to.be.instanceOf(RespuestaExamen);
        });
    });
});
