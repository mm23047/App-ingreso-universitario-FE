import { expect } from '../../lib/chai/index.js';
import sinon from '../../lib/sinon/sinon.js';
import AreasConocimientoDao from '../../../../js/control/areas_dao.js';
import AreaConocimiento from '../../../../js/entity/AreaConocimiento.js';
import Tema from '../../../../js/entity/Tema.js';

describe('AreasConocimientoDao - Pruebas Unitarias con Stubs', () => {
    let dao;

    const mockArea = {
        idAreaConocimiento: 'uuid-area-1',
        nombreArea: 'Matemáticas'
    };

    const mockTema = {
        idTema: 'uuid-tema-1',
        nombreTema: 'Álgebra',
        areaConocimiento: { idAreaConocimiento: 'uuid-area-1', nombreArea: 'Matemáticas' }
    };

    // Estructura que devuelve GET /pruebas_admision/{id}/areas — árbol plano área→temas
    const mockArbolPrueba = [
        {
            idAreaConocimiento: 'uuid-area-1',
            nombreArea: 'Matemáticas',
            temas: [
                { idTema: 'uuid-tema-1', nombreTema: 'Álgebra' },
                { idTema: 'uuid-tema-2', nombreTema: 'Geometría' }
            ]
        },
        {
            idAreaConocimiento: 'uuid-area-2',
            nombreArea: 'Ciencias',
            temas: [
                { idTema: 'uuid-tema-3', nombreTema: 'Física' }
            ]
        }
    ];

    beforeEach(() => {
        dao = new AreasConocimientoDao();
        sinon.restoreAll();
    });

    afterEach(() => {
        sinon.restoreAll();
    });

    describe('Constructor', () => {
        it('debe crear una instancia de AreasConocimientoDao', () => {
            expect(dao).to.be.instanceOf(AreasConocimientoDao);
        });

        it('debe tener BASE_URL que incluya "areas"', () => {
            expect(dao.BASE_URL).to.include('areas');
        });

        it('debe incluir /v1/ en la URL', () => {
            expect(dao.BASE_URL).to.include('/v1/');
        });

        it('debe tener URL que comience con http://localhost:9080', () => {
            expect(dao.BASE_URL).to.include('http://localhost:9080');
        });

        it('debe terminar con "areas"', () => {
            expect(dao.BASE_URL).to.match(/areas$/);
        });
    });

    describe('obtenerTodas con Stub', () => {
        it('debe retornar instancias de AreaConocimiento', async () => {
            sinon.stub(window, 'fetch').resolves({
                status: 200,
                json: () => Promise.resolve([mockArea])
            });

            const resultado = await dao.obtenerTodas();

            expect(resultado).to.be.an('array');
            expect(resultado.length).to.equal(1);
            expect(resultado[0]).to.be.instanceOf(AreaConocimiento);
        });

        it('debe mapear idAreaConocimiento y nombreArea', async () => {
            sinon.stub(window, 'fetch').resolves({
                status: 200,
                json: () => Promise.resolve([mockArea])
            });

            const resultado = await dao.obtenerTodas();

            expect(resultado[0].idAreaConocimiento).to.equal('uuid-area-1');
            expect(resultado[0].nombreArea).to.equal('Matemáticas');
        });

        it('debe incluir los parámetros first y max en la URL', async () => {
            sinon.stub(window, 'fetch');
            let capturedUrl;
            window.fetch = (url) => { capturedUrl = url; return Promise.resolve({ status: 200, json: () => Promise.resolve([]) }); };

            await dao.obtenerTodas(0, 100);

            expect(capturedUrl).to.include('first=0');
            expect(capturedUrl).to.include('max=100');
        });

        it('debe usar first=0 y max=100 por defecto', async () => {
            sinon.stub(window, 'fetch');
            let capturedUrl;
            window.fetch = (url) => { capturedUrl = url; return Promise.resolve({ status: 200, json: () => Promise.resolve([]) }); };

            await dao.obtenerTodas();

            expect(capturedUrl).to.include('first=0');
            expect(capturedUrl).to.include('max=100');
        });

        it('debe retornar array vacío cuando no hay áreas', async () => {
            sinon.stub(window, 'fetch').resolves({
                status: 200,
                json: () => Promise.resolve([])
            });

            const resultado = await dao.obtenerTodas();
            expect(resultado).to.be.an('array');
            expect(resultado.length).to.equal(0);
        });

        it('debe mapear múltiples áreas correctamente', async () => {
            const mockDosAreas = [
                { idAreaConocimiento: 'uuid-a1', nombreArea: 'Matemáticas' },
                { idAreaConocimiento: 'uuid-a2', nombreArea: 'Ciencias' }
            ];
            sinon.stub(window, 'fetch').resolves({
                status: 200,
                json: () => Promise.resolve(mockDosAreas)
            });

            const resultado = await dao.obtenerTodas();

            expect(resultado.length).to.equal(2);
            expect(resultado[1]).to.be.instanceOf(AreaConocimiento);
            expect(resultado[1].nombreArea).to.equal('Ciencias');
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
    });

    describe('obtenerTemasPorArea con Stub', () => {
        it('debe retornar instancias de Tema', async () => {
            sinon.stub(window, 'fetch').resolves({
                status: 200,
                json: () => Promise.resolve([mockTema])
            });

            const resultado = await dao.obtenerTemasPorArea('uuid-area-1');

            expect(resultado).to.be.an('array');
            expect(resultado.length).to.equal(1);
            expect(resultado[0]).to.be.instanceOf(Tema);
        });

        it('debe mapear idTema, nombreTema y areaConocimiento anidada', async () => {
            sinon.stub(window, 'fetch').resolves({
                status: 200,
                json: () => Promise.resolve([mockTema])
            });

            const resultado = await dao.obtenerTemasPorArea('uuid-area-1');

            expect(resultado[0].idTema).to.equal('uuid-tema-1');
            expect(resultado[0].nombreTema).to.equal('Álgebra');
            expect(resultado[0].areaConocimiento).to.be.instanceOf(AreaConocimiento);
            expect(resultado[0].areaConocimiento.idAreaConocimiento).to.equal('uuid-area-1');
        });

        it('debe llamar a la URL /areas/{idArea}/temas', async () => {
            sinon.stub(window, 'fetch');
            let capturedUrl;
            window.fetch = (url) => { capturedUrl = url; return Promise.resolve({ status: 200, json: () => Promise.resolve([]) }); };

            await dao.obtenerTemasPorArea('uuid-area-1');

            expect(capturedUrl).to.include('areas/uuid-area-1/temas');
        });

        it('debe lanzar error cuando no se proporciona idArea', async () => {
            try {
                await dao.obtenerTemasPorArea();
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.include('requerido');
            }
        });

        it('debe lanzar error cuando el servidor responde 404', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 404 });

            try {
                await dao.obtenerTemasPorArea('uuid-inexistente');
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });
    });

    describe('obtenerAreasPorPrueba con Stub — árbol de conocimiento', () => {
        it('debe retornar el árbol completo área→temas', async () => {
            sinon.stub(window, 'fetch').resolves({
                status: 200,
                json: () => Promise.resolve(mockArbolPrueba)
            });

            const resultado = await dao.obtenerAreasPorPrueba('uuid-prueba-1');

            expect(resultado).to.be.an('array');
            expect(resultado.length).to.equal(2);
        });

        it('debe preservar la estructura anidada con temas', async () => {
            sinon.stub(window, 'fetch').resolves({
                status: 200,
                json: () => Promise.resolve(mockArbolPrueba)
            });

            const resultado = await dao.obtenerAreasPorPrueba('uuid-prueba-1');

            expect(resultado[0].idAreaConocimiento).to.equal('uuid-area-1');
            expect(resultado[0].temas).to.be.an('array');
            expect(resultado[0].temas.length).to.equal(2);
            expect(resultado[0].temas[0].idTema).to.equal('uuid-tema-1');
        });

        it('debe llamar a /pruebas_admision/{idPrueba}/areas — no a /areas', async () => {
            sinon.stub(window, 'fetch');
            let capturedUrl;
            window.fetch = (url) => { capturedUrl = url; return Promise.resolve({ status: 200, json: () => Promise.resolve([]) }); };

            await dao.obtenerAreasPorPrueba('uuid-prueba-1');

            expect(capturedUrl).to.include('pruebas_admision/uuid-prueba-1/areas');
        });

        it('la URL de obtenerAreasPorPrueba no debe contener /areas/uuid-prueba-1', async () => {
            sinon.stub(window, 'fetch');
            let capturedUrl;
            window.fetch = (url) => { capturedUrl = url; return Promise.resolve({ status: 200, json: () => Promise.resolve([]) }); };

            await dao.obtenerAreasPorPrueba('uuid-prueba-1');

            expect(capturedUrl).to.not.match(/\/areas\/uuid-prueba-1/);
        });

        it('debe lanzar error cuando no se proporciona idPrueba', async () => {
            try {
                await dao.obtenerAreasPorPrueba();
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.include('requerido');
            }
        });

        it('debe lanzar error cuando el servidor responde 500', async () => {
            sinon.stub(window, 'fetch').resolves({ status: 500 });

            try {
                await dao.obtenerAreasPorPrueba('uuid-prueba-1');
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });
    });

    describe('Métodos disponibles', () => {
        it('debe tener obtenerTodas', () => {
            expect(typeof dao.obtenerTodas).to.equal('function');
        });

        it('debe tener obtenerTemasPorArea', () => {
            expect(typeof dao.obtenerTemasPorArea).to.equal('function');
        });

        it('debe tener obtenerAreasPorPrueba', () => {
            expect(typeof dao.obtenerAreasPorPrueba).to.equal('function');
        });
    });
});
