const TIPO_CICLO_DIAS = "ciclo_dias";
const TIPO_CICLO_HORAS = "ciclo_horas";
const TIPO_TURNO_ROTATIVO = "turno_rotativo";
const API_BASE_URL = "http://127.0.0.1:8000";

const LEGACY_STORAGE_KEY = "simulador_escala_demo_v09";
const PREVIOUS_STORAGE_KEY = "simulador_escala_demo_v013";
const STORAGE_KEY = "simulador_escala_demo_v014_local";
const THEME_KEY = "simulador_escala_theme";

const ESCALA_REAL_24_DIAS = [
    "Tarde", "Tarde", "Tarde",
    "Noite", "Noite", "Noite",
    "Folga", "Folga", "Folga",
    "Tarde", "Tarde", "Tarde",
    "Noite", "Noite", "Noite",
    "Folga", "Folga",
    "Manhã", "Manhã", "Manhã", "Manhã", "Manhã", "Manhã",
    "Folga"
];

const PREDEFINED_MODELS = [
    {
        id: "6x3",
        nome: "Escala 6x3",
        tipo: TIPO_CICLO_DIAS,
        dias_trabalho: 6,
        dias_folga: 3
    },
    {
        id: "5x2",
        nome: "Escala 5x2",
        tipo: TIPO_CICLO_DIAS,
        dias_trabalho: 5,
        dias_folga: 2
    },
    {
        id: "4x2",
        nome: "Escala 4x2",
        tipo: TIPO_CICLO_DIAS,
        dias_trabalho: 4,
        dias_folga: 2
    },
    {
        id: "12x36",
        nome: "Escala 12x36",
        tipo: TIPO_CICLO_HORAS,
        horas_trabalho: 12,
        horas_folga: 36
    },
    {
        id: "turno_rotativo_simples",
        nome: "Turno rotativo simples",
        tipo: TIPO_TURNO_ROTATIVO,
        sequencia_turnos: ["Manhã", "Manhã", "Tarde", "Tarde", "Noite", "Noite", "Folga", "Folga"]
    },
    {
        id: "escala_real_24_dias",
        nome: "Minha escala real 24 dias",
        tipo: TIPO_TURNO_ROTATIVO,
        sequencia_turnos: ESCALA_REAL_24_DIAS
    }
];

const TURN_CLASSES = {
    "manhã": "manha",
    "manha": "manha",
    "tarde": "tarde",
    "noite": "noite",
    "folga": "folga",
    "trabalhando": "trabalhando"
};

const state = {
    selectedType: TIPO_CICLO_DIAS,
    resultItems: [],
    savedScales: [],
    savedScaleSource: "local",
    availableModels: [],
    simulatorTurns: ["Manhã", "Tarde", "Noite", "Folga"],
    savedTurns: ["Manhã", "Tarde", "Noite", "Folga"],
    selectedSavedScaleName: null,
    isSavingScale: false,
    scrollTicking: false,
    calendarView: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    selectedModelId: null,
    calendarAnimating: false
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const elements = {
    root: document.documentElement,
    themeToggle: $("#themeToggle"),
    mobileMenuButton: $("#mobileMenuButton"),
    navLinks: $("#navLinks"),
    scrollProgress: $("#scrollProgress"),
    scaleTypeButtons: $("#scaleTypeButtons"),
    modelButtons: $("#modelButtons"),
    simulatorForm: $("#simulatorForm"),
    dynamicFields: $("#dynamicFields"),
    resultCard: $("#resultCard"),
    resultTitle: $("#resultTitle"),
    resultDescription: $("#resultDescription"),
    timelineList: $("#timelineList"),
    calendarGrid: $("#calendarGrid"),
    calendarMonth: $("#calendarMonth"),
    calendarContext: $("#calendarContext"),
    calendarPrevious: $("#calendarPrevious"),
    calendarNext: $("#calendarNext"),
    calendarToday: $("#calendarToday"),
    selectedPeriods: $("#selectedPeriods"),
    cycleSequence: $("#cycleSequence"),
    cycleBoardCaption: $("#cycleBoardCaption"),
    savedScaleForm: $("#savedScaleForm"),
    savedName: $("#savedName"),
    savedType: $("#savedType"),
    savedDynamicFields: $("#savedDynamicFields"),
    savedScalesList: $("#savedScalesList"),
    savedScaleSourceNotice: $("#savedScaleSourceNotice"),
    savedScaleSourceShort: $("#savedScaleSourceShort"),
    savedScaleSubmitButton: $("#savedScaleSubmitButton"),
    savedScaleFeedback: $("#savedScaleFeedback"),
    resetScalesButton: $("#resetScalesButton"),
    apiStatusCard: $("#apiStatusCard"),
    apiStatusText: $("#apiStatusText"),
    apiStatusDescription: $("#apiStatusDescription"),
    apiRefreshButton: $("#apiRefreshButton")
};

function cloneScale(scale) {
    return JSON.parse(JSON.stringify(scale));
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>\"']/g, (character) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
    })[character]);
}

function hasSimulator() {
    return Boolean(elements.simulatorForm && elements.dynamicFields);
}

function loadSavedScales() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
            || JSON.parse(localStorage.getItem(PREVIOUS_STORAGE_KEY))
            || JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY));

        if (Array.isArray(saved)) {
            return saved;
        }
    } catch (error) {
        console.warn("Não foi possível carregar escalas salvas.", error);
    }

    return [];
}

function normalizeTurns(value) {
    if (Array.isArray(value)) {
        return value
            .map((turn) => String(turn).trim())
            .filter(Boolean);
    }

    return String(value)
        .split(",")
        .map((turn) => turn.trim())
        .filter(Boolean);
}

function getTypeName(type) {
    const names = {
        [TIPO_CICLO_DIAS]: "Ciclo por dias",
        [TIPO_CICLO_HORAS]: "Ciclo por horas",
        [TIPO_TURNO_ROTATIVO]: "Turno rotativo"
    };

    return names[type] || "Ciclo por dias";
}

function getTurnClass(status) {
    const key = String(status).toLowerCase();
    return TURN_CLASSES[key] || "trabalhando";
}

function getScaleSummary(scale) {
    if (scale.tipo === TIPO_CICLO_HORAS) {
        return `${scale.horas_trabalho}x${scale.horas_folga} horas`;
    }

    if (scale.tipo === TIPO_TURNO_ROTATIVO) {
        return normalizeTurns(scale.sequencia_turnos).join(" → ");
    }

    return `${scale.dias_trabalho}x${scale.dias_folga} dias`;
}

function getModelIcon(type) {
    const icons = {
        [TIPO_CICLO_DIAS]: "calendar-days",
        [TIPO_CICLO_HORAS]: "clock",
        [TIPO_TURNO_ROTATIVO]: "repeat-2"
    };

    return icons[type] || "layers-3";
}

function renderModelButtons() {
    if (!elements.modelButtons) {
        return;
    }

    const models = state.availableModels.length ? state.availableModels : PREDEFINED_MODELS;

    elements.modelButtons.innerHTML = models
        .map((model, index) => `
            <button class="model-button ${state.selectedModelId === model.id ? "selected" : ""}" type="button" data-model-index="${index}">
                <span class="model-icon"><i data-lucide="${getModelIcon(model.tipo)}"></i></span>
                <span>
                <strong>${escapeHtml(model.nome)}</strong>
                    <small>${escapeHtml(getTypeName(model.tipo))} · ${escapeHtml(getScaleSummary(model))}</small>
                </span>
            </button>
        `)
        .join("");

    configureActiveNavigation();
    configureCodeCopyButtons();
    configureModelExplorer();
    configureRoadmapFilters();
    createLucideIcons();
}

function applyModelToSimulator(model) {
    if (!model || !hasSimulator()) {
        return;
    }

    state.selectedSavedScaleName = null;
    state.selectedModelId = model.id || null;
    state.selectedType = model.tipo;
    updateScaleButtons();

    if (model.tipo === TIPO_TURNO_ROTATIVO) {
        state.simulatorTurns = normalizeTurns(model.sequencia_turnos);
    }

    renderDynamicFields();

    if (model.tipo === TIPO_CICLO_HORAS) {
        $("#workHours").value = model.horas_trabalho;
        $("#offHours").value = model.horas_folga;
    } else if (model.tipo === TIPO_CICLO_DIAS) {
        $("#workDays").value = model.dias_trabalho;
        $("#offDays").value = model.dias_folga;
    }

    showResult(
        `Modelo aplicado: ${model.nome}`,
        `${getTypeName(model.tipo)} · ${getScaleSummary(model)}. Preencha as datas ou clique em simular para recalcular.`,
        []
    );
}

