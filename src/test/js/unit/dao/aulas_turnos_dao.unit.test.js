import { expect } from '../../lib/chai/index.js';
import sinon from '../../lib/sinon/sinon.js';
import AulasTurnosDao from '../../../../js/control/aulas_turnos_dao.js';

describe('AulasTurnosDao - Pruebas Unitarias con Stubs', () => {
    let dao;

    const mockDisponibilidad = [
        {
            idDisponibilidadAulaTurno: { idAula: 'uuid-aula-1', idTurno: 'uuid-turno-1' },
            aula:        { nombreSede: 'Sede Central', departamento: 'San Salvador', codigoAulaApi: 'AULA-A101' },
            turnoExamen: { idTurnoExamen: 'uuid-turno-1', nombreTurno: 'Matutina' }
        },
        {
            idDisponibilidadAulaTurno: { idAula: 'uuid-aula-2', idTurno: 'uuid-turno-2' },
            aula:        { nombreSede: 'Sede Norte', departamento: 'Santa Ana', codigoAulaApi: 'AULA-B202' },
            turnoExamen: { idTurnoExamen: 'uuid-turno-2', nombreTurno: 'Vespertina' }
        }
    ];

    beforeEach(() => {
        dao = new AulasTurnosDao();
        sinon.restoreAll();
    });

    afterEach(() => {
        sinon.restoreAll();
    });

    // ── Constructor ──────────────────────────────────────────────────────────
    describe('Constructor', () => {
        it('debe crear una instancia de AulasTurnosDao', () => {
            expect(dao).to.be.instanceOf(AulasTurnosDao);
        });

        it('debe tener BASE_URL que incluya "aulas_turnos"', () => {
            expect(dao.BASE_URL).to.include('aulas_turnos');
        });

        it('debe incluir /v1/ en la URL', () => {
            expect(dao.BASE_URL).to.include('/v1/');
        });
    });

    // ── obtenerDisponibilidad ────────────────────────────────────────────────
    describe('obtenerDisponibilidad con Stub', () => {
        it('URL debe apuntar al segmento /aulas_turnos/disponibilidad', async () => {
            sinon.stub(window, 'fetch');
            let capturedUrl;
            window.fetch = (url) => { capturedUrl = url; return Promise.resolve({ status: 200, json: () => Promise.resolve([]) }); };

            await dao.obtenerDisponibilidad();

            expect(capturedUrl).to.include('aulas_turnos/disponibilidad');
        });

        it('debe usar método GET', async () => {
            sinon.stub(window, 'fetch');
            let capturedOpts;
            window.fetch = (url, opts) => { capturedOpts = opts; return Promise.resolve({ status: 200, json: () => Promise.resolve([]) }); };

            await dao.obtenerDisponibilidad();

            expect(capturedOpts.method).to.equal('GET');
        });

        it('debe retornar el array de disponibilidades cuando el servidor responde 200', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve(mockDisponibilidad) });

            const resultado = await dao.obtenerDisponibilidad();

            expect(resultado).to.be.an('array');
            expect(resultado.length).to.equal(2);
        });

        it('debe preservar las propiedades del servidor sin transformación adicional', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve(mockDisponibilidad) });

            const resultado = await dao.obtenerDisponibilidad();

            expect(resultado[0].aula.nombreSede).to.equal('Sede Central');
            expect(resultado[0].turnoExamen.nombreTurno).to.equal('Matutina');
            expect(resultado[1].aula.departamento).to.equal('Santa Ana');
        });

        it('debe retornar array vacío cuando el servidor responde 200 con lista vacía', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve([]) });

            const resultado = await dao.obtenerDisponibilidad();

            expect(resultado).to.deep.equal([]);
        });

        it('debe lanzar Error con httpStatus 500 cuando el servidor responde 500', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 500 });

            try {
                await dao.obtenerDisponibilidad();
                expect.fail('Debería haber lanzado un error');
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
                expect(e.httpStatus).to.equal(500);
            }
        });

        it('debe lanzar Error con httpStatus 404 cuando el servidor responde 404', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 404 });

            try {
                await dao.obtenerDisponibilidad();
                expect.fail('Debería haber lanzado un error');
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
                expect(e.httpStatus).to.equal(404);
            }
        });

        it('debe propagar TypeError cuando la red no responde', async () => {
            sinon.stub(window, 'fetch').rejects(new TypeError('Failed to fetch'));

            try {
                await dao.obtenerDisponibilidad();
                expect.fail('Debería haber lanzado un error');
            } catch (e) {
                expect(e).to.be.instanceOf(TypeError);
            }
        });
    });
});
