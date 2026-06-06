import { expect } from '../../lib/chai/index.js';
import LocalStorageDao from '../../../../js/control/local_storage_dao.js';

describe('LocalStorageDao - Pruebas Unitarias', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('Propiedades Estáticas', () => {
        it('debe tener constante TURNOS_KEY', () => {
            expect(LocalStorageDao.TURNOS_KEY).to.exist;
            expect(LocalStorageDao.TURNOS_KEY).to.equal('app_turnos_seleccionados');
        });

        it('debe tener constante CARRERAS_KEY', () => {
            expect(LocalStorageDao.CARRERAS_KEY).to.exist;
            expect(LocalStorageDao.CARRERAS_KEY).to.equal('app_carreras_seleccionadas');
        });
    });

    describe('Guardar y Obtener Turnos', () => {
        it('debe guardar el ID de un turno', () => {
            const resultado = LocalStorageDao.guardarTurno(1);
            expect(resultado).to.be.true;
        });

        it('debe guardar SOLO el ID, no un objeto completo', () => {
            LocalStorageDao.guardarTurno(1);
            const datos = localStorage.getItem(LocalStorageDao.TURNOS_KEY);

            expect(datos).to.equal('[1]');
            expect(datos).to.not.include('nombre');
            expect(datos).to.not.include('horario');
        });

        it('debe obtener todos los turnos guardados', () => {
            LocalStorageDao.guardarTurno(1);
            LocalStorageDao.guardarTurno(2);

            const turnos = LocalStorageDao.obtenerTodosLosTurnos();

            expect(turnos).to.be.an('array');
            expect(turnos).to.deep.equal([1, 2]);
        });

        it('debe retornar array vacío si no hay turnos guardados', () => {
            const turnos = LocalStorageDao.obtenerTodosLosTurnos();
            expect(turnos).to.be.an('array');
            expect(turnos).to.have.lengthOf(0);
        });

        it('debe evitar duplicados al guardar turnos', () => {
            LocalStorageDao.guardarTurno(1);
            LocalStorageDao.guardarTurno(1);

            const turnos = LocalStorageDao.obtenerTodosLosTurnos();
            expect(turnos).to.have.lengthOf(1);
        });

        it('debe lanzar error si intenta guardar sin ID', () => {
            expect(() => {
                LocalStorageDao.guardarTurno(null);
            }).to.throw();
        });

        it('debe lanzar error si intenta guardar con ID indefinido', () => {
            expect(() => {
                LocalStorageDao.guardarTurno(undefined);
            }).to.throw();
        });
    });

    describe('Turno Actual', () => {
        it('debe establecer el turno actual', () => {
            const resultado = LocalStorageDao.establecerTurnoActual(5);
            expect(resultado).to.be.true;
        });

        it('debe guardar SOLO el ID del turno actual', () => {
            LocalStorageDao.establecerTurnoActual(5);
            const valor = localStorage.getItem('turnoActual');
            expect(valor).to.equal('5');
        });

        it('debe obtener el turno actual como string', () => {
            LocalStorageDao.establecerTurnoActual(3);
            const turnoId = LocalStorageDao.obtenerTurnoActual();
            expect(turnoId).to.equal('3');
        });

        it('debe retornar null si no hay turno actual', () => {
            const turnoId = LocalStorageDao.obtenerTurnoActual();
            expect(turnoId).to.be.null;
        });

        it('debe lanzar error sin ID al establecer turno actual', () => {
            expect(() => {
                LocalStorageDao.establecerTurnoActual(null);
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
            expect(carreraId).to.equal('4');
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
            LocalStorageDao.guardarTurno(1);
            LocalStorageDao.guardarCarrera(2);
            LocalStorageDao.establecerTurnoActual(1);
            LocalStorageDao.establecerCarreraActual(2);

            const resultado = LocalStorageDao.limpiarTodo();

            expect(resultado).to.be.true;
            expect(localStorage.length).to.equal(0);
        });

        it('debe eliminar turnos al limpiar', () => {
            LocalStorageDao.guardarTurno(1);
            LocalStorageDao.limpiarTodo();

            const turnos = LocalStorageDao.obtenerTodosLosTurnos();
            expect(turnos).to.have.lengthOf(0);
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
            LocalStorageDao.guardarTurno(1);
            LocalStorageDao.establecerTurnoActual(1);
            LocalStorageDao.guardarCarrera(2);
            LocalStorageDao.establecerCarreraActual(2);

            const resumen = LocalStorageDao.obtenerResumen();

            expect(resumen).to.have.property('turnosGuardados');
            expect(resumen).to.have.property('turnoActual');
            expect(resumen).to.have.property('carrerasGuardadas');
            expect(resumen).to.have.property('carreraActual');
        });

        it('debe mostrar IDs correctos en resumen', () => {
            LocalStorageDao.guardarTurno(1);
            LocalStorageDao.establecerTurnoActual(1);

            const resumen = LocalStorageDao.obtenerResumen();

            expect(resumen.turnosGuardados).to.deep.equal([1]);
            expect(resumen.turnoActual).to.equal('1');
        });

        it('debe mostrar valores null si no hay datos', () => {
            const resumen = LocalStorageDao.obtenerResumen();

            expect(resumen.turnoActual).to.be.null;
            expect(resumen.carreraActual).to.be.null;
        });
    });

    describe('Flujo Completo', () => {
        it('debe guardar turno, seleccionar y obtener', () => {
            LocalStorageDao.guardarTurno(1);
            LocalStorageDao.guardarTurno(2);
            LocalStorageDao.establecerTurnoActual(2);

            expect(LocalStorageDao.obtenerTurnoActual()).to.equal('2');
            expect(LocalStorageDao.obtenerTodosLosTurnos()).to.include(2);
        });

        it('debe mantener turnos y carreras separados', () => {
            LocalStorageDao.guardarTurno(1);
            LocalStorageDao.guardarCarrera(5);

            const turnos   = LocalStorageDao.obtenerTodosLosTurnos();
            const carreras = LocalStorageDao.obtenerTodasLasCarreras();

            expect(turnos).to.deep.equal([1]);
            expect(carreras).to.deep.equal([5]);
        });

        it('NO debe guardar objetos completos, solo IDs', () => {
            LocalStorageDao.guardarTurno(1);
            LocalStorageDao.establecerTurnoActual(1);

            const datos  = localStorage.getItem('turnoActual');
            const turnos = localStorage.getItem(LocalStorageDao.TURNOS_KEY);

            expect(datos).to.match(/^\d+$/);
            expect(turnos).to.match(/^\[\d+\]$/);
        });
    });
});