function parseDateInput(value) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function parseDateTimeInput(value) {
    return new Date(value);
}

function formatDate(date) {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(date);
}

function formatDateTime(date) {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).format(date);
}

function formatMonth(date) {
    return new Intl.DateTimeFormat("pt-BR", {
        month: "long",
        year: "numeric"
    }).format(date);
}

function addDays(date, amount) {
    const next = new Date(date);
    next.setDate(next.getDate() + amount);
    return next;
}

function addHours(date, amount) {
    const next = new Date(date);
    next.setHours(next.getHours() + amount);
    return next;
}

function getDaysDifference(start, query) {
    const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const queryUtc = Date.UTC(query.getFullYear(), query.getMonth(), query.getDate());

    return Math.floor((queryUtc - startUtc) / 86400000);
}

function calculateCycleDaysStatus(start, query, workDays, offDays) {
    return window.ScaleCalendarCore.cycleDaysStatus(start, query, workDays, offDays);
}

function calculateCycleHoursStatus(start, query, workHours, offHours) {
    return window.ScaleCalendarCore.cycleHoursStatus(start, query, workHours, offHours);
}

function calculateRotativeStatus(start, query, turns) {
    if (!turns.length) {
        throw new Error("A sequência de turnos não pode ficar vazia.");
    }

    return window.ScaleCalendarCore.rotativeStatus(start, query, turns);
}

function createTimelineItem(dateLabel, status, detail = "") {
    return {
        dateLabel,
        status,
        detail
    };
}

function generateCycleDaysItems(start, quantity, workDays, offDays, rangeStart = start) {
    return Array.from({ length: quantity }, (_, index) => {
        const current = addDays(rangeStart, index);
        const status = calculateCycleDaysStatus(start, current, workDays, offDays);

        return createTimelineItem(formatDate(current), status, `Dia ${index + 1} do período visualizado`);
    });
}

function generateRotativeItems(start, quantity, turns, rangeStart = start) {
    return Array.from({ length: quantity }, (_, index) => {
        const current = addDays(rangeStart, index);
        const status = calculateRotativeStatus(start, current, turns);

        return createTimelineItem(formatDate(current), status, `Etapa ${(index % turns.length) + 1} de ${turns.length}`);
    });
}

function generateCycleHoursItems(start, quantity, workHours, offHours) {
    const items = [];
    let current = new Date(start);

    for (let index = 0; index < quantity; index += 1) {
        const isWork = index % 2 === 0;
        const status = isWork ? "Trabalhando" : "Folga";
        const duration = isWork ? workHours : offHours;
        const end = addHours(current, duration);

        items.push(createTimelineItem(
            formatDateTime(current),
            status,
            `Até ${formatDateTime(end)}`
        ));

        current = end;
    }

    return items;
}

function setDefaultDateValues() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
}

function setDefaultDateTimeValues() {
    return `${setDefaultDateValues()}T06:00`;
}

function renderTurnBuilder(target) {
    const previewId = `${target}TurnPreview`;

    return `
        <div class="turn-builder" data-turn-builder="${target}">
            <div class="turn-builder-title">
                <div>
                    <strong>Monte a sequência</strong>
                    <small>Clique nos botões na ordem real do ciclo ou use o modelo pronto.</small>
                </div>
            </div>

            <div class="turn-button-grid" aria-label="Adicionar turno ao ciclo">
                <button class="turn-button manha" type="button" data-turn-target="${target}" data-turn-value="Manhã">Manhã</button>
                <button class="turn-button tarde" type="button" data-turn-target="${target}" data-turn-value="Tarde">Tarde</button>
                <button class="turn-button noite" type="button" data-turn-target="${target}" data-turn-value="Noite">Noite</button>
                <button class="turn-button folga" type="button" data-turn-target="${target}" data-turn-value="Folga">Folga</button>
            </div>

            <div class="turn-preview" id="${previewId}" aria-label="Sequência montada"></div>

            <div class="turn-actions">
                <button class="tiny-button" type="button" data-turn-action="undo" data-turn-target="${target}">Remover último</button>
                <button class="tiny-button" type="button" data-turn-action="clear" data-turn-target="${target}">Limpar sequência</button>
                <button class="tiny-button" type="button" data-turn-action="real24" data-turn-target="${target}">Escala real 24 dias</button>
            </div>
        </div>
    `;
}

function renderTurnPreview(target) {
    const preview = $(`#${target}TurnPreview`);
    const turns = target === "simulator" ? state.simulatorTurns : state.savedTurns;

    if (!preview) {
        return;
    }

    if (!turns.length) {
        preview.innerHTML = `<span class="turn-empty">Nenhum turno adicionado ainda.</span>`;
        return;
    }

    preview.innerHTML = turns
        .map((turn, index) => `
            <span class="turn-chip ${getTurnClass(turn)}">
                ${index + 1}. ${escapeHtml(turn)}
                <button type="button" aria-label="Remover ${escapeHtml(turn)}" data-turn-target="${target}" data-turn-remove="${index}">×</button>
            </span>
        `)
        .join("");
}

function renderDynamicFields() {
    if (!elements.dynamicFields) {
        return;
    }

    if (state.selectedType === TIPO_CICLO_HORAS) {
        elements.dynamicFields.innerHTML = `
            <div class="field-grid">
                <label>
                    Início da escala
                    <input id="startDateTime" type="datetime-local" value="${setDefaultDateTimeValues()}" required>
                </label>
                <label>
                    Data consultada
                    <input id="queryDateTime" type="datetime-local" value="${setDefaultDateTimeValues()}" required>
                </label>
                <label>
                    Horas trabalhadas
                    <input id="workHours" type="number" min="1" value="12" required>
                </label>
                <label>
                    Horas de folga
                    <input id="offHours" type="number" min="1" value="36" required>
                </label>
                <label>
                    Dias para visualizar
                    <input id="quantityPeriods" type="number" min="1" max="30" value="6" required>
                </label>
            </div>
        `;
        return;
    }

    if (state.selectedType === TIPO_TURNO_ROTATIVO) {
        elements.dynamicFields.innerHTML = `
            <div class="field-grid">
                <label>
                    Início do ciclo
                    <input id="startDate" type="date" value="${setDefaultDateValues()}" required>
                </label>
                <label>
                    Data consultada
                    <input id="queryDate" type="date" value="${setDefaultDateValues()}" required>
                </label>
                <label>
                    Dias para visualizar
                    <input id="quantityDays" type="number" min="1" max="60" value="14" required>
                </label>
            </div>
            ${renderTurnBuilder("simulator")}
        `;
        renderTurnPreview("simulator");
        return;
    }

    elements.dynamicFields.innerHTML = `
        <div class="field-grid">
            <label>
                Início da escala
                <input id="startDate" type="date" value="${setDefaultDateValues()}" required>
            </label>
            <label>
                Data consultada
                <input id="queryDate" type="date" value="${setDefaultDateValues()}" required>
            </label>
            <label>
                Dias trabalhados
                <input id="workDays" type="number" min="1" value="6" required>
            </label>
            <label>
                Dias de folga
                <input id="offDays" type="number" min="1" value="3" required>
            </label>
            <label>
                Dias para visualizar
                <input id="quantityDays" type="number" min="1" max="60" value="14" required>
            </label>
        </div>
    `;
}

function renderSavedDynamicFields() {
    if (!elements.savedType || !elements.savedDynamicFields) {
        return;
    }

    const type = elements.savedType.value;

    if (type === TIPO_CICLO_HORAS) {
        elements.savedDynamicFields.innerHTML = `
            <div class="field-grid">
                <label>
                    Horas trabalhadas
                    <input id="savedWorkHours" type="number" min="1" value="12" required>
                </label>
                <label>
                    Horas de folga
                    <input id="savedOffHours" type="number" min="1" value="36" required>
                </label>
            </div>
        `;
        return;
    }

    if (type === TIPO_TURNO_ROTATIVO) {
        elements.savedDynamicFields.innerHTML = renderTurnBuilder("saved");
        renderTurnPreview("saved");
        return;
    }

    elements.savedDynamicFields.innerHTML = `
        <div class="field-grid">
            <label>
                Dias trabalhados
                <input id="savedWorkDays" type="number" min="1" value="6" required>
            </label>
            <label>
                Dias de folga
                <input id="savedOffDays" type="number" min="1" value="3" required>
            </label>
        </div>
    `;
}

