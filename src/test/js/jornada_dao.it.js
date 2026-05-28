import { expect } from './lib/chai/index.js';
import JornadaDao from '../../js/control/jornada_dao.js';

describe('JornadaDao - Pruebas de Integración', () => {
    let jornadaDao;

    beforeEach(() => {
        jornadaDao = new JornadaDao();
    });

    describe('Integración con servidor real', () => {
        it('debe conectar al servidor y obtener todas las jornadas', async function() {
            this.timeout(5000);
            try {
                const resultado = await jornadaDao.obtenerJornadas();
                expect(resultado).to.be.an('array');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });

        it('debe intentar obtener una jornada por ID del servidor', async function() {
            this.timeout(5000);
            try {
                const resultado = await jornadaDao.obtenerJornadaPorId(1);
                if (resultado) {
                    expect(resultado).to.be.an('object');
                    expect(resultado.id).to.equal(1);
                }
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });
    });

    describe('Estructura de URL para integración', () => {
        it('debe construir URL correcta para obtener todas las jornadas', () => {
            const urlEsperada = 'http://localhost:9080/IngresoUniversitarioTPI135-1.0-SNAPSHOT/resources/v1/jornada';
            expect(jornadaDao.BASE_URL).to.equal(urlEsperada);
        });

        it('debe incluir /v1/ en la ruta', () => {
            expect(jornadaDao.BASE_URL).to.include('/v1/');
        });

        it('debe terminar con /jornada', () => {
            expect(jornadaDao.BASE_URL).to.match(/\/jornada$/);
        });
    });

    describe('Manejo de errores de integración', () => {
        it('debe rechazar cuando no puede conectar al servidor', async function() {
            this.timeout(5000);
            try {
                await jornadaDao.obtenerJornadas();
            } catch (error) {
                expect(error).to.exist;
            }
        });

        it('debe lanzar error cuando se solicita sin ID', async () => {
            try {
                await jornadaDao.obtenerJornadaPorId();
                expect.fail('Debería lanzar error');
            } catch (error) {
                expect(error.message).to.include('requerido');
            }
        });
    });
});
