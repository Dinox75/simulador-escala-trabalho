import modelos_escala

from tipos_escala import (
    TIPO_ESCALA_PADRAO,
    TIPO_CICLO_HORAS,
    TIPO_TURNO_ROTATIVO
)


def test_criar_modelo_6x3():
    escala = modelos_escala.criar_modelo_6x3()

    assert escala["nome"] == "Escala 6x3"
    assert escala["tipo"] == TIPO_ESCALA_PADRAO
    assert escala["dias_trabalho"] == 6
    assert escala["dias_folga"] == 3


def test_criar_modelo_5x2():
    escala = modelos_escala.criar_modelo_5x2()

    assert escala["nome"] == "Escala 5x2"
    assert escala["tipo"] == TIPO_ESCALA_PADRAO
    assert escala["dias_trabalho"] == 5
    assert escala["dias_folga"] == 2


def test_criar_modelo_12x36():
    escala = modelos_escala.criar_modelo_12x36()

    assert escala["nome"] == "Escala 12x36"
    assert escala["tipo"] == TIPO_CICLO_HORAS
    assert escala["horas_trabalho"] == 12
    assert escala["horas_folga"] == 36


def test_criar_modelo_turno_rotativo_simples():
    escala = modelos_escala.criar_modelo_turno_rotativo_simples()

    assert escala["nome"] == "Turno rotativo simples"
    assert escala["tipo"] == TIPO_TURNO_ROTATIVO
    assert escala["sequencia_turnos"] == [
        "Manhã", "Manhã",
        "Tarde", "Tarde",
        "Noite", "Noite",
        "Folga", "Folga"
    ]


def test_criar_modelo_escala_real_24_dias():
    escala = modelos_escala.criar_modelo_escala_real_24_dias()

    assert escala["nome"] == "Minha escala real 24 dias"
    assert escala["tipo"] == TIPO_TURNO_ROTATIVO
    assert len(escala["sequencia_turnos"]) == 24


def test_escala_real_24_dias_tem_quantidade_correta_de_turnos():
    escala = modelos_escala.criar_modelo_escala_real_24_dias()
    sequencia = escala["sequencia_turnos"]

    assert sequencia.count("Tarde") == 6
    assert sequencia.count("Noite") == 6
    assert sequencia.count("Manhã") == 6
    assert sequencia.count("Folga") == 6


def test_escala_real_24_dias_tem_ordem_correta():
    escala = modelos_escala.criar_modelo_escala_real_24_dias()

    assert escala["sequencia_turnos"] == [
        "Tarde", "Tarde", "Tarde",
        "Noite", "Noite", "Noite",
        "Folga", "Folga", "Folga",
        "Tarde", "Tarde", "Tarde",
        "Noite", "Noite", "Noite",
        "Folga", "Folga",
        "Manhã", "Manhã", "Manhã", "Manhã", "Manhã", "Manhã",
        "Folga"
    ]


def test_listar_modelos_escala():
    modelos = modelos_escala.listar_modelos_escala()

    assert len(modelos) == 6
    assert modelos[0]["nome"] == "Escala 6x3"
    assert modelos[1]["nome"] == "Escala 5x2"
    assert modelos[2]["nome"] == "Escala 4x2"
    assert modelos[3]["nome"] == "Escala 12x36"
    assert modelos[4]["nome"] == "Turno rotativo simples"
    assert modelos[5]["nome"] == "Minha escala real 24 dias"