function renderTimeline(items) {
    if (!elements.timelineList) {
        return;
    }

    if (!items.length) {
        elements.timelineList.innerHTML = `<p class="turn-empty">A linha do tempo aparecerá aqui depois da simulação.</p>`;
        return;
    }

    elements.timelineList.innerHTML = items
        .map((item) => `
            <div class="timeline-item">
        <span class="timeline-date">${escapeHtml(item.dateLabel)}</span>
                <span>${escapeHtml(item.detail)}</span>
                <strong class="timeline-status ${getTurnClass(item.status)} ${item.status === "Folga" ? "folga-status" : ""}">${escapeHtml(item.status)}</strong>
            </div>
        `)
        .join("");
}

function dateInputValue(date) {
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

function getSimulatorSpec() {
    if (state.selectedType === TIPO_CICLO_HORAS) {
        return { type: state.selectedType, start: parseDateTimeInput($("#startDateTime")?.value || ""), query: parseDateTimeInput($("#queryDateTime")?.value || ""), work: Number($("#workHours")?.value || 0), off: Number($("#offHours")?.value || 0) };
    }
    const start = parseDateInput($("#startDate")?.value || setDefaultDateValues());
    const query = parseDateInput($("#queryDate")?.value || setDefaultDateValues());
    if (state.selectedType === TIPO_TURNO_ROTATIVO) return { type: state.selectedType, start, query, turns: normalizeTurns(state.simulatorTurns) };
    return { type: state.selectedType, start, query, work: Number($("#workDays")?.value || 0), off: Number($("#offDays")?.value || 0) };
}

function statusForDate(spec, date) {
    if (spec.type === TIPO_CICLO_HORAS) {
        const query = new Date(date.getFullYear(), date.getMonth(), date.getDate(), spec.query.getHours(), spec.query.getMinutes());
        return window.ScaleCalendarCore.cycleHoursStatus(spec.start, query, spec.work, spec.off);
    }
    if (spec.type === TIPO_TURNO_ROTATIVO) return window.ScaleCalendarCore.rotativeStatus(spec.start, date, spec.turns);
    return window.ScaleCalendarCore.cycleDaysStatus(spec.start, date, spec.work, spec.off);
}

function assertApiStatusMatchesCalendar(status) {
    const spec = getSimulatorSpec();
    const expected = statusForDate(spec, spec.query);
    if (String(status).toLowerCase() !== String(expected).toLowerCase()) {
        throw new Error("O status da API diverge do calendário. Confira a data de início e os horários da escala.");
    }
}

function formatMinute(minute) {
    return String(Math.floor(minute / 60)).padStart(2, "0") + ":" + String(minute % 60).padStart(2, "0");
}

function renderSelectedPeriods(spec) {
    if (!elements.selectedPeriods) return;
    if (spec.type !== TIPO_CICLO_HORAS) {
        const status = statusForDate(spec, spec.query);
        elements.selectedPeriods.innerHTML = '<span class="period-chip ' + getTurnClass(status) + '">' + escapeHtml(status) + ' durante o dia</span>';
        return;
    }
    const segments = window.ScaleCalendarCore.cycleHoursSegments(spec.start, spec.query, spec.work, spec.off);
    elements.selectedPeriods.innerHTML = segments.map((segment) => '<span class="period-chip ' + getTurnClass(segment.status) + '"><strong>' + formatMinute(segment.startMinute) + '–' + formatMinute(segment.endMinute) + '</strong><span>' + escapeHtml(segment.status) + '</span></span>').join("");
}

function renderCalendar() {
    if (!elements.calendarGrid || !elements.calendarMonth) return;
    const spec = getSimulatorSpec();
    const selectedDate = dateInputValue(spec.query);
    const today = dateInputValue(new Date());
    const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const cells = window.ScaleCalendarCore.monthCells(state.calendarView).map((date) => {
        if (!date) return '<div class="calendar-empty" aria-hidden="true"></div>';
        const value = dateInputValue(date);
        const status = statusForDate(spec, date);
        const timeLabel = spec.query.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        const label = spec.type === TIPO_CICLO_HORAS ? timeLabel + " · " + status : status;
        const displayStatus = status === "Trabalhando" ? "Trabalho" : status;
        const current = value === selectedDate;
        const todayClass = value === today ? "is-today" : "";
        const visibleStatus = spec.type === TIPO_CICLO_HORAS
            ? '<span class="calendar-time">' + escapeHtml(timeLabel) + '</span><span class="calendar-status">' + escapeHtml(displayStatus) + '</span>'
            : escapeHtml(displayStatus);
        return '<button type="button" class="calendar-day ' + getTurnClass(status) + ' ' + (current ? "is-query-date" : "") + ' ' + todayClass + '" data-calendar-date="' + value + '" ' + (current ? 'aria-current="date"' : '') + ' aria-label="' + value + ': ' + escapeHtml(label) + '"><strong>' + date.getDate() + '<span>' + (current ? "Sel." : value === today ? "Hoje" : "") + '</span></strong><small>' + visibleStatus + '</small></button>';
    });
    elements.calendarMonth.textContent = formatMonth(state.calendarView);
    elements.calendarGrid.innerHTML = weekdays.map((day) => '<div class="calendar-weekday">' + day + '</div>').concat(cells).join("");
    if (elements.calendarContext) {
        elements.calendarContext.textContent = spec.type === TIPO_CICLO_HORAS
            ? "Ciclo por horas consultado às " + spec.query.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) + "; o status pode mudar dentro do mesmo dia. Os períodos acima mostram os horários exatos."
            : "Cada dia parte do início do ciclo em " + formatDate(spec.start) + ". Selecione um dia para consultar o resultado.";
    }
    renderSelectedPeriods(spec);
    animateCalendarDays();
}

function animateCalendarDays() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !window.gsap) return;
    const days = $$("#calendarGrid .calendar-day");
    window.gsap.fromTo(days, { opacity: 0, y: 5 }, { opacity: 1, y: 0, duration: 0.18, stagger: 0.008, ease: "power1.out", overwrite: true });
}

function renderCycleSequence() {
    if (!elements.cycleSequence) {
        return;
    }

    let sequence = [];
    let currentPosition = 0;
    let currentIndex = 0;
    let caption = "A posição consultada está destacada";

    if (state.selectedType === TIPO_CICLO_HORAS) {
        const start = parseDateTimeInput($("#startDateTime")?.value || "");
        const query = parseDateTimeInput($("#queryDateTime")?.value || "");
        const work = Number($("#workHours")?.value || 0);
        const off = Number($("#offHours")?.value || 0);
        const cycle = work + off;
        currentPosition = window.ScaleCalendarCore.cycleHoursPosition(start, query, work, off);
        currentIndex = currentPosition < work ? 0 : 1;
        sequence = [
            { label: `${work} h`, detail: "Trabalho", className: "trabalhando", end: work },
            { label: `${off} h`, detail: "Folga", className: "folga", end: cycle }
        ];
        caption = `Data consultada: ${formatDateTime(query)} · ciclo de ${cycle} h`;
    } else if (state.selectedType === TIPO_TURNO_ROTATIVO) {
        const start = parseDateInput($("#startDate")?.value || "");
        const query = parseDateInput($("#queryDate")?.value || "");
        const turns = normalizeTurns(state.simulatorTurns);
        currentPosition = window.ScaleCalendarCore.rotativePosition(start, query, turns.length);
        currentIndex = currentPosition;
        sequence = turns.map((turn, index) => ({
            label: `Dia ${index + 1}`,
            detail: turn,
            className: getTurnClass(turn)
        }));
        caption = `Data consultada: ${formatDate(query)} · posição ${currentPosition + 1} de ${turns.length}`;
    } else {
        const start = parseDateInput($("#startDate")?.value || "");
        const query = parseDateInput($("#queryDate")?.value || "");
        const work = Number($("#workDays")?.value || 0);
        const off = Number($("#offDays")?.value || 0);
        const cycle = work + off;
        currentPosition = window.ScaleCalendarCore.cycleDaysPosition(start, query, work, off);
        currentIndex = currentPosition;
        sequence = Array.from({ length: cycle }, (_, index) => ({
            label: `Dia ${index + 1}`,
            detail: index < work ? "Trabalho" : "Folga",
            className: index < work ? "trabalhando" : "folga"
        }));
        caption = `Data consultada: ${formatDate(query)} · posição ${currentPosition + 1} de ${cycle}`;
    }

    elements.cycleSequence.innerHTML = sequence.map((step, index) => `
        <div class="cycle-step ${escapeHtml(step.className)} ${index === currentIndex ? "is-current" : ""}"${index === currentIndex ? ' aria-current="true"' : ""}>
            <strong>${escapeHtml(step.label)}</strong>
            <span>${escapeHtml(step.detail)}</span>
        </div>
    `).join("");
    if (elements.cycleBoardCaption) {
        elements.cycleBoardCaption.textContent = caption;
    }
}

