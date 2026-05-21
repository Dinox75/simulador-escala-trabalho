from datetime import date

from escala import calcular_status, gerar_proximos_dias


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
    assert resultado[0]['data'] == date(2026, 5, 1)
    assert resultado[5]['status'] == "Trabalhando"
    assert resultado[6]['data'] == date(2026, 5, 7)
    assert resultado[8]['status'] == "Folga"