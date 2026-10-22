const TIPO_CICLO_DIAS = "ciclo_dias";
const TIPO_CICLO_HORAS = "ciclo_horas";
const TIPO_TURNO_ROTATIVO = "turno_rotativo";
const API_BASE_URL = "http://127.0.0.1:8000";
const MAX_CYCLE_LENGTH = 120;
const MAX_SEQUENCE_LENGTH = 60;
const MAX_VISIBLE_DAYS = 60;

function getOperationMode() {
    const host = window.location.hostname.toLowerCase();
    const forcedBrowserOnly = new URLSearchParams(window.location.search).has("browserOnly");
    const isPublicPages = host === "github.io" || host.endsWith(".github.io");
    const isLocalStaticServer = window.location.protocol === "http:"
        && (host === "localhost" || host === "127.0.0.1" || host === "[::1]")
        && window.location.port !== "8000";

    return !forcedBrowserOnly && !isPublicPages && isLocalStaticServer
        ? "local-api-optional"
        : "browser-only";
}

function canUseLocalApi() {
    return getOperationMode() === "local-api-optional";
}

const LEGACY_STORAGE_KEY = "simulador_escala_demo_v09";
const PREVIOUS_STORAGE_KEY = "simulador_escala_demo_v013";
const STORAGE_KEY = "simulador_escala_demo_v014_local";
const ACTIVE_SELECTION_KEY = "simulador_escala_active_v1";
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
    simulatorRevision: 0,
    guide: { step: 0, flow: null, offStart: 6, active: null },
    calendarAnimating: false,
    comparison: {
        selections: { a: "model:6x3", b: "model:12x36" },
        snapshots: { a: null, b: null },
        missing: { a: false, b: false },
        month: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        selectedDate: dateInputValue(new Date()),
        lastResult: null
    },
    report: {
        mode: "single",
        selections: { a: "model:6x3", b: "model:12x36" },
        snapshots: { a: null, b: null },
        missing: { a: false, b: false },
        fieldSelection: { a: null, b: null },
        catalog: new Map(),
        result: null
    }
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
    apiRefreshButton: $("#apiRefreshButton"),
    comparisonASelect: $("#comparisonAScale"),
    comparisonBSelect: $("#comparisonBScale"),
    comparisonAFields: $("#comparisonAFields"),
    comparisonBFields: $("#comparisonBFields"),
    comparisonFeedback: $("#comparisonFeedback"),
    comparisonCalendar: $("#comparisonCalendar"),
    comparisonMonth: $("#comparisonMonth"),
    comparisonSelectedDetails: $("#comparisonSelectedDetails"),
    comparisonSummary: $("#comparisonSummary"),
    comparisonTime: $("#comparisonTime"),
    comparisonPrevious: $("#comparisonPrevious"),
    comparisonNext: $("#comparisonNext"),
    comparisonToday: $("#comparisonToday"),
    comparisonRefreshSaved: $("#comparisonRefreshSaved"),
    reportMode: $("#reportMode"),
    reportBPanel: $("#reportBPanel"),
    reportASelect: $("#reportAScale"),
    reportBSelect: $("#reportBScale"),
    reportAFields: $("#reportAFields"),
    reportBFields: $("#reportBFields"),
    reportMonth: $("#reportMonth"),
    reportTime: $("#reportTime"),
    reportTimeField: $("#reportTimeField"),
    reportAnchorMonth: $("#reportAnchorMonth"),
    reportBAnchorMonth: $("#reportBAnchorMonth"),
    reportFeedback: $("#reportFeedback"),
    reportOutput: $("#reportOutput"),
    reportPrint: $("#reportPrint"),
    reportDownloadXlsx: $("#reportDownloadXlsx"),
    reportDownloadCsv: $("#reportDownloadCsv"),
    reportRefreshSaved: $("#reportRefreshSaved")
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

function hasComparator() {
    return Boolean(elements.comparisonASelect && elements.comparisonBSelect);
}

function hasReport() {
    return Boolean(elements.reportASelect && elements.reportMode);
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

    const choices = [
        ["admin", "5x2 administrativo", "Cinco dias de trabalho e dois de folga. Segunda a sexta é apenas um exemplo."],
        ["hours", "12x36", "Informe a data e a hora reais de início. A situação pode mudar no mesmo dia."],
        ["alternative", "Alternativa ao 6x1 · 5x2", "Escolha dois dias de folga consecutivos e veja a semana antes de aplicar."]
    ];
    elements.modelButtons.innerHTML = choices.map(([flow, title, detail]) => `
        <button class="model-button ${state.guide.flow === flow ? "selected" : ""}" type="button" data-guide-flow="${flow}" aria-pressed="${state.guide.flow === flow}">
            <strong>${escapeHtml(title)}</strong><small>${escapeHtml(detail)}</small>
        </button>
    `).join("");

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

    invalidateSimulatorResult();
}

const WEEKDAYS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];

function setGuideStep(step) {
    state.guide.step = step;
    [["guideEntry", 0], ["guideModels", 1], ["guideConfig", 2], ["guideReview", 3]]
        .forEach(([id, panelStep]) => {
            const panel = $(`#${id}`);
            if (panel) panel.hidden = panelStep !== step;
        });
    const progress = $("#guideProgress");
    if (progress) progress.textContent = step === 0 ? "Comece por aqui"
        : `Etapa ${step} de 3 · ${["", "Escolher", "Informar início", "Conferir e guardar"][step]}`;
    document.body.classList.toggle("guide-simple", step === 2 && state.guide.flow !== "custom");
}

function invalidateSimulatorResult() {
    if (!hasSimulator()) return;
    state.simulatorRevision += 1;
    document.body.dataset.resultReady = "false";
    elements.resultTitle.textContent = "Informe o início do ciclo";
    elements.resultDescription.textContent = "A consulta aparecerá depois que você conferir a data real de início.";
    elements.calendarGrid.replaceChildren();
    elements.selectedPeriods.replaceChildren();
    elements.cycleSequence.replaceChildren();
    elements.timelineList.replaceChildren();
    const empty = $("#calendarEmpty");
    if (empty) empty.hidden = false;
    if (state.guide.step === 3) setGuideStep(2);
}

function renderAlternativeWeek() {
    const section = $("#alternativeDays");
    if (!section) return;
    section.hidden = state.guide.flow !== "alternative";
    if (section.hidden) return;
    const offStart = Number($("#alternativeOffStart").value);
    state.guide.offStart = offStart;
    const week = $("#alternativeWeek");
    week.replaceChildren(...WEEKDAYS.map((day, index) => {
        const cell = document.createElement("span");
        const off = index === offStart || index === (offStart + 1) % 7;
        cell.className = off ? "week-off" : "week-work";
        cell.textContent = `${day.slice(0, 3)} · ${off ? "Folga" : "Trabalho"}`;
        return cell;
    }));
    $("#alternativeAnchorHelp").textContent = `Para estas folgas, informe uma ${WEEKDAYS[(offStart + 2) % 7]} em que começaram cinco dias de trabalho. Confirme a data real.`;
}

function selectGuideFlow(flow) {
    const id = flow === "hours" ? "12x36" : "5x2";
    const model = PREDEFINED_MODELS.find((item) => item.id === id);
    if (!model || !["admin", "hours", "alternative"].includes(flow)) return;
    state.guide.flow = flow;
    applyModelToSimulator(model);
    $("#guideSelectedModel").textContent = flow === "alternative"
        ? "Alternativa ao 6x1 · 5x2" : flow === "admin" ? "5x2 administrativo" : "12x36";
    renderAlternativeWeek();
    renderModelButtons();
    setGuideStep(2);
    $(flow === "hours" ? "#startDateTime" : "#startDate")?.focus();
}

function readConfirmedSelection() {
    const raw = localStorage.getItem(ACTIVE_SELECTION_KEY);
    if (!raw) return null;
    try {
        const record = JSON.parse(raw);
        if (!record || record.version !== 1 || !record.scale ||
            ![TIPO_CICLO_DIAS, TIPO_CICLO_HORAS, TIPO_TURNO_ROTATIVO].includes(record.scale.tipo) ||
            typeof record.scale.nome !== "string" || !record.scale.nome.trim() ||
            getScaleValidationError(record.scale) || typeof record.start !== "string" ||
            !["admin", "hours", "alternative", "custom", "saved"].includes(record.flow)) return null;
        if (record.flow === "alternative" &&
            (!Number.isInteger(record.offStart) || record.offStart < 0 || record.offStart > 6)) return null;
        if (record.scale.tipo === TIPO_CICLO_HORAS && record.queryTime != null &&
            !/^([01]\d|2[0-3]):[0-5]\d$/u.test(record.queryTime)) return null;
        const start = record.scale.tipo === TIPO_CICLO_HORAS
            ? parseDateTimeInput(record.start) : parseDateInput(record.start);
        if (!Number.isFinite(start.getTime())) return null;
        return record;
    } catch { return null; }
}

