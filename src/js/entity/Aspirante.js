// BE: AspirantesDato  @Table(name="aspirante_datos")
// PK: UUID id  (columna id_aspirante, getter getId() → JSON key "id")
class Aspirante {
    constructor(id, nombres, apellidos, fechaNacimiento, dui, correo, fechaCreacionPerfil, usaSillaRuedas) {
        this.id                  = id;
        this.nombres             = nombres;
        this.apellidos           = apellidos;
        this.fechaNacimiento     = fechaNacimiento;
        this.dui                 = dui;
        this.correo              = correo;
        this.fechaCreacionPerfil = fechaCreacionPerfil;
        this.usaSillaRuedas      = usaSillaRuedas;
    }
}

export default Aspirante;
