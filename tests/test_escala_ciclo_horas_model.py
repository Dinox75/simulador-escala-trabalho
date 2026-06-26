import pytest

from tipos_escala import TIPO_CICLO_HORAS
from models.escala_base import EscalaBase
from models.escala_ciclo_horas import EscalaCicloHoras


def test_deve_criar_escala_ciclo_horas():
    escala = EscalaCicloHoras("Escala 12x36", 12, 36)

    assert escala.nome == "Escala 12x36"
    assert escala.tipo == TIPO_CICLO_HORAS
    assert escala.horas_trabalho == 12
    assert escala.horas_folga == 36
    assert isinstance(escala, EscalaBase)


def test_deve_retornar_resumo_da_escala_ciclo_horas():
    escala = EscalaCicloHoras("Escala 12x36", 12, 36)

    assert escala.obter_resumo() == "12x36 horas"


def test_deve_converter_escala_ciclo_horas_para_dict():
    escala = EscalaCicloHoras("Escala 12x36", 12, 36)

    resultado = escala.to_dict()

    assert resultado == {
        "nome": "Escala 12x36",
        "tipo": TIPO_CICLO_HORAS,
        "horas_trabalho": 12,
        "horas_folga": 36
    }


def test_deve_criar_escala_ciclo_horas_a_partir_de_dict():
    dados = {
        "nome": "Escala 12x36",
        "tipo": TIPO_CICLO_HORAS,
        "horas_trabalho": 12,
        "horas_folga": 36
    }

    escala = EscalaCicloHoras.from_dict(dados)

    assert escala.nome == "Escala 12x36"
    assert escala.tipo == TIPO_CICLO_HORAS
    assert escala.horas_trabalho == 12
    assert escala.horas_folga == 36
    assert isinstance(escala, EscalaBase)


def test_deve_lancar_erro_quando_nome_for_vazio():
    with pytest.raises(ValueError):
        EscalaCicloHoras("", 12, 36)


def test_deve_lancar_erro_quando_horas_trabalho_for_invalido():
    with pytest.raises(ValueError):
        EscalaCicloHoras("Escala inválida", 0, 36)


def test_deve_lancar_erro_quando_horas_folga_for_invalido():
    with pytest.raises(ValueError):
        EscalaCicloHoras("Escala inválida", 12, 0)