function showActiveSummary() {
    const summary = $("#activeScaleSummary");
    if (!summary) return;
    const record = state.guide.active;
    summary.textContent = record
        ? `Guardada neste dispositivo: ${record.scale.nome} · início confirmado em ${record.scale.tipo === TIPO_CICLO_HORAS ? formatDateTime(parseDateTimeInput(record.start)) : formatDate(parseDateInput(record.start))}. Você pode corrigir esses dados.`
        : "Nenhuma consulta guardada ainda. Seus cadastros antigos continuam em Minhas escalas.";
}

function restoreConfirmedSelection() {
    const record = state.guide.active;
    if (!record) { setGuideStep(1); return; }
    state.guide.flow = record.flow;
    state.guide.offStart = Number.isInteger(record.offStart) ? record.offStart : 6;
    state.selectedType = record.scale.tipo;
    state.selectedModelId = record.modelId || null;
    state.selectedSavedScaleName = record.flow === "saved" ? record.scale.nome : null;
    if (record.scale.tipo === TIPO_TURNO_ROTATIVO) state.simulatorTurns = normalizeTurns(record.scale.sequencia_turnos);
    updateScaleButtons();
    renderDynamicFields();
    if (record.scale.tipo === TIPO_CICLO_HORAS) {
        $("#workHours").value = record.scale.horas_trabalho;
        $("#offHours").value = record.scale.horas_folga;
        $("#startDateTime").value = record.start;
        $("#queryDateTime").value = `${setDefaultDateValues()}T${record.queryTime || "12:00"}`;
    } else {
        $("#startDate").value = record.start;
        $("#queryDate").value = setDefaultDateValues();
        if (record.scale.tipo === TIPO_CICLO_DIAS) {
            $("#workDays").value = record.scale.dias_trabalho;
            $("#offDays").value = record.scale.dias_folga;
        }
    }
    const offSelect = $("#alternativeOffStart");
    if (offSelect) offSelect.value = String(state.guide.offStart);
    $("#guideSelectedModel").textContent = record.scale.nome;
    renderAlternativeWeek();
    renderModelButtons();
    setGuideStep(2);
    if (validateSimulatorForm()) elements.simulatorForm.requestSubmit();
}

function saveConfirmedSelection() {
    if (!validateSimulatorForm() || document.body.dataset.resultReady !== "true") return;
    const identity = getConfirmedSimulatorIdentity();
    const scale = state.selectedType === TIPO_CICLO_HORAS
        ? { nome: identity.name, tipo: state.selectedType, horas_trabalho: Number($("#workHours").value), horas_folga: Number($("#offHours").value) }
        : state.selectedType === TIPO_TURNO_ROTATIVO
            ? { nome: identity.name, tipo: state.selectedType, sequencia_turnos: [...state.simulatorTurns] }
            : { nome: identity.name, tipo: state.selectedType, dias_trabalho: Number($("#workDays").value), dias_folga: Number($("#offDays").value) };
    const record = {
        version: 1, scale, flow: identity.flow, offStart: state.guide.offStart,
        modelId: state.selectedModelId,
        start: state.selectedType === TIPO_CICLO_HORAS ? $("#startDateTime").value : $("#startDate").value,
        queryTime: state.selectedType === TIPO_CICLO_HORAS ? $("#queryDateTime").value.split("T")[1] : null
    };
    try {
        localStorage.setItem(ACTIVE_SELECTION_KEY, JSON.stringify(record));
        state.guide.active = record;
        showActiveSummary();
        $("#guideSaveFeedback").textContent = "Consulta guardada neste dispositivo. Confira o início ao voltar. O backup JSON dos cadastros não inclui esta consulta.";
    } catch (error) {
        $("#guideSaveFeedback").textContent = `Não foi possível guardar neste dispositivo: ${error.message}`;
    }
}

function parseDateInput(value) {
    if (!value) return new Date(NaN);
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
        ? date
        : new Date(NaN);
}

function parseDateTimeInput(value) {
    return value ? new Date(value) : new Date(NaN);
}

function setSimulatorFeedback(message = "", type = "error") {
    const feedback = $("#simulatorFeedback");
    if (!feedback) return;
    feedback.textContent = message;
    feedback.dataset.feedbackType = message ? type : "";
}

function getSimulatorValidationError() {
    const dateField = state.selectedType === TIPO_CICLO_HORAS ? "startDateTime" : "startDate";
    const queryField = state.selectedType === TIPO_CICLO_HORAS ? "queryDateTime" : "queryDate";
    const startValue = $(`#${dateField}`)?.value || "";
    const queryValue = $(`#${queryField}`)?.value || "";
    if (!startValue) return state.selectedType === TIPO_CICLO_HORAS
        ? "Informe a data e a hora reais em que começou esse ciclo."
        : "Informe a data real em que começou esse ciclo.";
    if (!queryValue) return "Informe a data que você quer consultar.";

    const start = state.selectedType === TIPO_CICLO_HORAS ? parseDateTimeInput(startValue) : parseDateInput(startValue);
    const query = state.selectedType === TIPO_CICLO_HORAS ? parseDateTimeInput(queryValue) : parseDateInput(queryValue);
    if (Number.isNaN(start.getTime()) || Number.isNaN(query.getTime())) {
        return state.selectedType === TIPO_CICLO_HORAS
            ? "Informe datas e horários válidos para o início e a consulta."
            : "Informe datas válidas para o início e a consulta.";
    }
    if (state.guide.flow === "alternative" && state.selectedType === TIPO_CICLO_DIAS &&
        start.getDay() !== (state.guide.offStart + 2) % 7) {
        return `Para estas folgas, escolha uma ${WEEKDAYS[(state.guide.offStart + 2) % 7]} em que começou o bloco de cinco dias de trabalho.`;
    }

    const quantityField = state.selectedType === TIPO_CICLO_HORAS ? "quantityPeriods" : "quantityDays";
    const quantityValue = $(`#${quantityField}`)?.value ?? "";
    const quantity = Number(quantityValue);
    if (quantityValue.trim() === "" || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_VISIBLE_DAYS) {
        return `A quantidade para visualizar deve ser um número inteiro entre 1 e ${MAX_VISIBLE_DAYS}.`;
    }

    if (state.selectedType === TIPO_TURNO_ROTATIVO) {
        const turns = normalizeTurns(state.simulatorTurns);
        if (!turns.length) return "Adicione pelo menos um turno à sequência antes de simular.";
        if (turns.length > MAX_SEQUENCE_LENGTH) return `A sequência pode ter no máximo ${MAX_SEQUENCE_LENGTH} turnos.`;
    } else {
        const workField = state.selectedType === TIPO_CICLO_HORAS ? "workHours" : "workDays";
        const offField = state.selectedType === TIPO_CICLO_HORAS ? "offHours" : "offDays";
        const workValue = $(`#${workField}`)?.value ?? "";
        const offValue = $(`#${offField}`)?.value ?? "";
        const work = Number(workValue);
        const off = Number(offValue);
        const unit = state.selectedType === TIPO_CICLO_HORAS ? "horas" : "dias";
        if (workValue.trim() === "" || offValue.trim() === "" || !Number.isInteger(work) || !Number.isInteger(off)) {
            return `Preencha os períodos de trabalho e folga com números inteiros de ${unit}.`;
        }
        if (work < 1 || off < 1) return "Os períodos de trabalho e folga devem ser maiores que zero.";
        if (work + off > MAX_CYCLE_LENGTH) return `O ciclo completo pode ter no máximo ${MAX_CYCLE_LENGTH} ${unit}.`;
    }

    return "";
}

