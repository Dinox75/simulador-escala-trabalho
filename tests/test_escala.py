from datetime import date, datetime

import pytest

from escala import (
    calcular_status,
    gerar_proximos_dias,
    calcular_status_por_escala,
    gerar_proximos_dias_por_escala,
    calcular_status_ciclo_horas,
    gerar_proximos_periodos_ciclo_horas,
    gerar_proximos_periodos_por_escala,
    converter_data_hora
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

def test_calcular_status_ciclo_horas_dentro_do_periodo_de_trabalho():
    data_hora_inicio = datetime(2026, 6, 1, 6, 0)
    data_hora_consulta = datetime(2026, 6, 1, 10, 0)

    resultado = calcular_status_ciclo_horas(
        data_hora_inicio,
        data_hora_consulta,
        12,
        36
    )

    assert resultado == "Trabalhando"


def test_calcular_status_ciclo_horas_dentro_do_periodo_de_folga():
    data_hora_inicio = datetime(2026, 6, 1, 6, 0)
    data_hora_consulta = datetime(2026, 6, 1, 20, 0)

    resultado = calcular_status_ciclo_horas(
        data_hora_inicio,
        data_hora_consulta,
        12,
        36
    )

    assert resultado == "Folga"


def test_calcular_status_por_escala_ciclo_horas_12x36():
    escala = {
        "nome": "Escala 12x36",
        "tipo": TIPO_CICLO_HORAS,
        "horas_trabalho": 12,
        "horas_folga": 36
    }

    data_hora_inicio = datetime(2026, 6, 1, 6, 0)
    data_hora_consulta = datetime(2026, 6, 3, 6, 0)

    resultado = calcular_status_por_escala(
        escala,
        data_hora_inicio,
        data_hora_consulta
    )

    assert resultado == "Trabalhando"

def test_gerar_proximos_periodos_ciclo_horas_12x36():
    data_hora_inicio = datetime(2026, 6, 1, 6, 0)

    resultado = gerar_proximos_periodos_ciclo_horas(
        data_hora_inicio,
        4,
        12,
        36
    )

    assert len(resultado) == 4

    assert resultado[0]["inicio"] == datetime(2026, 6, 1, 6, 0)
    assert resultado[0]["fim"] == datetime(2026, 6, 1, 18, 0)
    assert resultado[0]["status"] == "Trabalhando"

    assert resultado[1]["inicio"] == datetime(2026, 6, 1, 18, 0)
    assert resultado[1]["fim"] == datetime(2026, 6, 3, 6, 0)
    assert resultado[1]["status"] == "Folga"

    assert resultado[2]["inicio"] == datetime(2026, 6, 3, 6, 0)
    assert resultado[2]["fim"] == datetime(2026, 6, 3, 18, 0)
    assert resultado[2]["status"] == "Trabalhando"

    assert resultado[3]["inicio"] == datetime(2026, 6, 3, 18, 0)
    assert resultado[3]["fim"] == datetime(2026, 6, 5, 6, 0)
    assert resultado[3]["status"] == "Folga"

def test_gerar_proximos_periodos_por_escala_ciclo_horas_12x36():
    escala = {
        "nome": "Escala 12x36",
        "tipo": TIPO_CICLO_HORAS,
        "horas_trabalho": 12,
        "horas_folga": 36
    }

    data_hora_inicio = datetime(2026, 6, 1, 6, 0)

    resultado = gerar_proximos_periodos_por_escala(
        escala,
        data_hora_inicio,
        4
    )

    assert len(resultado) == 4

    assert resultado[0]["inicio"] == datetime(2026, 6, 1, 6, 0)
    assert resultado[0]["fim"] == datetime(2026, 6, 1, 18, 0)
    assert resultado[0]["status"] == "Trabalhando"

    assert resultado[1]["inicio"] == datetime(2026, 6, 1, 18, 0)
    assert resultado[1]["fim"] == datetime(2026, 6, 3, 6, 0)
    assert resultado[1]["status"] == "Folga"

def test_converter_data_hora_valida():
    resultado = converter_data_hora("01/06/2026 06:00")

    assert resultado == datetime(2026, 6, 1, 6, 0)


def test_converter_data_hora_invalida():
    resultado = converter_data_hora("01-06-2026 06:00")

    assert resultado is None