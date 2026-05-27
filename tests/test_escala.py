from datetime import date

import pytest

from escala import (
    calcular_status,
    gerar_proximos_dias,
    calcular_status_por_escala,
    gerar_proximos_dias_por_escala
)

from tipos_escala import (
    TIPO_CICLO_DIAS,
    TIPO_CICLO_HORAS,
    TIPO_TURNO_ROTATIVO
)


def test_calcular_status_primeiro_dia_de_trabalho():
    data_inicio = date(2026, 5, 1)
    data_consulta = date(2026, 5, 1)

    resultado = calcular_status(
        data_inicio,
        data_consulta,
        6,
        3
    )

    assert resultado == "Trabalhando"


def test_calcular_status_primeiro_dia_de_folga():
    data_inicio = date(2026, 5, 1)
    data_consulta = date(2026, 5, 7)

    resultado = calcular_status(
        data_inicio,
        data_consulta,
        6,
        3
    )

    assert resultado == "Folga"


def test_gerar_proximos_dias():
    data_inicio = date(2026, 5, 1)

    resultado = gerar_proximos_dias(
        data_inicio,
        10,
        6,
        3
    )

    assert len(resultado) == 10
    assert resultado[0]["data"] == date(2026, 5, 1)
    assert resultado[5]["status"] == "Trabalhando"
    assert resultado[6]["data"] == date(2026, 5, 7)
    assert resultado[8]["status"] == "Folga"


def test_calcular_status_por_escala_ciclo_dias():
    escala = {
        "nome": "Escala teste 6x3",
        "tipo": TIPO_CICLO_DIAS,
        "dias_trabalho": 6,
        "dias_folga": 3
    }

    data_inicio = date(2026, 5, 1)
    data_consulta = date(2026, 5, 7)

    resultado = calcular_status_por_escala(
        escala,
        data_inicio,
        data_consulta
    )

    assert resultado == "Folga"


def test_gerar_proximos_dias_por_escala_ciclo_dias():
    escala = {
        "nome": "Escala teste 6x3",
        "tipo": TIPO_CICLO_DIAS,
        "dias_trabalho": 6,
        "dias_folga": 3
    }

    data_inicio = date(2026, 5, 1)

    resultado = gerar_proximos_dias_por_escala(
        escala,
        data_inicio,
        10
    )

    assert len(resultado) == 10
    assert resultado[0]["data"] == date(2026, 5, 1)
    assert resultado[0]["status"] == "Trabalhando"
    assert resultado[6]["data"] == date(2026, 5, 7)
    assert resultado[6]["status"] == "Folga"


def test_calcular_status_por_escala_ciclo_horas_ainda_nao_implementado():
    escala = {
        "nome": "Escala teste 12x36",
        "tipo": TIPO_CICLO_HORAS
    }

    data_inicio = date(2026, 5, 1)
    data_consulta = date(2026, 5, 2)

    with pytest.raises(NotImplementedError):
        calcular_status_por_escala(
            escala,
            data_inicio,
            data_consulta
        )


def test_gerar_proximos_dias_por_escala_turno_rotativo_ainda_nao_implementado():
    escala = {
        "nome": "Escala turno rotativo",
        "tipo": TIPO_TURNO_ROTATIVO
    }

    data_inicio = date(2026, 5, 1)

    with pytest.raises(NotImplementedError):
        gerar_proximos_dias_por_escala(
            escala,
            data_inicio,
            10
        )