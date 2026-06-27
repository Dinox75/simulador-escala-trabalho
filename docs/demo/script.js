const TIPO_CICLO_DIAS = "ciclo_dias";
const TIPO_CICLO_HORAS = "ciclo_horas";
const TIPO_TURNO_ROTATIVO = "turno_rotativo";

const STORAGE_KEY = "simulador_escala_demo_v09";
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
        nome: "Escala 6x3",
        tipo: TIPO_CICLO_DIAS,
        dias_trabalho: 6,
        dias_folga: 3
    },
    {
        nome: "Escala 5x2",
        tipo: TIPO_CICLO_DIAS,
        dias_trabalho: 5,
        dias_folga: 2
    },
    {
        nome: "Escala 4x2",
        tipo: TIPO_CICLO_DIAS,
        dias_trabalho: 4,
        dias_folga: 2
    },
    {
        nome: "Escala 12x36",
        tipo: TIPO_CICLO_HORAS,
        horas_trabalho: 12,
        horas_folga: 36
    },
    {
        nome: "Turno rotativo simples",
        tipo: TIPO_TURNO_ROTATIVO,
        sequencia_turnos: ["Manhã", "Manhã", "Tarde", "Tarde", "Noite", "Noite", "Folga", "Folga"]
    },
    {
        nome: "Minha escala real 24 dias",
        tipo: TIPO_TURNO_ROTATIVO,
        sequencia_turnos: ESCALA_REAL_24_DIAS
    }
];

const DEFAULT_SCALES = PREDEFINED_MODELS;

const HERO_FRAMES = [
    {
        line: "Repository conectado",
        output: "Escala 6x3 salva no banco com sucesso",
        status: "PostgreSQL",
        meta: "Persistência relacional funcionando",
        progress: "82%"
    },
    {
        line: "ESCALA_REPOSITORY=postgres",
        output: "Aplicação alternando de JSON para PostgreSQL",
        status: "v0.9.0",
        meta: "Configuração técnica por ambiente",
        progress: "68%"
    },
    {
        line: "pytest",
        output: "Testes de repository e armazenamento passando",
        status: "Testado",
        meta: "JSON preservado como padrão seguro",
        progress: "94%"
    }
];

const PROCESS_RESULTS = [
    "Modelo selecionado",
    "Datas informadas",
    "Ciclo calculado",
    "Resultado exibido no calendário"
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
    simulatorTurns: ["Manhã", "Tarde", "Noite", "Folga"],
    savedTurns: ["Manhã", "Tarde", "Noite", "Folga"],
    heroIndex: 0,
    processIndex: 0,
    scrollTicking: false
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const elements = {
    root: document.documentElement,
    themeToggle: $("#themeToggle"),
    themeFlash: $("#themeFlash"),
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
    savedScaleForm: $("#savedScaleForm"),
    savedName: $("#savedName"),
    savedType: $("#savedType"),
    savedDynamicFields: $("#savedDynamicFields"),
    savedScalesList: $("#savedScalesList"),
    resetScalesButton: $("#resetScalesButton"),
    heroTerminalLine: $("#heroTerminalLine"),
    heroTerminalOutput: $("#heroTerminalOutput"),
    heroStatusText: $("#heroStatusText"),
    heroProgressBar: $("#heroProgressBar"),
    heroStatusMeta: $("#heroStatusMeta"),
    processResultText: $("#processResultText")
};

function cloneScale(scale) {
    return JSON.parse(JSON.stringify(scale));
}

function hasSimulator() {
    return Boolean(elements.simulatorForm && elements.dynamicFields);
}

function loadSavedScales() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

        if (Array.isArray(saved) && saved.length > 0) {
            return saved;
        }
    } catch (error) {
        console.warn("Não foi possível carregar escalas salvas.", error);
    }

    return DEFAULT_SCALES.map(cloneScale);
}

function saveScales() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.savedScales));
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

    elements.modelButtons.innerHTML = PREDEFINED_MODELS
        .map((model, index) => `
            <button class="model-button" type="button" data-model-index="${index}">
                <span class="model-icon"><i data-lucide="${getModelIcon(model.tipo)}"></i></span>
                <span>
                    <strong>${model.nome}</strong>
                    <small>${getTypeName(model.tipo)} · ${getScaleSummary(model)}</small>
                </span>
            </button>
        `)
        .join("");

    createLucideIcons();
}