function animateSimulationUpdate() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !window.gsap) {
        return;
    }

    const timelineItems = $$("#timelineList .timeline-item").slice(0, 16);
    const cycleSteps = $$("#cycleSequence .cycle-step").slice(0, 24);
    const calendarDays = $$("#calendarGrid .calendar-day").slice(0, 20);
    const resultCopy = [elements.resultTitle, elements.resultDescription].filter(Boolean);
    const targets = [...resultCopy, ...cycleSteps, ...timelineItems, ...calendarDays];
    if (!targets.length) {
        return;
    }

    window.gsap.fromTo(targets, { opacity: 0, y: 8 }, {
        opacity: 1,
        y: 0,
        duration: 0.22,
        stagger: 0.025,
        ease: "power1.out",
        overwrite: true
    });
}

function showResult(title, description, items) {
    if (!elements.resultTitle || !elements.resultDescription || !elements.resultCard) {
        return;
    }

    elements.resultTitle.textContent = title;
    elements.resultDescription.textContent = description;
    state.resultItems = items;

    renderTimeline(items);
    renderCalendar();
    renderCycleSequence();
    animateSimulationUpdate();
}

function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
}

function turnSequencesAreEqual(firstSequence, secondSequence) {
    const first = normalizeTurns(firstSequence);
    const second = normalizeTurns(secondSequence);

    if (first.length !== second.length) {
        return false;
    }

    return first.every((turn, index) => turn === second[index]);
}

function getSelectedModelForApi() {
    const models = state.availableModels.length ? state.availableModels : PREDEFINED_MODELS;

    if (state.selectedType === TIPO_CICLO_HORAS) {
        const workHoursInput = $("#workHours");
        const offHoursInput = $("#offHours");

        if (!workHoursInput || !offHoursInput) {
            return null;
        }

        const workHours = Number(workHoursInput.value);
        const offHours = Number(offHoursInput.value);

        return models.find((model) =>
            model.tipo === TIPO_CICLO_HORAS
            && Number(model.horas_trabalho) === workHours
            && Number(model.horas_folga) === offHours
        ) || null;
    }

    if (state.selectedType === TIPO_TURNO_ROTATIVO) {
        const currentTurns = normalizeTurns(state.simulatorTurns);

        return models.find((model) =>
            model.tipo === TIPO_TURNO_ROTATIVO
            && turnSequencesAreEqual(model.sequencia_turnos, currentTurns)
        ) || null;
    }

    const workDaysInput = $("#workDays");
    const offDaysInput = $("#offDays");

    if (!workDaysInput || !offDaysInput) {
        return null;
    }

    const workDays = Number(workDaysInput.value);
    const offDays = Number(offDaysInput.value);

    return models.find((model) =>
        model.tipo === TIPO_CICLO_DIAS
        && Number(model.dias_trabalho) === workDays
        && Number(model.dias_folga) === offDays
    ) || null;
}


function generateCycleHoursDailyItems(start, quantity, workHours, offHours, queryReference) {
    const items = [];

    for (let index = 0; index < quantity; index += 1) {
        const current = addDays(queryReference, index);
        const status = calculateCycleHoursStatus(start, current, workHours, offHours);

        items.push(createTimelineItem(
            formatDate(current),
            status,
            `Consulta às ${formatTime(current)}`
        ));
    }

    return items;
}

function simulateLocally(reason = "") {
    if (state.selectedType === TIPO_CICLO_HORAS) {
        const startDateTime = parseDateTimeInput($("#startDateTime").value);
        const queryDateTime = parseDateTimeInput($("#queryDateTime").value);
        const workHours = Number($("#workHours").value);
        const offHours = Number($("#offHours").value);
        const quantity = Number($("#quantityPeriods").value);

        const status = calculateCycleHoursStatus(startDateTime, queryDateTime, workHours, offHours);
        const items = generateCycleHoursDailyItems(startDateTime, quantity, workHours, offHours, queryDateTime);

        showResult(
            `Status: ${status}`,
            reason || "Resultado calculado localmente pela demo para uma escala personalizada ou sem conexão com a API.",
            items
        );

        return;
    }

    const startDate = parseDateInput($("#startDate").value);
    const queryDate = parseDateInput($("#queryDate").value);
    const quantity = Number($("#quantityDays").value);

    if (state.selectedType === TIPO_TURNO_ROTATIVO) {
        const turns = normalizeTurns(state.simulatorTurns);
        const status = calculateRotativeStatus(startDate, queryDate, turns);
        const items = generateRotativeItems(startDate, quantity, turns, queryDate);

        showResult(
            `Turno: ${status}`,
            reason || "Resultado calculado localmente pela demo para uma sequência de turnos personalizada.",
            items
        );

        return;
    }

    const workDays = Number($("#workDays").value);
    const offDays = Number($("#offDays").value);
    const status = calculateCycleDaysStatus(startDate, queryDate, workDays, offDays);
    const items = generateCycleDaysItems(startDate, quantity, workDays, offDays, queryDate);

    showResult(
        `Status: ${status}`,
        reason || "Resultado calculado localmente pela demo para uma escala personalizada ou sem conexão com a API.",
        items
    );
}



function currentSimulatorMatchesScale(scale) {
    if (!scale || !hasSimulator()) {
        return false;
    }

    if (scale.tipo !== state.selectedType) {
        return false;
    }

    if (scale.tipo === TIPO_CICLO_HORAS) {
        const workHoursInput = $("#workHours");
        const offHoursInput = $("#offHours");

        if (!workHoursInput || !offHoursInput) {
            return false;
        }

        return Number(scale.horas_trabalho) === Number(workHoursInput.value)
            && Number(scale.horas_folga) === Number(offHoursInput.value);
    }

    if (scale.tipo === TIPO_TURNO_ROTATIVO) {
        return turnSequencesAreEqual(scale.sequencia_turnos, state.simulatorTurns);
    }

    const workDaysInput = $("#workDays");
    const offDaysInput = $("#offDays");

    if (!workDaysInput || !offDaysInput) {
        return false;
    }

    return Number(scale.dias_trabalho) === Number(workDaysInput.value)
        && Number(scale.dias_folga) === Number(offDaysInput.value);
}

function getSelectedSavedScaleForApi() {
    if (!state.selectedSavedScaleName) {
        return null;
    }

    const scale = state.savedScales.find((savedScale) =>
        savedScale.nome === state.selectedSavedScaleName
    );

    if (!currentSimulatorMatchesScale(scale)) {
        return null;
    }

    return scale;
}

async function simulateSavedScaleByApi(scale) {
    if (!scale || !scale.nome) {
        throw new Error("Escala salva inválida para simulação.");
    }

    const encodedName = encodeURIComponent(scale.nome);

    if (state.selectedType === TIPO_CICLO_HORAS) {
        const startDateTime = parseDateTimeInput($("#startDateTime").value);
        const queryDateTime = parseDateTimeInput($("#queryDateTime").value);
        const quantity = Number($("#quantityPeriods").value);

        const statusPayload = {
            data_inicio: formatDate(startDateTime),
            hora_inicio: formatTime(startDateTime),
            data_consulta: formatDate(queryDateTime),
            hora_consulta: formatTime(queryDateTime)
        };

        const nextDaysPayload = {
            data_inicio: formatDate(startDateTime),
            data_consulta: formatDate(queryDateTime),
            hora_inicio: formatTime(startDateTime),
            hora_consulta: formatTime(queryDateTime),
            quantidade_dias: quantity
        };

        const statusData = await apiRequest(`/api/v1/escalas/${encodedName}/simulacao/status`, {
            method: "POST",
            body: JSON.stringify(statusPayload)
        });
        assertApiStatusMatchesCalendar(statusData.status);

        const nextDaysData = await apiRequest(`/api/v1/escalas/${encodedName}/simulacao/proximos-dias`, {
            method: "POST",
            body: JSON.stringify(nextDaysPayload)
        });

        const items = nextDaysData.dias.map((dia) => createTimelineItem(
            dia.data,
            dia.status,
            dia.hora_consulta ? `Consulta às ${dia.hora_consulta}` : ""
        ));

        showResult(
            `Status: ${statusData.status}`,
            `Status consultado na API usando a escala salva "${statusData.escala_nome}". O calendário projeta o mês no navegador pela mesma regra.`,
            items
        );

        console.info("Escala salva simulada pela API:", {
            scale,
            statusData,
            nextDaysData
        });

        return;
    }

    const startDate = parseDateInput($("#startDate").value);
    const queryDate = parseDateInput($("#queryDate").value);
    const quantity = Number($("#quantityDays").value);

    const statusPayload = {
        data_inicio: formatDate(startDate),
        data_consulta: formatDate(queryDate)
    };

    const nextDaysPayload = {
        data_inicio: formatDate(startDate),
        data_consulta: formatDate(queryDate),
        quantidade_dias: quantity
    };

    const statusData = await apiRequest(`/api/v1/escalas/${encodedName}/simulacao/status`, {
        method: "POST",
        body: JSON.stringify(statusPayload)
    });
    assertApiStatusMatchesCalendar(statusData.status);

    const nextDaysData = await apiRequest(`/api/v1/escalas/${encodedName}/simulacao/proximos-dias`, {
        method: "POST",
        body: JSON.stringify(nextDaysPayload)
    });

    const items = nextDaysData.dias.map((dia, index) => createTimelineItem(
        dia.data,
        dia.status,
        `Dia ${index + 1} do período visualizado`
    ));

    showResult(
        state.selectedType === TIPO_TURNO_ROTATIVO
            ? `Turno: ${statusData.status}`
            : `Status: ${statusData.status}`,
        `Status consultado na API usando a escala salva "${statusData.escala_nome}". O calendário projeta o mês no navegador pela mesma regra.`,
        items
    );

    console.info("Escala salva simulada pela API:", {
        scale,
        statusData,
        nextDaysData
    });
}


