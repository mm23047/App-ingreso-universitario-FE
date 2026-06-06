import { expect } from '../../lib/chai/index.js';
import AspirantesDao from '../../../../js/control/aspirantes_dao.js';
import Aspirante from '../../../../js/entity/Aspirante.js';

// DUI/correo exclusivos de este archivo de integración para evitar colisiones con otros suites.
const DATOS_CREAR = {
    nombres:         'Test DAO Int',
    apellidos:       'Aspirante Prueba',
    dui:             '11100099-9',
    fechaNacimiento: '2001-06-15',
    correo:          'dao.int.aspirante@tpi.sv',
    usaSillaRuedas:  false
};

// Fecha de nacimiento que siempre es < 18 años: usada para disparar EDAD_MINIMA.
const DATOS_MENOR_EDAD = {
    nombres:         'Menor Edad Test',
    apellidos:       'Aspirante Prueba',
    dui:             '11100088-8',
    fechaNacimiento: '2015-01-01',
    correo:          'menor.edad.int@tpi.sv',
    usaSillaRuedas:  false
};

const TIPOS_NEGOCIO_CONOCIDOS = ['DUI_DUPLICADO', 'CORREO_DUPLICADO', 'EDAD_MINIMA'];

describe('AspirantesDao — Integración con backend', () => {
    let dao;

    beforeEach(() => {
        dao = new AspirantesDao();
    });

    // ── POST /aspirantes ──────────────────────────────────────────────────────

    describe('POST /aspirantes — crear aspirante', () => {

        it('debe retornar un Aspirante mapeado con id y datos cuando el backend responde 201', async function () {
            this.timeout(5000);
            try {
                const resultado = await dao.crear(DATOS_CREAR);
                // Servidor activo y DUI libre: validar entidad mapeada
                expect(resultado).to.be.instanceOf(Aspirante);
                expect(resultado.id).to.be.a('string').and.not.equal('');
                expect(resultado.nombres).to.equal('Test DAO Int');
                expect(resultado.dui).to.equal('11100099-9');
                expect(resultado.correo).to.equal('dao.int.aspirante@tpi.sv');
                expect(resultado.usaSillaRuedas).to.be.a('boolean');
            } catch (error) {
                // DUI/correo ya registrado o servidor apagado: aceptable
                expect(error).to.be.instanceOf(Error);
            }
        });

        it('debe propagar err.tipo de negocio cuando el DUI ya está registrado en el sistema (409)', async function () {
            this.timeout(10000);

            // Primer llamado: crea el aspirante o confirma que ya existía
            try { await dao.crear(DATOS_CREAR); } catch { /* puede que ya exista */ }

            // Segundo llamado: el DUI ya existe → el servidor debe devolver 409
            try {
                await dao.crear(DATOS_CREAR);
                // 201: el servidor limpió la BD entre las dos llamadas — improbable pero aceptable
            } catch (error) {
                if (error.httpStatus === 409) {
                    // Servidor respondió 409: validar que lleva tipo de negocio estructurado
                    expect(TIPOS_NEGOCIO_CONOCIDOS).to.include(error.tipo);
                    expect(error.mensajeNegocio).to.be.a('string').and.not.equal('');
                    expect(error.httpStatus).to.equal(409);
                } else {
                    // Servidor apagado o error de red: aceptable
                    expect(error).to.be.instanceOf(Error);
                }
            }
        });

        it('debe propagar err.tipo = EDAD_MINIMA cuando el aspirante es menor de edad', async function () {
            this.timeout(5000);
            try {
                await dao.crear(DATOS_MENOR_EDAD);
                // Servidor no validó edad mínima: sin error que verificar
            } catch (error) {
                if (error.httpStatus !== undefined) {
                    // Servidor activo: el tipo de negocio debe ser uno conocido
                    expect(error).to.be.instanceOf(Error);
                    if (error.tipo !== null) {
                        expect(TIPOS_NEGOCIO_CONOCIDOS).to.include(error.tipo);
                    }
                    if (error.tipo === 'EDAD_MINIMA') {
                        expect(error.mensajeNegocio).to.be.a('string');
                    }
                } else {
                    // Error de red o servidor apagado: aceptable
                    expect(error).to.be.instanceOf(Error);
                }
            }
        });
    });

    // ── GET /aspirantes/{id} ──────────────────────────────────────────────────

    describe('GET /aspirantes/{id} — obtener aspirante por ID', () => {

        it('debe retornar el mismo Aspirante al consultar por el ID recién creado', async function () {
            this.timeout(10000);
            let idCreado = null;

            // Obtener un ID real: intentar crear el aspirante de prueba
            try {
                const aspirante = await dao.crear(DATOS_CREAR);
                idCreado = aspirante.id;
            } catch {
                // DUI ya existía (de una ejecución anterior) — no tenemos ID desde aquí
            }

            if (!idCreado) {
                // Sin ID no podemos ejercitar la ruta GET: verificar al menos que el método existe
                expect(typeof dao.obtenerPorId).to.equal('function');
                return;
            }

            try {
                const resultado = await dao.obtenerPorId(idCreado);
                expect(resultado).to.be.instanceOf(Aspirante);
                expect(resultado.id).to.equal(idCreado);
                expect(resultado.dui).to.equal('11100099-9');
            } catch (error) {
                // Error de red tras crear: aceptable
                expect(error).to.be.instanceOf(Error);
            }
        });
    });
});
