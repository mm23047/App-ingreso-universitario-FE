const _initialState = {
    // Entidades del flujo del aspirante
    aspirante:          null,   // Aspirante — se llena al registrarse
    prueba:             null,   // PruebaAdmision activa — cargada al inicio del flujo
    etapa:              null,   // EtapasAdmision — necesaria para POST /examen_realizado
    inscripcionActiva:  null,   // InscripcionPrueba — resultado de POST /aspirantes/{id}/inscripciones
    carreraSeleccionada: null,  // Carrera — seleccionada en la vista de carreras (antes de inscribir)
    carrerasElegidas:   [],     // CarrerasElegida[] — registradas en la inscripción activa
    turnoSeleccionado:  null,   // Turno — seleccionado por el aspirante
    examenActivo:       null,   // ExamenRealizado — iniciado por POST /examen_realizado

    // Datos de catálogo
    carreras:  [],  // CatalogoCarrera[] — cargados en la vista de carreras
    turnos:    [],  // TurnosExamen[]    — cargados en la vista de turnos
    preguntas: [],  // PreguntasPorClave[] — cargados del examen activo

    // UI
    notificaciones: [],
    loading:        false,
    route:          '/'
};

const _listeners = {};
const _state = { ..._initialState };

export const store = new Proxy(_state, {
    set(target, prop, newValue) {
        const oldValue = target[prop];
        target[prop] = newValue;
        window.dispatchEvent(new CustomEvent('state-changed', {
            detail: { prop, oldValue, newValue }
        }));
        if (_listeners[prop]) {
            _listeners[prop].forEach(cb => cb(newValue, oldValue));
        }
        return true;
    },
    get(target, prop) {
        return target[prop];
    }
});

export const subscribe = (prop, callback) => {
    if (!_listeners[prop]) _listeners[prop] = [];
    _listeners[prop].push(callback);
    return () => {
        _listeners[prop] = _listeners[prop].filter(cb => cb !== callback);
    };
};

export const resetStore = () => {
    Object.keys(_initialState).forEach(key => {
        store[key] = Array.isArray(_initialState[key])
            ? []
            : _initialState[key];
    });
};
