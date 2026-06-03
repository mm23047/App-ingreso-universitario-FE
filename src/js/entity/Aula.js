// BE: Aula  @Table(name="aula")
// PK: UUID idAula  (columna id_aula)
class Aula {
    constructor(idAula, codigoAulaApi, capacidadFisica, accesibleSillaRuedas) {
        this.idAula               = idAula;
        this.codigoAulaApi        = codigoAulaApi;
        this.capacidadFisica      = capacidadFisica;
        this.accesibleSillaRuedas = accesibleSillaRuedas;
    }
}

export default Aula;
