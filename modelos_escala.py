from armazenamento import montar_sequencia_por_blocos

from tipos_escala import (
    TIPO_ESCALA_PADRAO,
    TIPO_CICLO_HORAS,
    TIPO_TURNO_ROTATIVO
)


def criar_modelo_6x3():
    return {
        "nome": "Escala 6x3",
        "tipo": TIPO_ESCALA_PADRAO,
        "dias_trabalho": 6,
        "dias_folga": 3
    }


def criar_modelo_5x2():
    return {
        "nome": "Escala 5x2",
        "tipo": TIPO_ESCALA_PADRAO,
        "dias_trabalho": 5,
        "dias_folga": 2
    }


def criar_modelo_4x2():
    return {
        "nome": "Escala 4x2",
        "tipo": TIPO_ESCALA_PADRAO,
        "dias_trabalho": 4,
        "dias_folga": 2
    }


def criar_modelo_12x36():
    return {
        "nome": "Escala 12x36",
        "tipo": TIPO_CICLO_HORAS,
        "horas_trabalho": 12,
        "horas_folga": 36
    }


def criar_modelo_turno_rotativo_simples():
    sequencia_turnos = montar_sequencia_por_blocos([
        ("Manhã", 2),
        ("Tarde", 2),
        ("Noite", 2),
        ("Folga", 2)
    ])

    return {
        "nome": "Turno rotativo simples",
        "tipo": TIPO_TURNO_ROTATIVO,
        "sequencia_turnos": sequencia_turnos
    }


def criar_modelo_escala_real_24_dias():
    sequencia_turnos = montar_sequencia_por_blocos([
        ("Tarde", 3),
        ("Noite", 3),
        ("Folga", 3),
        ("Tarde", 3),
        ("Noite", 3),
        ("Folga", 2),
        ("Manhã", 6),
        ("Folga", 1)
    ])

    return {
        "nome": "Minha escala real 24 dias",
        "tipo": TIPO_TURNO_ROTATIVO,
        "sequencia_turnos": sequencia_turnos
    }


def listar_modelos_escala():
    return [
        criar_modelo_6x3(),
        criar_modelo_5x2(),
        criar_modelo_4x2(),
        criar_modelo_12x36(),
        criar_modelo_turno_rotativo_simples(),
        criar_modelo_escala_real_24_dias()
    ]