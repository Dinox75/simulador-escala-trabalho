from models.escala_factory import (
    criar_escala_a_partir_de_dict,
    converter_escalas_para_objetos,
    converter_escalas_para_dict
)

from models.escala_ciclo_dias import EscalaCicloDias
from models.escala_ciclo_horas import EscalaCicloHoras
from models.escala_turno_rotativo import EscalaTurnoRotativo

from tipos_escala import (
    TIPO_ESCALA_PADRAO,
    TIPO_CICLO_HORAS,
    TIPO_TURNO_ROTATIVO
)


def test_criar_escala_ciclo_dias_a_partir_de_dict():
    dados = {
        "nome": "Escala 6x3",
        "tipo": TIPO_ESCALA_PADRAO,
        "dias_trabalho": 6,
        "dias_folga": 3
    }

    escala = criar_escala_a_partir_de_dict(dados)

    assert isinstance(escala, EscalaCicloDias)
    assert escala.nome == "Escala 6x3"
    assert escala.dias_trabalho == 6
    assert escala.dias_folga == 3


def test_criar_escala_ciclo_horas_a_partir_de_dict():
    dados = {
        "nome": "Escala 12x36",
        "tipo": TIPO_CICLO_HORAS,
        "horas_trabalho": 12,
        "horas_folga": 36
    }

    escala = criar_escala_a_partir_de_dict(dados)

    assert isinstance(escala, EscalaCicloHoras)
    assert escala.nome == "Escala 12x36"
    assert escala.horas_trabalho == 12
    assert escala.horas_folga == 36


def test_criar_escala_turno_rotativo_a_partir_de_dict():
    dados = {
        "nome": "Turno rotativo simples",
        "tipo": TIPO_TURNO_ROTATIVO,
        "sequencia_turnos": ["Manhã", "Tarde", "Noite", "Folga"]
    }

    escala = criar_escala_a_partir_de_dict(dados)

    assert isinstance(escala, EscalaTurnoRotativo)
    assert escala.nome == "Turno rotativo simples"
    assert escala.sequencia_turnos == ["Manhã", "Tarde", "Noite", "Folga"]


def test_criar_escala_sem_tipo_usa_ciclo_dias_como_padrao():
    dados = {
        "nome": "Escala antiga 6x3",
        "dias_trabalho": 6,
        "dias_folga": 3
    }

    escala = criar_escala_a_partir_de_dict(dados)

    assert isinstance(escala, EscalaCicloDias)
    assert escala.tipo == TIPO_ESCALA_PADRAO


def test_converter_lista_de_dicts_para_objetos():
    dados = [
        {
            "nome": "Escala 6x3",
            "tipo": TIPO_ESCALA_PADRAO,
            "dias_trabalho": 6,
            "dias_folga": 3
        },
        {
            "nome": "Escala 12x36",
            "tipo": TIPO_CICLO_HORAS,
            "horas_trabalho": 12,
            "horas_folga": 36
        },
        {
            "nome": "Turno rotativo simples",
            "tipo": TIPO_TURNO_ROTATIVO,
            "sequencia_turnos": ["Manhã", "Tarde", "Noite", "Folga"]
        }
    ]

    escalas = converter_escalas_para_objetos(dados)

    assert isinstance(escalas[0], EscalaCicloDias)
    assert isinstance(escalas[1], EscalaCicloHoras)
    assert isinstance(escalas[2], EscalaTurnoRotativo)


def test_converter_lista_de_objetos_para_dicts():
    escalas = [
        EscalaCicloDias("Escala 6x3", 6, 3),
        EscalaCicloHoras("Escala 12x36", 12, 36),
        EscalaTurnoRotativo("Turno rotativo simples", ["Manhã", "Tarde", "Noite", "Folga"])
    ]

    resultado = converter_escalas_para_dict(escalas)

    assert resultado == [
        {
            "nome": "Escala 6x3",
            "tipo": TIPO_ESCALA_PADRAO,
            "dias_trabalho": 6,
            "dias_folga": 3
        },
        {
            "nome": "Escala 12x36",
            "tipo": TIPO_CICLO_HORAS,
            "horas_trabalho": 12,
            "horas_folga": 36
        },
        {
            "nome": "Turno rotativo simples",
            "tipo": TIPO_TURNO_ROTATIVO,
            "sequencia_turnos": ["Manhã", "Tarde", "Noite", "Folga"]
        }
    ]