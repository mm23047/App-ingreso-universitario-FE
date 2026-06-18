import { expect } from '../lib/chai/index.js';
import '../../../js/boundary/components/resultado-card.js';

describe('ResultadoCard — app-resultado-card — Pruebas Unitarias', () => {
    let el;

    const sr = () => el.shadowRoot;

    const EXAMEN_CALIFICADO = {
        puntajeFinal: 8.5,
        estadoAdmision: 'ADMITIDO',
        fechaRealizacion: '2026-03-15T10:30:00',
        claveExamen: {
            nombreClave: 'CLAVE-A',
            pruebaAdmision: { nombrePrueba: 'Prueba General 2026' }
        },
        etapaAdmision: { nombre: 'Primera' },
        inscripcionesPrueba: {
            estado: 'CALIFICADO',
            aspiranteDato: { nombres: 'Juan', apellidos: 'Pérez' }
        }
    };

    const EXAMEN_PENDIENTE = {
        puntajeFinal: null,
        estadoAdmision: 'PENDIENTE',
        fechaRealizacion: '2026-03-15T10:30:00',
        claveExamen: {
            nombreClave: 'CLAVE-B',
            pruebaAdmision: { nombrePrueba: 'Prueba General 2026' }
        },
        etapaAdmision: { nombre: 'Primera' },
        inscripcionesPrueba: {
            estado: 'INSCRITO',
            aspiranteDato: { nombres: 'Ana', apellidos: 'López' }
        }
    };

    const INSCRIPCION = {
        pruebaAdmision: { nombrePrueba: 'Prueba Ciclo II' },
        aspiranteDato: { nombres: 'María', apellidos: 'García' },
        estado: 'INSCRITO'
    };

    const ASPIRANTE = {
        nombres: 'Carlos',
        apellidos: 'Martínez'
    };

    beforeEach(() => {
        el = document.createElement('app-resultado-card');
        document.body.appendChild(el);
    });

    afterEach(() => {
        if (el?.parentNode) el.parentNode.removeChild(el);
    });

    // ── Estructura inicial ─────────────────────────────────────────────────
    describe('Estructura inicial', () => {
        it('el shadow DOM está inicializado', () => {
            expect(sr()).to.not.be.null;
        });

        it('data es null antes de asignar', () => {
            expect(el.data).to.be.null;
        });

        it('tipo es null antes de asignar', () => {
            expect(el.tipo).to.be.null;
        });

        it('no renderiza nada si solo se asigna tipo sin data', () => {
            el.tipo = 'examen';
            expect(sr().children.length).to.equal(0);
        });

        it('no renderiza nada si solo se asigna data sin tipo', () => {
            el.data = EXAMEN_CALIFICADO;
            expect(sr().children.length).to.equal(0);
        });
    });

    // ── Variante examen calificado ────────────────────────────────────────
    describe('Variante examen — calificado', () => {
        beforeEach(() => {
            el.tipo = 'examen';
            el.data = EXAMEN_CALIFICADO;
        });

        it('renderiza una tarjeta .card', () => {
            expect(sr().querySelector('.card')).to.not.be.null;
        });

        it('muestra el nombre de la prueba en el h3', () => {
            expect(sr().querySelector('h3').textContent).to.equal('Prueba General 2026');
        });

        it('muestra el badge Calificado', () => {
            const badges = sr().querySelectorAll('.badge');
            const textos = [...badges].map(b => b.textContent);
            expect(textos).to.include('Calificado');
        });

        it('muestra el badge Admitido', () => {
            const badges = sr().querySelectorAll('.badge');
            const textos = [...badges].map(b => b.textContent);
            expect(textos).to.include('Admitido');
        });

        it('muestra el panel de puntaje', () => {
            expect(sr().querySelector('.puntaje-panel')).to.not.be.null;
        });

        it('muestra el puntaje correcto', () => {
            expect(sr().querySelector('.puntaje-num').textContent).to.equal('8.5');
        });

        it('muestra el nombre del aspirante en el grid', () => {
            const dds = sr().querySelectorAll('.examen-grid dd');
            const textos = [...dds].map(dd => dd.textContent);
            expect(textos).to.include('Juan Pérez');
        });

        it('muestra la clave de examen en el grid', () => {
            const dds = sr().querySelectorAll('.examen-grid dd');
            const textos = [...dds].map(dd => dd.textContent);
            expect(textos).to.include('CLAVE-A');
        });

        it('no muestra alerta de inconsistencia (estado es CALIFICADO)', () => {
            expect(sr().querySelector('.alerta-datos')).to.be.null;
        });

        it('incluye un app-recom-box', () => {
            expect(sr().querySelector('app-recom-box')).to.not.be.null;
        });
    });

    // ── Variante examen pendiente ─────────────────────────────────────────
    describe('Variante examen — pendiente de calificación', () => {
        beforeEach(() => {
            el.tipo = 'examen';
            el.data = EXAMEN_PENDIENTE;
        });

        it('muestra el badge Pendiente de calificación', () => {
            const badges = sr().querySelectorAll('.badge');
            const textos = [...badges].map(b => b.textContent);
            expect(textos).to.include('Pendiente de calificación');
        });

        it('no muestra el panel de puntaje', () => {
            expect(sr().querySelector('.puntaje-panel')).to.be.null;
        });

        it('muestra alerta de inconsistencia (calificado=false pero estado=INSCRITO no aplica)', () => {
            expect(sr().querySelector('.alerta-datos')).to.be.null;
        });
    });

    // ── Alerta de inconsistencia de datos ─────────────────────────────────
    describe('Alerta de inconsistencia', () => {
        it('se muestra cuando puntajeFinal existe pero estado es INSCRITO', () => {
            const exInconsistente = {
                ...EXAMEN_CALIFICADO,
                inscripcionesPrueba: {
                    ...EXAMEN_CALIFICADO.inscripcionesPrueba,
                    estado: 'INSCRITO'
                }
            };
            el.tipo = 'examen';
            el.data = exInconsistente;
            expect(sr().querySelector('.alerta-datos')).to.not.be.null;
        });
    });

    // ── Variante inscrito ─────────────────────────────────────────────────
    describe('Variante inscrito', () => {
        beforeEach(() => {
            el.tipo = 'inscrito';
            el.data = INSCRIPCION;
        });

        it('renderiza una tarjeta .card con clase inscrito', () => {
            const card = sr().querySelector('.card');
            expect(card).to.not.be.null;
            expect(card.classList.contains('inscrito')).to.be.true;
        });

        it('muestra el nombre de la prueba en el h3', () => {
            expect(sr().querySelector('h3').textContent).to.equal('Prueba Ciclo II');
        });

        it('muestra el badge Pendiente de examen', () => {
            const badges = sr().querySelectorAll('.badge');
            const textos = [...badges].map(b => b.textContent);
            expect(textos).to.include('Pendiente de examen');
        });

        it('muestra el nombre del aspirante', () => {
            const dds = sr().querySelectorAll('.examen-grid dd');
            const textos = [...dds].map(dd => dd.textContent);
            expect(textos).to.include('María García');
        });

        it('incluye un app-recom-box', () => {
            expect(sr().querySelector('app-recom-box')).to.not.be.null;
        });
    });

    // ── Variante registrado ───────────────────────────────────────────────
    describe('Variante registrado', () => {
        beforeEach(() => {
            el.tipo = 'registrado';
            el.data = ASPIRANTE;
        });

        it('renderiza una tarjeta .card con clase registrado', () => {
            const card = sr().querySelector('.card');
            expect(card).to.not.be.null;
            expect(card.classList.contains('registrado')).to.be.true;
        });

        it('muestra ¡Registro Encontrado! en el h3', () => {
            expect(sr().querySelector('h3').textContent).to.equal('¡Registro Encontrado!');
        });

        it('muestra el nombre del aspirante en el párrafo', () => {
            const p = sr().querySelector('p');
            expect(p.textContent).to.include('Carlos Martínez');
        });

        it('incluye un app-recom-box', () => {
            expect(sr().querySelector('app-recom-box')).to.not.be.null;
        });
    });

    // ── Getters ──────────────────────────────────────────────────────────
    describe('Getters de tipo y data', () => {
        it('getter tipo retorna el valor asignado', () => {
            el.tipo = 'inscrito';
            expect(el.tipo).to.equal('inscrito');
        });

        it('getter data retorna el objeto asignado', () => {
            el.data = ASPIRANTE;
            expect(el.data).to.equal(ASPIRANTE);
        });
    });

    // ── Reasignación ─────────────────────────────────────────────────────
    describe('Reasignación', () => {
        it('cambiar tipo reconstruye la tarjeta', () => {
            el.tipo = 'inscrito';
            el.data = INSCRIPCION;
            expect(sr().querySelector('.card.inscrito')).to.not.be.null;

            el.tipo = 'registrado';
            el.data = ASPIRANTE;
            expect(sr().querySelector('.card.inscrito')).to.be.null;
            expect(sr().querySelector('.card.registrado')).to.not.be.null;
        });

        it('cambiar data con el mismo tipo actualiza el contenido', () => {
            el.tipo = 'examen';
            el.data = EXAMEN_CALIFICADO;
            expect(sr().querySelector('h3').textContent).to.equal('Prueba General 2026');

            const otro = {
                ...EXAMEN_CALIFICADO,
                claveExamen: {
                    ...EXAMEN_CALIFICADO.claveExamen,
                    pruebaAdmision: { nombrePrueba: 'Prueba Especial' }
                }
            };
            el.data = otro;
            expect(sr().querySelector('h3').textContent).to.equal('Prueba Especial');
        });
    });
});
