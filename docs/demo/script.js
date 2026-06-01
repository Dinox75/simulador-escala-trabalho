const TIPO_CICLO_DIAS = "ciclo_dias";
const TIPO_CICLO_HORAS = "ciclo_horas";
const TIPO_TURNO_ROTATIVO = "turno_rotativo";
const STORAGE_KEY = "simulador_escala_demo_v06";
const THEME_KEY = "simulador_escala_theme";

const DEFAULT_SCALES = [
    {
        nome: "Escala padrão 6x3",
        tipo: TIPO_CICLO_DIAS,
        dias_trabalho: 6,
        dias_folga: 3
    },
    {
        nome: "Escala 12x36",
        tipo: TIPO_CICLO_HORAS,
        horas_trabalho: 12,
        horas_folga: 36
    },
    {
        nome: "Turno rotativo exemplo",
        tipo: TIPO_TURNO_ROTATIVO,
        sequencia_turnos: ["Manhã", "Manhã", "Tarde", "Tarde", "Noite", "Noite", "Folga", "Folga"]
    }
];

const state = {
    selectedType: TIPO_CICLO_DIAS,
    resultItems: [],
    savedScales: [],
    heroIndex: 0,
    scrollTicking: false
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const elements = {
    root: document.documentElement,
    themeToggle: $("#themeToggle"),
    themeTransition: $("#themeTransition"),
    mobileMenuButton: $("#mobileMenuButton"),
    navLinks: $("#navLinks"),
    scrollProgress: $("#scrollProgress"),
    scaleTypeButtons: $("#scaleTypeButtons"),
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
    heroStatusMeta: $("#heroStatusMeta")
};

const HERO_FRAMES = [
    {
        line: "Aplicando escala 6x3",
        output: "Hoje: Trabalhando · Próxima folga em 2 dias",
        status: "Trabalhando",
        meta: "Ciclo 6x3 em andamento",
        progress: "62%"
    },
    {
        line: "Consultando escala 12x36",
        output: "01/06/2026 20:00 → Folga",
        status: "Folga",
        meta: "Retorno previsto após 36h",
        progress: "34%"
    },
    {
        line: "Calculando turno rotativo",
        output: "Sequência: Manhã → Tarde → Noite → Folga",
        status: "Turno: Noite",
        meta: "Rotação por sequência personalizada",
        progress: "78%"
    }
];

function cloneScale(scale) {
    return JSON.parse(JSON.stringify(scale));
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

function getScaleSummary(scale) {
    if (scale.tipo === TIPO_CICLO_HORAS) {
        return `${scale.horas_trabalho}x${scale.horas_folga} horas`;
    }

    if (scale.tipo === TIPO_TURNO_ROTATIVO) {
        return normalizeTurns(scale.sequencia_turnos).join(" → ");
    }

    return `${scale.dias_trabalho}x${scale.dias_folga} dias`;
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

function generateDays(start, amount, statusCallback) {
    return Array.from({ length: amount }, (_, index) => {
        const date = new Date(start);
        date.setDate(start.getDate() + index);

        return {
            date,
            status: statusCallback(date)
        };
    });
}

function generateHourPeriods(start, amount, workHours, offHours) {
    const periods = [];
    let currentStart = new Date(start);

    for (let index = 0; index < amount; index += 1) {
        const isWork = index % 2 === 0;
        const duration = isWork ? workHours : offHours;
        const end = new Date(currentStart);

        end.setHours(end.getHours() + duration);

        periods.push({
            date: new Date(currentStart),
            end,
            status: isWork ? "Trabalhando" : "Folga"
        });

        currentStart = end;
    }

    return periods;
}

function getStatusClass(status) {
    const normalized = String(status).toLowerCase();

    if (normalized.includes("trabalhando") || normalized.includes("manhã") || normalized.includes("tarde")) {
        return "work";
    }

    if (normalized.includes("noite")) {
        return "night";
    }

    return "off";
}

function todayInputValue() {
    return new Date().toISOString().slice(0, 10);
}

function nowDateTimeInputValue() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
}

function renderSimulatorFields() {
    const today = todayInputValue();
    const now = nowDateTimeInputValue();

    const templates = {
        [TIPO_CICLO_DIAS]: `
            <div class="form-grid">
                <label>
                    Data inicial
                    <input id="startDate" type="date" value="2026-05-01" required>
                </label>
                <label>
                    Data para consultar
                    <input id="queryDate" type="date" value="${today}" required>
                </label>
                <label>
                    Dias de trabalho
                    <input id="workDays" type="number" min="1" value="6" required>
                </label>
                <label>
                    Dias de folga
                    <input id="offDays" type="number" min="1" value="3" required>
                </label>
                <label>
                    Dias para visualizar
                    <input id="amountDays" type="number" min="1" max="60" value="21" required>
                </label>
            </div>
        `,
        [TIPO_CICLO_HORAS]: `
            <div class="form-grid">
                <label>
                    Data/hora inicial
                    <input id="startDateTime" type="datetime-local" value="2026-06-01T06:00" required>
                </label>
                <label>
                    Data/hora para consultar
                    <input id="queryDateTime" type="datetime-local" value="${now}" required>
                </label>
                <label>
                    Horas de trabalho
                    <input id="workHours" type="number" min="1" value="12" required>
                </label>
                <label>
                    Horas de folga
                    <input id="offHours" type="number" min="1" value="36" required>
                </label>
                <label>
                    Períodos para visualizar
                    <input id="amountPeriods" type="number" min="1" max="40" value="8" required>
                </label>
            </div>
        `,
        [TIPO_TURNO_ROTATIVO]: `
            <div class="form-grid">
                <label>
                    Data inicial
                    <input id="startDate" type="date" value="2026-05-01" required>
                </label>
                <label>
                    Data para consultar
                    <input id="queryDate" type="date" value="${today}" required>
                </label>
                <label class="wide-field">
                    Sequência de turnos
                    <input id="turnSequence" type="text" value="Manhã,Manhã,Tarde,Tarde,Noite,Noite,Folga,Folga" required>
                </label>
                <label>
                    Dias para visualizar
                    <input id="amountDays" type="number" min="1" max="60" value="21" required>
                </label>
            </div>
        `
    };

    elements.dynamicFields.innerHTML = templates[state.selectedType];
}

function renderSavedDynamicFields() {
    const type = elements.savedType.value;

    const templates = {
        [TIPO_CICLO_DIAS]: `
            <div class="form-grid">
                <label>
                    Dias de trabalho
                    <input id="savedWorkDays" type="number" min="1" value="6" required>
                </label>
                <label>
                    Dias de folga
                    <input id="savedOffDays" type="number" min="1" value="3" required>
                </label>
            </div>
        `,
        [TIPO_CICLO_HORAS]: `
            <div class="form-grid">
                <label>
                    Horas de trabalho
                    <input id="savedWorkHours" type="number" min="1" value="12" required>
                </label>
                <label>
                    Horas de folga
                    <input id="savedOffHours" type="number" min="1" value="36" required>
                </label>
            </div>
        `,
        [TIPO_TURNO_ROTATIVO]: `
            <label>
                Sequência de turnos
                <input id="savedTurnSequence" type="text" value="Manhã,Tarde,Noite,Folga" required>
            </label>
        `
    };

    elements.savedDynamicFields.innerHTML = templates[type];
}

function updateScaleButtons() {
    $$('[data-type]').forEach((button) => {
        button.classList.toggle("active", button.dataset.type === state.selectedType);
    });
}

function runSimulation(event) {
    event.preventDefault();

    try {
        if (state.selectedType === TIPO_CICLO_HORAS) {
            runHoursSimulation();
            return;
        }

        if (state.selectedType === TIPO_TURNO_ROTATIVO) {
            runRotativeSimulation();
            return;
        }

        runDaysSimulation();
    } catch (error) {
        showResult("Erro na simulação", error.message, "off");
    }
}

function runDaysSimulation() {
    const start = parseDateInput($("#startDate").value);
    const query = parseDateInput($("#queryDate").value);
    const workDays = Number($("#workDays").value);
    const offDays = Number($("#offDays").value);
    const amount = Number($("#amountDays").value);
    const status = calculateCycleDaysStatus(start, query, workDays, offDays);

    state.resultItems = generateDays(start, amount, (date) => calculateCycleDaysStatus(start, date, workDays, offDays));

    showResult(
        status,
        `Na data ${formatDate(query)}, o status calculado para a escala ${workDays}x${offDays} é: ${status}.`,
        getStatusClass(status)
    );

    renderTimeline();
    renderCalendar();
}

function runHoursSimulation() {
    const start = parseDateTimeInput($("#startDateTime").value);
    const query = parseDateTimeInput($("#queryDateTime").value);
    const workHours = Number($("#workHours").value);
    const offHours = Number($("#offHours").value);
    const amount = Number($("#amountPeriods").value);
    const status = calculateCycleHoursStatus(start, query, workHours, offHours);

    state.resultItems = generateHourPeriods(start, amount, workHours, offHours);

    showResult(
        status,
        `Em ${formatDateTime(query)}, o status calculado para a escala ${workHours}x${offHours} horas é: ${status}.`,
        getStatusClass(status)
    );

    renderTimeline(true);
    renderCalendar();
}

function runRotativeSimulation() {
    const start = parseDateInput($("#startDate").value);
    const query = parseDateInput($("#queryDate").value);
    const turns = normalizeTurns($("#turnSequence").value);
    const amount = Number($("#amountDays").value);
    const status = calculateRotativeStatus(start, query, turns);

    state.resultItems = generateDays(start, amount, (date) => calculateRotativeStatus(start, date, turns));

    showResult(
        status,
        `Na data ${formatDate(query)}, a sequência rotativa aponta: ${status}.`,
        getStatusClass(status)
    );

    renderTimeline();
    renderCalendar();
}

function showResult(title, description, statusClass) {
    elements.resultTitle.textContent = title;
    elements.resultDescription.textContent = description;
    elements.resultCard.classList.remove("status-work", "status-off");
    elements.resultCard.classList.add(statusClass === "work" ? "status-work" : "status-off");

    if (window.gsap) {
        window.gsap.fromTo(
            elements.resultCard,
            { y: 14, opacity: 0.6 },
            { y: 0, opacity: 1, duration: 0.38, ease: "power2.out" }
        );
    }
}

function renderTimeline(isHourly = false) {
    elements.timelineList.innerHTML = state.resultItems.map((item) => {
        const statusClass = getStatusClass(item.status);
        const dateLabel = isHourly ? formatDateTime(item.date) : formatDate(item.date);
        const meta = item.end ? `Até ${formatDateTime(item.end)}` : getTypeName(state.selectedType);

        return `
            <article class="timeline-item ${statusClass}">
                <span class="timeline-dot"></span>
                <div>
                    <div class="timeline-date">${dateLabel}</div>
                    <div class="timeline-meta">${meta}</div>
                </div>
                <strong class="timeline-status">${item.status}</strong>
            </article>
        `;
    }).join("");
}

function renderCalendar() {
    const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const baseItems = state.resultItems.filter((item) => item.date instanceof Date);

    if (!baseItems.length) {
        elements.calendarGrid.innerHTML = "";
        return;
    }

    const firstDate = baseItems[0].date;
    const year = firstDate.getFullYear();
    const month = firstDate.getMonth();
    const monthName = new Intl.DateTimeFormat("pt-BR", {
        month: "long",
        year: "numeric"
    }).format(firstDate);

    elements.calendarMonth.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    const byDate = new Map(
        baseItems.map((item) => [
            item.date.toISOString().slice(0, 10),
            item.status
        ])
    );

    const firstMonthDay = new Date(year, month, 1);
    const lastMonthDay = new Date(year, month + 1, 0);
    const cells = [];

    weekDays.forEach((day) => {
        cells.push(`<div class="calendar-head">${day}</div>`);
    });

    for (let index = 0; index < firstMonthDay.getDay(); index += 1) {
        cells.push(`<div class="calendar-cell empty"></div>`);
    }

    for (let day = 1; day <= lastMonthDay.getDate(); day += 1) {
        const date = new Date(year, month, day);
        const key = date.toISOString().slice(0, 10);
        const status = byDate.get(key);
        const statusClass = status ? getStatusClass(status) : "";

        cells.push(`
            <div class="calendar-cell ${statusClass}">
                <strong>${day}</strong>
                ${status ? `<span>${status}</span>` : ""}
            </div>
        `);
    }

    elements.calendarGrid.innerHTML = cells.join("");
}

function renderSavedScales() {
    elements.savedScalesList.innerHTML = state.savedScales.map((scale, index) => `
        <article class="scale-card">
            <div>
                <h4>${scale.nome}</h4>
                <p>${getTypeName(scale.tipo)} · ${getScaleSummary(scale)}</p>
            </div>
            <div class="scale-card-actions">
                <button class="small-button" type="button" data-apply-scale="${index}">Usar</button>
                <button class="small-button danger" type="button" data-delete-scale="${index}">Excluir</button>
            </div>
        </article>
    `).join("");

    if (!state.savedScales.length) {
        elements.savedScalesList.innerHTML = `<p class="timeline-meta">Nenhuma escala salva.</p>`;
    }
}

function handleSavedScaleSubmit(event) {
    event.preventDefault();

    const name = elements.savedName.value.trim();
    const type = elements.savedType.value;

    if (!name) {
        return;
    }

    const scale = { nome: name, tipo: type };

    if (type === TIPO_CICLO_DIAS) {
        scale.dias_trabalho = Number($("#savedWorkDays").value);
        scale.dias_folga = Number($("#savedOffDays").value);
    }

    if (type === TIPO_CICLO_HORAS) {
        scale.horas_trabalho = Number($("#savedWorkHours").value);
        scale.horas_folga = Number($("#savedOffHours").value);
    }

    if (type === TIPO_TURNO_ROTATIVO) {
        scale.sequencia_turnos = normalizeTurns($("#savedTurnSequence").value);

        if (!scale.sequencia_turnos.length) {
            alert("A sequência de turnos não pode ficar vazia.");
            return;
        }
    }

    state.savedScales.push(scale);
    saveScales();
    renderSavedScales();
    elements.savedScaleForm.reset();
    renderSavedDynamicFields();
}

function applySavedScale(index) {
    const scale = state.savedScales[index];

    if (!scale) {
        return;
    }

    state.selectedType = scale.tipo;
    updateScaleButtons();
    renderSimulatorFields();

    if (scale.tipo === TIPO_CICLO_DIAS) {
        $("#workDays").value = scale.dias_trabalho;
        $("#offDays").value = scale.dias_folga;
    }

    if (scale.tipo === TIPO_CICLO_HORAS) {
        $("#workHours").value = scale.horas_trabalho;
        $("#offHours").value = scale.horas_folga;
    }

    if (scale.tipo === TIPO_TURNO_ROTATIVO) {
        $("#turnSequence").value = normalizeTurns(scale.sequencia_turnos).join(",");
    }

    document.getElementById("simulador").scrollIntoView({ behavior: "smooth" });
}

function deleteSavedScale(index) {
    state.savedScales.splice(index, 1);
    saveScales();
    renderSavedScales();
}

function configureScaleButtons() {
    elements.scaleTypeButtons.addEventListener("click", (event) => {
        const button = event.target.closest("[data-type]");

        if (!button) {
            return;
        }

        state.selectedType = button.dataset.type;
        updateScaleButtons();
        renderSimulatorFields();

        if (window.gsap) {
            window.gsap.fromTo(
                elements.dynamicFields,
                { y: 12, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.32, ease: "power2.out" }
            );
        }
    });
}

function configureTabs() {
    $$('[data-result-tab]').forEach((button) => {
        button.addEventListener("click", () => {
            $$('[data-result-tab]').forEach((item) => item.classList.remove("active"));
            $$('.tab-content').forEach((content) => content.classList.remove("active"));

            button.classList.add("active");
            $(`#${button.dataset.resultTab}Tab`).classList.add("active");
        });
    });

    $$('[data-doc]').forEach((button) => {
        button.addEventListener("click", () => {
            $$('[data-doc]').forEach((item) => item.classList.remove("active"));
            $$('.doc-content').forEach((content) => content.classList.remove("active"));

            button.classList.add("active");
            $(`#doc-${button.dataset.doc}`).classList.add("active");
        });
    });
}

function configureTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);

    if (savedTheme) {
        elements.root.dataset.theme = savedTheme;
    }

    updateThemeIcon();

    elements.themeToggle.addEventListener("click", () => {
        const rect = elements.themeToggle.getBoundingClientRect();
        const nextTheme = elements.root.dataset.theme === "dark" ? "light" : "dark";

        elements.themeTransition.style.setProperty("--x", `${rect.left + rect.width / 2}px`);
        elements.themeTransition.style.setProperty("--y", `${rect.top + rect.height / 2}px`);
        elements.themeTransition.classList.remove("active");
        void elements.themeTransition.offsetWidth;
        elements.themeTransition.classList.add("active");

        window.setTimeout(() => {
            elements.root.dataset.theme = nextTheme;
            localStorage.setItem(THEME_KEY, nextTheme);
            updateThemeIcon();
        }, 180);
    });
}

