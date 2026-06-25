from models.escala_ciclo_horas import EscalaCicloHoras
from tipos_escala import TIPO_CICLO_HORAS
import pytest

def test_cria_escala_ciclo_horas():
    escala = EscalaCicloHoras("Escala 12x36", 12, 36)

    assert escala.nome == "Escala 12x36"
    assert escala.horas_trabalho == 12
    assert escala.horas_folga == 36
    assert escala.tipo == TIPO_CICLO_HORAS


def test_obter_resumo_escala_ciclo_horas():
    escala = EscalaCicloHoras("Escala 24x72", 24, 72)

    assert escala.obter_resumo() == "24x72 horas"


def test_converter_escala_ciclo_horas_para_dict():
    escala = EscalaCicloHoras("Escala 12x36", 12, 36)

    resultado = escala.to_dict()

    assert resultado == {
        "nome": "Escala 12x36",
        "tipo": TIPO_CICLO_HORAS,
        "horas_trabalho": 12,
        "horas_folga": 36
    }


def test_criar_escala_ciclo_horas_a_partir_de_dict():
    dados = {
        "nome": "Escala 18x36",
        "tipo": TIPO_CICLO_HORAS,
        "horas_trabalho": 18,
        "horas_folga": 36
    }

    escala = EscalaCicloHoras.from_dict(dados)

    assert escala.nome == "Escala 18x36"
    assert escala.tipo == TIPO_CICLO_HORAS
    assert escala.horas_trabalho == 18
    assert escala.horas_folga == 36

def test_escala_ciclo_horas_nao_aceita_nome_vazio():
    with pytest.raises(ValueError):
        EscalaCicloHoras("", 12, 36)


def test_escala_ciclo_horas_nao_aceita_horas_trabalho_invalidas():
    with pytest.raises(ValueError):
        EscalaCicloHoras("Escala inválida", 0, 36)


def test_escala_ciclo_horas_nao_aceita_horas_folga_invalidas():
    with pytest.raises(ValueError):
        EscalaCicloHoras("Escala inválida", 12, -36)