function validateSimulatorForm() {
    const error = getSimulatorValidationError();
    setSimulatorFeedback(error, "error");
    return !error;
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
    const now = new Date();
    return `${setDefaultDateValues()}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
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
                    Quando começou esse ciclo? Data e hora
                    <input id="startDateTime" type="datetime-local" required>
                </label>
                <p class="field-help">No 12x36, começar às 18:00 significa trabalhar até as 06:00 do dia seguinte. Um mesmo dia pode ter trabalho e folga.</p>
                <label class="field-advanced">
                    Qual data e hora consultar?
                    <input id="queryDateTime" type="datetime-local" value="${setDefaultDateTimeValues()}" required>
                </label>
                <label class="field-advanced">
                    Horas trabalhadas
                    <input id="workHours" type="number" min="1" max="${MAX_CYCLE_LENGTH}" value="12" required>
                </label>
                <label class="field-advanced">
                    Horas de folga
                    <input id="offHours" type="number" min="1" max="${MAX_CYCLE_LENGTH}" value="36" required>
                </label>
                <label class="field-advanced">
                    Dias para visualizar
                    <input id="quantityPeriods" type="number" min="1" max="${MAX_VISIBLE_DAYS}" value="6" required>
                </label>
            </div>
        `;
        return;
    }

    if (state.selectedType === TIPO_TURNO_ROTATIVO) {
        elements.dynamicFields.innerHTML = `
            <div class="field-grid">
                <label>
                    Quando começou esse ciclo?
                    <input id="startDate" type="date" required>
                </label>
                <label class="field-advanced">
                    Qual data consultar?
                    <input id="queryDate" type="date" value="${setDefaultDateValues()}" required>
                </label>
                <label class="field-advanced">
                    Dias para visualizar
                    <input id="quantityDays" type="number" min="1" max="${MAX_VISIBLE_DAYS}" value="14" required>
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
                Quando começou esse ciclo?
                <input id="startDate" type="date" required>
            </label>
            <label class="field-advanced">
                Qual data consultar?
                <input id="queryDate" type="date" value="${setDefaultDateValues()}" required>
            </label>
            <label class="field-advanced">
                Dias trabalhados
                <input id="workDays" type="number" min="1" max="${MAX_CYCLE_LENGTH}" value="5" required>
            </label>
            <label class="field-advanced">
                Dias de folga
                <input id="offDays" type="number" min="1" max="${MAX_CYCLE_LENGTH}" value="2" required>
            </label>
            <label class="field-advanced">
                Dias para visualizar
                <input id="quantityDays" type="number" min="1" max="${MAX_VISIBLE_DAYS}" value="14" required>
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
                    <input id="savedWorkHours" type="number" min="1" max="${MAX_CYCLE_LENGTH}" value="12" required>
                </label>
                <label>
                    Horas de folga
                    <input id="savedOffHours" type="number" min="1" max="${MAX_CYCLE_LENGTH}" value="36" required>
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
                <input id="savedWorkDays" type="number" min="1" max="${MAX_CYCLE_LENGTH}" value="6" required>
            </label>
            <label>
                Dias de folga
                <input id="savedOffDays" type="number" min="1" max="${MAX_CYCLE_LENGTH}" value="3" required>
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
    const start = parseDateInput($("#startDate")?.value || "");
    const query = parseDateInput($("#queryDate")?.value || "");
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
    const validationError = getSimulatorValidationError();
    if (validationError) {
        setSimulatorFeedback(validationError, "error");
        return;
    }
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
    const validationError = getSimulatorValidationError();
    if (validationError) {
        setSimulatorFeedback(validationError, "error");
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

    if (/^(Status|Turno):/u.test(title)) {
        document.body.dataset.resultReady = "true";
        const empty = $("#calendarEmpty");
        if (empty) empty.hidden = true;
        renderGuideReview();
        setGuideStep(3);
    }

    renderTimeline(items);
    renderCalendar();
    renderCycleSequence();
    animateSimulationUpdate();
}

function renderGuideReview() {
    const summary = $("#guideResultSummary");
    if (!summary) return;
    const spec = getSimulatorSpec();
    const status = statusForDate(spec, spec.query);
    const next = window.ScaleCalendarCore.nextChange(spec, spec.query);
    const position = spec.type === TIPO_CICLO_HORAS
        ? `Fase ${window.ScaleCalendarCore.cycleHoursPosition(spec.start, spec.query, spec.work, spec.off) < spec.work ? "de trabalho" : "de folga"}`
        : spec.type === TIPO_TURNO_ROTATIVO
            ? `Posição ${window.ScaleCalendarCore.rotativePosition(spec.start, spec.query, spec.turns.length) + 1} de ${spec.turns.length}`
            : `Dia ${window.ScaleCalendarCore.cycleDaysPosition(spec.start, spec.query, spec.work, spec.off) + 1} de ${spec.work + spec.off}`;
    const name = getConfirmedSimulatorIdentity().name;
    const start = spec.type === TIPO_CICLO_HORAS ? formatDateTime(spec.start) : formatDate(spec.start);
    const query = spec.type === TIPO_CICLO_HORAS ? formatDateTime(spec.query) : formatDate(spec.query);
    const today = dateInputValue(spec.query) === dateInputValue(new Date()) ? "Hoje, " : "";
    summary.textContent = `${name} · início confirmado: ${start}. ${today}${query}: ${status}. ${position}. ${next ? `Próxima mudança: ${spec.type === TIPO_CICLO_HORAS ? formatDateTime(next) : formatDate(next)}.` : "Sem mudança na sequência."} Confira os próximos dias e o calendário antes de guardar.`;
    const feedback = $("#guideSaveFeedback");
    if (feedback) feedback.textContent = "";
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
    if (!validateSimulatorForm()) {
        return;
    }

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

function getConfirmedSimulatorIdentity() {
    const saved = getSelectedSavedScaleForApi();
    if (saved) return { flow: "saved", name: saved.nome };
    const active = state.guide.active;
    if (state.guide.flow === "saved" && active?.flow === "saved" &&
        state.selectedSavedScaleName === active.scale.nome && currentSimulatorMatchesScale(active.scale)) {
        return { flow: "saved", name: active.scale.nome };
    }
    const model = getSelectedModelForApi();
    if (model?.id === "5x2" && state.guide.flow === "alternative") {
        return { flow: "alternative", name: "Alternativa 5x2" };
    }
    if (model?.id === "5x2" && state.guide.flow === "admin") {
        return { flow: "admin", name: "5x2 administrativo" };
    }
    if (model?.id === "12x36" && state.guide.flow === "hours") {
        return { flow: "hours", name: "12x36" };
    }
    return { flow: "custom", name: state.selectedType === TIPO_TURNO_ROTATIVO
        ? "Minha sequência" : "Minha escala personalizada" };
}

async function simulateSavedScaleByApi(scale, revision) {
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
        if (state.simulatorRevision !== revision) return;
        assertApiStatusMatchesCalendar(statusData.status);

        const nextDaysData = await apiRequest(`/api/v1/escalas/${encodedName}/simulacao/proximos-dias`, {
            method: "POST",
            body: JSON.stringify(nextDaysPayload)
        });
        if (state.simulatorRevision !== revision) return;

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
    if (state.simulatorRevision !== revision) return;
    assertApiStatusMatchesCalendar(statusData.status);

    const nextDaysData = await apiRequest(`/api/v1/escalas/${encodedName}/simulacao/proximos-dias`, {
        method: "POST",
        body: JSON.stringify(nextDaysPayload)
    });
    if (state.simulatorRevision !== revision) return;

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

    if (!validateSimulatorForm()) {
        return;
    }
    const revision = ++state.simulatorRevision;

    if (!canUseLocalApi()) {
        simulateLocally("Simulação feita neste navegador; a origem pública não usa a API local.");
        return;
    }

    const selectedModel = getSelectedModelForApi();
    const selectedSavedScale = getSelectedSavedScaleForApi();

    if (selectedSavedScale) {
        if (state.savedScaleSource !== "api") {
            simulateLocally("Escala personalizada salva neste navegador. O cálculo foi feito localmente.");
            return;
        }
        try {
            await simulateSavedScaleByApi(selectedSavedScale, revision);
        } catch (error) {
            if (state.simulatorRevision !== revision) return;
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
            if (state.simulatorRevision !== revision) return;
            assertApiStatusMatchesCalendar(statusData.status);

            const nextDaysData = await apiRequest("/api/v1/simulacao/proximos-dias", {
                method: "POST",
                body: JSON.stringify(nextDaysPayload)
            });
            if (state.simulatorRevision !== revision) return;

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
        if (state.simulatorRevision !== revision) return;
        assertApiStatusMatchesCalendar(statusData.status);

        const nextDaysData = await apiRequest("/api/v1/simulacao/proximos-dias", {
            method: "POST",
            body: JSON.stringify(nextDaysPayload)
        });
        if (state.simulatorRevision !== revision) return;

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
        if (state.simulatorRevision !== revision) return;
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

function getScaleValidationError(scale) {
    if (scale.tipo === TIPO_TURNO_ROTATIVO) {
        const turns = normalizeTurns(scale.sequencia_turnos);
        if (!turns.length) return "Adicione pelo menos um turno antes de salvar.";
        if (turns.length > MAX_SEQUENCE_LENGTH) return `A sequência pode ter no máximo ${MAX_SEQUENCE_LENGTH} turnos.`;
        return "";
    }

    const work = Number(scale.tipo === TIPO_CICLO_HORAS ? scale.horas_trabalho : scale.dias_trabalho);
    const off = Number(scale.tipo === TIPO_CICLO_HORAS ? scale.horas_folga : scale.dias_folga);
    const unit = scale.tipo === TIPO_CICLO_HORAS ? "horas" : "dias";
    if (!Number.isInteger(work) || !Number.isInteger(off) || work < 1 || off < 1) {
        return `Os períodos de trabalho e folga devem ser inteiros positivos em ${unit}.`;
    }
    if (work + off > MAX_CYCLE_LENGTH) return `O ciclo completo pode ter no máximo ${MAX_CYCLE_LENGTH} ${unit}.`;
    return "";
}

function saveScaleInBrowser(scale) {
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

    const validationError = getScaleValidationError(scale);
    if (validationError) {
        setSavedScaleFeedback(validationError, "error");
        return;
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
        if (canUseLocalApi()) {
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
        } else {
            saveScaleInBrowser(scale);
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
    state.guide.flow = "saved";
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

    $("#guideSelectedModel").textContent = scale.nome;
    renderAlternativeWeek();
    setGuideStep(2);
    invalidateSimulatorResult();
    setSimulatorFeedback("Informe quando começou esta escala para consultar. O cadastro não contém essa data.", "info");

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

        if (list.length >= MAX_SEQUENCE_LENGTH) {
            const message = `A sequência pode ter no máximo ${MAX_SEQUENCE_LENGTH} turnos.`;
            if (target === "simulator") setSimulatorFeedback(message, "error");
            else setSavedScaleFeedback(message, "error");
            return;
        }

        list.push(value);
        renderTurnPreview(target);
        if (target === "simulator") validateSimulatorForm();
        return;
    }

    if (removeButton) {
        const target = removeButton.dataset.turnTarget;
        const index = Number(removeButton.dataset.turnRemove);
        const list = target === "simulator" ? state.simulatorTurns : state.savedTurns;

        list.splice(index, 1);
        renderTurnPreview(target);
        if (target === "simulator") validateSimulatorForm();
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
        if (target === "simulator") validateSimulatorForm();
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
    if (!canUseLocalApi()) {
        throw new Error("A origem desta demo permite apenas armazenamento no navegador.");
    }
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

    if (!canUseLocalApi()) {
        setApiStatus(
            "Modo público: somente navegador",
            "Modelos e escalas ficam neste navegador. A API local não é consultada nesta origem."
        );
        if (elements.apiRefreshButton) elements.apiRefreshButton.hidden = true;
        return;
    }
    if (elements.apiRefreshButton) elements.apiRefreshButton.hidden = false;

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
    if (!elements.modelButtons && !hasComparator() && !hasReport()) {
        return;
    }

    if (!canUseLocalApi()) {
        state.availableModels = PREDEFINED_MODELS.map(cloneScale);
        renderModelButtons();
        refreshComparisonOptions();
        refreshReportOptions();
        return;
    }

    try {
        const data = await apiRequest("/api/v1/modelos");

        if (!Array.isArray(data.modelos) || data.modelos.length === 0) {
            throw new Error("A API não retornou modelos.");
        }

        state.availableModels = data.modelos.map(cloneScale);
        renderModelButtons();
        refreshComparisonOptions();
        refreshReportOptions();

        console.info("Modelos carregados da API:", state.availableModels);
    } catch (error) {
        console.warn("Não foi possível carregar modelos da API. Usando modelos locais.", error);

        state.availableModels = PREDEFINED_MODELS.map(cloneScale);
        renderModelButtons();
        refreshComparisonOptions();
        refreshReportOptions();
    }
}

async function loadSavedScalesFromApi(options = {}) {
    const { preserveCurrentOnEmpty = false } = options;

    if (!elements.savedScalesList && !hasComparator() && !hasReport()) {
        console.warn("Elemento #savedScalesList não encontrado.");
        return;
    }

    if (!canUseLocalApi()) {
        state.savedScaleSource = "local";
        state.savedScales = loadSavedScales();
        if (elements.resetScalesButton) elements.resetScalesButton.textContent = "Atualizar lista deste navegador";
        if (elements.savedScalesList) renderSavedScales();
        refreshComparisonOptions();
        refreshReportOptions();
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
            if (elements.savedScalesList) renderSavedScales();
            refreshComparisonOptions();
            refreshReportOptions();
            return;
        }

        state.savedScales = data.escalas.map(cloneScale);
        state.savedScaleSource = "api";
        if (elements.resetScalesButton) elements.resetScalesButton.textContent = "Recarregar escalas da API local";
        if (elements.savedScalesList) renderSavedScales();
        refreshComparisonOptions();
        refreshReportOptions();

        console.info("Escalas salvas renderizadas:", state.savedScales);
    } catch (error) {
        console.warn("API indisponível. Mostrando escalas deste navegador.", error);
        state.savedScaleSource = "local";
        state.savedScales = loadSavedScales();
        if (elements.resetScalesButton) elements.resetScalesButton.textContent = "Atualizar origem dos dados";
        if (elements.savedScalesList) renderSavedScales();
        refreshComparisonOptions();
        refreshReportOptions();
    }
}

function getComparisonCatalog() {
    const catalog = new Map();
    const models = state.availableModels.length ? state.availableModels : PREDEFINED_MODELS;
    models.forEach((scale, index) => {
        const id = String(scale.id || `modelo-${index + 1}`);
        catalog.set(`model:${id}`, { ...cloneScale(scale), id, source: "model" });
    });
    state.savedScales.forEach((scale) => {
        const source = state.savedScaleSource === "api" ? "api" : "local";
        const key = `saved:${source}:${encodeURIComponent(String(scale.nome || ""))}`;
        catalog.set(key, { ...cloneScale(scale), source });
    });
    return catalog;
}

function addComparisonOption(group, key, scale, source) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = `${scale.nome} · ${getTypeName(scale.tipo)} · ${getScaleSummary(scale)}`;
    option.dataset.source = source;
    group.append(option);
}

function refreshComparisonOptions() {
    if (!hasComparator()) return;
    const catalog = getComparisonCatalog();
    state.comparison.catalog = catalog;

    ["a", "b"].forEach((side) => {
        const select = side === "a" ? elements.comparisonASelect : elements.comparisonBSelect;
        const selected = select.value || state.comparison.selections[side];
        const modelGroup = document.createElement("optgroup");
        modelGroup.label = "Modelos prontos";
        const savedGroup = document.createElement("optgroup");
        savedGroup.label = state.savedScaleSource === "api" ? "Escalas salvas na API local" : "Escalas salvas neste navegador";

        catalog.forEach((scale, key) => {
            if (scale.source === "model") addComparisonOption(modelGroup, key, scale, "model");
            else addComparisonOption(savedGroup, key, scale, scale.source);
        });

        const fragment = document.createDocumentFragment();
        fragment.append(modelGroup, savedGroup);
        const exists = catalog.has(selected);
        if (selected && !exists && state.comparison.snapshots[side]) {
            const missingGroup = document.createElement("optgroup");
            missingGroup.label = "Indisponível";
            const missingOption = document.createElement("option");
            missingOption.value = selected;
            missingOption.textContent = `Escala removida: ${state.comparison.snapshots[side].nome}`;
            missingGroup.append(missingOption);
            fragment.append(missingGroup);
            state.comparison.missing[side] = true;
            select.replaceChildren(fragment);
            select.value = selected;
            return;
        }

        select.replaceChildren(fragment);
        let nextSelection = exists ? selected : (side === "a" ? "model:6x3" : "model:12x36");
        if (!catalog.has(nextSelection)) nextSelection = catalog.keys().next().value || "";
        select.value = nextSelection;
        state.comparison.selections[side] = nextSelection;
        state.comparison.missing[side] = false;

        const scale = catalog.get(nextSelection);
        if (scale) {
            state.comparison.snapshots[side] = cloneScale(scale);
            if (state.comparison.fieldSelection[side] !== nextSelection) {
                renderComparisonFields(side, scale);
                state.comparison.fieldSelection[side] = nextSelection;
            }
        }
    });
    updateComparison();
}

function appendComparisonInput(container, side, key, labelText, value, attributes = {}) {
    const label = document.createElement("label");
    label.className = "comparison-field";
    label.htmlFor = `comparison-${side}-${key}`;
    label.textContent = labelText;
    const input = document.createElement("input");
    input.id = label.htmlFor;
    input.name = label.htmlFor;
    Object.entries(attributes).forEach(([name, attributeValue]) => input.setAttribute(name, attributeValue));
    input.value = value;
    label.append(input);
    container.append(label);
}

function renderComparisonFields(side, scale) {
    const container = side === "a" ? elements.comparisonAFields : elements.comparisonBFields;
    if (!container) return;
    container.replaceChildren();
    const now = new Date();
    const defaultDate = dateInputValue(now);

    if (scale.tipo === TIPO_CICLO_HORAS) {
        const anchor = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0);
        appendComparisonInput(container, side, "anchor", "Início do ciclo · data e hora", scale.data_inicio || `${dateInputValue(anchor)}T06:00`, { type: "datetime-local", required: "required" });
        appendComparisonInput(container, side, "work", "Horas de trabalho", scale.horas_trabalho, { type: "number", min: "1", max: String(MAX_CYCLE_LENGTH - 1), step: "1", required: "required" });
        appendComparisonInput(container, side, "off", "Horas de folga", scale.horas_folga, { type: "number", min: "1", max: String(MAX_CYCLE_LENGTH - 1), step: "1", required: "required" });
    } else {
        appendComparisonInput(container, side, "anchor", "Início do ciclo · data", scale.data_inicio || defaultDate, { type: "date", required: "required" });
        if (scale.tipo === TIPO_TURNO_ROTATIVO) {
            appendComparisonInput(container, side, "turns", "Sequência diária · separada por vírgulas", normalizeTurns(scale.sequencia_turnos).join(", "), { type: "text", maxlength: String(MAX_SEQUENCE_LENGTH * 12), required: "required", placeholder: "Manhã, Tarde, Noite, Folga" });
        } else {
            appendComparisonInput(container, side, "work", "Dias de trabalho", scale.dias_trabalho, { type: "number", min: "1", max: String(MAX_CYCLE_LENGTH - 1), step: "1", required: "required" });
            appendComparisonInput(container, side, "off", "Dias de folga", scale.dias_folga, { type: "number", min: "1", max: String(MAX_CYCLE_LENGTH - 1), step: "1", required: "required" });
        }
    }

    const note = document.createElement("p");
    note.className = "comparison-edit-note";
    note.textContent = "Você pode ajustar estes parâmetros só para comparar; a escala original não será alterada nem salva.";
    container.append(note);
}

function readComparisonSpec(side) {
    const scale = state.comparison.snapshots[side];
    if (!scale || state.comparison.missing[side]) {
        throw new Error(`Escolha uma escala ${side.toUpperCase()} disponível; a seleção atual foi removida da origem.`);
    }
    const anchorValue = $(`#comparison-${side}-anchor`)?.value || "";
    const start = scale.tipo === TIPO_CICLO_HORAS ? parseDateTimeInput(anchorValue) : parseDateInput(anchorValue);
    if (!anchorValue || Number.isNaN(start.getTime())) throw new Error(`Informe um início válido para a Escala ${side.toUpperCase()}.`);

    if (scale.tipo === TIPO_TURNO_ROTATIVO) {
        const turns = normalizeTurns($(`#comparison-${side}-turns`)?.value || "");
        return { name: scale.nome, type: scale.tipo, source: scale.source, start, turns };
    }
    const work = Number($(`#comparison-${side}-work`)?.value ?? "");
    const off = Number($(`#comparison-${side}-off`)?.value ?? "");
    return { name: scale.nome, type: scale.tipo, source: scale.source, start, work, off };
}