function updateThemeIcon() {
    const icon = elements.root.dataset.theme === "dark" ? "sun" : "moon";
    elements.themeToggle.innerHTML = `<i data-lucide="${icon}"></i>`;

    if (window.lucide) {
        window.lucide.createIcons();
    }
}

function configureMenu() {
    elements.mobileMenuButton.addEventListener("click", () => {
        elements.navLinks.classList.toggle("open");
        document.body.classList.toggle("menu-open");
    });

    elements.navLinks.addEventListener("click", (event) => {
        if (event.target.matches("a")) {
            elements.navLinks.classList.remove("open");
            document.body.classList.remove("menu-open");
        }
    });
}

function configureRevealAnimations() {
    const revealItems = $$(".reveal");

    if (!("IntersectionObserver" in window)) {
        revealItems.forEach((item) => item.classList.add("visible"));
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
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px"
    });

    revealItems.forEach((item) => observer.observe(item));
}

function configureScrollProgress() {
    window.addEventListener("scroll", () => {
        if (state.scrollTicking) {
            return;
        }

        state.scrollTicking = true;

        requestAnimationFrame(() => {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;

            elements.scrollProgress.style.width = `${progress}%`;
            state.scrollTicking = false;
        });
    }, { passive: true });
}

function startHeroDemo() {
    function renderFrame() {
        const frame = HERO_FRAMES[state.heroIndex % HERO_FRAMES.length];

        elements.heroTerminalLine.textContent = frame.line;
        elements.heroTerminalOutput.textContent = frame.output;
        elements.heroStatusText.textContent = frame.status;
        elements.heroStatusMeta.textContent = frame.meta;
        elements.heroProgressBar.style.width = frame.progress;

        state.heroIndex += 1;

        if (window.gsap) {
            window.gsap.fromTo(
                [elements.heroTerminalLine, elements.heroTerminalOutput, elements.heroStatusText],
                { y: 8, opacity: 0.5 },
                { y: 0, opacity: 1, duration: 0.35, ease: "power2.out", stagger: 0.05 }
            );
        }
    }

    renderFrame();
    window.setInterval(renderFrame, 2600);
}