async function handleSimulatorSubmit(event) {
    event.preventDefault();

    const selectedModel = getSelectedModelForApi();
    const selectedSavedScale = getSelectedSavedScaleForApi();

    if (selectedSavedScale) {
        if (state.savedScaleSource !== "api") {
            simulateLocally("Escala personalizada salva neste navegador. O cálculo foi feito localmente.");
            return;
        }
        try {
            await simulateSavedScaleByApi(selectedSavedScale);
        } catch (error) {
            console.warn("Não foi possível simular a escala salva pela API. Usando cálculo local.", error);

            simulateLocally(
                `A API não conseguiu simular a escala salva "${selectedSavedScale.nome}" (${error.message}). ` +
                "Para não travar a experiência, a demo calculou o resultado localmente."
            );
        }

        return;
    }

    if (!selectedModel || !selectedModel.id) {
        simulateLocally(
            "Essa escala ainda não existe como modelo pronto da API e não há uma escala salva ativa correspondente. " +
            "Mesmo assim, a demo calculou o resultado localmente para você visualizar a escala."
        );

        return;
    }

    try {
        if (state.selectedType === TIPO_CICLO_HORAS) {
            const startDateTime = parseDateTimeInput($("#startDateTime").value);
            const queryDateTime = parseDateTimeInput($("#queryDateTime").value);
            const quantity = Number($("#quantityPeriods").value);

            const statusPayload = {
                modelo_id: selectedModel.id,
                data_inicio: formatDate(startDateTime),
                hora_inicio: formatTime(startDateTime),
                data_consulta: formatDate(queryDateTime),
                hora_consulta: formatTime(queryDateTime)
            };

            const nextDaysPayload = {
                modelo_id: selectedModel.id,
                data_inicio: formatDate(startDateTime),
                data_consulta: formatDate(queryDateTime),
                hora_inicio: formatTime(startDateTime),
                hora_consulta: formatTime(queryDateTime),
                quantidade_dias: quantity
            };

            const statusData = await apiRequest("/api/v1/simulacao/status", {
                method: "POST",
                body: JSON.stringify(statusPayload)
            });
            assertApiStatusMatchesCalendar(statusData.status);

            const nextDaysData = await apiRequest("/api/v1/simulacao/proximos-dias", {
                method: "POST",
                body: JSON.stringify(nextDaysPayload)
            });

            const items = nextDaysData.dias.map((dia) => createTimelineItem(
                dia.data,
                dia.status,
                dia.hora_consulta ? `Consulta às ${dia.hora_consulta}` : ""
            ));

            showResult(
                `Status: ${statusData.status}`,
                `Status consultado na API para ${statusData.modelo_nome}. O calendário projeta o mês no navegador pela mesma regra.`,
                items
            );

            console.info("Simulação 12x36 calculada pela API:", {
                statusData,
                nextDaysData
            });

            return;
        }

        const startDate = parseDateInput($("#startDate").value);
        const queryDate = parseDateInput($("#queryDate").value);
        const quantity = Number($("#quantityDays").value);

        const statusPayload = {
            modelo_id: selectedModel.id,
            data_inicio: formatDate(startDate),
            data_consulta: formatDate(queryDate)
        };

        const nextDaysPayload = {
            modelo_id: selectedModel.id,
            data_inicio: formatDate(startDate),
            data_consulta: formatDate(queryDate),
            quantidade_dias: quantity
        };

        const statusData = await apiRequest("/api/v1/simulacao/status", {
            method: "POST",
            body: JSON.stringify(statusPayload)
        });
        assertApiStatusMatchesCalendar(statusData.status);

        const nextDaysData = await apiRequest("/api/v1/simulacao/proximos-dias", {
            method: "POST",
            body: JSON.stringify(nextDaysPayload)
        });

        const items = nextDaysData.dias.map((dia, index) => createTimelineItem(
            dia.data,
            dia.status,
            `Dia ${index + 1} do período visualizado`
        ));

        showResult(
            state.selectedType === TIPO_TURNO_ROTATIVO
                ? `Turno: ${statusData.status}`
                : `Status: ${statusData.status}`,
            `Status consultado na API para ${statusData.modelo_nome}. O calendário projeta o mês no navegador pela mesma regra.`,
            items
        );

        console.info("Simulação calculada pela API:", {
            statusData,
            nextDaysData
        });
    } catch (error) {
        console.warn("Não foi possível simular pela API. Usando cálculo local.", error);

        simulateLocally(
            `A API local não respondeu corretamente (${error.message}). ` +
            "Para não travar a experiência, a demo calculou o resultado localmente."
        );
    }
}





function setSavedScaleFeedback(message, type = "info") {
    if (!elements.savedScaleFeedback) {
        return;
    }

    elements.savedScaleFeedback.textContent = message;
    elements.savedScaleFeedback.dataset.feedbackType = type;
}

function getSavedScaleSubmitButton(fallbackButton = null) {
    return fallbackButton
        || elements.savedScaleSubmitButton
        || elements.savedScaleForm?.querySelector('[data-save-scale-button]')
        || elements.savedScaleForm?.querySelector('button[type="submit"]')
        || elements.savedScaleForm?.querySelector('button');
}

function getScaleKey(scale) {
    return String(scale?.nome || "").trim().toLowerCase();
}

function getScaleConfigurationKey(scale) {
    const configuration = cloneScale(scale);
    delete configuration.nome;
    return JSON.stringify(configuration);
}

function upsertSavedScale(scale) {
    if (!scale || !scale.nome) {
        return;
    }

    const key = getScaleKey(scale);
    const index = state.savedScales.findIndex((savedScale) =>
        getScaleKey(savedScale) === key
    );

    if (index >= 0) {
        state.savedScales[index] = cloneScale(scale);
    } else {
        state.savedScales.push(cloneScale(scale));
    }
}

function showSavedScalesLoading(message = "Carregando escalas...") {
    if (!elements.savedScalesList) {
        return;
    }

    elements.savedScalesList.textContent = message;
}


function renderSavedScales() {
    if (!elements.savedScalesList) {
        console.warn("Elemento #savedScalesList não encontrado para renderização.");
        return;
    }

    if (elements.savedScaleSourceNotice) {
        elements.savedScaleSourceNotice.textContent = state.savedScaleSource === "api"
            ? "Origem atual: API local · persistência no arquivo JSON do projeto."
            : "Origem atual: armazenamento deste navegador · seus dados não são enviados ao servidor.";
    }
    if (elements.savedScaleSourceShort) {
        elements.savedScaleSourceShort.textContent = state.savedScaleSource === "api" ? "API local" : "Neste navegador";
    }

    if (!Array.isArray(state.savedScales) || state.savedScales.length === 0) {
        elements.savedScalesList.innerHTML = `<p class="turn-empty">Nenhuma escala salva em ${state.savedScaleSource === "api" ? "API local" : "neste navegador"}. Cadastre uma escala no formulário acima.</p>`;
        return;
    }

    elements.savedScalesList.innerHTML = state.savedScales
        .map((scale, index) => `
            <div class="saved-item">
                <div>
                    <strong>${escapeHtml(scale.nome)}</strong>
                    <small>${escapeHtml(getTypeName(scale.tipo))} · ${escapeHtml(getScaleSummary(scale))}</small>
                </div>
                <div class="saved-item-actions">
                    <button class="tiny-button" type="button" data-apply-scale="${index}">Aplicar</button>
                    <button class="tiny-button" type="button" data-delete-scale="${index}">Excluir</button>
                </div>
            </div>
        `)
        .join("");

    configureActiveNavigation();
    configureCodeCopyButtons();
    configureModelExplorer();
    configureRoadmapFilters();
    createLucideIcons();
}

