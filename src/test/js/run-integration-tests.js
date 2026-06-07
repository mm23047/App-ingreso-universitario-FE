async function inicializarPruebasIntegracion() {
    if (typeof mocha === 'undefined') {
        console.error('Mocha no está disponible');
        return;
    }
    mocha.setup('bdd');
    try {
        // ── DAOs de catálogo (solo lectura) ───────────────────────────────────
        await import('./integration/server-on/pruebas_admision_dao.integration.test.js');
        await import('./integration/server-on/carreras_dao.integration.test.js');
        await import('./integration/server-on/turnos_dao.integration.test.js');
        await import('./integration/server-on/areas_dao.integration.test.js');

        // ── DAOs con escritura ────────────────────────────────────────────────
        await import('./integration/server-on/aspirantes_dao.integration.test.js');
        await import('./integration/server-on/inscripciones_dao.integration.test.js');
        await import('./integration/server-on/carreras_elegida_dao.integration.test.js');

        // ── Controllers ───────────────────────────────────────────────────────
        await import('./integration/server-on/aspirantes_controller.integration.test.js');
        await import('./integration/server-on/carreras_controller.integration.test.js');
        await import('./integration/server-on/turnos_controller.integration.test.js');
        await import('./integration/server-on/inscripciones_controller.integration.test.js');
        await import('./integration/server-on/procesos_controller.integration.test.js');

        mocha.run();
    } catch (error) {
        console.error('Error al cargar pruebas de integración:', error);
    }
}

document.addEventListener('DOMContentLoaded', inicializarPruebasIntegracion);
