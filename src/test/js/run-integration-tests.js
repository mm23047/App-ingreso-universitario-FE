async function inicializarPruebasIntegracion() {
    if (typeof mocha === 'undefined') {
        console.error('Mocha no está disponible');
        return;
    }
    mocha.setup('bdd');
    try {
        await import('./integration/server-on/turnos_dao.integration.test.js');
        await import('./integration/server-on/aspirantes_dao.integration.test.js');
        await import('./integration/server-on/aspirantes_controller.integration.test.js');
        mocha.run();
    } catch (error) {
        console.error('Error al cargar pruebas de integración:', error);
    }
}

document.addEventListener('DOMContentLoaded', inicializarPruebasIntegracion);
