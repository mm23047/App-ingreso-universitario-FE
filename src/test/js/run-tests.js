async function inicializarPruebas() {
    if (typeof mocha === 'undefined') {
        console.error('Mocha no está disponible');
        return;
    }
    mocha.setup('bdd');
    try {
        await import('./aspirantes_dao.unit.test.js');
        await import('./carreras_dao.unit.test.js');
        await import('./turnos_dao.unit.test.js');
        await import('./examen_dao.unit.test.js');
        await import('./inscripciones_dao.unit.test.js');
        await import('./preguntas_dao.unit.test.js');
        await import('./turnos_controller.unit.test.js');
        await import('./local_storage_dao.unit.test.js');
        mocha.run();
    } catch (error) {
        console.error('Error al cargar pruebas:', error);
    }
}

document.addEventListener('DOMContentLoaded', inicializarPruebas);
