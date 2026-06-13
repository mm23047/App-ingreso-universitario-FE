import PruebasAdmisionDao from './pruebas_admision_dao.js';
import TurnosDao          from './turnos_dao.js';
import AulasTurnosDao     from './aulas_turnos_dao.js';

class ProcesosController {
    constructor() {
        this.pruebasDao      = new PruebasAdmisionDao();
        this.turnosDao       = new TurnosDao();
        this.aulasDao        = new AulasTurnosDao();
        this._turnosBrutos   = [];
        this._dispsBrutos    = [];
        this._abortController = null;
    }

    /**
     * Carga los 3 endpoints en paralelo con degradación controlada.
     * @returns {{ procesos: Object[], avisos: string[] }}
     */
    async cargar() {
        const [resPruebas, resTurnos, resDisp] = await Promise.allSettled([
            this.pruebasDao.obtenerTodas(0, 200),
            this.turnosDao.obtenerTurnos(),
            this.aulasDao.obtenerDisponibilidad(),
        ]);

        if (resPruebas.status === 'rejected') {
            throw new Error('No se pudieron cargar los procesos. Verifica que el servidor esté encendido en el puerto 9080.');
        }

        const avisos = [];
        if (resTurnos.status === 'rejected') avisos.push('fechas y horarios (turnos no disponibles)');
        if (resDisp.status   === 'rejected') avisos.push('sedes (disponibilidad de aulas no disponible)');

        this._turnosBrutos = resTurnos.status === 'fulfilled' ? (resTurnos.value ?? []) : [];
        this._dispsBrutos  = resDisp.status   === 'fulfilled' ? (resDisp.value   ?? []) : [];

        return {
            procesos: this._ensamblar(resPruebas.value ?? [], this._turnosBrutos, this._dispsBrutos),
            avisos,
        };
    }

    /**
     * Busca procesos en el backend y reensambla con los datos crudos en caché.
     * Cancela automáticamente la petición anterior si llega una nueva.
     * @param {string} query
     * @returns {Object[]}
     */
    async buscar(query) {
        if (this._abortController) this._abortController.abort();
        this._abortController = new AbortController();

        const pruebas = await this.pruebasDao.obtenerTodas(0, 200, query, this._abortController.signal);

        return this._ensamblar(pruebas, this._turnosBrutos, this._dispsBrutos);
    }

    /**
     * Agrupa una lista de procesos por año en un Map ordenado descendente.
     * @param {Object[]} lista
     * @returns {Map<string|number, Object[]>}
     */
    agruparPorAnio(lista) {
        const mapa = new Map();
        const ordenada = [...lista].sort((a, b) => Number(b.anio) - Number(a.anio));
        for (const p of ordenada) {
            const k = p.anio ?? '—';
            if (!mapa.has(k)) mapa.set(k, []);
            mapa.get(k).push(p);
        }
        return mapa;
    }

    /* ── Join cliente: prueba → turnos → sedes ── */
    _ensamblar(pruebas, turnos, disps) {
        const turnosPorPrueba = {};
        for (const t of turnos) {
            const pid = t.pruebaAdmision?.idPruebaAdmision;
            if (pid) (turnosPorPrueba[pid] ??= []).push(t);
        }

        const sedesPorTurno = {};
        for (const d of disps) {
            const tid  = d.turnoExamen?.idTurnoExamen ?? d.idDisponibilidadAulaTurno?.idTurno;
            const aula = d.aula;
            const sede = aula?.nombreSede
                ? `${aula.nombreSede} — ${aula.departamento ?? ''}`.trimEnd()
                : aula?.codigoAulaApi;
            if (tid && sede) (sedesPorTurno[tid] ??= new Set()).add(sede);
        }

        return pruebas.map(p => {
            const turnosP  = turnosPorPrueba[p.idPruebaAdmision] ?? [];
            const fechas   = turnosP.map(t => t.fecha).filter(Boolean).sort();
            const jornadas = [...new Set(turnosP.map(t => t.nombreTurno).filter(Boolean))];
            const horarios = [...new Set(
                turnosP
                    .filter(t => t.horaInicio && t.horaFin)
                    .map(t => `${t.horaInicio.slice(0,5)} – ${t.horaFin.slice(0,5)}`)
            )];
            const sedes = new Set();
            turnosP.forEach(t =>
                (sedesPorTurno[t.idTurnoExamen] ?? new Set()).forEach(s => sedes.add(s))
            );

            return {
                idPruebaAdmision: p.idPruebaAdmision,
                nombrePrueba:     p.nombrePrueba ?? '—',
                anio:             p.anio         ?? '—',
                activa:           !!p.activa,
                fechaInicio:      fechas[0]       ?? null,
                fechaFin:         fechas.at(-1)   ?? null,
                jornadas,
                horarios,
                sedes: [...sedes],
            };
        });
    }
}

export default ProcesosController;
