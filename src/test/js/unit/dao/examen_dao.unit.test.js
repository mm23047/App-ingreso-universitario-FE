import { expect } from '../../lib/chai/index.js';
import sinon from '../../lib/sinon/sinon.js';
import ExamenRealizadoDao from '../../../../js/control/examen_realizado_dao.js';
import RespuestaExamenDao from '../../../../js/control/respuesta_examen_dao.js';
import ExamenRealizado from '../../../../js/entity/ExamenRealizado.js';
import RespuestaExamen from '../../../../js/entity/RespuestaExamen.js';

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
            sinon.stub(window, 'fetch');
            let capturedOpts;
            window.fetch = (url, opts) => { capturedOpts = opts; return Promise.resolve({ status: 201, json: () => Promise.resolve({}) }); };

            await dao.iniciarExamen('uuid-inscripcion-1', 'uuid-etapa-1');

            const body = JSON.parse(capturedOpts.body);
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

// RespuestaExamenDao está cubierto por su propio archivo: respuesta_examen_dao.unit.test.js

// ── obtenerPorAspirante ───────────────────────────────────────────────────────
// Método con comportamiento especial: 404 → [] (no lanza, devuelve vacío)
// No cubierto en ningún otro archivo de unitarias.

describe('ExamenRealizadoDao — obtenerPorAspirante con Stub', () => {
    let dao;

    beforeEach(() => {
        dao = new ExamenRealizadoDao();
        sinon.restoreAll();
    });

    afterEach(() => {
        sinon.restoreAll();
    });

    it('debe retornar un array de ExamenRealizado cuando el servidor responde 200', async () => {
        const mockData = [{ idExamenRealizado: 'uuid-e1' }, { idExamenRealizado: 'uuid-e2' }];
        sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve(mockData) });

        const resultado = await dao.obtenerPorAspirante('uuid-aspirante-1');

        expect(resultado).to.be.an('array');
        expect(resultado.length).to.equal(2);
        expect(resultado[0]).to.be.instanceOf(ExamenRealizado);
        expect(resultado[0].idExamenRealizado).to.equal('uuid-e1');
    });

    it('URL debe incluir el segmento /aspirante/{aspiranteId}', async () => {
        sinon.stub(window, 'fetch');
        let capturedUrl;
        window.fetch = (url) => { capturedUrl = url; return Promise.resolve({ status: 200, json: () => Promise.resolve([]) }); };

        await dao.obtenerPorAspirante('uuid-aspirante-1');

        expect(capturedUrl).to.include('/aspirante/uuid-aspirante-1');
    });

    it('debe retornar array vacío con status 404 — aspirante sin exámenes no es un error', async () => {
        sinon.stub(window, 'fetch').resolves({ status: 404 });

        const resultado = await dao.obtenerPorAspirante('uuid-aspirante-sin-examenes');

        expect(resultado).to.deep.equal([]);
    });

    it('debe lanzar error con status 400 (ID con formato inválido)', async () => {
        sinon.stub(window, 'fetch').resolves({ status: 400 });

        try {
            await dao.obtenerPorAspirante('formato-invalido');
            expect.fail();
        } catch (e) {
            expect(e.message).to.include('inválido');
        }
    });

    it('debe lanzar error si aspiranteId no se proporciona', async () => {
        try {
            await dao.obtenerPorAspirante();
            expect.fail();
        } catch (e) {
            expect(e.message).to.include('requerido');
        }
    });
});