function comparisonIsoDate(date) {
    return dateInputValue(date);
}

function comparisonStatusLabel(status) {
    return status === "Trabalhando" ? "Trabalho" : status;
}

function appendComparisonStatus(parent, side, status) {
    const line = document.createElement("span");
    line.className = `compare-status ${getTurnClass(status)}`;
    const tag = document.createElement("b");
    tag.textContent = side.toUpperCase();
    const label = document.createElement("span");
    label.textContent = comparisonStatusLabel(status);
    line.append(tag, label);
    parent.append(line);
}

function renderComparisonCalendar(result) {
    const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const month = new Date(result.year, result.month, 1);
    elements.comparisonMonth.textContent = formatMonth(month);
    const cells = window.ScaleCalendarCore.monthCells(month);
    const byDate = new Map(result.days.map((day) => [comparisonIsoDate(day.date), day]));
    const selected = state.comparison.selectedDate;
    const fragment = document.createDocumentFragment();
    weekdays.forEach((weekday) => {
        const label = document.createElement("div");
        label.className = "compare-weekday";
        label.setAttribute("role", "columnheader");
        label.textContent = weekday;
        fragment.append(label);
    });
    cells.forEach((date) => {
        if (!date) {
            const empty = document.createElement("div");
            empty.className = "compare-empty";
            empty.setAttribute("aria-hidden", "true");
            fragment.append(empty);
            return;
        }
        const key = comparisonIsoDate(date);
        const day = byDate.get(key);
        const button = document.createElement("button");
        button.type = "button";
        button.className = `compare-day${key === selected ? " is-selected" : ""}`;
        button.dataset.compareDate = key;
        button.setAttribute("role", "gridcell");
        button.setAttribute("aria-pressed", String(key === selected));
        button.setAttribute("aria-label", `${formatDate(date)}. Escala A: ${day.statusA}. Escala B: ${day.statusB}.`);
        const dateLabel = document.createElement("strong");
        dateLabel.className = "compare-date-number";
        dateLabel.textContent = String(date.getDate());
        button.append(dateLabel);
        appendComparisonStatus(button, "a", day.statusA);
        appendComparisonStatus(button, "b", day.statusB);
        fragment.append(button);
    });
    elements.comparisonCalendar.replaceChildren(fragment);
}

