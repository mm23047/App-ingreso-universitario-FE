import { expect } from '../../lib/chai/index.js';
import sinon from '../../lib/sinon/sinon.js';
import ExamenController    from '../../../../js/control/examen_controller.js';
import ExamenRealizadoDao  from '../../../../js/control/examen_realizado_dao.js';
import RespuestaExamenDao  from '../../../../js/control/respuesta_examen_dao.js';
import PreguntasDao        from '../../../../js/control/preguntas_dao.js';
import AspirantesDao       from '../../../../js/control/aspirantes_dao.js';
import ExamenRealizado     from '../../../../js/entity/ExamenRealizado.js';
import RespuestaExamen     from '../../../../js/entity/RespuestaExamen.js';
import { store, resetStore } from '../../../../js/infra/app_state.js';

describe('ExamenController - Pruebas Unitarias', () => {
    let ctrl;

    const mockInscripcion = { idInscripcionPrueba: 'uuid-insc-1' };
    const mockEtapa       = { idEtapaAdmision: 'uuid-etapa-1', nombre: 'Primera ronda' };
    const mockExamen      = new ExamenRealizado('uuid-examen-1', null, null, null, null, null);

    beforeEach(() => {
        ctrl = new ExamenController();
        sinon.restoreAll();
        resetStore();
    });

    afterEach(() => {
        sinon.restoreAll();
        resetStore();
    });

    // ── Constructor ──────────────────────────────────────────────────────────
    describe('Constructor', () => {
        it('debe crear una instancia de ExamenController', () => {
            expect(ctrl).to.be.instanceOf(ExamenController);
        });
        it('debe tener examenRealizadoDao', () => {
            expect(ctrl.examenRealizadoDao).to.be.instanceOf(ExamenRealizadoDao);
        });
        it('debe tener respuestaExamenDao', () => {
            expect(ctrl.respuestaExamenDao).to.be.instanceOf(RespuestaExamenDao);
        });
        it('debe tener preguntasDao', () => {
            expect(ctrl.preguntasDao).to.be.instanceOf(PreguntasDao);
        });
        it('debe tener aspirantesDao', () => {
            expect(ctrl.aspirantesDao).to.be.instanceOf(AspirantesDao);
        });
    });

    // ── iniciar ──────────────────────────────────────────────────────────────
    describe('iniciar', () => {
        it('debe lanzar error cuando no hay inscripcionActiva en el store', async () => {
            store.etapa = mockEtapa;
            try {
                await ctrl.iniciar();
                expect.fail();
            } catch (e) {
                expect(e.message).to.include('inscripción');
            }
        });

        it('debe lanzar error cuando no hay etapa en el store', async () => {
            store.inscripcionActiva = mockInscripcion;
            try {
                await ctrl.iniciar();
                expect.fail();
            } catch (e) {
                expect(e.message).to.include('etapa');
            }
        });

        it('debe llamar a iniciarExamen con los IDs correctos del store', async () => {
            store.inscripcionActiva = mockInscripcion;
            store.etapa             = mockEtapa;
            let capturedArgs;
            ctrl.examenRealizadoDao.iniciarExamen = (...args) => { capturedArgs = args; return Promise.resolve(mockExamen); };

            await ctrl.iniciar();

            expect(capturedArgs[0]).to.equal('uuid-insc-1');
            expect(capturedArgs[1]).to.equal('uuid-etapa-1');
        });

        it('debe guardar el examen en store.examenActivo', async () => {
            store.inscripcionActiva = mockInscripcion;
            store.etapa             = mockEtapa;
            sinon.stub(ctrl.examenRealizadoDao, 'iniciarExamen').resolves(mockExamen);

            await ctrl.iniciar();

            expect(store.examenActivo).to.equal(mockExamen);
        });

        it('debe retornar el examen creado', async () => {
            store.inscripcionActiva = mockInscripcion;
            store.etapa             = mockEtapa;
            sinon.stub(ctrl.examenRealizadoDao, 'iniciarExamen').resolves(mockExamen);

            const resultado = await ctrl.iniciar();

            expect(resultado).to.equal(mockExamen);
        });

        it('NO debe escribir store.examenActivo cuando el DAO falla (409 ya existe)', async () => {
            store.inscripcionActiva = mockInscripcion;
            store.etapa             = mockEtapa;
            sinon.stub(ctrl.examenRealizadoDao, 'iniciarExamen')
                .rejects(new Error('Error HTTP: 409'));

            try {
                await ctrl.iniciar();
                expect.fail();
            } catch (e) {
                expect(store.examenActivo).to.be.null;
            }
        });

        it('debe restablecer store.loading a false incluso cuando el DAO falla', async () => {
            store.inscripcionActiva = mockInscripcion;
            store.etapa             = mockEtapa;
            sinon.stub(ctrl.examenRealizadoDao, 'iniciarExamen')
                .rejects(new Error('Error HTTP: 500'));

            try { await ctrl.iniciar(); } catch { /* esperado */ }

            expect(store.loading).to.be.false;
        });

        it('debe restablecer store.loading a false cuando iniciar termina con éxito', async () => {
            store.inscripcionActiva = mockInscripcion;
            store.etapa             = mockEtapa;
            sinon.stub(ctrl.examenRealizadoDao, 'iniciarExamen').resolves(mockExamen);

            await ctrl.iniciar();

            expect(store.loading).to.be.false;
        });
    });

    // ── cargarPreguntas ──────────────────────────────────────────────────────
    describe('cargarPreguntas', () => {
        it('debe lanzar error si no hay examen activo en el store', async () => {
            try {
                await ctrl.cargarPreguntas();
                expect.fail();
            } catch (e) {
                expect(e.message).to.include('examen activo');
            }
        });

        it('debe llamar a obtenerPreguntas con el id del examen activo', async () => {
            store.examenActivo = { idExamenRealizado: 'uuid-examen-1' };
            let capturedId;
            ctrl.examenRealizadoDao.obtenerPreguntas = (id) => { capturedId = id; return Promise.resolve([]); };

            await ctrl.cargarPreguntas();

            expect(capturedId).to.equal('uuid-examen-1');
        });

        it('debe cargar opciones por separado para cada pregunta', async () => {
            store.examenActivo = { idExamenRealizado: 'uuid-examen-1' };
            const mockPreguntas = [
                { bancoPregunta: { idBancoPregunta: 'uuid-p1' } },
                { bancoPregunta: { idBancoPregunta: 'uuid-p2' } }
            ];
            sinon.stub(ctrl.examenRealizadoDao, 'obtenerPreguntas').resolves(mockPreguntas);
            const calls = [];
            ctrl.preguntasDao.obtenerOpcionesDePregunta = (id) => { calls.push(id); return Promise.resolve([]); };

            await ctrl.cargarPreguntas();

            expect(calls).to.have.length(2);
            expect(calls[0]).to.equal('uuid-p1');
            expect(calls[1]).to.equal('uuid-p2');
        });

        it('debe asignar opciones vacías si la carga de opciones de una pregunta falla', async () => {
            store.examenActivo = { idExamenRealizado: 'uuid-examen-1' };
            const mockPreguntas = [{ bancoPregunta: { idBancoPregunta: 'uuid-p1' } }];
            sinon.stub(ctrl.examenRealizadoDao, 'obtenerPreguntas').resolves(mockPreguntas);
            sinon.stub(ctrl.preguntasDao, 'obtenerOpcionesDePregunta')
                .rejects(new Error('Network error'));

            const resultado = await ctrl.cargarPreguntas();

            expect(resultado[0].opciones).to.deep.equal([]);
        });

        it('debe guardar las preguntas en store.preguntas', async () => {
            store.examenActivo = { idExamenRealizado: 'uuid-examen-1' };
            const mockPreguntas = [
                { bancoPregunta: { idBancoPregunta: 'uuid-p1' } },
                { bancoPregunta: { idBancoPregunta: 'uuid-p2' } }
            ];
            sinon.stub(ctrl.examenRealizadoDao, 'obtenerPreguntas').resolves(mockPreguntas);
            sinon.stub(ctrl.preguntasDao, 'obtenerOpcionesDePregunta').resolves([]);

            await ctrl.cargarPreguntas();

            expect(store.preguntas).to.be.an('array');
            expect(store.preguntas.length).to.equal(2);
        });

        it('NO debe llamar a obtenerOpcionesDePregunta si la pregunta no tiene bancoPregunta', async () => {
            store.examenActivo = { idExamenRealizado: 'uuid-examen-1' };
            const mockPreguntas = [{ bancoPregunta: null }];
            sinon.stub(ctrl.examenRealizadoDao, 'obtenerPreguntas').resolves(mockPreguntas);
            let wasCalled = false;
            ctrl.preguntasDao.obtenerOpcionesDePregunta = () => { wasCalled = true; return Promise.resolve([]); };

            await ctrl.cargarPreguntas();

            expect(wasCalled).to.be.false;
        });

        it('debe restablecer store.loading a false cuando la carga de preguntas termina con éxito', async () => {
            store.examenActivo = { idExamenRealizado: 'uuid-examen-1' };
            sinon.stub(ctrl.examenRealizadoDao, 'obtenerPreguntas').resolves([]);

            await ctrl.cargarPreguntas();

            expect(store.loading).to.be.false;
        });
    });

    // ── guardarRespuesta ─────────────────────────────────────────────────────
    describe('guardarRespuesta', () => {
        it('debe lanzar error si no hay examen activo en el store', async () => {
            try {
                await ctrl.guardarRespuesta('uuid-opcion-1');
                expect.fail();
            } catch (e) {
                expect(e.message).to.include('examen activo');
            }
        });

        it('debe llamar a enviarRespuesta con el examenId del store y el opcionId', async () => {
            store.examenActivo = { idExamenRealizado: 'uuid-examen-1' };
            let capturedArgs;
            ctrl.respuestaExamenDao.enviarRespuesta = (...args) => { capturedArgs = args; return Promise.resolve(new RespuestaExamen('uuid-r1', null, null)); };

            await ctrl.guardarRespuesta('uuid-opcion-1');

            expect(capturedArgs[0]).to.equal('uuid-examen-1');
            expect(capturedArgs[1]).to.equal('uuid-opcion-1');
        });

        it('debe retornar la respuesta guardada', async () => {
            store.examenActivo = { idExamenRealizado: 'uuid-examen-1' };
            const mockRespuesta = new RespuestaExamen('uuid-r1', null, null);
            sinon.stub(ctrl.respuestaExamenDao, 'enviarRespuesta').resolves(mockRespuesta);

            const resultado = await ctrl.guardarRespuesta('uuid-opcion-1');

            expect(resultado).to.equal(mockRespuesta);
        });

        it('debe propagar error del DAO', async () => {
            store.examenActivo = { idExamenRealizado: 'uuid-examen-1' };
            sinon.stub(ctrl.respuestaExamenDao, 'enviarRespuesta')
                .rejects(new Error('Error HTTP: 400'));

            try {
                await ctrl.guardarRespuesta('uuid-opcion-1');
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
            }
        });
    });

    // ── entregar ─────────────────────────────────────────────────────────────
    describe('entregar', () => {
        it('debe lanzar error si no hay examen activo en el store', async () => {
            try {
                await ctrl.entregar(['uuid-o1']);
                expect.fail();
            } catch (e) {
                expect(e.message).to.include('examen activo');
            }
        });

        it('debe lanzar error si la lista de opciones está vacía', async () => {
            store.examenActivo = { idExamenRealizado: 'uuid-examen-1' };
            try {
                await ctrl.entregar([]);
                expect.fail();
            } catch (e) {
                expect(e.message).to.include('pregunta');
            }
        });

        it('debe lanzar error si opcionesIds es null', async () => {
            store.examenActivo = { idExamenRealizado: 'uuid-examen-1' };
            try {
                await ctrl.entregar(null);
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
            }
        });

        it('debe llamar a enviarLote con el examenId y las opciones seleccionadas', async () => {
            store.examenActivo = { idExamenRealizado: 'uuid-examen-1' };
            let capturedArgs;
            ctrl.respuestaExamenDao.enviarLote = (...args) => { capturedArgs = args; return Promise.resolve(true); };

            await ctrl.entregar(['uuid-o1', 'uuid-o2']);

            expect(capturedArgs[0]).to.equal('uuid-examen-1');
            expect(capturedArgs[1]).to.deep.equal(['uuid-o1', 'uuid-o2']);
        });

        it('debe marcar store.examenActivo.completado = true tras entregar', async () => {
            store.examenActivo = { idExamenRealizado: 'uuid-examen-1', completado: false };
            sinon.stub(ctrl.respuestaExamenDao, 'enviarLote').resolves(true);

            await ctrl.entregar(['uuid-o1']);

            expect(store.examenActivo.completado).to.be.true;
        });

        it('debe propagar error del DAO y NO marcar completado', async () => {
            store.examenActivo = { idExamenRealizado: 'uuid-examen-1', completado: false };
            sinon.stub(ctrl.respuestaExamenDao, 'enviarLote')
                .rejects(new Error('Error HTTP: 500'));

            try {
                await ctrl.entregar(['uuid-o1']);
                expect.fail();
            } catch (e) {
                expect(store.examenActivo.completado).to.be.false;
            }
        });

        it('debe restablecer store.loading a false cuando la entrega termina con éxito', async () => {
            store.examenActivo = { idExamenRealizado: 'uuid-examen-1' };
            sinon.stub(ctrl.respuestaExamenDao, 'enviarLote').resolves(true);

            await ctrl.entregar(['uuid-o1']);

            expect(store.loading).to.be.false;
        });
    });

    // ── consultarResultados ──────────────────────────────────────────────────
    describe('consultarResultados', () => {
        it('debe lanzar error si aspiranteId no se proporciona', async () => {
            try {
                await ctrl.consultarResultados();
                expect.fail();
            } catch (e) {
                expect(e.message).to.include('requerido');
            }
        });

        it('debe llamar a obtenerPorAspirante con el aspiranteId', async () => {
            let capturedId;
            ctrl.examenRealizadoDao.obtenerPorAspirante = (id) => { capturedId = id; return Promise.resolve([mockExamen]); };

            await ctrl.consultarResultados('uuid-aspirante-1');

            expect(capturedId).to.equal('uuid-aspirante-1');
        });

        it('debe retornar el array de examenes del aspirante', async () => {
            sinon.stub(ctrl.examenRealizadoDao, 'obtenerPorAspirante')
                .resolves([mockExamen, mockExamen]);

            const resultado = await ctrl.consultarResultados('uuid-aspirante-1');

            expect(resultado).to.be.an('array');
            expect(resultado.length).to.equal(2);
        });

        it('debe retornar array vacío cuando el aspirante no tiene exámenes (404 → [])', async () => {
            sinon.stub(ctrl.examenRealizadoDao, 'obtenerPorAspirante').resolves([]);

            const resultado = await ctrl.consultarResultados('uuid-aspirante-1');

            expect(resultado).to.deep.equal([]);
        });

        it('debe propagar error del DAO', async () => {
            sinon.stub(ctrl.examenRealizadoDao, 'obtenerPorAspirante')
                .rejects(new Error('Error HTTP: 500'));

            try {
                await ctrl.consultarResultados('uuid-aspirante-1');
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
            }
        });

        it('debe restablecer store.loading a false incluso cuando el DAO falla', async () => {
            sinon.stub(ctrl.examenRealizadoDao, 'obtenerPorAspirante')
                .rejects(new Error('Error HTTP: 500'));

            try { await ctrl.consultarResultados('uuid-a1'); } catch { /* esperado */ }

            expect(store.loading).to.be.false;
        });
    });

    // ── recuperarRespuestas ──────────────────────────────────────────────────
    describe('recuperarRespuestas', () => {
        it('debe retornar array vacío si no hay examen activo en el store', async () => {
            const resultado = await ctrl.recuperarRespuestas();
            expect(resultado).to.deep.equal([]);
        });

        it('debe llamar a obtenerPorExamen con el id del examen activo', async () => {
            store.examenActivo = { idExamenRealizado: 'uuid-examen-1' };
            let capturedId;
            ctrl.respuestaExamenDao.obtenerPorExamen = (id) => { capturedId = id; return Promise.resolve([]); };

            await ctrl.recuperarRespuestas();

            expect(capturedId).to.equal('uuid-examen-1');
        });

        it('debe retornar array vacío si el DAO falla (comportamiento fail-safe)', async () => {
            store.examenActivo = { idExamenRealizado: 'uuid-examen-1' };
            sinon.stub(ctrl.respuestaExamenDao, 'obtenerPorExamen')
                .rejects(new Error('Network error'));

            const resultado = await ctrl.recuperarRespuestas();

            expect(resultado).to.deep.equal([]);
        });
    });

    // ── consultarEstadoAspirante ─────────────────────────────────────────────
    describe('consultarEstadoAspirante', () => {
        const UUID_VALIDO = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
        const mockAsp     = { id: 'asp-1', nombres: 'Juan', apellidos: 'Pérez' };
        const mockInsc    = { idInscripcionPrueba: 'insc-1', estado: 'INSCRITO' };

        it('debe lanzar error cuando criterio es nulo', async () => {
            try {
                await ctrl.consultarEstadoAspirante(null);
                expect.fail();
            } catch (e) {
                expect(e.message).to.include('requerido');
            }
        });

        it('debe lanzar error cuando criterio es cadena vacía', async () => {
            try {
                await ctrl.consultarEstadoAspirante('');
                expect.fail();
            } catch (e) {
                expect(e.message).to.include('requerido');
            }
        });

        // ── CASO A: UUID ──────────────────────────────────────────────────────

        it('CASO A: retorna { tipo:"examenes" } cuando obtenerPorAspirante devuelve exámenes', async () => {
            sinon.stub(ctrl.examenRealizadoDao, 'obtenerPorAspirante').resolves([mockExamen]);

            const resultado = await ctrl.consultarEstadoAspirante(UUID_VALIDO);

            expect(resultado.tipo).to.equal('examenes');
            expect(resultado.datos).to.deep.equal([mockExamen]);
        });

        it('CASO A: retorna { tipo:"inscripciones" } cuando no hay exámenes pero sí inscripciones', async () => {
            sinon.stub(ctrl.examenRealizadoDao, 'obtenerPorAspirante').resolves([]);
            sinon.stub(ctrl.aspirantesDao, 'obtenerInscripciones').resolves([mockInsc]);

            const resultado = await ctrl.consultarEstadoAspirante(UUID_VALIDO);

            expect(resultado.tipo).to.equal('inscripciones');
            expect(resultado.datos).to.deep.equal([mockInsc]);
        });

        it('CASO A: retorna { tipo:"solo_registrado" } cuando no hay exámenes ni inscripciones pero el aspirante existe', async () => {
            sinon.stub(ctrl.examenRealizadoDao, 'obtenerPorAspirante').resolves([]);
            sinon.stub(ctrl.aspirantesDao, 'obtenerInscripciones').resolves([]);
            sinon.stub(ctrl.aspirantesDao, 'obtenerPorId').resolves(mockAsp);

            const resultado = await ctrl.consultarEstadoAspirante(UUID_VALIDO);

            expect(resultado.tipo).to.equal('solo_registrado');
            expect(resultado.datos).to.equal(mockAsp);
        });

        it('CASO A: retorna { tipo:"nada" } cuando el aspirante no existe (404)', async () => {
            sinon.stub(ctrl.examenRealizadoDao, 'obtenerPorAspirante').resolves([]);
            sinon.stub(ctrl.aspirantesDao, 'obtenerInscripciones').resolves([]);
            sinon.stub(ctrl.aspirantesDao, 'obtenerPorId').rejects(new Error('Error HTTP: 404'));

            const resultado = await ctrl.consultarEstadoAspirante(UUID_VALIDO);

            expect(resultado.tipo).to.equal('nada');
            expect(resultado.datos).to.deep.equal([]);
        });

        it('CASO A: retorna { tipo:"nada" } cuando obtenerPorId falla con error no-404', async () => {
            sinon.stub(ctrl.examenRealizadoDao, 'obtenerPorAspirante').resolves([]);
            sinon.stub(ctrl.aspirantesDao, 'obtenerInscripciones').resolves([]);
            sinon.stub(ctrl.aspirantesDao, 'obtenerPorId').rejects(new Error('Error HTTP: 500'));

            const resultado = await ctrl.consultarEstadoAspirante(UUID_VALIDO);

            expect(resultado.tipo).to.equal('nada');
            expect(resultado.datos).to.deep.equal([]);
        });

        // ── CASO B: DUI / correo ──────────────────────────────────────────────

        it('CASO B: usa el parámetro "correo" cuando el criterio contiene "@"', async () => {
            let capturedUrl;
            let fetchCount = 0;
            sinon.stub(window, 'fetch');
            window.fetch = (url) => {
                fetchCount++;
                if (fetchCount === 1) capturedUrl = url;
                return Promise.resolve({ ok: fetchCount === 1, json: () => Promise.resolve([]) });
            };

            await ctrl.consultarEstadoAspirante('juan@correo.com');

            expect(capturedUrl).to.include('buscar');
            expect(capturedUrl).to.include('correo=');
            expect(capturedUrl).to.not.include('dui=');
        });

        it('CASO B: usa el parámetro "dui" cuando el criterio no contiene "@"', async () => {
            let capturedUrl;
            let fetchCount = 0;
            sinon.stub(window, 'fetch');
            window.fetch = (url) => {
                fetchCount++;
                if (fetchCount === 1) capturedUrl = url;
                return Promise.resolve({ ok: fetchCount === 1, json: () => Promise.resolve([]) });
            };

            await ctrl.consultarEstadoAspirante('01234567-8');

            expect(capturedUrl).to.include('buscar');
            expect(capturedUrl).to.include('dui=');
            expect(capturedUrl).to.not.include('correo=');
        });

        it('CASO B: retorna { tipo:"examenes" } cuando /buscar devuelve exámenes', async () => {
            const mockExamenRaw = { idExamenRealizado: 'uuid-e-b1' };
            sinon.stub(window, 'fetch');
            window.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve([mockExamenRaw]) });

            const resultado = await ctrl.consultarEstadoAspirante('01234567-8');

            expect(resultado.tipo).to.equal('examenes');
            expect(resultado.datos).to.have.lengthOf(1);
        });

        it('CASO B: retorna { tipo:"inscripciones" } cuando /buscar vacío y el aspirante tiene inscripciones', async () => {
            let fetchCount = 0;
            sinon.stub(window, 'fetch');
            window.fetch = (url) => {
                fetchCount++;
                if (fetchCount === 1)
                    return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
                return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 'asp-1' }]) });
            };
            sinon.stub(ctrl.aspirantesDao, 'obtenerInscripciones').resolves([mockInsc]);

            const resultado = await ctrl.consultarEstadoAspirante('01234567-8');

            expect(resultado.tipo).to.equal('inscripciones');
            expect(resultado.datos).to.deep.equal([mockInsc]);
        });

        it('CASO B: retorna { tipo:"solo_registrado" } cuando /buscar vacío y el aspirante no tiene inscripciones', async () => {
            let fetchCount = 0;
            sinon.stub(window, 'fetch');
            window.fetch = (url) => {
                fetchCount++;
                if (fetchCount === 1)
                    return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
                return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 'asp-1', nombres: 'Juan' }]) });
            };
            sinon.stub(ctrl.aspirantesDao, 'obtenerInscripciones').resolves([]);

            const resultado = await ctrl.consultarEstadoAspirante('01234567-8');

            expect(resultado.tipo).to.equal('solo_registrado');
        });

        it('CASO B: retorna { tipo:"nada" } cuando /buscar vacío y /aspirantes no encuentra al criterio', async () => {
            let fetchCount = 0;
            sinon.stub(window, 'fetch');
            window.fetch = () => {
                fetchCount++;
                if (fetchCount === 1)
                    return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
                return Promise.resolve({ ok: false });
            };

            const resultado = await ctrl.consultarEstadoAspirante('01234567-8');

            expect(resultado.tipo).to.equal('nada');
            expect(resultado.datos).to.deep.equal([]);
        });

        it('CASO B: lanza error cuando /buscar responde con error del servidor', async () => {
            sinon.stub(window, 'fetch');
            window.fetch = () => Promise.resolve({ ok: false });

            try {
                await ctrl.consultarEstadoAspirante('01234567-8');
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
            }
        });

        // ── store.loading ─────────────────────────────────────────────────────

        it('debe restablecer store.loading a false al terminar con éxito (CASO A)', async () => {
            sinon.stub(ctrl.examenRealizadoDao, 'obtenerPorAspirante').resolves([mockExamen]);

            await ctrl.consultarEstadoAspirante(UUID_VALIDO);

            expect(store.loading).to.be.false;
        });

        it('debe restablecer store.loading a false cuando se lanza un error (CASO B)', async () => {
            sinon.stub(window, 'fetch');
            window.fetch = () => Promise.resolve({ ok: false });

            try { await ctrl.consultarEstadoAspirante('01234567-8'); } catch { /* esperado */ }

            expect(store.loading).to.be.false;
        });
    });

    // ── consultarInscripciones ───────────────────────────────────────────────
    describe('consultarInscripciones', () => {
        it('debe lanzar error cuando aspiranteId no se proporciona', async () => {
            try {
                await ctrl.consultarInscripciones(null);
                expect.fail();
            } catch (e) {
                expect(e.message).to.include('requerido');
            }
        });

        it('debe lanzar error cuando aspiranteId es cadena vacía', async () => {
            try {
                await ctrl.consultarInscripciones('');
                expect.fail();
            } catch (e) {
                expect(e.message).to.include('requerido');
            }
        });

        it('debe llamar a aspirantesDao.obtenerInscripciones con el aspiranteId correcto', async () => {
            let capturedId;
            ctrl.aspirantesDao.obtenerInscripciones = (id) => { capturedId = id; return Promise.resolve([]); };

            await ctrl.consultarInscripciones('uuid-asp-1');

            expect(capturedId).to.equal('uuid-asp-1');
        });

        it('debe retornar el array de inscripciones del DAO', async () => {
            const mockInscripciones = [{ idInscripcionPrueba: 'insc-1' }, { idInscripcionPrueba: 'insc-2' }];
            sinon.stub(ctrl.aspirantesDao, 'obtenerInscripciones').resolves(mockInscripciones);

            const resultado = await ctrl.consultarInscripciones('uuid-asp-1');

            expect(resultado).to.deep.equal(mockInscripciones);
        });

        it('debe restablecer store.loading a false cuando termina con éxito', async () => {
            sinon.stub(ctrl.aspirantesDao, 'obtenerInscripciones').resolves([]);

            await ctrl.consultarInscripciones('uuid-asp-1');

            expect(store.loading).to.be.false;
        });

        it('debe restablecer store.loading a false cuando el DAO falla', async () => {
            sinon.stub(ctrl.aspirantesDao, 'obtenerInscripciones').rejects(new Error('Network error'));

            try { await ctrl.consultarInscripciones('uuid-asp-1'); } catch { /* esperado */ }

            expect(store.loading).to.be.false;
        });

        it('debe propagar el error del DAO al llamador', async () => {
            sinon.stub(ctrl.aspirantesDao, 'obtenerInscripciones').rejects(new Error('Error HTTP: 500'));

            try {
                await ctrl.consultarInscripciones('uuid-asp-1');
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
            }
        });
    });
});
