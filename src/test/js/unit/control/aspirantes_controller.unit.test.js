import { expect } from '../../lib/chai/index.js';
import sinon from '../../lib/sinon/sinon.js';
import AspirantesController from '../../../../js/control/aspirantes_controller.js';
import AspirantesDao from '../../../../js/control/aspirantes_dao.js';
import Aspirante from '../../../../js/entity/Aspirante.js';
import { store, resetStore } from '../../../../js/infra/app_state.js';

describe('AspirantesController - Pruebas Unitarias', () => {
    let controller;

    const datosValidos = {
        nombres:         'Juan',
        apellidos:       'Pérez',
        dui:             '01234567-8',
        correo:          'juan@mail.com',
        fechaNacimiento: '2000-05-15',
        usaSillaRuedas:  false
    };

    beforeEach(() => {
        controller = new AspirantesController();
        sinon.restoreAll();
        resetStore();
    });

    afterEach(() => {
        sinon.restoreAll();
        resetStore();
    });

    describe('Constructor', () => {
        it('debe crear una instancia de AspirantesController', () => {
            expect(controller).to.be.instanceOf(AspirantesController);
        });

        it('debe inicializar un AspirantesDao', () => {
            expect(controller.aspirantesDao).to.be.instanceOf(AspirantesDao);
        });
    });

    describe('validarDatos — campos requeridos', () => {
        it('debe retornar valido:true con todos los datos correctos', () => {
            const resultado = controller.validarDatos(datosValidos);
            expect(resultado.valido).to.be.true;
        });

        it('debe rechazar cuando nombres está vacío', () => {
            const resultado = controller.validarDatos({ ...datosValidos, nombres: '' });
            expect(resultado.valido).to.be.false;
            expect(resultado.mensaje).to.include('nombres');
        });

        it('debe rechazar cuando apellidos está vacío', () => {
            const resultado = controller.validarDatos({ ...datosValidos, apellidos: '' });
            expect(resultado.valido).to.be.false;
            expect(resultado.mensaje).to.include('apellidos');
        });

        it('debe rechazar cuando falta fechaNacimiento', () => {
            const resultado = controller.validarDatos({ ...datosValidos, fechaNacimiento: '' });
            expect(resultado.valido).to.be.false;
            expect(resultado.mensaje).to.include('fechaNacimiento');
        });

        it('debe rechazar cuando falta correo', () => {
            const resultado = controller.validarDatos({ ...datosValidos, correo: '' });
            expect(resultado.valido).to.be.false;
        });

        it('debe rechazar cuando falta dui', () => {
            const resultado = controller.validarDatos({ ...datosValidos, dui: '' });
            expect(resultado.valido).to.be.false;
        });

        it('debe rechazar cuando nombres tiene solo espacios', () => {
            const resultado = controller.validarDatos({ ...datosValidos, nombres: '   ' });
            expect(resultado.valido).to.be.false;
        });
    });

    describe('validarDatos — formato DUI (##########-#)', () => {
        it('debe aceptar DUI con formato correcto: "01234567-8"', () => {
            const resultado = controller.validarDatos({ ...datosValidos, dui: '01234567-8' });
            expect(resultado.valido).to.be.true;
        });

        it('debe rechazar DUI sin guión: "012345678"', () => {
            const resultado = controller.validarDatos({ ...datosValidos, dui: '012345678' });
            expect(resultado.valido).to.be.false;
            expect(resultado.mensaje).to.include('DUI');
        });

        it('debe rechazar DUI con guión en posición incorrecta: "0123456-78"', () => {
            const resultado = controller.validarDatos({ ...datosValidos, dui: '0123456-78' });
            expect(resultado.valido).to.be.false;
        });

        it('debe rechazar DUI con letras: "ABCDEFGH-1"', () => {
            const resultado = controller.validarDatos({ ...datosValidos, dui: 'ABCDEFGH-1' });
            expect(resultado.valido).to.be.false;
        });

        it('debe rechazar DUI demasiado corto: "1234-5"', () => {
            const resultado = controller.validarDatos({ ...datosValidos, dui: '1234-5' });
            expect(resultado.valido).to.be.false;
        });
    });

    describe('validarDatos — formato correo', () => {
        it('debe aceptar correo válido con dominio .com', () => {
            const resultado = controller.validarDatos({ ...datosValidos, correo: 'aspirante@universidad.edu.sv' });
            expect(resultado.valido).to.be.true;
        });

        it('debe rechazar correo sin arroba: "juanmail.com"', () => {
            const resultado = controller.validarDatos({ ...datosValidos, correo: 'juanmail.com' });
            expect(resultado.valido).to.be.false;
            expect(resultado.mensaje).to.include('correo');
        });

        it('debe rechazar correo sin dominio: "juan@"', () => {
            const resultado = controller.validarDatos({ ...datosValidos, correo: 'juan@' });
            expect(resultado.valido).to.be.false;
        });

        it('debe rechazar correo sin extensión: "juan@dominio"', () => {
            const resultado = controller.validarDatos({ ...datosValidos, correo: 'juan@dominio' });
            expect(resultado.valido).to.be.false;
        });

        it('debe rechazar correo con espacios: "juan @mail.com"', () => {
            const resultado = controller.validarDatos({ ...datosValidos, correo: 'juan @mail.com' });
            expect(resultado.valido).to.be.false;
        });
    });

    describe('registrar — flujo exitoso', () => {
        it('debe retornar una instancia de Aspirante', async () => {
            const mockAspirante = new Aspirante('uuid-1', 'Juan', 'Pérez', '2000-05-15', '01234567-8', 'juan@mail.com', '2026-06-04', false);
            sinon.stub(controller.aspirantesDao, 'crear').resolves(mockAspirante);

            const resultado = await controller.registrar(datosValidos);

            expect(resultado).to.be.instanceOf(Aspirante);
            expect(resultado.id).to.equal('uuid-1');
        });

        it('debe almacenar el aspirante en store.aspirante', async () => {
            const mockAspirante = new Aspirante('uuid-1', 'Juan', 'Pérez', '2000-05-15', '01234567-8', 'juan@mail.com', '2026-06-04', false);
            sinon.stub(controller.aspirantesDao, 'crear').resolves(mockAspirante);

            await controller.registrar(datosValidos);

            expect(store.aspirante).to.equal(mockAspirante);
            expect(store.aspirante.id).to.equal('uuid-1');
        });

        it('debe llamar al DAO exactamente una vez', async () => {
            const mockAspirante = new Aspirante('uuid-1', 'Juan', 'Pérez', '2000-05-15', '01234567-8', 'juan@mail.com', '2026-06-04', false);
            let callCount = 0;
            controller.aspirantesDao.crear = () => { callCount++; return Promise.resolve(mockAspirante); };

            await controller.registrar(datosValidos);

            expect(callCount).to.equal(1);
        });

        it('debe completar con usaSillaRuedas:false cuando el campo está ausente', async () => {
            const mockAspirante = new Aspirante('uuid-1', 'Juan', 'Pérez', '2000-05-15', '01234567-8', 'juan@mail.com', '2026-06-04', false);
            let capturedArg;
            controller.aspirantesDao.crear = (datos) => { capturedArg = datos; return Promise.resolve(mockAspirante); };
            const datos = { ...datosValidos };
            delete datos.usaSillaRuedas;

            await controller.registrar(datos);

            expect(capturedArg.usaSillaRuedas).to.equal(false);
        });
    });

    describe('registrar — validación local impide llamar al DAO', () => {
        it('debe lanzar error y NO llamar al DAO si el DUI tiene formato incorrecto', async () => {
            let wasCalled = false;
            controller.aspirantesDao.crear = () => { wasCalled = true; return Promise.resolve({}); };

            try {
                await controller.registrar({ ...datosValidos, dui: 'INVALIDO' });
                expect.fail('Debería haber lanzado un error');
            } catch (error) {
                expect(wasCalled).to.be.false;
                expect(error).to.be.instanceOf(Error);
            }
        });

        it('debe lanzar error y NO llamar al DAO si el correo no es válido', async () => {
            let wasCalled = false;
            controller.aspirantesDao.crear = () => { wasCalled = true; return Promise.resolve({}); };

            try {
                await controller.registrar({ ...datosValidos, correo: 'no-es-correo' });
                expect.fail();
            } catch (error) {
                expect(wasCalled).to.be.false;
            }
        });
    });

    describe('registrar — errores tipados del backend (duplicados y edad)', () => {
        it('debe propagar err.tipo = DUI_DUPLICADO cuando el DUI ya existe en el sistema', async () => {
            const err = new Error('Error HTTP: 409');
            err.httpStatus      = 409;
            err.tipo            = 'DUI_DUPLICADO';
            err.mensajeNegocio  = 'Ya existe un aspirante registrado con ese DUI';
            sinon.stub(controller.aspirantesDao, 'crear').rejects(err);

            try {
                await controller.registrar(datosValidos);
                expect.fail();
            } catch (e) {
                expect(e.tipo).to.equal('DUI_DUPLICADO');
            }
        });

        it('debe propagar err.tipo = CORREO_DUPLICADO cuando el correo ya existe', async () => {
            const err = new Error('Error HTTP: 409');
            err.httpStatus      = 409;
            err.tipo            = 'CORREO_DUPLICADO';
            err.mensajeNegocio  = 'Ya existe un aspirante registrado con ese correo';
            sinon.stub(controller.aspirantesDao, 'crear').rejects(err);

            try {
                await controller.registrar(datosValidos);
                expect.fail();
            } catch (e) {
                expect(e.tipo).to.equal('CORREO_DUPLICADO');
            }
        });

        it('debe propagar err.tipo = EDAD_MINIMA cuando el aspirante no cumple la edad mínima', async () => {
            const err = new Error('Error HTTP: 422');
            err.httpStatus      = 422;
            err.tipo            = 'EDAD_MINIMA';
            err.mensajeNegocio  = 'El aspirante no cumple la edad mínima requerida';
            sinon.stub(controller.aspirantesDao, 'crear').rejects(err);

            try {
                await controller.registrar(datosValidos);
                expect.fail();
            } catch (e) {
                expect(e.tipo).to.equal('EDAD_MINIMA');
                expect(e.mensajeNegocio).to.include('edad');
            }
        });

        it('debe dejar store.aspirante en null si el registro falla', async () => {
            const err = new Error('Error HTTP: 409');
            err.tipo = 'DUI_DUPLICADO';
            sinon.stub(controller.aspirantesDao, 'crear').rejects(err);

            try { await controller.registrar(datosValidos); } catch { /* esperado */ }

            expect(store.aspirante).to.be.null;
        });

        it('debe propagar mensajeNegocio del error del backend', async () => {
            const err = new Error('Error HTTP: 409');
            err.tipo           = 'DUI_DUPLICADO';
            err.mensajeNegocio = 'DUI ya registrado en el sistema';
            sinon.stub(controller.aspirantesDao, 'crear').rejects(err);

            try {
                await controller.registrar(datosValidos);
                expect.fail();
            } catch (e) {
                expect(e.mensajeNegocio).to.equal('DUI ya registrado en el sistema');
            }
        });
    });

    describe('Métodos disponibles', () => {
        it('debe tener el método validarDatos', () => {
            expect(typeof controller.validarDatos).to.equal('function');
        });

        it('debe tener el método registrar', () => {
            expect(typeof controller.registrar).to.equal('function');
        });
    });

    // ── registrar — gestión de store.loading ─────────────────────────────────
    describe('registrar — gestión de store.loading', () => {
        it('debe activar store.loading durante la petición al DAO', async () => {
            const mockAspirante = new Aspirante('uuid-1', 'Juan', 'Pérez', '2000-05-15', '01234567-8', 'juan@mail.com', null, false);
            const loadingDurante = [];
            controller.aspirantesDao.crear = () => {
                loadingDurante.push(store.loading);
                return Promise.resolve(mockAspirante);
            };

            await controller.registrar(datosValidos);

            expect(loadingDurante[0]).to.be.true;
            expect(store.loading).to.be.false;
        });

        it('debe restablecer store.loading a false después del registro exitoso', async () => {
            const mockAspirante = new Aspirante('uuid-1', 'Juan', 'Pérez', '2000-05-15', '01234567-8', 'juan@mail.com', null, false);
            sinon.stub(controller.aspirantesDao, 'crear').resolves(mockAspirante);

            await controller.registrar(datosValidos);

            expect(store.loading).to.be.false;
        });

        it('debe restablecer store.loading a false incluso cuando el DAO falla', async () => {
            sinon.stub(controller.aspirantesDao, 'crear').rejects(new Error('Error HTTP: 500'));

            try { await controller.registrar(datosValidos); } catch { /* esperado */ }

            expect(store.loading).to.be.false;
        });
    });

    // ── registrar — error genérico sin tipo de negocio ───────────────────────
    describe('registrar — error genérico (sin tipo de negocio)', () => {
        it('debe propagar el error aunque no tenga tipo de negocio asignado', async () => {
            sinon.stub(controller.aspirantesDao, 'crear').rejects(new Error('Network error'));

            try {
                await controller.registrar(datosValidos);
                expect.fail();
            } catch (e) {
                expect(e).to.be.instanceOf(Error);
                expect(e.tipo).to.be.undefined;
            }
        });

        it('debe dejar store.aspirante en null tras un error de red', async () => {
            sinon.stub(controller.aspirantesDao, 'crear').rejects(new Error('Network error'));

            try { await controller.registrar(datosValidos); } catch { /* esperado */ }

            expect(store.aspirante).to.be.null;
        });
    });
});