function sourceLabel(source) {
    if (source === "api") return "API local";
    if (source === "local") return "Neste navegador";
    return "Modelo pronto";
}

function renderComparisonDetail(result, specA, specB) {
    const date = parseDateInput(state.comparison.selectedDate);
    const selected = result.days.find((day) => comparisonIsoDate(day.date) === state.comparison.selectedDate);
    if (!selected) throw new Error("A data selecionada não pertence ao mês exibido.");

    const panel = document.createElement("div");
    panel.className = "compare-detail-layout";
    [
        { side: "a", spec: specA, status: selected.statusA, intervals: selected.intervalsA },
        { side: "b", spec: specB, status: selected.statusB, intervals: selected.intervalsB }
    ].forEach(({ side, spec, status, intervals }) => {
        const card = document.createElement("article");
        card.className = "compare-detail-card";
        const heading = document.createElement("h3");
        heading.textContent = `Escala ${side.toUpperCase()} · ${spec.name}`;
        const origin = document.createElement("p");
        origin.className = "compare-detail-origin";
        origin.textContent = sourceLabel(spec.source);
        const statusLine = document.createElement("p");
        statusLine.className = "compare-detail-at-time";
        statusLine.textContent = `Às ${elements.comparisonTime.value}: ${comparisonStatusLabel(status)}`;
        card.append(heading, origin, statusLine);

        if (intervals) {
            const intervalTitle = document.createElement("strong");
            intervalTitle.className = "compare-interval-heading";
            intervalTitle.textContent = "Intervalos reais neste dia";
            const list = document.createElement("ul");
            list.className = "compare-interval-list";
            intervals.forEach((interval) => {
                const item = document.createElement("li");
                item.className = getTurnClass(interval.status);
                item.textContent = `${formatMinute(interval.startMinute)}–${formatMinute(interval.endMinute)} · ${interval.status}`;
                list.append(item);
            });
            card.append(intervalTitle, list);
        } else {
            const note = document.createElement("p");
            note.className = "compare-detail-note";
            note.textContent = spec.type === TIPO_TURNO_ROTATIVO
                ? "O turno rotativo representa a posição deste dia na sequência."
                : "O ciclo por dias atribui este status à data consultada.";
            card.append(note);
        }
        panel.append(card);
    });
    elements.comparisonSelectedDetails.replaceChildren(panel);
    const heading = document.createElement("h2");
    heading.id = "comparisonSelectedHeading";
    heading.textContent = `Detalhes de ${formatDate(date)} · ${elements.comparisonTime.value}`;
    elements.comparisonSelectedDetails.prepend(heading);
}

function renderComparisonSummary(summary) {
    const values = [
        ["aWorking", "Datas com A em trabalho"],
        ["bWorking", "Datas com B em trabalho"],
        ["bothOff", "Datas com ambas em folga"]
    ];
    const fragment = document.createDocumentFragment();
    values.forEach(([key, label]) => {
        const item = document.createElement("div");
        item.className = "compare-summary-item";
        const count = document.createElement("strong");
        count.textContent = String(summary[key]);
        const text = document.createElement("span");
        text.textContent = label;
        item.append(count, text);
        fragment.append(item);
    });
    elements.comparisonSummary.replaceChildren(fragment);
}

function updateComparison() {
    if (!hasComparator()) return false;
    try {
        const specA = readComparisonSpec("a");
        const specB = readComparisonSpec("b");
        const time = elements.comparisonTime.value;
        if (!time) throw new Error("Escolha o horário usado na comparação.");
        const selected = parseDateInput(state.comparison.selectedDate);
        const result = window.ScaleCalendarCore.compareMonth(specA, specB, state.comparison.month, time);
        if (!result.days.some((day) => comparisonIsoDate(day.date) === state.comparison.selectedDate)) {
            state.comparison.selectedDate = comparisonIsoDate(new Date(result.year, result.month, 1));
        }
        renderComparisonCalendar(result);
        renderComparisonDetail(result, specA, specB);
        renderComparisonSummary(result.summary);
        state.comparison.lastResult = result;
        elements.comparisonFeedback.textContent = "Comparação atualizada. Os dois calendários usam o mesmo mês, dia selecionado e horário de consulta.";
        elements.comparisonFeedback.dataset.feedbackType = "success";
        return true;
    } catch (error) {
        elements.comparisonFeedback.textContent = `${error.message} O último resultado válido continua exibido.`;
        elements.comparisonFeedback.dataset.feedbackType = "error";
        return false;
    }
}

