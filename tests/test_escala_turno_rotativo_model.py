from models.escala_turno_rotativo import EscalaTurnoRotativo
from tipos_escala import TIPO_TURNO_ROTATIVO
import pytest

def test_cria_escala_turno_rotativo():
    sequencia = ["Manhã", "Tarde", "Noite", "Folga"]

    escala = EscalaTurnoRotativo("Turno rotativo simples", sequencia)

    assert escala.nome == "Turno rotativo simples"
    assert escala.tipo == TIPO_TURNO_ROTATIVO
    assert escala.sequencia_turnos == sequencia


def test_obter_resumo_escala_turno_rotativo():
    sequencia = ["Manhã", "Tarde", "Noite", "Folga"]

    escala = EscalaTurnoRotativo("Turno rotativo simples", sequencia)

    assert escala.obter_resumo() == "Manhã -> Tarde -> Noite -> Folga"


def test_obter_total_dias_ciclo_turno_rotativo():
    sequencia = ["Manhã", "Tarde", "Noite", "Folga"]

    escala = EscalaTurnoRotativo("Turno rotativo simples", sequencia)

    assert escala.obter_total_dias_ciclo() == 4


def test_converter_escala_turno_rotativo_para_dict():
    sequencia = ["Tarde", "Tarde", "Noite", "Folga"]

    escala = EscalaTurnoRotativo("Escala teste", sequencia)

    resultado = escala.to_dict()

    assert resultado == {
        "nome": "Escala teste",
        "tipo": TIPO_TURNO_ROTATIVO,
        "sequencia_turnos": sequencia
    }


def test_criar_escala_turno_rotativo_a_partir_de_dict():
    dados = {
        "nome": "Escala real 24 dias",
        "tipo": TIPO_TURNO_ROTATIVO,
        "sequencia_turnos": [
            "Tarde", "Tarde", "Tarde",
            "Noite", "Noite", "Noite",
            "Folga", "Folga", "Folga",
            "Tarde", "Tarde", "Tarde",
            "Noite", "Noite", "Noite",
            "Folga", "Folga",
            "Manhã", "Manhã", "Manhã", "Manhã", "Manhã", "Manhã",
            "Folga"
        ]
    }

    escala = EscalaTurnoRotativo.from_dict(dados)

    assert escala.nome == "Escala real 24 dias"
    assert escala.tipo == TIPO_TURNO_ROTATIVO
    assert escala.sequencia_turnos == dados["sequencia_turnos"]
    assert escala.obter_total_dias_ciclo() == 24


def test_escala_turno_rotativo_real_tem_quantidade_correta_de_turnos():
    sequencia = [
        "Tarde", "Tarde", "Tarde",
        "Noite", "Noite", "Noite",
        "Folga", "Folga", "Folga",
        "Tarde", "Tarde", "Tarde",
        "Noite", "Noite", "Noite",
        "Folga", "Folga",
        "Manhã", "Manhã", "Manhã", "Manhã", "Manhã", "Manhã",
        "Folga"
    ]

    escala = EscalaTurnoRotativo("Escala real 24 dias", sequencia)

    assert escala.sequencia_turnos.count("Tarde") == 6
    assert escala.sequencia_turnos.count("Noite") == 6
    assert escala.sequencia_turnos.count("Manhã") == 6
    assert escala.sequencia_turnos.count("Folga") == 6

def test_escala_turno_rotativo_nao_aceita_nome_vazio():
    with pytest.raises(ValueError):
        EscalaTurnoRotativo("", ["Manhã", "Folga"])


def test_escala_turno_rotativo_nao_aceita_sequencia_vazia():
    with pytest.raises(ValueError):
        EscalaTurnoRotativo("Escala inválida", [])


def test_escala_turno_rotativo_nao_aceita_turno_invalido():
    with pytest.raises(ValueError):
        EscalaTurnoRotativo("Escala inválida", ["Manhã", "Madrugada", "Folga"])