import { expect } from '../lib/chai/index.js';
import LocalStorageDao from '../../js/control/local_storage_dao.js';

describe('LocalStorageDao - Pruebas Unitarias', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('Constructor y Propiedades Estáticas', () => {
        it('debe tener constante JORNADAS_KEY', () => {
            expect(LocalStorageDao.JORNADAS_KEY).to.exist;
            expect(LocalStorageDao.JORNADAS_KEY).to.equal('app_jornadas_seleccionadas');
        });

        it('debe tener constante CARRERAS_KEY', () => {
            expect(LocalStorageDao.CARRERAS_KEY).to.exist;
            expect(LocalStorageDao.CARRERAS_KEY).to.equal('app_carreras_seleccionadas');
        });
    });

    describe('Guardar y Obtener Jornadas', () => {
        it('debe guardar el ID de una jornada', () => {
            const resultado = LocalStorageDao.guardarJornada(1);
            expect(resultado).to.be.true;
        });

        it('debe guardar SOLO el ID, no un objeto completo', () => {
            LocalStorageDao.guardarJornada(1);
            const datos = localStorage.getItem(LocalStorageDao.JORNADAS_KEY);

            expect(datos).to.equal('[1]');
            expect(datos).to.not.include('nombre');
            expect(datos).to.not.include('horario');
        });

        it('debe obtener todas las jornadas guardadas', () => {
            LocalStorageDao.guardarJornada(1);
            LocalStorageDao.guardarJornada(2);

            const jornadas = LocalStorageDao.obtenerTodasLasJornadas();

            expect(jornadas).to.be.an('array');
            expect(jornadas).to.deep.equal([1, 2]);
        });

        it('debe retornar array vacío si no hay jornadas guardadas', () => {
            const jornadas = LocalStorageDao.obtenerTodasLasJornadas();
            expect(jornadas).to.be.an('array');
            expect(jornadas).to.have.lengthOf(0);
        });

        it('debe evitar duplicados al guardar jornadas', () => {
            LocalStorageDao.guardarJornada(1);
            LocalStorageDao.guardarJornada(1);

            const jornadas = LocalStorageDao.obtenerTodasLasJornadas();
            expect(jornadas).to.have.lengthOf(1);
        });

        it('debe lanzar error si intenta guardar sin ID', () => {
            expect(() => {
                LocalStorageDao.guardarJornada(null);
            }).to.throw();
        });

        it('debe lanzar error si intenta guardar con ID indefinido', () => {
            expect(() => {
                LocalStorageDao.guardarJornada(undefined);
            }).to.throw();
        });
    });

    describe('Jornada Actual', () => {
        it('debe establecer la jornada actual', () => {
            const resultado = LocalStorageDao.establecerJornadaActual(5);
            expect(resultado).to.be.true;
        });

        it('debe guardar SOLO el ID de la jornada actual', () => {
            LocalStorageDao.establecerJornadaActual(5);
            const valor = localStorage.getItem('jornadaActual');

            expect(valor).to.equal('5');
        });

        it('debe obtener la jornada actual', () => {
            LocalStorageDao.establecerJornadaActual(3);
            const jornadaId = LocalStorageDao.obtenerJornadaActual();

            expect(jornadaId).to.equal(3);
        });

        it('debe retornar null si no hay jornada actual', () => {
            const jornadaId = LocalStorageDao.obtenerJornadaActual();
            expect(jornadaId).to.be.null;
        });

        it('debe retornar número, no cadena', () => {
            LocalStorageDao.establecerJornadaActual(7);
            const jornadaId = LocalStorageDao.obtenerJornadaActual();

            expect(jornadaId).to.be.a('number');
            expect(jornadaId).to.equal(7);
        });

        it('debe lanzar error sin ID al establecer jornada actual', () => {
            expect(() => {
                LocalStorageDao.establecerJornadaActual(null);
            }).to.throw();
        });
    });

    describe('Guardar y Obtener Carreras', () => {
        it('debe guardar el ID de una carrera', () => {
            const resultado = LocalStorageDao.guardarCarrera(1);
            expect(resultado).to.be.true;
        });

        it('debe guardar SOLO el ID de carrera, no el objeto', () => {
            LocalStorageDao.guardarCarrera(1);
            const datos = localStorage.getItem(LocalStorageDao.CARRERAS_KEY);

            expect(datos).to.equal('[1]');
            expect(datos).to.not.include('nombre');
        });

        it('debe obtener todas las carreras guardadas', () => {
            LocalStorageDao.guardarCarrera(1);
            LocalStorageDao.guardarCarrera(2);
            LocalStorageDao.guardarCarrera(3);

            const carreras = LocalStorageDao.obtenerTodasLasCarreras();

            expect(carreras).to.deep.equal([1, 2, 3]);
        });

        it('debe retornar array vacío si no hay carreras', () => {
            const carreras = LocalStorageDao.obtenerTodasLasCarreras();
            expect(carreras).to.have.lengthOf(0);
        });

        it('debe evitar duplicados en carreras', () => {
            LocalStorageDao.guardarCarrera(2);
            LocalStorageDao.guardarCarrera(2);

            const carreras = LocalStorageDao.obtenerTodasLasCarreras();
            expect(carreras).to.have.lengthOf(1);
        });
    });

    describe('Carrera Actual', () => {
        it('debe establecer la carrera actual', () => {
            const resultado = LocalStorageDao.establecerCarreraActual(4);
            expect(resultado).to.be.true;
        });

        it('debe obtener la carrera actual', () => {
            LocalStorageDao.establecerCarreraActual(4);
            const carreraId = LocalStorageDao.obtenerCarreraActual();

            expect(carreraId).to.equal(4);
        });

        it('debe retornar null si no hay carrera actual', () => {
            const carreraId = LocalStorageDao.obtenerCarreraActual();
            expect(carreraId).to.be.null;
        });

        it('debe guardar SOLO el ID de carrera actual', () => {
            LocalStorageDao.establecerCarreraActual(9);
            const valor = localStorage.getItem('carreraActual');

            expect(valor).to.equal('9');
        });
    });

    describe('Verificar Existencia', () => {
        it('debe verificar si existe una clave', () => {
            localStorage.setItem('clave_prueba', 'valor');
            const existe = LocalStorageDao.existe('clave_prueba');

            expect(existe).to.be.true;
        });

        it('debe retornar false si no existe clave', () => {
            const existe = LocalStorageDao.existe('clave_inexistente');
            expect(existe).to.be.false;
        });
    });

    describe('Limpiar Datos', () => {
        it('debe limpiar todos los datos locales', () => {
            LocalStorageDao.guardarJornada(1);
            LocalStorageDao.guardarCarrera(2);
            LocalStorageDao.establecerJornadaActual(1);
            LocalStorageDao.establecerCarreraActual(2);

            const resultado = LocalStorageDao.limpiarTodo();

            expect(resultado).to.be.true;
            expect(localStorage.length).to.equal(0);
        });

        it('debe eliminar jornadas al limpiar', () => {
            LocalStorageDao.guardarJornada(1);
            LocalStorageDao.limpiarTodo();

            const jornadas = LocalStorageDao.obtenerTodasLasJornadas();
            expect(jornadas).to.have.lengthOf(0);
        });

        it('debe eliminar carreras al limpiar', () => {
            LocalStorageDao.guardarCarrera(1);
            LocalStorageDao.limpiarTodo();

            const carreras = LocalStorageDao.obtenerTodasLasCarreras();
            expect(carreras).to.have.lengthOf(0);
        });
    });

    describe('Resumen de Datos', () => {
        it('debe obtener resumen de datos guardados', () => {
            LocalStorageDao.guardarJornada(1);
            LocalStorageDao.establecerJornadaActual(1);
            LocalStorageDao.guardarCarrera(2);
            LocalStorageDao.establecerCarreraActual(2);

            const resumen = LocalStorageDao.obtenerResumen();

            expect(resumen).to.have.property('jornadasGuardadas');
            expect(resumen).to.have.property('jornadaActual');
            expect(resumen).to.have.property('carrerasGuardadas');
            expect(resumen).to.have.property('carreraActual');
        });

        it('debe mostrar IDs correctos en resumen', () => {
            LocalStorageDao.guardarJornada(1);
            LocalStorageDao.establecerJornadaActual(1);

            const resumen = LocalStorageDao.obtenerResumen();

            expect(resumen.jornadasGuardadas).to.deep.equal([1]);
            expect(resumen.jornadaActual).to.equal(1);
        });

        it('debe mostrar valores null si no hay datos', () => {
            const resumen = LocalStorageDao.obtenerResumen();

            expect(resumen.jornadaActual).to.be.null;
            expect(resumen.carreraActual).to.be.null;
        });
    });

    describe('Integración - Flujo Completo', () => {
        it('debe guardar jornada completa, seleccionar y obtener', () => {
            // 1. Guardar múltiples jornadas
            LocalStorageDao.guardarJornada(1);
            LocalStorageDao.guardarJornada(2);

            // 2. Establecer la actual
            LocalStorageDao.establecerJornadaActual(2);

            // 3. Verificar
            expect(LocalStorageDao.obtenerJornadaActual()).to.equal(2);
            expect(LocalStorageDao.obtenerTodasLasJornadas()).to.include(2);
        });

        it('debe mantener jornadas y carreras separadas', () => {
            LocalStorageDao.guardarJornada(1);
            LocalStorageDao.guardarCarrera(5);

            const jornadas = LocalStorageDao.obtenerTodasLasJornadas();
            const carreras = LocalStorageDao.obtenerTodasLasCarreras();

            expect(jornadas).to.deep.equal([1]);
            expect(carreras).to.deep.equal([5]);
        });

        it('NO debe guardar objetos completos, solo IDs', () => {
            LocalStorageDao.guardarJornada(1);
            LocalStorageDao.establecerJornadaActual(1);

            const datos = localStorage.getItem('jornadaActual');
            const jornadas = localStorage.getItem(LocalStorageDao.JORNADAS_KEY);

            // Verificar que son solo números en formato JSON
            expect(datos).to.match(/^\d+$/);
            expect(jornadas).to.match(/^\[\d+\]$/);
        });
    });
});