function selectComparisonScale(side, key) {
    const scale = state.comparison.catalog.get(key);
    if (!scale) return;
    state.comparison.selections[side] = key;
    state.comparison.snapshots[side] = cloneScale(scale);
    state.comparison.missing[side] = false;
    state.comparison.fieldSelection[side] = key;
    renderComparisonFields(side, scale);
    updateComparison();
}

function initComparisonPage() {
    if (!hasComparator()) return;
    state.comparison.catalog = new Map();
    state.comparison.fieldSelection = { a: null, b: null };
    const today = new Date();
    state.comparison.month = new Date(today.getFullYear(), today.getMonth(), 1);
    state.comparison.selectedDate = dateInputValue(today);
    elements.comparisonTime.value = "06:00";
    state.savedScales = loadSavedScales();
    state.availableModels = PREDEFINED_MODELS.map(cloneScale);
    refreshComparisonOptions();

    [
        [elements.comparisonASelect, "a"],
        [elements.comparisonBSelect, "b"]
    ].forEach(([select, side]) => select.addEventListener("change", () => selectComparisonScale(side, select.value)));
    [elements.comparisonAFields, elements.comparisonBFields].forEach((fields) => {
        fields.addEventListener("input", updateComparison);
        fields.addEventListener("change", updateComparison);
    });
    elements.comparisonTime.addEventListener("input", updateComparison);
    elements.comparisonTime.addEventListener("change", updateComparison);
    elements.comparisonPrevious.addEventListener("click", () => {
        state.comparison.month = window.ScaleCalendarCore.moveMonth(state.comparison.month, -1);
        state.comparison.selectedDate = dateInputValue(state.comparison.month);
        updateComparison();
    });
    elements.comparisonNext.addEventListener("click", () => {
        state.comparison.month = window.ScaleCalendarCore.moveMonth(state.comparison.month, 1);
        state.comparison.selectedDate = dateInputValue(state.comparison.month);
        updateComparison();
    });
    elements.comparisonToday.addEventListener("click", () => {
        const current = new Date();
        state.comparison.month = new Date(current.getFullYear(), current.getMonth(), 1);
        state.comparison.selectedDate = dateInputValue(current);
        updateComparison();
    });
    elements.comparisonCalendar.addEventListener("click", (event) => {
        const day = event.target.closest("[data-compare-date]");
        if (!day) return;
        state.comparison.selectedDate = day.dataset.compareDate;
        updateComparison();
    });
    elements.comparisonRefreshSaved.addEventListener("click", async () => {
        elements.comparisonRefreshSaved.disabled = true;
        elements.comparisonFeedback.textContent = canUseLocalApi()
            ? "Atualizando modelos e escalas salvas da origem local..."
            : "Atualizando modelos e escalas salvas deste navegador...";
        await Promise.all([loadModelsFromApi(), loadSavedScalesFromApi()]);
        elements.comparisonRefreshSaved.disabled = false;
    });
}

function addReportOption(group, key, scale) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = `${scale.nome} · ${getTypeName(scale.tipo)} · ${getScaleSummary(scale)}`;
    group.append(option);
}

function refreshReportOptions() {
    if (!hasReport()) return;
    const catalog = getComparisonCatalog();
    state.report.catalog = catalog;

    ["a", "b"].forEach((side) => {
        const select = side === "a" ? elements.reportASelect : elements.reportBSelect;
        const selected = select.value || state.report.selections[side];
        const models = document.createElement("optgroup");
        models.label = "Modelos prontos";
        const saved = document.createElement("optgroup");
        saved.label = state.savedScaleSource === "api" ? "Escalas salvas na API local" : "Escalas salvas neste navegador";
        catalog.forEach((scale, key) => {
            addReportOption(scale.source === "model" ? models : saved, key, scale);
        });

        const options = document.createDocumentFragment();
        options.append(models, saved);
        const exists = catalog.has(selected);
        if (selected && !exists && state.report.snapshots[side]) {
            const unavailable = document.createElement("optgroup");
            unavailable.label = "Indisponível";
            const option = document.createElement("option");
            option.value = selected;
            option.textContent = `Escala removida: ${state.report.snapshots[side].nome}`;
            unavailable.append(option);
            options.append(unavailable);
            state.report.missing[side] = true;
            select.replaceChildren(options);
            select.value = selected;
            return;
        }

        select.replaceChildren(options);
        let next = exists ? selected : (side === "a" ? "model:6x3" : "model:12x36");
        if (!catalog.has(next)) next = catalog.keys().next().value || "";
        select.value = next;
        state.report.selections[side] = next;
        state.report.missing[side] = false;
        const scale = catalog.get(next);
        if (scale) {
            state.report.snapshots[side] = cloneScale(scale);
            if (state.report.fieldSelection[side] !== next) {
                renderReportFields(side, scale);
                state.report.fieldSelection[side] = next;
            }
        }
    });
    updateReport();
}

function appendReportInput(container, side, key, labelText, value, attributes = {}) {
    const label = document.createElement("label");
    label.className = "comparison-field";
    label.htmlFor = `report-${side}-${key}`;
    label.textContent = labelText;
    const input = document.createElement("input");
    input.id = label.htmlFor;
    input.name = label.htmlFor;
    Object.entries(attributes).forEach(([name, attributeValue]) => input.setAttribute(name, attributeValue));
    input.value = value;
    label.append(input);
    container.append(label);
}

function renderReportFields(side, scale) {
    const container = side === "a" ? elements.reportAFields : elements.reportBFields;
    container.replaceChildren();
    const today = new Date();
    if (scale.tipo === TIPO_CICLO_HORAS) {
        const anchor = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 6, 0);
        appendReportInput(container, side, "anchor", "Início do ciclo · data e hora", scale.data_inicio || `${dateInputValue(anchor)}T06:00`, { type: "datetime-local", required: "required" });
        appendReportInput(container, side, "work", "Horas de trabalho", scale.horas_trabalho, { type: "number", min: "1", max: String(MAX_CYCLE_LENGTH - 1), step: "1", required: "required" });
        appendReportInput(container, side, "off", "Horas de folga", scale.horas_folga, { type: "number", min: "1", max: String(MAX_CYCLE_LENGTH - 1), step: "1", required: "required" });
    } else {
        appendReportInput(container, side, "anchor", "Início do ciclo · data", scale.data_inicio || dateInputValue(today), { type: "date", required: "required" });
        if (scale.tipo === TIPO_TURNO_ROTATIVO) {
            appendReportInput(container, side, "turns", "Sequência diária · separada por vírgulas", normalizeTurns(scale.sequencia_turnos).join(", "), { type: "text", maxlength: String(MAX_SEQUENCE_LENGTH * 12), required: "required", placeholder: "Manhã, Tarde, Noite, Folga" });
        } else {
            appendReportInput(container, side, "work", "Dias de trabalho", scale.dias_trabalho, { type: "number", min: "1", max: String(MAX_CYCLE_LENGTH - 1), step: "1", required: "required" });
            appendReportInput(container, side, "off", "Dias de folga", scale.dias_folga, { type: "number", min: "1", max: String(MAX_CYCLE_LENGTH - 1), step: "1", required: "required" });
        }
    }
    const note = document.createElement("p");
    note.className = "comparison-edit-note";
    note.textContent = "Ajustes usados somente neste relatório; não alteram nem salvam a escala original.";
    container.append(note);
}

function readReportScale(side) {
    const scale = state.report.snapshots[side];
    if (!scale || state.report.missing[side]) {
        throw new Error(`Escolha uma Escala ${side.toUpperCase()} disponível. A escala selecionada não está mais na origem.`);
    }
    const anchorValue = $(`#report-${side}-anchor`)?.value || "";
    const start = scale.tipo === TIPO_CICLO_HORAS ? parseDateTimeInput(anchorValue) : parseDateInput(anchorValue);
    if (!anchorValue || !Number.isFinite(start.getTime())) throw new Error(`Informe uma data inicial válida para a Escala ${side.toUpperCase()}.`);

    let work;
    let off;
    let turns;
    if (scale.tipo === TIPO_TURNO_ROTATIVO) {
        turns = normalizeTurns($(`#report-${side}-turns`)?.value || "");
    } else {
        work = Number($(`#report-${side}-work`)?.value ?? "");
        off = Number($(`#report-${side}-off`)?.value ?? "");
    }
    const parameters = scale.tipo === TIPO_CICLO_HORAS
        ? `${work} horas de trabalho / ${off} horas de folga`
        : scale.tipo === TIPO_TURNO_ROTATIVO
            ? `Sequência: ${turns.join(" → ")}`
            : `${work} dias de trabalho / ${off} dias de folga`;
    return {
        name: String(scale.nome || `Escala ${side.toUpperCase()}`),
        type: scale.tipo,
        source: scale.source,
        start,
        work,
        off,
        turns,
        parameters,
        anchor: scale.tipo === TIPO_CICLO_HORAS ? formatDateTime(start) : formatDate(start),
        origin: sourceLabel(scale.source)
    };
}

