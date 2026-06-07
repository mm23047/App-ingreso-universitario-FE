import { expect } from '../../lib/chai/index.js';
import TurnosDao  from '../../../../js/control/turnos_dao.js';

describe('TurnosDao — Backend apagado (errores de red)', () => {
    let dao;

    beforeEach(() => {
        dao = new TurnosDao();
    });

    // Un test es suficiente: obtenerTurnos y obtenerTurnoPorId son ambos GET contra el mismo
    // host apagado → mismo ECONNREFUSED → TypeError idéntica. No hay diferencia discriminatoria.

    describe('GET /turnos — backend apagado', () => {

        it('debe propagar TypeError con httpStatus indefinido cuando el backend no responde', async function () {
            this.timeout(5000);
            let errorCapturado;

            try {
                await dao.obtenerTurnos();
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
