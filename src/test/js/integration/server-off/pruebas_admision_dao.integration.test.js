import { expect }        from '../../lib/chai/index.js';
import PruebasAdmisionDao from '../../../../js/control/pruebas_admision_dao.js';

describe('PruebasAdmisionDao — Backend apagado (errores de red)', () => {
    let dao;

    beforeEach(() => {
        dao = new PruebasAdmisionDao();
    });

    // Un test es suficiente para verificar la propagación de TypeError en este DAO:
    // los tres métodos GET (obtenerActivas, obtenerTodas, obtenerPorId) llaman a fetch
    // contra el mismo host apagado y producen el mismo ECONNREFUSED → TypeError idéntica.
    // No existe diferencia discriminatoria entre las tres rutas en ausencia de servidor.

    describe('GET /pruebas_admision — backend apagado', () => {

        it('debe propagar TypeError con httpStatus indefinido cuando el backend no responde', async function () {
            this.timeout(5000);
            let errorCapturado;

            try {
                await dao.obtenerActivas();
            } catch (err) {
                errorCapturado = err;
            }

            expect(errorCapturado,
                '⚠ El backend respondió — este test DEBE ejecutarse con el backend APAGADO'
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
