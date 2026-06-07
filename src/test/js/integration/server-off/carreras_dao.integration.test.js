import { expect }  from '../../lib/chai/index.js';
import CarrerasDao from '../../../../js/control/carreras_dao.js';

describe('CarrerasDao — Backend apagado (errores de red)', () => {
    let dao;

    beforeEach(() => {
        dao = new CarrerasDao();
    });

    // Un test es suficiente: obtenerTodas y obtenerPorId son ambos GET contra el mismo host
    // apagado → mismo ECONNREFUSED → TypeError idéntica. No hay diferencia discriminatoria.

    describe('GET /carreras — backend apagado', () => {

        it('debe propagar TypeError con httpStatus indefinido cuando el backend no responde', async function () {
            this.timeout(5000);
            let errorCapturado;

            try {
                await dao.obtenerTodas();
            } catch (err) {
                errorCapturado = err;
            }

            expect(errorCapturado,
                'El backend respondió — este test DEBE ejecutarse con el backend APAGADO'
            ).to.exist;

            expect(errorCapturado,
                'Se esperaba TypeError de red, no un Error HTTP del servidor'
            ).to.be.instanceOf(TypeError);

            expect(errorCapturado.httpStatus,
                'httpStatus definido indica que el servidor respondió — el backend debe estar APAGADO'
            ).to.be.undefined;
        });
    });
});