async function saveScaleFromForm(button = null) {
    if (!elements.savedScaleForm) {
        return;
    }

    if (state.isSavingScale) {
        return;
    }

    const submitButton = getSavedScaleSubmitButton(button);
    const originalButtonText = submitButton ? submitButton.innerHTML : "";

    const name = elements.savedName.value.trim();
    const type = elements.savedType.value;

    if (!name) {
        setSavedScaleFeedback("Informe um nome para salvar a escala.", "error");
        elements.savedName.focus();
        return;
    }

    let scale;

    if (type === TIPO_CICLO_HORAS) {
        const workHoursInput = $("#savedWorkHours");
        const offHoursInput = $("#savedOffHours");

        if (!workHoursInput || !offHoursInput) {
            setSavedScaleFeedback("Campos de horas não encontrados. Troque o tipo e tente novamente.", "error");
            return;
        }

        scale = {
            nome: name,
            tipo: type,
            horas_trabalho: Number(workHoursInput.value),
            horas_folga: Number(offHoursInput.value)
        };
    } else if (type === TIPO_TURNO_ROTATIVO) {
        const turns = normalizeTurns(state.savedTurns);

        if (!turns.length) {
            setSavedScaleFeedback("Adicione pelo menos um turno antes de salvar.", "error");
            return;
        }

        scale = {
            nome: name,
            tipo: type,
            sequencia_turnos: turns
        };
    } else {
        const workDaysInput = $("#savedWorkDays");
        const offDaysInput = $("#savedOffDays");

        if (!workDaysInput || !offDaysInput) {
            setSavedScaleFeedback("Campos de dias não encontrados. Troque o tipo e tente novamente.", "error");
            return;
        }

        scale = {
            nome: name,
            tipo: type,
            dias_trabalho: Number(workDaysInput.value),
            dias_folga: Number(offDaysInput.value)
        };
    }

    try {
        state.isSavingScale = true;

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Salvando...";
            createLucideIcons();
        }

        console.info("Tentando salvar escala pela demo:", scale);
        let createdScale = scale;
        let destination = "armazenamento deste navegador";
        try {
            const data = await apiRequest("/api/v1/escalas", {
                method: "POST",
                body: JSON.stringify(scale)
            });
            createdScale = data.escala || scale;
            destination = "API local (JSON)";
            if (state.savedScaleSource !== "api") {
                state.savedScales = [];
            }
            state.savedScaleSource = "api";
            upsertSavedScale(createdScale);
        } catch (apiError) {
            if (!(apiError instanceof TypeError) && apiError?.name !== "AbortError") {
                throw apiError;
            }
            const localScales = loadSavedScales();
            if (localScales.some((item) => getScaleKey(item) === getScaleKey(scale))) {
                throw new Error("Já existe uma escala local com esse nome.");
            }
            if (localScales.some((item) => getScaleConfigurationKey(item) === getScaleConfigurationKey(scale))) {
                throw new Error("Já existe uma escala local com essa configuração.");
            }
            localScales.push(cloneScale(scale));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(localScales));
            state.savedScales = localScales;
            state.savedScaleSource = "local";
        }
        renderSavedScales();

        elements.savedScaleForm.reset();
        state.savedTurns = ["Manhã", "Tarde", "Noite", "Folga"];
        renderSavedDynamicFields();

        setSavedScaleFeedback(`Escala "${createdScale.nome}" salva em ${destination}.`, "success");

        showResult(
            `Escala salva em ${destination}`,
            `A escala "${createdScale.nome}" foi salva em ${destination} e já aparece na lista abaixo.`,
            state.resultItems
        );

        if (state.savedScaleSource === "api") {
            await loadSavedScalesFromApi({ preserveCurrentOnEmpty: true });
        }
    } catch (error) {
        renderSavedScales();
        setSavedScaleFeedback(`Erro ao salvar: ${error.message}`, "error");
        alert(`Não foi possível salvar a escala: ${error.message}`);
    } finally {
        state.isSavingScale = false;

        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
            createLucideIcons();
        }
    }
}

async function handleSavedScaleSubmit(event) {
    event.preventDefault();

    console.info("Submit detectado no formulário de escala salva.");

    await saveScaleFromForm(event.submitter);
}

function applySavedScale(index) {
    const scale = state.savedScales[index];

    if (!scale) {
        return;
    }

    state.selectedType = scale.tipo;
    state.selectedModelId = null;
    updateScaleButtons();
    renderDynamicFields();

    if (scale.tipo === TIPO_CICLO_HORAS) {
        $("#workHours").value = scale.horas_trabalho;
        $("#offHours").value = scale.horas_folga;
    } else if (scale.tipo === TIPO_TURNO_ROTATIVO) {
        state.simulatorTurns = normalizeTurns(scale.sequencia_turnos);
        renderDynamicFields();
    } else {
        $("#workDays").value = scale.dias_trabalho;
        $("#offDays").value = scale.dias_folga;
    }

    state.selectedSavedScaleName = scale.nome;

    showResult(
        `Escala aplicada: ${scale.nome}`,
        `${getTypeName(scale.tipo)} · ${getScaleSummary(scale)}. Clique em simular para calcular a partir da data escolhida${state.savedScaleSource === "api" ? " pela API local" : " neste navegador"}.`,
        []
    );

    const simulator = document.querySelector("#simulador");

    if (simulator) {
        simulator.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

async function deleteSavedScale(index) {
    const scale = state.savedScales[index];

    if (!scale) {
        return;
    }

    const source = state.savedScaleSource;
    const confirmed = window.confirm(`Deseja excluir a escala "${scale.nome}" de ${source === "api" ? "API local" : "deste navegador"}?`);

    if (!confirmed) {
        return;
    }

    try {
        if (source === "api") {
            await apiRequest(`/api/v1/escalas/${encodeURIComponent(scale.nome)}`, { method: "DELETE" });
            await loadSavedScalesFromApi();
        } else {
            state.savedScales.splice(index, 1);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state.savedScales));
            renderSavedScales();
        }

        showResult(
            `Escala excluída de ${source === "api" ? "API local" : "este navegador"}`,
            `A escala "${scale.nome}" foi removida.`,
            state.resultItems
        );
    } catch (error) {
        alert(`Não foi possível excluir a escala: ${error.message}`);
    }
}

async function resetSavedScales() {
    await loadSavedScalesFromApi({ preserveCurrentOnEmpty: false });
}

function updateScaleButtons() {
    $$("[data-type]").forEach((button) => {
        button.classList.toggle("active", button.dataset.type === state.selectedType);
    });
}

function handleTurnBuilderClick(event) {
    const addButton = event.target.closest("[data-turn-value]");
    const removeButton = event.target.closest("[data-turn-remove]");
    const actionButton = event.target.closest("[data-turn-action]");

    if (addButton) {
        const target = addButton.dataset.turnTarget;
        const value = addButton.dataset.turnValue;
        const list = target === "simulator" ? state.simulatorTurns : state.savedTurns;

        list.push(value);
        renderTurnPreview(target);
        return;
    }

    if (removeButton) {
        const target = removeButton.dataset.turnTarget;
        const index = Number(removeButton.dataset.turnRemove);
        const list = target === "simulator" ? state.simulatorTurns : state.savedTurns;

        list.splice(index, 1);
        renderTurnPreview(target);
        return;
    }

    if (actionButton) {
        const target = actionButton.dataset.turnTarget;
        const action = actionButton.dataset.turnAction;
        const list = target === "simulator" ? state.simulatorTurns : state.savedTurns;

        if (action === "undo") {
            list.pop();
        }

        if (action === "clear") {
            list.splice(0, list.length);
        }

        if (action === "real24") {
            list.splice(0, list.length, ...ESCALA_REAL_24_DIAS);
        }

        renderTurnPreview(target);
    }
}