function applyModelToSimulator(model) {
    if (!model || !hasSimulator()) {
        return;
    }

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
    const cycle = workDays + offDays;
    const daysPassed = getDaysDifference(start, query);
    const position = ((daysPassed % cycle) + cycle) % cycle;

    return position < workDays ? "Trabalhando" : "Folga";
}

function calculateCycleHoursStatus(start, query, workHours, offHours) {
    const cycle = workHours + offHours;
    const hoursPassed = (query - start) / 3600000;
    const position = ((hoursPassed % cycle) + cycle) % cycle;

    return position < workHours ? "Trabalhando" : "Folga";
}

function calculateRotativeStatus(start, query, turns) {
    if (!turns.length) {
        throw new Error("A sequência de turnos não pode ficar vazia.");
    }

    const daysPassed = getDaysDifference(start, query);
    const position = ((daysPassed % turns.length) + turns.length) % turns.length;

    return turns[position];
}

function createTimelineItem(dateLabel, status, detail = "") {
    return {
        dateLabel,
        status,
        detail
    };
}

function generateCycleDaysItems(start, quantity, workDays, offDays) {
    return Array.from({ length: quantity }, (_, index) => {
        const current = addDays(start, index);
        const status = calculateCycleDaysStatus(start, current, workDays, offDays);

        return createTimelineItem(formatDate(current), status, `Dia ${index + 1} do período visualizado`);
    });
}

