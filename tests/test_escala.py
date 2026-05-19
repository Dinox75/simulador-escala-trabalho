from datetime import date

from escala import calcular_status


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