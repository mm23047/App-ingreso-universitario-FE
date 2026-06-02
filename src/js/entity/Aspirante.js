// Entidad: AspirantesDato
// Campos backend: id (UUID), nombres, apellidos, fechaNacimiento (YYYY-MM-DD),
//   dui (String), correo (String), usaSillaRuedas (Boolean), fechaCreacionPerfil
export default class Aspirante {
    constructor(data = {}) {
        Object.assign(this, data);
    }
}