function configureSavedScaleActions() {
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

function configureGsapIntro() {
    if (!window.gsap) {
        return;
    }

    window.gsap.from(".brand", { y: -16, opacity: 0, duration: 0.5, ease: "power2.out" });
    window.gsap.from(".nav-links a", { y: -12, opacity: 0, duration: 0.4, stagger: 0.04, delay: 0.1 });
    window.gsap.from(".hero-copy > *", { y: 24, opacity: 0, duration: 0.65, stagger: 0.08, delay: 0.15, ease: "power3.out" });
    window.gsap.from(".demo-window", { rotate: -8, scale: 0.92, opacity: 0, duration: 0.8, delay: 0.2, ease: "back.out(1.4)" });
}

function initializeDefaultSimulation() {
    runDaysSimulation();
}

function initialize() {
    state.savedScales = loadSavedScales();

    configureTheme();
    configureMenu();
    configureScaleButtons();
    configureTabs();
    configureRevealAnimations();
    configureScrollProgress();
    configureSavedScaleActions();

    renderSimulatorFields();
    renderSavedDynamicFields();
    renderSavedScales();

    elements.simulatorForm.addEventListener("submit", runSimulation);
    elements.savedScaleForm.addEventListener("submit", handleSavedScaleSubmit);
    elements.savedType.addEventListener("change", renderSavedDynamicFields);
    elements.resetScalesButton.addEventListener("click", () => {
        state.savedScales = DEFAULT_SCALES.map(cloneScale);
        saveScales();
        renderSavedScales();
    });

    if (window.lucide) {
        window.lucide.createIcons();
    }

    startHeroDemo();
    configureGsapIntro();
    initializeDefaultSimulation();
}

document.addEventListener("DOMContentLoaded", initialize);
