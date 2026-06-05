import { expect } from './lib/chai/index.js';
import sinon from './lib/sinon/sinon.js';
import EtapasDao from '../../js/control/etapas_dao.js';
import EtapasAdmision from '../../js/entity/EtapasAdmision.js';

describe('EtapasDao - Pruebas Unitarias con Stubs', () => {
    let dao;

    const mockEtapa = {
        idEtapaAdmision:            'uuid-etapa-1',
        nombre:                     'Etapa Primera Ronda',
        cantidadPreguntasRequeridas: 40
    };

    beforeEach(() => {
        dao = new EtapasDao();
        sinon.restoreAll();
    });

    afterEach(() => {
        sinon.restoreAll();
    });

    describe('Constructor', () => {
        it('debe crear una instancia de EtapasDao', () => {
            expect(dao).to.be.instanceOf(EtapasDao);
        });

        it('debe tener URL que incluya "etapas"', () => {
            expect(dao.BASE_URL).to.include('etapas');
        });

        it('debe incluir /v1/ en la URL', () => {
            expect(dao.BASE_URL).to.include('/v1/');
        });
    });

    describe('obtenerTodas con Stub', () => {
        it('debe retornar instancias de EtapasAdmision', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve([mockEtapa]) });

            const resultado = await dao.obtenerTodas();

            expect(resultado).to.be.an('array');
            expect(resultado[0]).to.be.instanceOf(EtapasAdmision);
        });

        it('debe mapear idEtapaAdmision e id', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve([mockEtapa]) });

            const resultado = await dao.obtenerTodas();

            expect(resultado[0].idEtapaAdmision).to.equal('uuid-etapa-1');
            expect(resultado[0].cantidadPreguntasRequeridas).to.equal(40);
        });

        it('debe retornar array vacío si no hay etapas', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve([]) });
            const resultado = await dao.obtenerTodas();
            expect(resultado).to.have.lengthOf(0);
        });

        it('debe lanzar error cuando el servidor responde 500', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 500 });
            try {
                await dao.obtenerTodas();
                expect.fail();
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });
    });

    describe('obtenerPorId con Stub', () => {
        it('debe retornar una instancia de EtapasAdmision', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve(mockEtapa) });

            const resultado = await dao.obtenerPorId('uuid-etapa-1');

            expect(resultado).to.be.instanceOf(EtapasAdmision);
            expect(resultado.nombre).to.equal('Etapa Primera Ronda');
        });

        it('debe lanzar error cuando se llama sin ID', async () => {
            try {
                await dao.obtenerPorId();
                expect.fail();
            } catch (error) {
                expect(error.message).to.include('requerido');
            }
        });

        it('debe lanzar error cuando el servidor responde 404', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 404 });
            try {
                await dao.obtenerPorId('uuid-no-existe');
                expect.fail();
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });
    });

    describe('Métodos disponibles', () => {
        it('debe tener obtenerTodas', () => {
            expect(typeof dao.obtenerTodas).to.equal('function');
        });

        it('debe tener obtenerPorId', () => {
            expect(typeof dao.obtenerPorId).to.equal('function');
        });
    });
});
