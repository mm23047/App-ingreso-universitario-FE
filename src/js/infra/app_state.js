const _initialState = {
    aspirante: null,
    carreraSeleccionada: null,
    turnoSeleccionado: null,
    inscripcionActiva: null,
    examenActivo: null,
    notificaciones: [],
    loading: false,
    carreras: [],
    turnos: [],
    preguntas: [],
    route: '/'
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
