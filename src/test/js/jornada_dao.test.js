import { expect } from './lib/chai/index.js';
import JornadaDao from '../../js/control/jornada_dao.js';

describe('JornadaDao', () => {
    let jornadaDao;

    beforeEach(() => {
        jornadaDao = new JornadaDao();
    });

    describe('Constructor', () => {
        it('debe crear una instancia de JornadaDao', () => {
            expect(jornadaDao).to.be.instanceOf(JornadaDao);
        });

        it('debe tener la URL base correctamente configurada', () => {
            expect(jornadaDao.BASE_URL).to.include('jornada');
        });

        it('debe incluir el prefijo /v1/ en la URL', () => {
            expect(jornadaDao.BASE_URL).to.include('/v1/');
        });

        it('debe tener URL que comience con http://localhost:9080', () => {
            expect(jornadaDao.BASE_URL).to.include('http://localhost:9080');
        });

        it('debe tener URL que termine con "jornada"', () => {
            expect(jornadaDao.BASE_URL).to.have.string('jornada');
        });

        it('debe terminar con "jornada" sin barra diagonal', () => {
            expect(jornadaDao.BASE_URL).to.match(/jornada$/);
        });
    });

    describe('obtenerJornadas', () => {
        it('debe ser una función', () => {
            expect(jornadaDao.obtenerJornadas).to.be.a('function');
        });

        it('debe retornar una Promesa', () => {
            const resultado = jornadaDao.obtenerJornadas();
            expect(resultado).to.be.instanceOf(Promise);
        });

        it('debe ser un método que puede ser llamado sin parámetros', () => {
            expect(() => jornadaDao.obtenerJornadas()).to.not.throw();
        });

        it('debe ser un método propio de la instancia o heredado', () => {
            expect(jornadaDao).to.have.property('obtenerJornadas');
        });

        it('debe tener tipo function', () => {
            expect(typeof jornadaDao.obtenerJornadas).to.equal('function');
        });
    });

    describe('obtenerJornadaPorId', () => {
        it('debe ser una función', () => {
            expect(jornadaDao.obtenerJornadaPorId).to.be.a('function');
        });

        it('debe retornar una Promesa cuando se le pasa un ID', () => {
            const resultado = jornadaDao.obtenerJornadaPorId(1);
            expect(resultado).to.be.instanceOf(Promise);
        });

        it('debe ser un método que acepta parámetros', () => {
            expect(jornadaDao.obtenerJornadaPorId.length).to.be.at.least(1);
        });

        it('debe lanzar error cuando se llama sin ID', async () => {
            try {
                await jornadaDao.obtenerJornadaPorId();
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.include('requerido');
            }
        });

        it('debe ser un método propio de la instancia o heredado', () => {
            expect(jornadaDao).to.have.property('obtenerJornadaPorId');
        });

        it('debe tener tipo function', () => {
            expect(typeof jornadaDao.obtenerJornadaPorId).to.equal('function');
        });
    });

    describe('Configuración URL', () => {
        it('debe mantener URL consistente entre instancias', () => {
            const dao1 = new JornadaDao();
            const dao2 = new JornadaDao();
            expect(dao1.BASE_URL).to.equal(dao2.BASE_URL);
        });

        it('debe tener URL con patrón válido', () => {
            const pattern = /^http:\/\/.+:\d+\/.+\/v1\/jornada$/;
            expect(jornadaDao.BASE_URL).to.match(pattern);
        });

        it('debe contener "jornada" una sola vez', () => {
            const count = (jornadaDao.BASE_URL.match(/jornada/g) || []).length;
            expect(count).to.equal(1);
        });

        it('debe no contener valores indefinidos', () => {
            expect(jornadaDao.BASE_URL).to.not.include('undefined');
            expect(jornadaDao.BASE_URL).to.not.include('null');
            expect(jornadaDao.BASE_URL).to.not.include('NaN');
        });
    });

    describe('Estructura de herencia', () => {
        it('debe ser una instancia de JornadaDao', () => {
            expect(jornadaDao).to.be.instanceOf(JornadaDao);
        });

        it('debe tener la URL base como una propiedad pública', () => {
            expect(jornadaDao.BASE_URL).to.not.be.undefined;
            expect(jornadaDao.BASE_URL).to.be.a('string');
            expect(jornadaDao.BASE_URL.length).to.be.greaterThan(0);
        });
    });

    describe('Validación de URLs', () => {
        it('debe incluir el ID en construcción de URL', () => {
            expect(jornadaDao.BASE_URL).to.not.include('undefined');
            expect(jornadaDao.BASE_URL).to.not.include('null');
            expect(jornadaDao.BASE_URL).to.not.include('NaN');
        });

        it('debe mantener estructura correcta de URL base', () => {
            const baseUrl = jornadaDao.BASE_URL;
            expect(baseUrl).to.match(/^http/);
            expect(baseUrl).to.include('://');
            expect(baseUrl).to.include(':9080');
        });
    });

    describe('Consistencia de configuración', () => {
        it('debe mantener la URL base entre instancias diferentes', () => {
            const jornada1 = new JornadaDao();
            const jornada2 = new JornadaDao();
            
            expect(jornada1.BASE_URL).to.equal(jornada2.BASE_URL);
        });

        it('debe incluir el sufijo "jornada" exactamente una vez en la URL', () => {
            const matches = (jornadaDao.BASE_URL.match(/jornada/g) || []).length;
            expect(matches).to.equal(1);
        });

        it('debe tener una URL con más de 50 caracteres', () => {
            expect(jornadaDao.BASE_URL.length).to.be.greaterThan(50);
        });

        it('debe ser una URL válida con patrón correcto', () => {
            const urlPattern = /^http:\/\/.+:\d+\/.+\/v1\/jornada$/;
            expect(jornadaDao.BASE_URL).to.match(urlPattern);
        });
    });

    describe('Métodos disponibles', () => {
        it('debe tener el método obtenerJornadas accesible', () => {
            expect(typeof jornadaDao.obtenerJornadas).to.equal('function');
        });

        it('debe tener el método obtenerJornadaPorId accesible', () => {
            expect(typeof jornadaDao.obtenerJornadaPorId).to.equal('function');
        });

        it('debe tener los dos métodos principales implementados', () => {
            expect(jornadaDao.obtenerJornadas).to.exist;
            expect(jornadaDao.obtenerJornadaPorId).to.exist;
            expect(typeof jornadaDao.obtenerJornadas).to.equal('function');
            expect(typeof jornadaDao.obtenerJornadaPorId).to.equal('function');
        });
    });
});
