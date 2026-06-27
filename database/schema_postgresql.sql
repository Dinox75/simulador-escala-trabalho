-- Schema PostgreSQL inicial para o Simulador de Escala de Trabalho
-- Versão planejada para futura integração com banco de dados.
-- Este arquivo ainda não é executado pela aplicação na v0.8.0.

CREATE TABLE IF NOT EXISTS escalas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    tipo VARCHAR(30) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_escalas_tipo
        CHECK (tipo IN ('ciclo_dias', 'ciclo_horas', 'turno_rotativo'))
);

CREATE TABLE IF NOT EXISTS escalas_ciclo_dias (
    escala_id INTEGER PRIMARY KEY,
    dias_trabalho INTEGER NOT NULL,
    dias_folga INTEGER NOT NULL,

    CONSTRAINT fk_escalas_ciclo_dias_escala
        FOREIGN KEY (escala_id)
        REFERENCES escalas(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_escalas_ciclo_dias_trabalho
        CHECK (dias_trabalho > 0),

    CONSTRAINT chk_escalas_ciclo_dias_folga
        CHECK (dias_folga > 0)
);

CREATE TABLE IF NOT EXISTS escalas_ciclo_horas (
    escala_id INTEGER PRIMARY KEY,
    horas_trabalho INTEGER NOT NULL,
    horas_folga INTEGER NOT NULL,

    CONSTRAINT fk_escalas_ciclo_horas_escala
        FOREIGN KEY (escala_id)
        REFERENCES escalas(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_escalas_ciclo_horas_trabalho
        CHECK (horas_trabalho > 0),

    CONSTRAINT chk_escalas_ciclo_horas_folga
        CHECK (horas_folga > 0)
);

CREATE TABLE IF NOT EXISTS escalas_turnos (
    id SERIAL PRIMARY KEY,
    escala_id INTEGER NOT NULL,
    ordem INTEGER NOT NULL,
    turno VARCHAR(20) NOT NULL,

    CONSTRAINT fk_escalas_turnos_escala
        FOREIGN KEY (escala_id)
        REFERENCES escalas(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_escalas_turnos_ordem
        CHECK (ordem > 0),

    CONSTRAINT chk_escalas_turnos_turno
        CHECK (turno IN ('Manhã', 'Tarde', 'Noite', 'Folga')),

    CONSTRAINT uq_escalas_turnos_ordem
        UNIQUE (escala_id, ordem)
);

CREATE INDEX IF NOT EXISTS iidx_escalas_tipo
    ON escalas(tipo);

CREATE INDEX IF NOT EXISTS idx_escalas_turnos_escala_id
    ON escalas_turnos(escala_id);