import { expect } from '../../lib/chai/index.js';
import sinon from '../../lib/sinon/sinon.js';
import PruebasAdmisionDao from '../../../../js/control/pruebas_admision_dao.js';
import PruebaAdmision from '../../../../js/entity/PruebaAdmision.js';

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
            expect(resultado[0].activa).to.be.true;
        });

        it('debe usar la ruta /activas', async () => {
            sinon.stub(window, 'fetch');
            let capturedUrl;
            window.fetch = (url) => { capturedUrl = url; return Promise.resolve({ status: 200, json: () => Promise.resolve([]) }); };

            await dao.obtenerActivas();

            expect(capturedUrl).to.include('/activas');
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

    describe('obtenerTodas — construcción de URL con filtros', () => {
        it('debe incluir first=0 y max=50 en la URL por defecto', async () => {
            sinon.stub(window, 'fetch');
            let capturedUrl;
            window.fetch = (url) => { capturedUrl = url; return Promise.resolve({ status: 200, json: () => Promise.resolve([]) }); };

            await dao.obtenerTodas();

            expect(capturedUrl).to.include('first=0');
            expect(capturedUrl).to.include('max=50');
        });

        it('debe incluir ?buscar=2026 en la URL cuando buscar es "2026"', async () => {
            sinon.stub(window, 'fetch');
            let capturedUrl;
            window.fetch = (url) => { capturedUrl = url; return Promise.resolve({ status: 200, json: () => Promise.resolve([]) }); };

            await dao.obtenerTodas(0, 50, '2026');

            expect(capturedUrl).to.include('buscar=2026');
        });

        it('debe incluir ?buscar= con el texto exacto cuando se busca por nombre', async () => {
            sinon.stub(window, 'fetch');
            let capturedUrl;
            window.fetch = (url) => { capturedUrl = url; return Promise.resolve({ status: 200, json: () => Promise.resolve([]) }); };

            await dao.obtenerTodas(0, 50, 'Proceso 2026');

            expect(capturedUrl).to.include('buscar=');
            // URLSearchParams codifica espacios como '+'; URLSearchParams.get() los decodifica correctamente
            expect(new URL(capturedUrl).searchParams.get('buscar')).to.equal('Proceso 2026');
        });

        it('NO debe incluir el parámetro buscar cuando buscar es ""', async () => {
            sinon.stub(window, 'fetch');
            let capturedUrl;
            window.fetch = (url) => { capturedUrl = url; return Promise.resolve({ status: 200, json: () => Promise.resolve([]) }); };

            await dao.obtenerTodas(0, 50, '');

            expect(capturedUrl).to.not.include('buscar');
        });

        it('NO debe incluir el parámetro buscar cuando buscar es solo espacios en blanco', async () => {
            sinon.stub(window, 'fetch');
            let capturedUrl;
            window.fetch = (url) => { capturedUrl = url; return Promise.resolve({ status: 200, json: () => Promise.resolve([]) }); };

            await dao.obtenerTodas(0, 50, '   ');

            expect(capturedUrl).to.not.include('buscar');
        });

        it('debe retornar instancias de PruebaAdmision', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 200, json: () => Promise.resolve([mockPrueba]) });

            const resultado = await dao.obtenerTodas();

            expect(resultado[0]).to.be.instanceOf(PruebaAdmision);
        });

        it('debe lanzar error cuando el servidor responde 500', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 500 });

            try {
                await dao.obtenerTodas();
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });

        it('debe respetar first y max personalizados en la URL', async () => {
            sinon.stub(window, 'fetch');
            let capturedUrl;
            window.fetch = (url) => { capturedUrl = url; return Promise.resolve({ status: 200, json: () => Promise.resolve([]) }); };

            await dao.obtenerTodas(10, 25, '');

            expect(capturedUrl).to.include('first=10');
            expect(capturedUrl).to.include('max=25');
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
