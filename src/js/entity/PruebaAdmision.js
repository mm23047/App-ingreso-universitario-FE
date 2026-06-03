// BE: PruebasAdmision  @Table(name="prueba_admision")
// PK: UUID idPruebaAdmision  (columna id_prueba)
class PruebaAdmision {
    constructor(idPruebaAdmision, nombrePrueba, anio, activa) {
        this.idPruebaAdmision = idPruebaAdmision;
        this.nombrePrueba     = nombrePrueba;
        this.anio             = anio;
        this.activa           = activa;
    }
}

export default PruebaAdmision;
