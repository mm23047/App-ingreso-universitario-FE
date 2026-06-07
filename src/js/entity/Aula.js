// BE: Aula  @Table(name="aula")
// PK: UUID idAula  (columna id_aula)
class Aula {
    constructor(idAula, codigoAulaApi, capacidadFisica, accesibleSillaRuedas, nombreSede, departamento, municipio) {
        this.idAula               = idAula;
        this.codigoAulaApi        = codigoAulaApi;
        this.capacidadFisica      = capacidadFisica;
        this.accesibleSillaRuedas = accesibleSillaRuedas;
        this.nombreSede           = nombreSede   ?? null;
        this.departamento         = departamento ?? null;
        this.municipio            = municipio    ?? null;
    }
}

export default Aula;
