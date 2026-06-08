async function inicializarPruebasIntegracionOff() {
    if (typeof mocha === 'undefined') {
        console.error('Mocha no está disponible');
        return;
    }
    mocha.setup('bdd');
    try {
        // ── DAOs de catálogo ──────────────────────────────────────────────────
        await import('./integration/server-off/pruebas_admision_dao.integration.test.js');
        await import('./integration/server-off/carreras_dao.integration.test.js');
        await import('./integration/server-off/turnos_dao.integration.test.js');
        await import('./integration/server-off/areas_dao.integration.test.js');

        // ── DAOs con escritura ────────────────────────────────────────────────
        await import('./integration/server-off/aspirantes_dao.integration.test.js');
        await import('./integration/server-off/inscripciones_dao.integration.test.js');
        await import('./integration/server-off/carreras_elegida_dao.integration.test.js');

        // ── Controllers ───────────────────────────────────────────────────────
        await import('./integration/server-off/aspirantes_controller.integration.test.js');
        await import('./integration/server-off/carreras_controller.integration.test.js');
        await import('./integration/server-off/turnos_controller.integration.test.js');
        await import('./integration/server-off/inscripciones_controller.integration.test.js');
        await import('./integration/server-off/procesos_controller.integration.test.js');
        await import('./integration/server-off/examen_dao.integration.test.js');
        await import('./integration/server-off/examen_controller.integration.test.js');

        mocha.run();
    } catch (error) {
        console.error('Error al cargar pruebas de integración (server-off):', error);
    }
}

document.addEventListener('DOMContentLoaded', inicializarPruebasIntegracionOff);
