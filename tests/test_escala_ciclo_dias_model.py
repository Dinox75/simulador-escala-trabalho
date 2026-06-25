from models.escala_ciclo_dias import EscalaCicloDias
from tipos_escala import TIPO_ESCALA_PADRAO
import pytest


def test_cria_escala_ciclo_dias():
    escala = EscalaCicloDias("Escala 6x3", 6, 3)

    assert escala.nome == "Escala 6x3"
    assert escala.dias_trabalho == 6
    assert escala.dias_folga == 3
    assert escala.tipo == TIPO_ESCALA_PADRAO


def test_obter_resumo_escala_ciclo_dias():
    escala = EscalaCicloDias("Escala 5x2", 5, 2)

    assert escala.obter_resumo() == "5x2 dias"


def test_converter_escala_ciclo_dias_para_dict():
    escala = EscalaCicloDias("Escala 4x2", 4, 2)

    resultado = escala.to_dict()

    assert resultado == {
        "nome": "Escala 4x2",
        "tipo": TIPO_ESCALA_PADRAO,
        "dias_trabalho": 4,
        "dias_folga": 2
    }


def test_criar_escala_ciclo_dias_a_partir_de_dict():
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

def test_escala_ciclo_dias_nao_aceita_nome_vazio():
    with pytest.raises(ValueError):
        EscalaCicloDias("", 6, 3)


def test_escala_ciclo_dias_nao_aceita_dias_trabalho_invalido():
    with pytest.raises(ValueError):
        EscalaCicloDias("Escala inválida", 0, 3)


def test_escala_ciclo_dias_nao_aceita_dias_folga_invalido():
    with pytest.raises(ValueError):
        EscalaCicloDias("Escala inválida", 6, -1)