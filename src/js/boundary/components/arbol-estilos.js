const estilos = new CSSStyleSheet();
estilos.replaceSync(`
    /*
     * Variables CSS (--color-primary, --radius-lg, etc.) provienen
     * de global.css y atraviesan el Shadow DOM boundary sin problema.
     */
    :host {
        display: block;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        margin-bottom: var(--space-sm);
        overflow: hidden;
    }

    /* ── Nivel 1: cabecera del área ── */
    .cabecera {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-md) var(--space-lg);
        cursor: pointer;
        user-select: none;
        transition: background var(--transition);
    }
    .cabecera:hover    { background: #EFF6FF; }
    .cabecera.expandida {
        background: #EFF6FF;
        border-bottom: 1px solid var(--color-border);
    }
    .titulo { font-weight: 600; color: var(--color-primary-dark); }
    .icono-toggle {
        font-size: 1.1rem;
        color: var(--color-primary);
        transition: transform .2s;
    }
    .cabecera.expandida .icono-toggle { transform: rotate(90deg); }

    /* ── Contenedor de temas (oculto por defecto) ── */
    .temas {
        display: none;
        padding: var(--space-md) var(--space-lg);
    }
    .sin-temas { color: var(--color-text-muted); font-size: .9rem; font-style: italic; }

    /* ── Nivel 2: ítem de tema (sin subtemas) ── */
    .tema-item {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        padding: var(--space-xs) 0;
        border-bottom: 1px solid #F1F5F9;
        font-size: .93rem;
        color: var(--color-text);
    }
    .tema-item:last-child { border-bottom: none; }
    .tema-dot {
        width: 8px; height: 8px; border-radius: 50%;
        background: var(--color-primary-light); flex-shrink: 0;
    }

    /* ── Nivel 2: ítem de tema expandible (tiene subtemas) ── */
    .tema-item.tiene-subtemas {
        flex-direction: column;
        align-items: flex-start;
        gap: 0;
        padding: 0;
        cursor: default;
    }
    .tema-cabecera {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        width: 100%;
        padding: var(--space-xs) 0;
        cursor: pointer;
        user-select: none;
    }
    .tema-icono-toggle {
        font-size: .75rem;
        color: var(--color-primary);
        transition: transform .2s;
        margin-left: auto;
        flex-shrink: 0;
    }
    .tema-item.tiene-subtemas.abierto .tema-icono-toggle {
        transform: rotate(90deg);
    }

    /* ── Nivel 3: lista de subtemas ── */
    .subtemas-lista {
        display: none;
        width: 100%;
        padding-left: calc(8px + var(--space-md) + var(--space-md));
        padding-bottom: var(--space-xs);
    }
    .tema-item.tiene-subtemas.abierto .subtemas-lista {
        display: block;
    }
    .subtema-item {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        padding: 3px 0;
        font-size: .93rem;
        color: var(--color-text);
        border-bottom: 1px solid #F8FAFC;
    }
    .subtema-item:last-child { border-bottom: none; }
    .subtema-dot {
        width: 5px; height: 5px; border-radius: 50%;
        background: var(--color-primary-light);
        flex-shrink: 0;
        opacity: .55;
    }
`);

export default estilos;