function renderReportScaleMetadata(scale, side) {
    const item = document.createElement("article");
    item.className = `report-meta-card report-meta-${side}`;
    const title = document.createElement("h3");
    title.textContent = `Escala ${side.toUpperCase()} · ${scale.name}`;
    const details = document.createElement("dl");
    [
        ["Tipo e parâmetros", `${getTypeName(scale.type)} · ${scale.parameters}`],
        ["Início do ciclo", scale.anchor],
        ["Origem", scale.origin]
    ].forEach(([labelText, valueText]) => {
        const row = document.createElement("div");
        const label = document.createElement("dt");
        label.textContent = labelText;
        const value = document.createElement("dd");
        value.textContent = valueText;
        row.append(label, value);
        details.append(row);
    });
    item.append(title, details);
    return item;
}

function renderReport(report) {
    const fragment = document.createDocumentFragment();
    const heading = document.createElement("header");
    heading.className = "report-print-heading";
    const kicker = document.createElement("span");
    kicker.className = "mono-kicker";
    kicker.textContent = "RELATÓRIO MENSAL DE ESCALAS";
    const title = document.createElement("h1");
    title.id = "reportTitle";
    title.textContent = `Relatório mensal · ${report.monthLabel}`;
    const period = document.createElement("p");
    period.className = "report-print-period";
    period.textContent = `Período: ${report.periodStart} a ${report.periodEnd} · ${report.usesTime ? `Status observado às ${report.time}` : "Status por data"}`;
    heading.append(kicker, title, period);
    fragment.append(heading);

    const metadata = document.createElement("div");
    metadata.className = "report-meta-grid";
    metadata.append(renderReportScaleMetadata(report.scaleA, "a"));
    if (report.mode === "compare") metadata.append(renderReportScaleMetadata(report.scaleB, "b"));
    fragment.append(metadata);

    const summary = document.createElement("section");
    summary.className = "report-summary";
    const summaryHeading = document.createElement("h2");
    summaryHeading.textContent = report.usesTime ? `Resumo no horário consultado · ${report.time}` : "Resumo por data";
    const summaryList = document.createElement("div");
    summaryList.className = "report-summary-list";
    const timeSuffix = report.usesTime ? ` às ${report.time}` : "";
    const values = report.mode === "single"
        ? [[report.summary.aWorking, `Datas com status de trabalho da Escala A${timeSuffix}`], [report.summary.aOff, `Datas com status de folga da Escala A${timeSuffix}`]]
        : [[report.summary.aWorking, `Datas com status de trabalho da Escala A${timeSuffix}`], [report.summary.bWorking, `Datas com status de trabalho da Escala B${timeSuffix}`], [report.summary.bothOff, `Datas com ambas em folga${timeSuffix}`]];
    values.forEach(([countValue, labelText]) => {
        const card = document.createElement("div");
        card.className = "report-summary-item";
        const count = document.createElement("strong");
        count.textContent = String(countValue);
        const label = document.createElement("span");
        label.textContent = labelText;
        card.append(count, label);
        summaryList.append(card);
    });
    const note = document.createElement("p");
    note.className = "report-sample-note";
    note.textContent = report.usesTime
        ? `Cada data registra o status às ${report.time}. Em ciclos por horas pode haver outra situação no mesmo dia. Os totais não representam dias inteiros de trabalho nem horas trabalhadas.`
        : "Cada data registra a situação do ciclo por dias. Os totais não representam horas trabalhadas.";
    summary.append(summaryHeading, summaryList, note);
    fragment.append(summary);

    const calendarSection = document.createElement("section");
    calendarSection.className = "report-calendar-section";
    const calendarHeading = document.createElement("h2");
    calendarHeading.textContent = "Calendário do mês";
    const legend = document.createElement("p");
    legend.className = "report-calendar-legend";
    legend.textContent = "Legenda: Trabalho (Trab. no celular) · Folga · Manhã · Tarde · Noite. A e B indicam cada escala; folgas coincidentes têm destaque.";
    const calendar = document.createElement("div");
    calendar.className = `report-calendar${report.mode === "compare" ? " has-two-scales" : ""}`;
    calendar.setAttribute("aria-label", `Calendário de ${report.monthLabel}${report.usesTime ? ` observado às ${report.time}` : ""}`);
    ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].forEach((weekday) => {
        const label = document.createElement("div");
        label.className = "report-calendar-weekday";
        label.textContent = weekday;
        calendar.append(label);
    });
    for (let index = 0; index < report.rows[0].date.getDay(); index += 1) {
        const blank = document.createElement("div");
        blank.className = "report-calendar-blank";
        blank.setAttribute("aria-hidden", "true");
        calendar.append(blank);
    }
    report.rows.forEach((record) => {
        const day = document.createElement("article");
        const bothOff = report.mode === "compare" && record.statusA === "Folga" && record.statusB === "Folga";
        day.className = `report-calendar-day${bothOff ? " both-off" : ""}${record.transitionA || record.transitionB ? " has-transition" : ""}`;
        day.setAttribute("aria-label", `${record.dateLabel}. Escala A: ${record.statusA}.${report.mode === "compare" ? ` Escala B: ${record.statusB}.` : ""}${record.transitionA || record.transitionB ? " Há transição de status na data." : ""}`);
        const date = document.createElement("strong");
        date.className = "report-calendar-date";
        date.textContent = String(record.date.getDate());
        day.append(date);
        [["a", record.statusA], ...(report.mode === "compare" ? [["b", record.statusB]] : [])].forEach(([side, status]) => {
            const statusLabel = document.createElement("span");
            statusLabel.className = `report-calendar-status status-${TURN_CLASSES[status.toLowerCase()] || "trabalhando"}`;
            const sideLabel = document.createElement("b");
            sideLabel.textContent = side.toUpperCase();
            const text = document.createElement("span");
            text.className = "report-status-full";
            text.textContent = status === "Trabalhando" ? "Trabalho" : status;
            statusLabel.append(sideLabel, text);
            if (status === "Trabalhando") {
                const short = document.createElement("span");
                short.className = "report-status-short";
                short.setAttribute("aria-hidden", "true");
                short.textContent = "Trab.";
                statusLabel.append(short);
            }
            day.append(statusLabel);
        });
        if (record.transitionA || record.transitionB) {
            const transition = document.createElement("small");
            transition.className = "report-calendar-transition";
            transition.textContent = "↔ Troca no dia";
            day.append(transition);
        } else if (bothOff) {
            const coincidence = document.createElement("small");
            coincidence.className = "report-calendar-coincidence";
            coincidence.textContent = "Ambas em folga";
            day.append(coincidence);
        }
        calendar.append(day);
    });
    calendarSection.append(calendarHeading, legend, calendar);
    fragment.append(calendarSection);

    const details = document.createElement("details");
    details.className = "report-details";
    const detailsSummary = document.createElement("summary");
    detailsSummary.textContent = "Conferir tabela detalhada de todas as datas";
    details.append(detailsSummary);
    const tableWrap = document.createElement("div");
    tableWrap.className = "report-table-wrap";
    const table = document.createElement("table");
    table.className = "report-table";
    table.id = "reportRecords";
    const caption = document.createElement("caption");
    caption.textContent = report.usesTime ? `Status das escalas observado às ${report.time} em cada data do período.` : "Status das escalas em cada data do período.";
    const head = document.createElement("thead");
    const headerRow = document.createElement("tr");
    ["Data", "Dia da semana", `Escala A${timeSuffix}`].concat(report.mode === "compare" ? [`Escala B${timeSuffix}`] : []).forEach((text) => {
        const cell = document.createElement("th");
        cell.scope = "col";
        cell.textContent = text;
        headerRow.append(cell);
    });
    head.append(headerRow);
    const body = document.createElement("tbody");
    report.rows.forEach((record) => {
        const row = document.createElement("tr");
        [record.dateLabel, record.weekday, record.statusA].concat(report.mode === "compare" ? [record.statusB] : []).forEach((value) => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.append(cell);
        });
        body.append(row);
    });
    table.append(caption, head, body);
    tableWrap.append(table);
    details.append(tableWrap);
    fragment.append(details);
    elements.reportOutput.replaceChildren(fragment);
}

function setReportInvalid(message) {
    state.report.result = null;
    elements.reportPrint.disabled = true;
    elements.reportDownloadXlsx.disabled = true;
    elements.reportDownloadCsv.disabled = true;
    elements.reportFeedback.textContent = `${message} Corrija os campos para gerar e exportar uma nova prévia.`;
    elements.reportFeedback.dataset.feedbackType = "error";
    const empty = document.createElement("div");
    empty.className = "report-empty report-empty-invalid";
    const heading = document.createElement("h2");
    heading.id = "reportTitle";
    heading.textContent = "Relatório indisponível";
    const note = document.createElement("p");
    note.textContent = "A prévia anterior foi removida porque os parâmetros atuais não são válidos.";
    empty.append(heading, note);
    elements.reportOutput.replaceChildren(empty);
}

