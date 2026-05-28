async function inicializarPruebasIntegracion() {
    if (typeof mocha === 'undefined') {
        console.error('Mocha no está disponible');
        return;
    }
    mocha.setup('bdd');
    try {
        await import('./jornada_dao.it.js');
        mocha.run();
    } catch (error) {
        console.error('Error al cargar pruebas de integración:', error);
    }
}

document.addEventListener('DOMContentLoaded', inicializarPruebasIntegracion);