function configureTabs() {
    $$("[data-result-tab]").forEach((button) => {
        button.addEventListener("click", () => {
            $$("[data-result-tab]").forEach((item) => item.classList.remove("active"));
            button.classList.add("active");

            const tab = button.dataset.resultTab;

            $$(".tab-content").forEach((panel) => panel.classList.remove("active"));

            const panel = $(`#${tab}Tab`);

            if (panel) {
                panel.classList.add("active");
            }
        });
    });

    $$("[data-doc-tab]").forEach((button) => {
        button.addEventListener("click", () => {
            $$("[data-doc-tab]").forEach((item) => item.classList.remove("active"));
            button.classList.add("active");

            $$(".doc-panel").forEach((panel) => panel.classList.remove("active"));

            const panel = $(`#doc-${button.dataset.docTab}`);

            if (panel) {
                panel.classList.add("active");
            }
        });
    });
}

function configureTheme() {
    if (!elements.themeToggle) {
        return;
    }

    const savedTheme = localStorage.getItem(THEME_KEY) || "dark";
    elements.root.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);

    elements.themeToggle.addEventListener("click", (event) => {
        const current = elements.root.getAttribute("data-theme") || "dark";
        const next = current === "dark" ? "light" : "dark";

        elements.root.setAttribute("data-theme", next);
        localStorage.setItem(THEME_KEY, next);
        updateThemeIcon(next);

        event.currentTarget.blur();
    });
}

function updateThemeIcon(theme) {
    if (!elements.themeToggle) {
        return;
    }

    const iconName = theme === "dark" ? "moon" : "sun";
    elements.themeToggle.textContent = theme === "dark" ? "☾" : "☀";
    elements.themeToggle.setAttribute("aria-label", theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro");

    configureActiveNavigation();
    configureCodeCopyButtons();
    configureModelExplorer();
    configureRoadmapFilters();
    createLucideIcons();
}

function configureRevealAnimations() {
    const items = $$(".reveal");

    if (!("IntersectionObserver" in window)) {
        items.forEach((item) => item.classList.add("visible"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px"
    });

    items.forEach((item) => observer.observe(item));
}

function configureScrollProgress() {
    if (!elements.scrollProgress) {
        return;
    }

    window.addEventListener("scroll", () => {
        if (state.scrollTicking) {
            return;
        }

        state.scrollTicking = true;

        window.requestAnimationFrame(() => {
            const total = document.documentElement.scrollHeight - window.innerHeight;
            const progress = total > 0 ? (window.scrollY / total) * 100 : 0;

            elements.scrollProgress.style.width = `${progress}%`;
            state.scrollTicking = false;
        });
    }, { passive: true });
}

function configureMobileMenu() {
    if (!elements.mobileMenuButton || !elements.navLinks) {
        return;
    }

    elements.mobileMenuButton.addEventListener("click", () => {
        const expanded = elements.navLinks.classList.toggle("open");
        document.body.classList.toggle("menu-open", expanded);
        elements.mobileMenuButton.setAttribute("aria-expanded", String(expanded));
    });

    $$(".nav-links a").forEach((link) => {
        link.addEventListener("click", () => {
            elements.navLinks.classList.remove("open");
            document.body.classList.remove("menu-open");
            elements.mobileMenuButton.setAttribute("aria-expanded", "false");
        });
    });
}

async function apiRequest(endpoint, options = {}) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 1800);
    let response;
    try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: options.method || "GET",
        cache: "no-store",
        signal: controller.signal,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },
        ...options
        });
    } finally {
        window.clearTimeout(timeout);
    }

    const responseText = await response.text();
    let data = {};

    try {
        data = responseText ? JSON.parse(responseText) : {};
    } catch (error) {
        throw new Error("A API retornou uma resposta que não é JSON válido.");
    }

    console.info(`[API] ${options.method || "GET"} ${endpoint}`, {
        status: response.status,
        ok: response.ok,
        data
    });

    if (!response.ok) {
        throw new Error(data.detail || `Erro HTTP ${response.status} ao consumir a API.`);
    }

    return data;
}


function setApiStatus(title, description, statusClass = "") {
    if (!elements.apiStatusText || !elements.apiStatusDescription || !elements.apiStatusCard) {
        return;
    }

    elements.apiStatusText.textContent = title;
    elements.apiStatusDescription.textContent = description;

    elements.apiStatusCard.classList.remove("api-online", "api-offline");

    if (statusClass) {
        elements.apiStatusCard.classList.add(statusClass);
    }
}


async function checkApiHealth() {
    if (!elements.apiStatusText) {
        return;
    }

    setApiStatus(
        "Verificando conexão...",
        `Tentando conectar em ${API_BASE_URL}/health`
    );

    try {
        const data = await apiRequest("/health");

        setApiStatus(
            "API conectada com sucesso",
            `Backend online. Versão retornada: ${data.version}.`,
            "api-online"
        );
    } catch (error) {
        setApiStatus(
            "API local não conectada",
            `A demo continua disponível com modelos prontos e escalas salvas neste navegador. Para usar a API: uvicorn api.app:app --reload.`,
            "api-offline"
        );
    }
}

async function loadModelsFromApi() {
    if (!elements.modelButtons) {
        return;
    }

    try {
        const data = await apiRequest("/api/v1/modelos");

        if (!Array.isArray(data.modelos) || data.modelos.length === 0) {
            throw new Error("A API não retornou modelos.");
        }

        state.availableModels = data.modelos.map(cloneScale);
        renderModelButtons();

        console.info("Modelos carregados da API:", state.availableModels);
    } catch (error) {
        console.warn("Não foi possível carregar modelos da API. Usando modelos locais.", error);

        state.availableModels = PREDEFINED_MODELS.map(cloneScale);
        renderModelButtons();
    }
}

async function loadSavedScalesFromApi(options = {}) {
    const { preserveCurrentOnEmpty = false } = options;

    if (!elements.savedScalesList) {
        console.warn("Elemento #savedScalesList não encontrado.");
        return;
    }

    showSavedScalesLoading();

    try {
        const data = await apiRequest(`/api/v1/escalas?_=${Date.now()}`);

        console.info("Resposta completa de escalas da API:", data);

        if (!Array.isArray(data.escalas)) {
            throw new Error("A API não retornou uma lista de escalas.");
        }

        if (preserveCurrentOnEmpty && data.escalas.length === 0 && state.savedScales.length > 0) {
            console.warn(
                "A API retornou lista vazia logo após salvar. Mantendo a escala recém-criada na interface até a próxima recarga."
            );
            renderSavedScales();
            return;
        }

        state.savedScales = data.escalas.map(cloneScale);
        state.savedScaleSource = "api";
        if (elements.resetScalesButton) elements.resetScalesButton.textContent = "Recarregar escalas da API local";
        renderSavedScales();

        console.info("Escalas salvas renderizadas:", state.savedScales);
    } catch (error) {
        console.warn("API indisponível. Mostrando escalas deste navegador.", error);
        state.savedScaleSource = "local";
        state.savedScales = loadSavedScales();
        if (elements.resetScalesButton) elements.resetScalesButton.textContent = "Atualizar origem dos dados";
        renderSavedScales();
    }
}

