import pytest

from tipos_escala import TIPO_TURNO_ROTATIVO
from models.escala_base import EscalaBase
from models.escala_turno_rotativo import EscalaTurnoRotativo


def test_deve_criar_escala_turno_rotativo():
    escala = EscalaTurnoRotativo(
        "Turno rotativo",
        ["Manhã", "Tarde", "Noite", "Folga"]
    )

    assert escala.nome == "Turno rotativo"
    assert escala.tipo == TIPO_TURNO_ROTATIVO
    assert escala.sequencia_turnos == ["Manhã", "Tarde", "Noite", "Folga"]
    assert isinstance(escala, EscalaBase)


def test_deve_retornar_resumo_da_escala_turno_rotativo():
    escala = EscalaTurnoRotativo(
        "Turno rotativo",
        ["Manhã", "Tarde", "Noite", "Folga"]
    )

    assert escala.obter_resumo() == "Manhã -> Tarde -> Noite -> Folga"


def test_deve_retornar_total_de_dias_do_ciclo():
    escala = EscalaTurnoRotativo(
        "Turno rotativo",
        ["Manhã", "Tarde", "Noite", "Folga"]
    )

    assert escala.obter_total_dias_ciclo() == 4


def test_deve_converter_escala_turno_rotativo_para_dict():
    escala = EscalaTurnoRotativo(
        "Turno rotativo",
        ["Manhã", "Tarde", "Noite", "Folga"]
    )

    resultado = escala.to_dict()

    assert resultado == {
        "nome": "Turno rotativo",
        "tipo": TIPO_TURNO_ROTATIVO,
        "sequencia_turnos": ["Manhã", "Tarde", "Noite", "Folga"]
    }


def test_deve_criar_escala_turno_rotativo_a_partir_de_dict():
    dados = {
        "nome": "Turno rotativo",
        "tipo": TIPO_TURNO_ROTATIVO,
        "sequencia_turnos": ["Manhã", "Tarde", "Noite", "Folga"]
    }

    escala = EscalaTurnoRotativo.from_dict(dados)

    assert escala.nome == "Turno rotativo"
    assert escala.tipo == TIPO_TURNO_ROTATIVO
    assert escala.sequencia_turnos == ["Manhã", "Tarde", "Noite", "Folga"]
    assert isinstance(escala, EscalaBase)


def test_deve_lancar_erro_quando_nome_for_vazio():
    with pytest.raises(ValueError):
        EscalaTurnoRotativo("", ["Manhã", "Tarde"])


def test_deve_lancar_erro_quando_sequencia_for_vazia():
    with pytest.raises(ValueError):
        EscalaTurnoRotativo("Turno inválido", [])


def test_deve_lancar_erro_quando_sequencia_nao_for_lista():
    with pytest.raises(ValueError):
        EscalaTurnoRotativo("Turno inválido", "Manhã,Tarde")


def test_deve_lancar_erro_quando_turno_for_invalido():
    with pytest.raises(ValueError):
        EscalaTurnoRotativo("Turno inválido", ["Manhã", "Madrugada"])