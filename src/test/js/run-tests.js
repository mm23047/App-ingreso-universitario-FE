async function inicializarPruebas() {
    if (typeof mocha === 'undefined') {
        console.error('Mocha no está disponible');
        return;
    }
    mocha.setup('bdd');
    try {
        await import('./jornada_dao.unit.test.js');
        mocha.run();
    } catch (error) {
        console.error('Error al cargar pruebas:', error);
    }
}

document.addEventListener('DOMContentLoaded', inicializarPruebas);
