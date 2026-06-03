import { expect } from './lib/chai/index.js';
import sinon from './lib/sinon/sinon.js';
import PruebasAdmisionDao from '../../js/control/pruebas_admision_dao.js';
import PruebaAdmision from '../../js/entity/PruebaAdmision.js';

describe('PruebasAdmisionDao - Pruebas Unitarias con Stubs', () => {
    let dao;

    const mockPrueba = {
        idPruebaAdmision: 'uuid-prueba-1',
        nombrePrueba:     'Prueba Admisión 2026',
        anio:             2026,
        activa:           true
    };

    beforeEach(() => {
        dao = new PruebasAdmisionDao();
        sinon.restoreAll();
    });

    afterEach(() => {
        sinon.restoreAll();
    });

    describe('Constructor', () => {
        it('debe crear una instancia de PruebasAdmisionDao', () => {
            expect(dao).to.be.instanceOf(PruebasAdmisionDao);
        });

        it('debe tener URL que incluya "pruebas_admision"', () => {
            expect(dao.BASE_URL).to.include('pruebas_admision');
        });

        it('debe incluir /v1/ en la URL', () => {
            expect(dao.BASE_URL).to.include('/v1/');
        });
    });

    describe('obtenerActivas con Stub', () => {
        it('debe retornar instancias de PruebaAdmision', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve([mockPrueba]) });

            const resultado = await dao.obtenerActivas();

            expect(resultado).to.be.an('array');
            expect(resultado.length).to.equal(1);
            expect(resultado[0]).to.be.instanceOf(PruebaAdmision);
        });

        it('debe mapear idPruebaAdmision correctamente', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve([mockPrueba]) });

            const resultado = await dao.obtenerActivas();

            expect(resultado[0].idPruebaAdmision).to.equal('uuid-prueba-1');
            expect(resultado[0].id).to.equal('uuid-prueba-1');
            expect(resultado[0].activa).to.be.true;
        });

        it('debe usar la ruta /activas', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve([]) });

            await dao.obtenerActivas();

            const urlLlamada = window.fetch.firstCall.args[0];
            expect(urlLlamada).to.include('/activas');
        });

        it('debe retornar array vacío si no hay pruebas activas', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve([]) });

            const resultado = await dao.obtenerActivas();
            expect(resultado).to.be.an('array');
            expect(resultado.length).to.equal(0);
        });

        it('debe lanzar error cuando el servidor responde 500', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 500 });

            try {
                await dao.obtenerActivas();
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });
    });

    describe('obtenerPorId con Stub', () => {
        it('debe retornar una instancia de PruebaAdmision', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve(mockPrueba) });

            const resultado = await dao.obtenerPorId('uuid-prueba-1');

            expect(resultado).to.be.instanceOf(PruebaAdmision);
            expect(resultado.idPruebaAdmision).to.equal('uuid-prueba-1');
        });

        it('debe lanzar error cuando se llama sin ID', async () => {
            try {
                await dao.obtenerPorId();
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error.message).to.include('requerido');
            }
        });

        it('debe lanzar error cuando el servidor responde 404', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 404 });

            try {
                await dao.obtenerPorId('uuid-no-existe');
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });
    });

    describe('Métodos disponibles', () => {
        it('debe tener obtenerActivas', () => {
            expect(typeof dao.obtenerActivas).to.equal('function');
        });

        it('debe tener obtenerPorId', () => {
            expect(typeof dao.obtenerPorId).to.equal('function');
        });

        it('debe tener obtenerTodas', () => {
            expect(typeof dao.obtenerTodas).to.equal('function');
        });
    });
});
