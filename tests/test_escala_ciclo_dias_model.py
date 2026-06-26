import pytest

from tipos_escala import TIPO_ESCALA_PADRAO
from models.escala_base import EscalaBase
from models.escala_ciclo_dias import EscalaCicloDias


def test_deve_criar_escala_ciclo_dias():
    escala = EscalaCicloDias("Escala 6x3", 6, 3)

    assert escala.nome == "Escala 6x3"
    assert escala.tipo == TIPO_ESCALA_PADRAO
    assert escala.dias_trabalho == 6
    assert escala.dias_folga == 3
    assert isinstance(escala, EscalaBase)


def test_deve_retornar_resumo_da_escala_ciclo_dias():
    escala = EscalaCicloDias("Escala 6x3", 6, 3)

    assert escala.obter_resumo() == "6x3 dias"


def test_deve_converter_escala_ciclo_dias_para_dict():
    escala = EscalaCicloDias("Escala 6x3", 6, 3)

    resultado = escala.to_dict()

    assert resultado == {
        "nome": "Escala 6x3",
        "tipo": TIPO_ESCALA_PADRAO,
        "dias_trabalho": 6,
        "dias_folga": 3
    }


def test_deve_criar_escala_ciclo_dias_a_partir_de_dict():
    dados = {
        "nome": "Escala 6x3",
        "tipo": TIPO_ESCALA_PADRAO,
        "dias_trabalho": 6,
        "dias_folga": 3
    }

    escala = EscalaCicloDias.from_dict(dados)

    assert escala.nome == "Escala 6x3"
    assert escala.tipo == TIPO_ESCALA_PADRAO
    assert escala.dias_trabalho == 6
    assert escala.dias_folga == 3
    assert isinstance(escala, EscalaBase)


def test_deve_lancar_erro_quando_nome_for_vazio():
    with pytest.raises(ValueError):
        EscalaCicloDias("", 6, 3)


def test_deve_lancar_erro_quando_dias_trabalho_for_invalido():
    with pytest.raises(ValueError):
        EscalaCicloDias("Escala inválida", 0, 3)


def test_deve_lancar_erro_quando_dias_folga_for_invalido():
    with pytest.raises(ValueError):
        EscalaCicloDias("Escala inválida", 6, 0)