function updateReport() {
    if (!hasReport()) return false;
    const needsTime = [state.report.snapshots.a, elements.reportMode.value === "compare" ? state.report.snapshots.b : null]
        .some((scale) => scale?.tipo === TIPO_CICLO_HORAS);
    elements.reportTimeField.hidden = !needsTime;
    try {
        const mode = elements.reportMode.value;
        const scaleA = readReportScale("a");
        const scaleB = mode === "compare" ? readReportScale("b") : null;
        const monthValue = elements.reportMonth.value;
        const monthMatch = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(monthValue);
        if (!monthMatch) throw new Error("Escolha um mês válido para o relatório.");
        const month = new Date(Number(monthMatch[1]), Number(monthMatch[2]) - 1, 1);
        const report = window.ScaleReportCore.createMonthlyReport({
            mode,
            month,
            time: elements.reportTime.value,
            scaleA,
            scaleB
        });
        state.report.result = report;
        renderReport(report);
        elements.reportPrint.disabled = false;
        elements.reportDownloadXlsx.disabled = false;
        elements.reportDownloadCsv.disabled = false;
        elements.reportFeedback.textContent = "Prévia atualizada. Impressão, Excel e CSV correspondem a estes registros.";
        elements.reportFeedback.dataset.feedbackType = "success";
        return true;
    } catch (error) {
        setReportInvalid(error.message);
        return false;
    }
}

function selectReportScale(side, key) {
    const scale = state.report.catalog.get(key);
    if (!scale) return;
    state.report.selections[side] = key;
    state.report.snapshots[side] = cloneScale(scale);
    state.report.missing[side] = false;
    state.report.fieldSelection[side] = key;
    renderReportFields(side, scale);
    updateReport();
}

function downloadReportFile(blob, extension) {
    const report = state.report.result;
    if (!report) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-escalas-${report.year}-${String(report.month + 1).padStart(2, "0")}.${extension}`;
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadReportCsv() {
    if (!state.report.result) return;
    const csv = window.ScaleReportCore.createCsv(state.report.result);
    downloadReportFile(new Blob([csv], { type: "text/csv;charset=utf-8" }), "csv");
}

function downloadReportXlsx() {
    if (!state.report.result) return;
    const bytes = window.ScaleReportXlsx.createXlsx(state.report.result);
    downloadReportFile(new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), "xlsx");
}

function jumpReportToAnchorMonth(side) {
    const anchorValue = $(`#report-${side}-anchor`)?.value || "";
    const anchor = anchorValue.includes("T") ? parseDateTimeInput(anchorValue) : parseDateInput(anchorValue);
    if (!Number.isFinite(anchor.getTime())) {
        setReportInvalid(`Informe um início do ciclo válido para a Escala ${side.toUpperCase()}.`);
        return;
    }
    elements.reportMonth.value = `${anchor.getFullYear()}-${String(anchor.getMonth() + 1).padStart(2, "0")}`;
    updateReport();
}

function initReportPage() {
    if (!hasReport()) return;
    const now = new Date();
    elements.reportMonth.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    elements.reportTime.value = "06:00";
    elements.reportMode.value = "single";
    elements.reportBPanel.hidden = true;
    elements.reportBAnchorMonth.hidden = true;
    state.savedScales = loadSavedScales();
    state.availableModels = PREDEFINED_MODELS.map(cloneScale);
    refreshReportOptions();

    elements.reportMode.addEventListener("change", () => {
        state.report.mode = elements.reportMode.value;
        elements.reportBPanel.hidden = state.report.mode !== "compare";
        elements.reportBAnchorMonth.hidden = state.report.mode !== "compare";
        updateReport();
    });
    [[elements.reportASelect, "a"], [elements.reportBSelect, "b"]].forEach(([select, side]) => {
        select.addEventListener("change", () => selectReportScale(side, select.value));
    });
    [elements.reportAFields, elements.reportBFields].forEach((fields) => {
        fields.addEventListener("input", updateReport);
        fields.addEventListener("change", updateReport);
    });
    elements.reportMonth.addEventListener("input", updateReport);
    elements.reportMonth.addEventListener("change", updateReport);
    elements.reportTime.addEventListener("input", updateReport);
    elements.reportTime.addEventListener("change", updateReport);
    elements.reportAnchorMonth.addEventListener("click", () => jumpReportToAnchorMonth("a"));
    elements.reportBAnchorMonth.addEventListener("click", () => jumpReportToAnchorMonth("b"));
    elements.reportPrint.addEventListener("click", () => {
        if (state.report.result) window.print();
    });
    elements.reportDownloadCsv.addEventListener("click", downloadReportCsv);
    elements.reportDownloadXlsx.addEventListener("click", downloadReportXlsx);
    elements.reportRefreshSaved.addEventListener("click", async () => {
        elements.reportRefreshSaved.disabled = true;
        await Promise.all([loadModelsFromApi(), loadSavedScalesFromApi()]);
        elements.reportRefreshSaved.disabled = false;
    });
    window.ScaleReportApp = Object.freeze({ getCurrentReport: () => state.report.result });
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
    $("#calendarStart")?.addEventListener("click", () => {
        if (!validateSimulatorForm()) return;
        const start = getSimulatorSpec().start;
        state.calendarView = new Date(start.getFullYear(), start.getMonth(), 1);
        renderCalendar();
    });
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
            state.guide.flow = "custom";
            state.selectedType = button.dataset.type;
            updateScaleButtons();
            renderDynamicFields();
            $("#guideSelectedModel").textContent = "Escala personalizada";
            renderAlternativeWeek();
            setGuideStep(2);
            invalidateSimulatorResult();
            createLucideIcons();
        });
    }

    if (elements.modelButtons) {
        elements.modelButtons.addEventListener("click", (event) => {
            const button = event.target.closest("[data-guide-flow]");

            if (!button) {
                return;
            }

            selectGuideFlow(button.dataset.guideFlow);
        });
    }

    $("#guideView")?.addEventListener("click", restoreConfirmedSelection);
    $("#guideConfigure")?.addEventListener("click", () => { invalidateSimulatorResult(); setGuideStep(1); });
    $("#guideBack")?.addEventListener("click", () => { invalidateSimulatorResult(); setGuideStep(1); });
    $("#guideCorrect")?.addEventListener("click", () => { invalidateSimulatorResult(); setGuideStep(2); });
    $("#guideSave")?.addEventListener("click", saveConfirmedSelection);
    $("#alternativeOffStart")?.addEventListener("change", () => {
        renderAlternativeWeek();
        invalidateSimulatorResult();
    });

    if (elements.simulatorForm) {
        elements.simulatorForm.addEventListener("submit", handleSimulatorSubmit);
        elements.simulatorForm.addEventListener("click", handleTurnBuilderClick);
        elements.simulatorForm.addEventListener("input", (event) => {
            if (event.target.matches("input")) invalidateSimulatorResult();
        });
        elements.simulatorForm.addEventListener("change", (event) => {
            if (event.target.id === "queryDate" || event.target.id === "queryDateTime") {
                const query = event.target.id === "queryDateTime" ? parseDateTimeInput(event.target.value) : parseDateInput(event.target.value);
                if (!Number.isNaN(query.getTime())) {
                    state.calendarView = new Date(query.getFullYear(), query.getMonth(), 1);
                }
                elements.simulatorForm.requestSubmit();
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
    state.guide.active = readConfirmedSelection();
    showActiveSummary();
    invalidateSimulatorResult();
    const hash = window.location.hash;
    const requestedFlow = new URLSearchParams(window.location.search).get("flow");
    if (hash === "#minhas-escalas") {
        elements.savedScalesList.closest("details").open = true;
        setGuideStep(0);
    } else if (hash === "#configurar") {
        if (["admin", "hours", "alternative"].includes(requestedFlow)) selectGuideFlow(requestedFlow);
        else if (requestedFlow === "custom") {
            $("#advancedControls").open = true;
            state.guide.flow = "custom";
            $("#guideSelectedModel").textContent = "Escala personalizada";
            setGuideStep(2);
        } else setGuideStep(1);
    } else if (state.guide.active) restoreConfirmedSelection();
    else setGuideStep(0);
    window.addEventListener("hashchange", () => {
        if (window.location.hash === "#minhas-escalas") {
            elements.savedScalesList.closest("details").open = true;
        } else if (window.location.hash === "#configurar") {
            setGuideStep(1);
        } else if (window.location.hash === "#consultar") {
            if (state.guide.active) restoreConfirmedSelection();
            else setGuideStep(0);
        }
        configureActiveNavigation();
    });
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
        const [linkPage, linkHash] = link.getAttribute("href").split("#");
        const isCurrent = linkPage === currentPage &&
            (!linkHash || (window.location.hash || "#consultar") === `#${linkHash}`);
        link.classList.toggle("active", isCurrent);
        if (isCurrent) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
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
    initComparisonPage();
    initReportPage();
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