function generateRotativeItems(start, quantity, turns) {
    return Array.from({ length: quantity }, (_, index) => {
        const current = addDays(start, index);
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
                ${index + 1}. ${turn}
                <button type="button" aria-label="Remover ${turn}" data-turn-target="${target}" data-turn-remove="${index}">×</button>
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
                    Períodos para visualizar
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
                <span class="timeline-date">${item.dateLabel}</span>
                <span>${item.detail}</span>
                <strong class="timeline-status ${getTurnClass(item.status)} ${item.status === "Folga" ? "folga-status" : ""}">${item.status}</strong>
            </div>
        `)
        .join("");
}

function parseDateFromLabel(label) {
    const [day, month, year] = label.split("/").map(Number);
    return new Date(year, month - 1, day);
}

function renderCalendar(items) {
    if (!elements.calendarGrid || !elements.calendarMonth) {
        return;
    }

    const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const today = new Date();
    const monthBase = items.length ? parseDateFromLabel(items[0].dateLabel) : today;
    const firstDay = new Date(monthBase.getFullYear(), monthBase.getMonth(), 1);
    const lastDay = new Date(monthBase.getFullYear(), monthBase.getMonth() + 1, 0);
    const statusByDate = new Map(items.map((item) => [item.dateLabel, item.status]));

    elements.calendarMonth.textContent = formatMonth(monthBase);

    const cells = [];

    weekdays.forEach((day) => {
        cells.push(`<div class="calendar-weekday">${day}</div>`);
    });

    for (let index = 0; index < firstDay.getDay(); index += 1) {
        cells.push(`<div class="calendar-empty" aria-hidden="true"></div>`);
    }

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
        const current = new Date(monthBase.getFullYear(), monthBase.getMonth(), day);
        const label = formatDate(current);
        const status = statusByDate.get(label) || "";
        const statusClass = status ? `${getTurnClass(status)} ${status === "Folga" ? "folga-status" : ""}` : "";

        cells.push(`
            <div class="calendar-day ${statusClass}">
                <strong>${day}</strong>
                <small>${status}</small>
            </div>
        `);
    }

    elements.calendarGrid.innerHTML = cells.join("");
}

function showResult(title, description, items) {
    if (!elements.resultTitle || !elements.resultDescription || !elements.resultCard) {
        return;
    }

    elements.resultTitle.textContent = title;
    elements.resultDescription.textContent = description;
    state.resultItems = items;

    renderTimeline(items);
    renderCalendar(items);

    elements.resultCard.classList.remove("result-pulse");
    window.requestAnimationFrame(() => {
        elements.resultCard.classList.add("result-pulse");
    });
}

function handleSimulatorSubmit(event) {
    event.preventDefault();

    try {
        if (state.selectedType === TIPO_CICLO_HORAS) {
            const start = parseDateTimeInput($("#startDateTime").value);
            const query = parseDateTimeInput($("#queryDateTime").value);
            const workHours = Number($("#workHours").value);
            const offHours = Number($("#offHours").value);
            const quantity = Number($("#quantityPeriods").value);
            const status = calculateCycleHoursStatus(start, query, workHours, offHours);
            const items = generateCycleHoursItems(start, quantity, workHours, offHours);

            showResult(
                `Status: ${status}`,
                `Na data ${formatDateTime(query)}, a escala ${workHours}x${offHours} indica: ${status}.`,
                items
            );
            return;
        }

        const start = parseDateInput($("#startDate").value);
        const query = parseDateInput($("#queryDate").value);
        const quantity = Number($("#quantityDays").value);

        if (state.selectedType === TIPO_TURNO_ROTATIVO) {
            const turns = normalizeTurns(state.simulatorTurns);
            const status = calculateRotativeStatus(start, query, turns);
            const items = generateRotativeItems(start, quantity, turns);

            showResult(
                `Turno: ${status}`,
                `Na data ${formatDate(query)}, a sequência indica: ${status}.`,
                items
            );
            return;
        }

        const workDays = Number($("#workDays").value);
        const offDays = Number($("#offDays").value);
        const status = calculateCycleDaysStatus(start, query, workDays, offDays);
        const items = generateCycleDaysItems(start, quantity, workDays, offDays);

        showResult(
            `Status: ${status}`,
            `Na data ${formatDate(query)}, a escala ${workDays}x${offDays} indica: ${status}.`,
            items
        );
    } catch (error) {
        showResult("Não foi possível simular", error.message, []);
    }
}

function renderSavedScales() {
    if (!elements.savedScalesList) {
        return;
    }

    if (!state.savedScales.length) {
        elements.savedScalesList.innerHTML = `<p class="turn-empty">Nenhuma escala salva.</p>`;
        return;
    }

    elements.savedScalesList.innerHTML = state.savedScales
        .map((scale, index) => `
            <div class="saved-item">
                <div>
                    <strong>${scale.nome}</strong>
                    <small>${getTypeName(scale.tipo)} · ${getScaleSummary(scale)}</small>
                </div>
                <div class="saved-item-actions">
                    <button class="tiny-button" type="button" data-apply-scale="${index}">Aplicar</button>
                    <button class="tiny-button" type="button" data-delete-scale="${index}">Excluir</button>
                </div>
            </div>
        `)
        .join("");
}

function handleSavedScaleSubmit(event) {
    event.preventDefault();

    const name = elements.savedName.value.trim();
    const type = elements.savedType.value;

    if (!name) {
        return;
    }

    let scale;

    if (type === TIPO_CICLO_HORAS) {
        scale = {
            nome: name,
            tipo,
            horas_trabalho: Number($("#savedWorkHours").value),
            horas_folga: Number($("#savedOffHours").value)
        };
    } else if (type === TIPO_TURNO_ROTATIVO) {
        const turns = normalizeTurns(state.savedTurns);

        if (!turns.length) {
            alert("Adicione pelo menos um turno antes de salvar.");
            return;
        }

        scale = {
            nome: name,
            tipo,
            sequencia_turnos: turns
        };
    } else {
        scale = {
            nome: name,
            tipo,
            dias_trabalho: Number($("#savedWorkDays").value),
            dias_folga: Number($("#savedOffDays").value)
        };
    }

    state.savedScales.push(scale);
    saveScales();
    renderSavedScales();
    elements.savedScaleForm.reset();
    state.savedTurns = ["Manhã", "Tarde", "Noite", "Folga"];
    renderSavedDynamicFields();
}

function applySavedScale(index) {
    const scale = state.savedScales[index];

    if (!scale) {
        return;
    }

    state.selectedType = scale.tipo;
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

    const simulator = document.querySelector("#simulador");

    if (simulator) {
        simulator.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

function deleteSavedScale(index) {
    state.savedScales.splice(index, 1);
    saveScales();
    renderSavedScales();
}

function resetSavedScales() {
    state.savedScales = DEFAULT_SCALES.map(cloneScale);
    saveScales();
    renderSavedScales();
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

        if (elements.themeFlash) {
            const rect = elements.themeToggle.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;

            elements.themeFlash.style.setProperty("--x", `${x}px`);
            elements.themeFlash.style.setProperty("--y", `${y}px`);
            elements.themeFlash.classList.remove("active");
            void elements.themeFlash.offsetWidth;
            elements.themeFlash.classList.add("active");
        }

        elements.root.setAttribute("data-theme", next);
        localStorage.setItem(THEME_KEY, next);
        updateThemeIcon(next);

        if (window.gsap) {
            window.gsap.fromTo(
                "body",
                { scale: 0.995 },
                { scale: 1, duration: 0.45, ease: "power2.out" }
            );
        }

        event.currentTarget.blur();
    });
}

function updateThemeIcon(theme) {
    if (!elements.themeToggle) {
        return;
    }

    const iconName = theme === "dark" ? "moon" : "sun";
    elements.themeToggle.innerHTML = `<i data-lucide="${iconName}"></i>`;

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

function configureHeroDemo() {
    const requiredElements = [
        elements.heroTerminalLine,
        elements.heroTerminalOutput,
        elements.heroStatusText,
        elements.heroStatusMeta,
        elements.heroProgressBar
    ];

    if (requiredElements.some((item) => !item)) {
        return;
    }

    window.setInterval(() => {
        state.heroIndex = (state.heroIndex + 1) % HERO_FRAMES.length;
        const frame = HERO_FRAMES[state.heroIndex];

        elements.heroTerminalLine.textContent = frame.line;
        elements.heroTerminalOutput.textContent = frame.output;
        elements.heroStatusText.textContent = frame.status;
        elements.heroStatusMeta.textContent = frame.meta;
        elements.heroProgressBar.style.width = frame.progress;

        if (window.gsap) {
            window.gsap.fromTo(
                [elements.heroTerminalLine, elements.heroTerminalOutput, elements.heroStatusText],
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: "power2.out" }
            );
        }
    }, 3200);
}

function configureProcessDemo() {
    const lines = $$("[data-process-line]");

    if (!lines.length || !elements.processResultText) {
        return;
    }

    window.setInterval(() => {
        state.processIndex = (state.processIndex + 1) % lines.length;

        lines.forEach((line, index) => {
            line.classList.toggle("active", index === state.processIndex);
        });

        elements.processResultText.textContent = PROCESS_RESULTS[state.processIndex];
    }, 1800);
}

function configureMobileMenu() {
    if (!elements.mobileMenuButton || !elements.navLinks) {
        return;
    }

    elements.mobileMenuButton.addEventListener("click", () => {
        elements.navLinks.classList.toggle("open");
        document.body.classList.toggle("menu-open");
    });

    $$(".nav-links a").forEach((link) => {
        link.addEventListener("click", () => {
            elements.navLinks.classList.remove("open");
            document.body.classList.remove("menu-open");
        });
    });
}

function configureEvents() {
    if (elements.scaleTypeButtons) {
        elements.scaleTypeButtons.addEventListener("click", (event) => {
            const button = event.target.closest("[data-type]");

            if (!button) {
                return;
            }

            state.selectedType = button.dataset.type;
            updateScaleButtons();
            renderDynamicFields();
            createLucideIcons();
        });
    }

    if (elements.modelButtons) {
        elements.modelButtons.addEventListener("click", (event) => {
            const button = event.target.closest("[data-model-index]");

            if (!button) {
                return;
            }

            const model = PREDEFINED_MODELS[Number(button.dataset.modelIndex)];
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
    }

    if (elements.savedScaleForm) {
        elements.savedScaleForm.addEventListener("submit", handleSavedScaleSubmit);
        elements.savedScaleForm.addEventListener("click", handleTurnBuilderClick);
    }

    if (elements.savedType) {
        elements.savedType.addEventListener("change", () => {
            renderSavedDynamicFields();
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
}

function bootInitialSimulation() {
    if (!hasSimulator()) {
        return;
    }

    const start = parseDateInput(setDefaultDateValues());
    const items = generateCycleDaysItems(start, 14, 6, 3);

    showResult(
        "Exemplo: Trabalhando",
        "Este é um exemplo automático usando o modelo 6x3 da v0.9.0.",
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

    renderDynamicFields();
    renderModelButtons();
    renderSavedDynamicFields();
    renderSavedScales();
    bootInitialSimulation();
}

function init() {
    configureTheme();
    configureTabs();
    configureRevealAnimations();
    configureScrollProgress();
    configureHeroDemo();
    configureProcessDemo();
    configureMobileMenu();
    configureEvents();
    initSimulatorPage();
    createLucideIcons();
}

document.addEventListener("DOMContentLoaded", init);
