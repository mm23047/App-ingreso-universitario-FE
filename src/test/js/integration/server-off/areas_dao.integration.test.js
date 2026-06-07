import { expect }          from '../../lib/chai/index.js';
import AreasConocimientoDao from '../../../../js/control/areas_dao.js';

const ID_PRUEBA_FALSO = '00000000-0000-0000-0000-000000000006';

describe('AreasConocimientoDao — Backend apagado (errores de red)', () => {
    let dao;

    beforeEach(() => {
        dao = new AreasConocimientoDao();
    });

    // obtenerAreasPorPrueba es el método clave del flujo de árbol de áreas.
    // Con el backend apagado, el fetch falla con ECONNREFUSED → TypeError.

    describe('GET /pruebas_admision/{id}/areas — backend apagado', () => {

        it('debe propagar TypeError con httpStatus indefinido cuando el backend no responde', async function () {
            this.timeout(5000);
            let errorCapturado;

            try {
                await dao.obtenerAreasPorPrueba(ID_PRUEBA_FALSO);
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
