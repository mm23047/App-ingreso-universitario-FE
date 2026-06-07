import { expect } from '../../lib/chai/index.js';
import AspirantesDao from '../../../../js/control/aspirantes_dao.js';
import Aspirante from '../../../../js/entity/Aspirante.js';

// Genera datos únicos por llamada para evitar colisiones entre ejecuciones del test.
// Los registros creados se eliminan con DELETE /aspirantes/{id} en el afterEach.
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
    const idsCreados = []; // IDs creados por cada test; drenados en afterEach

    beforeEach(() => {
        dao = new AspirantesDao();
    });

    // Limpieza real vía DELETE /aspirantes/{id}.
    // best-effort: si el borrado falla (ej. servidor cayó tras el test), se avisa por consola
    // pero no enmascara el resultado del test ya ejecutado.
    afterEach(async function () {
        this.timeout(5000);
        while (idsCreados.length > 0) {
            const id = idsCreados.pop();
            try {
                await dao.eliminar(id);
            } catch (e) {
                console.warn(`[cleanup] No se pudo eliminar aspirante ${id}: ${e.message}`);
            }
        }
    });

    // ── POST /aspirantes ──────────────────────────────────────────────────────

    describe('POST /aspirantes — crear aspirante', () => {

        it('debe retornar un Aspirante mapeado con id y datos cuando el backend responde 201', async function () {
            this.timeout(5000);
            const datos = generarDatos();

            const resultado = await dao.crear(datos);
            idsCreados.push(resultado.id); // registrar para limpieza

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
            const primerAspirante = await dao.crear(datos);
            idsCreados.push(primerAspirante.id); // registrar para limpieza

            // Segunda llamada: el DUI ya existe — el backend debe devolver 409
            let errorDuplicado;
            try {
                await dao.crear(datos);
            } catch (error) {
                errorDuplicado = error;
            }

            expect(errorDuplicado, 'La segunda llamada con DUI duplicado debe ser rechazada').to.exist;
            expect(errorDuplicado.httpStatus, 'Error de red en segunda llamada — ¿cayó el servidor?').to.be.a('number');
            expect(errorDuplicado.httpStatus).to.equal(409);
            expect(TIPOS_NEGOCIO_CONOCIDOS).to.include(errorDuplicado.tipo);
            expect(errorDuplicado.mensajeNegocio).to.be.a('string').and.not.equal('');
        });

        it('debe propagar err.tipo = CORREO_DUPLICADO cuando el correo ya está registrado (409)', async function () {
            this.timeout(10000);
            const correoCompartido = `correo.dup.${Date.now()}@tpi-test.sv`;
            const datosA = { ...generarDatos('cdup-a'), correo: correoCompartido };
            const datosB = { ...generarDatos('cdup-b'), correo: correoCompartido };

            // Primera llamada: sin try/catch, falla si el servidor está apagado
            const primerAspirante = await dao.crear(datosA);
            idsCreados.push(primerAspirante.id);

            // Segunda llamada: mismo correo, DUI distinto — debe producir CORREO_DUPLICADO
            let errorCorreo;
            try {
                await dao.crear(datosB);
            } catch (error) {
                errorCorreo = error;
            }

            expect(errorCorreo, 'Debe rechazar el correo duplicado').to.exist;
            expect(errorCorreo.httpStatus, 'Error de red — ¿está el servidor activo?').to.be.a('number');
            expect(errorCorreo.httpStatus).to.equal(409);
            expect(errorCorreo.tipo).to.equal('CORREO_DUPLICADO');
            expect(errorCorreo.mensajeNegocio).to.be.a('string').and.not.equal('');
        });

        it('debe retornar httpStatus 400 y tipo EDAD_MINIMA cuando el aspirante es menor de edad', async function () {
            this.timeout(5000);
            const datos = generarDatosMenorEdad();
            let errorCapturado;

            try {
                await dao.crear(datos);
            } catch (error) {
                errorCapturado = error;
            }

            // El backend NO persiste al menor — no hay ID que registrar ni limpiar.
            // AspirantesDatoResource devuelve 400 BAD_REQUEST para EDAD_MINIMA
            // (solo DUI_DUPLICADO y CORREO_DUPLICADO devuelven 409 CONFLICT).
            expect(errorCapturado,
                'El backend debe rechazar la creación del aspirante menor de edad'
            ).to.exist;

            expect(errorCapturado.httpStatus,
                'Error de red — ¿está el servidor activo?'
            ).to.equal(400);

            expect(errorCapturado.tipo,
                'El backend debe informar el tipo de negocio exacto'
            ).to.equal('EDAD_MINIMA');

            expect(errorCapturado.mensajeNegocio,
                'Debe incluir el mensaje de negocio del backend'
            ).to.be.a('string').and.not.equal('');
        });
    });

    // ── GET /aspirantes/{id} ──────────────────────────────────────────────────

    describe('GET /aspirantes/{id} — obtener aspirante por ID', () => {

        it('debe retornar el mismo Aspirante al consultar por el ID recién creado', async function () {
            this.timeout(10000);
            const datos = generarDatos('get');

            const aspiranteCreado = await dao.crear(datos);
            idsCreados.push(aspiranteCreado.id); // registrar para limpieza

            const resultado = await dao.obtenerPorId(aspiranteCreado.id);

            expect(resultado).to.be.instanceOf(Aspirante);
            expect(resultado.id).to.equal(aspiranteCreado.id);
            expect(resultado.dui).to.equal(datos.dui);
        });
    });
});
