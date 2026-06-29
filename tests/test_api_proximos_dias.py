from fastapi.testclient import TestClient

from api.app import app


client = TestClient(app)


def test_consultar_proximos_dias_6x3_deve_retornar_status_200():
    payload = {
        "modelo_id": "6x3",
        "data_inicio": "01/07/2026",
        "quantidade_dias": 10
    }

    response = client.post("/api/v1/simulacao/proximos-dias", json=payload)

    assert response.status_code == 200


def test_consultar_proximos_dias_6x3_deve_retornar_quantidade_correta():
    payload = {
        "modelo_id": "6x3",
        "data_inicio": "01/07/2026",
        "quantidade_dias": 10
    }

    response = client.post("/api/v1/simulacao/proximos-dias", json=payload)

    data = response.json()

    assert data["modelo_id"] == "6x3"
    assert data["quantidade_dias"] == 10
    assert len(data["dias"]) == 10


def test_consultar_proximos_dias_6x3_deve_retornar_trabalho_e_folga():
    payload = {
        "modelo_id": "6x3",
        "data_inicio": "01/07/2026",
        "quantidade_dias": 10
    }

    response = client.post("/api/v1/simulacao/proximos-dias", json=payload)

    data = response.json()

    assert data["dias"][0]["data"] == "01/07/2026"
    assert data["dias"][0]["status"] == "Trabalhando"

    assert data["dias"][6]["data"] == "07/07/2026"
    assert data["dias"][6]["status"] == "Folga"


def test_consultar_proximos_dias_12x36_deve_retornar_lista_com_hora():
    payload = {
        "modelo_id": "12x36",
        "data_inicio": "01/07/2026",
        "hora_inicio": "07:00",
        "hora_consulta": "10:00",
        "quantidade_dias": 2
    }

    response = client.post("/api/v1/simulacao/proximos-dias", json=payload)

    assert response.status_code == 200

    data = response.json()

    assert data["modelo_id"] == "12x36"
    assert len(data["dias"]) == 2
    assert data["dias"][0]["hora_consulta"] == "10:00"


def test_consultar_proximos_dias_deve_retornar_404_para_modelo_inexistente():
    payload = {
        "modelo_id": "modelo_inexistente",
        "data_inicio": "01/07/2026",
        "quantidade_dias": 10
    }

    response = client.post("/api/v1/simulacao/proximos-dias", json=payload)

    assert response.status_code == 404


def test_consultar_proximos_dias_deve_retornar_400_para_data_invalida():
    payload = {
        "modelo_id": "6x3",
        "data_inicio": "2026-07-01",
        "quantidade_dias": 10
    }

    response = client.post("/api/v1/simulacao/proximos-dias", json=payload)

    assert response.status_code == 400


def test_consultar_proximos_dias_12x36_deve_exigir_hora_inicio():
    payload = {
        "modelo_id": "12x36",
        "data_inicio": "01/07/2026",
        "quantidade_dias": 2
    }

    response = client.post("/api/v1/simulacao/proximos-dias", json=payload)

    assert response.status_code == 400