function configureEvents() {
    if (elements.calendarPrevious) {
        elements.calendarPrevious.addEventListener("click", () => {
            state.calendarView = window.ScaleCalendarCore.moveMonth(state.calendarView, -1);
            renderCalendar();
        });
    }
    if (elements.calendarNext) {
        elements.calendarNext.addEventListener("click", () => {
            state.calendarView = window.ScaleCalendarCore.moveMonth(state.calendarView, 1);
            renderCalendar();
        });
    }
    if (elements.calendarToday) {
        elements.calendarToday.addEventListener("click", () => {
            const today = new Date();
            state.calendarView = new Date(today.getFullYear(), today.getMonth(), 1);
            if (state.selectedType === TIPO_CICLO_HORAS) {
                const input = $("#queryDateTime");
                const time = input.value.split("T")[1] || "06:00";
                input.value = dateInputValue(today) + "T" + time;
            } else {
                $("#queryDate").value = dateInputValue(today);
            }
            elements.simulatorForm.requestSubmit();
        });
    }
    if (elements.calendarGrid) {
        elements.calendarGrid.addEventListener("click", (event) => {
            const dayButton = event.target.closest("[data-calendar-date]");
            if (!dayButton) return;
            const selected = dayButton.dataset.calendarDate;
            if (state.selectedType === TIPO_CICLO_HORAS) {
                const input = $("#queryDateTime");
                const time = input.value.split("T")[1] || "06:00";
                input.value = selected + "T" + time;
            } else {
                $("#queryDate").value = selected;
            }
            state.calendarView = new Date(Number(selected.slice(0, 4)), Number(selected.slice(5, 7)) - 1, 1);
            elements.simulatorForm.requestSubmit();
        });
    }
    if (elements.scaleTypeButtons) {
        elements.scaleTypeButtons.addEventListener("click", (event) => {
            const button = event.target.closest("[data-type]");

            if (!button) {
                return;
            }

            state.selectedSavedScaleName = null;
            state.selectedModelId = null;
            state.selectedType = button.dataset.type;
            updateScaleButtons();
            renderDynamicFields();
            state.calendarView = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            renderCalendar();
            createLucideIcons();
        });
    }

    if (elements.modelButtons) {
        elements.modelButtons.addEventListener("click", (event) => {
            const button = event.target.closest("[data-model-index]");

            if (!button) {
                return;
            }

            const models = state.availableModels.length ? state.availableModels : PREDEFINED_MODELS;
            const model = models[Number(button.dataset.modelIndex)];

            applyModelToSimulator(cloneScale(model));

            const simulator = document.querySelector("#simulador");

            if (simulator) {
                simulator.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    }

    if (elements.simulatorForm) {
        elements.simulatorForm.addEventListener("submit", handleSimulatorSubmit);
        elements.simulatorForm.addEventListener("click", handleTurnBuilderClick);
        elements.simulatorForm.addEventListener("change", (event) => {
            if (event.target.id === "queryDate" || event.target.id === "queryDateTime") {
                const query = event.target.id === "queryDateTime" ? parseDateTimeInput(event.target.value) : parseDateInput(event.target.value);
                if (!Number.isNaN(query.getTime())) {
                    state.calendarView = new Date(query.getFullYear(), query.getMonth(), 1);
                    elements.simulatorForm.requestSubmit();
                }
            }
        });
    }

    if (elements.savedScaleForm) {
        elements.savedScaleForm.addEventListener("submit", handleSavedScaleSubmit);
        elements.savedScaleForm.addEventListener("click", handleTurnBuilderClick);
    }

    if (elements.savedType) {
        elements.savedType.addEventListener("change", () => {
            renderSavedDynamicFields();
            setSavedScaleFeedback("Preencha os dados da escala e clique em Salvar escala.", "info");
        });
    }

    if (elements.savedScalesList) {
        elements.savedScalesList.addEventListener("click", (event) => {
            const applyButton = event.target.closest("[data-apply-scale]");
            const deleteButton = event.target.closest("[data-delete-scale]");

            if (applyButton) {
                applySavedScale(Number(applyButton.dataset.applyScale));
            }

            if (deleteButton) {
                deleteSavedScale(Number(deleteButton.dataset.deleteScale));
            }
        });
    }

    if (elements.resetScalesButton) {
        elements.resetScalesButton.addEventListener("click", resetSavedScales);
    }

    if (elements.apiRefreshButton) {
        elements.apiRefreshButton.addEventListener("click", checkApiHealth);
    }
}

function bootInitialSimulation() {
    if (!hasSimulator()) {
        return;
    }

    const start = parseDateInput(setDefaultDateValues());
    const items = generateCycleDaysItems(start, 14, 6, 3);

    showResult(
        "Exemplo: Trabalhando",
        "Este é um exemplo automático usando o modelo 6x3. Modelos prontos e escalas salvas agora podem ser calculados pela API.",
        items
    );
}

function createLucideIcons() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

function initSimulatorPage() {
    if (!hasSimulator()) {
        return;
    }

    state.savedScales = loadSavedScales();
    state.availableModels = PREDEFINED_MODELS.map(cloneScale);

    renderDynamicFields();
    renderModelButtons();
    renderSavedDynamicFields();
    renderSavedScales();
    bootInitialSimulation();
}



/* =========================================================
   Super interações - v0.14.0
   ========================================================= */

const MODEL_DETAILS = {
    "6x3": {
        title: "Escala 6x3",
        description: "Ciclo por dias com seis dias de trabalho e três dias de folga. É um bom modelo para demonstrar ciclos longos e viradas de mês.",
        type: "Ciclo por dias",
        config: "6 trabalho · 3 folga",
        test: "Simule 45 ou 60 dias"
    },
    "5x2": {
        title: "Escala 5x2",
        description: "Ciclo por dias com cinco dias de trabalho e dois dias de folga. É simples para explicar a lógica de ciclo e comparar com rotinas administrativas.",
        type: "Ciclo por dias",
        config: "5 trabalho · 2 folga",
        test: "Compare semanas completas"
    },
    "4x2": {
        title: "Escala 4x2",
        description: "Ciclo por dias com quatro dias de trabalho e dois dias de folga. Ajuda a testar ciclos menores e repetitivos.",
        type: "Ciclo por dias",
        config: "4 trabalho · 2 folga",
        test: "Veja a repetição mensal"
    },
    "12x36": {
        title: "Escala 12x36",
        description: "Ciclo por horas com doze horas de trabalho e trinta e seis horas de folga. Usa data e hora no cálculo.",
        type: "Ciclo por horas",
        config: "12h trabalho · 36h folga",
        test: "Teste horários diferentes"
    },
    "turno": {
        title: "Turno rotativo simples",
        description: "Sequência de turnos em que cada posição representa um dia do ciclo. Útil para demonstrar alternância entre manhã, tarde, noite e folga.",
        type: "Turno rotativo",
        config: "Manhã · Tarde · Noite · Folga",
        test: "Monte uma sequência manual"
    },
    "real24": {
        title: "Escala real 24 dias",
        description: "Modelo maior com 24 posições, útil para testar uma rotina com tarde, noite, manhã e folgas em um ciclo mais realista.",
        type: "Turno rotativo",
        config: "Sequência de 24 dias",
        test: "Simule 24 ou 48 dias"
    }
};

function configureActiveNavigation() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    $$(".nav-links a").forEach((link) => {
        const linkPage = link.getAttribute("href");
        link.classList.toggle("active", linkPage === currentPage);
    });
}

function configureCodeCopyButtons() {
    $$("pre").forEach((block) => {
        if (block.dataset.copyReady === "true") {
            return;
        }

        block.dataset.copyReady = "true";

        const button = document.createElement("button");
        button.type = "button";
        button.className = "copy-code-button";
        button.textContent = "Copiar";

        button.addEventListener("click", async () => {
            const text = block.innerText.replace("Copiar", "").trim();

            try {
                await navigator.clipboard.writeText(text);
                button.textContent = "Copiado";
                window.setTimeout(() => {
                    button.textContent = "Copiar";
                }, 1400);
            } catch (error) {
                button.textContent = "Falhou";
                window.setTimeout(() => {
                    button.textContent = "Copiar";
                }, 1400);
            }
        });

        block.prepend(button);
    });
}

function configureModelExplorer() {
    const cards = $$("[data-model-demo]");
    const title = $("#modelDetailTitle");
    const description = $("#modelDetailDescription");
    const type = $("#modelDetailType");
    const config = $("#modelDetailConfig");
    const test = $("#modelDetailTest");

    if (!cards.length || !title || !description || !type || !config || !test) {
        return;
    }

    const showModel = (key) => {
        const model = MODEL_DETAILS[key];

        if (!model) {
            return;
        }

        title.textContent = model.title;
        description.textContent = model.description;
        type.textContent = model.type;
        config.textContent = model.config;
        test.textContent = model.test;

        cards.forEach((card) => {
            card.classList.toggle("active", card.dataset.modelDemo === key);
        });

        if (window.gsap) {
            window.gsap.fromTo(
                "#modelDetailCard",
                { y: 12, opacity: 0.82 },
                { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" }
            );
        }
    };

    cards.forEach((card) => {
        card.addEventListener("click", () => showModel(card.dataset.modelDemo));
    });

    showModel("6x3");
}

function configureRoadmapFilters() {
    const buttons = $$("[data-roadmap-filter]");
    const items = $$("[data-roadmap-status]");

    if (!buttons.length || !items.length) {
        return;
    }

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            const filter = button.dataset.roadmapFilter;

            buttons.forEach((item) => item.classList.remove("active"));
            button.classList.add("active");

            items.forEach((item) => {
                const visible = filter === "all" || item.dataset.roadmapStatus === filter;
                item.classList.toggle("is-hidden", !visible);
            });
        });
    });
}

function init() {
    configureTheme();
    configureTabs();
    configureRevealAnimations();
    configureScrollProgress();
    configureMobileMenu();
    configureEvents();
    initSimulatorPage();
    checkApiHealth();
    loadModelsFromApi();
    loadSavedScalesFromApi();
    configureActiveNavigation();
    configureCodeCopyButtons();
    configureModelExplorer();
    configureRoadmapFilters();
    createLucideIcons();
}

document.addEventListener("DOMContentLoaded", init);
