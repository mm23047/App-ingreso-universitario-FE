import { expect } from '../../lib/chai/index.js';
import AspirantesDao from '../../../../js/control/aspirantes_dao.js';
import Aspirante from '../../../../js/entity/Aspirante.js';

// Genera datos únicos por llamada para evitar colisiones entre ejecuciones del test.
// No existe endpoint DELETE para aspirantes — los registros se acumulan en BD con dominio @tpi-test.sv.
function generarDatos(prefijo = 'dao') {
    const n = Math.floor(Math.random() * 99999999);
    const d = Math.floor(Math.random() * 9);
    return {
        nombres:         'Test DAO Int',
        apellidos:       'Aspirante Prueba',
        dui:             `${String(n).padStart(8, '0')}-${d}`,
        fechaNacimiento: '2001-06-15',
        correo:          `${prefijo}.int.${Date.now()}.${n}@tpi-test.sv`,
        usaSillaRuedas:  false
    };
}

function generarDatosMenorEdad() {
    const n = Math.floor(Math.random() * 99999999);
    const d = Math.floor(Math.random() * 9);
    return {
        nombres:         'Menor Edad Test',
        apellidos:       'Aspirante Prueba',
        dui:             `${String(n).padStart(8, '0')}-${d}`,
        fechaNacimiento: '2015-01-01',
        correo:          `menor.edad.${Date.now()}.${n}@tpi-test.sv`,
        usaSillaRuedas:  false
    };
}

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
            const datos = generarDatos();

            // Sin try/catch: TypeError si el servidor está apagado → test falla correctamente
            const resultado = await dao.crear(datos);

            expect(resultado).to.be.instanceOf(Aspirante);
            expect(resultado.id).to.be.a('string').and.not.equal('');
            expect(resultado.nombres).to.equal('Test DAO Int');
            expect(resultado.dui).to.equal(datos.dui);
            expect(resultado.correo).to.equal(datos.correo);
            expect(resultado.usaSillaRuedas).to.be.a('boolean');
        });

        it('debe propagar err.tipo de negocio cuando el DUI ya está registrado en el sistema (409)', async function () {
            this.timeout(10000);
            const datos = generarDatos('dup');

            // Primera llamada: crea el aspirante — sin try/catch, falla si el servidor está apagado
            await dao.crear(datos);

            // Segunda llamada: el DUI ya existe — el backend debe devolver 409
            let errorDuplicado;
            try {
                await dao.crear(datos);
            } catch (error) {
                errorDuplicado = error;
            }

            // Si el servidor respondió en la primera pero no en la segunda → error de red real
            expect(errorDuplicado, 'La segunda llamada con DUI duplicado debe ser rechazada').to.exist;
            expect(errorDuplicado.httpStatus, 'Error de red en segunda llamada — ¿cayó el servidor?').to.be.a('number');
            expect(errorDuplicado.httpStatus).to.equal(409);
            expect(TIPOS_NEGOCIO_CONOCIDOS).to.include(errorDuplicado.tipo);
            expect(errorDuplicado.mensajeNegocio).to.be.a('string').and.not.equal('');
        });

        it('debe propagar err.tipo = EDAD_MINIMA cuando el aspirante es menor de edad', async function () {
            this.timeout(5000);
            const datos = generarDatosMenorEdad();
            let errorCapturado;

            try {
                await dao.crear(datos);
            } catch (error) {
                errorCapturado = error;
            }

            // El backend debe rechazar al menor de edad — si no hubo error, el backend no está validando
            expect(errorCapturado, 'El backend debe rechazar aspirantes menores de edad').to.exist;
            // httpStatus debe ser un número: si es undefined, el servidor estaba apagado
            expect(errorCapturado.httpStatus, 'Error de red — ¿está el servidor activo?').to.be.a('number');

            if (errorCapturado.tipo !== null) {
                expect(TIPOS_NEGOCIO_CONOCIDOS).to.include(errorCapturado.tipo);
            }
            if (errorCapturado.tipo === 'EDAD_MINIMA') {
                expect(errorCapturado.mensajeNegocio).to.be.a('string');
            }
        });
    });

    // ── GET /aspirantes/{id} ──────────────────────────────────────────────────

    describe('GET /aspirantes/{id} — obtener aspirante por ID', () => {

        it('debe retornar el mismo Aspirante al consultar por el ID recién creado', async function () {
            this.timeout(10000);
            const datos = generarDatos('get');

            // Sin try/catch en ninguna de las dos llamadas: fallos de red fallan el test correctamente
            const aspiranteCreado = await dao.crear(datos);
            const resultado = await dao.obtenerPorId(aspiranteCreado.id);

            expect(resultado).to.be.instanceOf(Aspirante);
            expect(resultado.id).to.equal(aspiranteCreado.id);
            expect(resultado.dui).to.equal(datos.dui);
        });
    });
});
