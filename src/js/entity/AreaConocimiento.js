// BE: AreasConocimiento  @Table(name="area_conocimiento")
// PK: UUID idAreaConocimiento  (columna id_area)
class AreaConocimiento {
    constructor(idAreaConocimiento, nombreArea) {
        this.idAreaConocimiento = idAreaConocimiento;
        this.nombreArea         = nombreArea;
    }
}

export default AreaConocimiento;
