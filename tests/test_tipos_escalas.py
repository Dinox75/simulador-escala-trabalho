from tipos_escala import (
    TIPO_CICLO_DIAS,
    TIPO_CICLO_HORAS,
    TIPO_TURNO_ROTATIVO,
    validar_tipo_escala,
    obter_nome_tipo
)


def test_validar_tipo_escala_ciclo_dias():
    assert validar_tipo_escala(TIPO_CICLO_DIAS) is True


def test_validar_tipo_escala_ciclo_horas():
    assert validar_tipo_escala(TIPO_CICLO_HORAS) is True


def test_validar_tipo_escala_turno_rotativo():
    assert validar_tipo_escala(TIPO_TURNO_ROTATIVO) is True


def test_validar_tipo_escala_invalido():
    assert validar_tipo_escala("tipo_errado") is False


def test_obter_nome_tipo_ciclo_dias():
    assert obter_nome_tipo(TIPO_CICLO_DIAS) == "Ciclo por dias"


def test_obter_nome_tipo_ciclo_horas():
    assert obter_nome_tipo(TIPO_CICLO_HORAS) == "Ciclo por horas"


def test_obter_nome_tipo_turno_rotativo():
    assert obter_nome_tipo(TIPO_TURNO_ROTATIVO) == "Turno rotativo"


def test_obter_nome_tipo_invalido_retorna_padrao():
    assert obter_nome_tipo("tipo_errado") == "Ciclo por dias"