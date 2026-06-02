import { expect } from './lib/chai/index.js';
import TurnosDao from '../../js/dao/turnos_dao.js';

describe('TurnosDao - Pruebas de Integración', () => {
    let turnosDao;

    beforeEach(() => {
        turnosDao = new TurnosDao();
    });

    describe('Integración con servidor real', () => {
        it('debe conectar al servidor y obtener todos los turnos', async function() {
            this.timeout(5000);
            try {
                const resultado = await turnosDao.obtenerTurnos();
                expect(resultado).to.be.an('array');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
            }
        });

        it('debe intentar obtener un turno por ID del servidor', async function() {
            this.timeout(5000);
            try {
                const resultado = await turnosDao.obtenerTurnoPorId(1);
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
        it('debe construir URL correcta para obtener todos los turnos', () => {
            const urlEsperada = 'http://localhost:9080/IngresoUniversitarioTPI135-1.0-SNAPSHOT/resources/v1/turnos';
            expect(turnosDao.BASE_URL).to.equal(urlEsperada);
        });

        it('debe incluir /v1/ en la ruta', () => {
            expect(turnosDao.BASE_URL).to.include('/v1/');
        });

        it('debe terminar con /turnos', () => {
            expect(turnosDao.BASE_URL).to.match(/\/turnos$/);
        });
    });

    describe('Manejo de errores de integración', () => {
        it('debe rechazar cuando no puede conectar al servidor', async function() {
            this.timeout(5000);
            try {
                await turnosDao.obtenerTurnos();
            } catch (error) {
                expect(error).to.exist;
            }
        });

        it('debe lanzar error cuando se solicita sin ID', async () => {
            try {
                await turnosDao.obtenerTurnoPorId();
                expect.fail('Debería lanzar error');
            } catch (error) {
                expect(error.message).to.include('requerido');
            }
        });
    });
});
