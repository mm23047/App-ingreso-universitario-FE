async function inicializarPruebasIntegracion() {
    if (typeof mocha === 'undefined') {
        console.error('Mocha no está disponible');
        return;
    }
    mocha.setup('bdd');
    try {
        // ════════════════════════════════════════════════════════════════════
        // SERVIDOR ENCENDIDO — ejecutar con backend activo en localhost:9080
        // ════════════════════════════════════════════════════════════════════
        await import('./integration/server-on/pruebas_admision_dao.integration.test.js');
        await import('./integration/server-on/carreras_dao.integration.test.js');
        await import('./integration/server-on/turnos_dao.integration.test.js');
        await import('./integration/server-on/areas_dao.integration.test.js');
        await import('./integration/server-on/aspirantes_dao.integration.test.js');
        await import('./integration/server-on/inscripciones_dao.integration.test.js');
        await import('./integration/server-on/carreras_elegida_dao.integration.test.js');
        await import('./integration/server-on/aspirantes_controller.integration.test.js');
        await import('./integration/server-on/carreras_controller.integration.test.js');
        await import('./integration/server-on/turnos_controller.integration.test.js');
        await import('./integration/server-on/inscripciones_controller.integration.test.js');
        await import('./integration/server-on/procesos_controller.integration.test.js');

        // ════════════════════════════════════════════════════════════════════
        // SERVIDOR APAGADO — ejecutar con backend detenido
        // ════════════════════════════════════════════════════════════════════
        await import('./integration/server-off/pruebas_admision_dao.integration.test.js');
        await import('./integration/server-off/carreras_dao.integration.test.js');
        await import('./integration/server-off/turnos_dao.integration.test.js');
        await import('./integration/server-off/areas_dao.integration.test.js');
        await import('./integration/server-off/aspirantes_dao.integration.test.js');
        await import('./integration/server-off/inscripciones_dao.integration.test.js');
        await import('./integration/server-off/carreras_elegida_dao.integration.test.js');
        await import('./integration/server-off/aspirantes_controller.integration.test.js');
        await import('./integration/server-off/carreras_controller.integration.test.js');
        await import('./integration/server-off/turnos_controller.integration.test.js');
        await import('./integration/server-off/inscripciones_controller.integration.test.js');
        await import('./integration/server-off/procesos_controller.integration.test.js');

        mocha.run();
    } catch (error) {
        console.error('Error al cargar pruebas de integración:', error);
    }
}

document.addEventListener('DOMContentLoaded', inicializarPruebasIntegracion);
