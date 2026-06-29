from fastapi.testclient import TestClient

from api.app import app


client = TestClient(app)


def test_consultar_status_6x3_deve_retornar_trabalhando():
    payload = {
        "modelo_id": "6x3",
        "data_inicio": "01/07/2026",
        "data_consulta": "01/07/2026"
    }

    response = client.post("/api/v1/simulacao/status", json=payload)

    assert response.status_code == 200

    data = response.json()

    assert data["modelo_id"] == "6x3"
    assert data["status"] == "Trabalhando"


def test_consultar_status_6x3_deve_retornar_folga():
    payload = {
        "modelo_id": "6x3",
        "data_inicio": "01/07/2026",
        "data_consulta": "07/07/2026"
    }

    response = client.post("/api/v1/simulacao/status", json=payload)

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "Folga"


def test_consultar_status_12x36_deve_retornar_status():
    payload = {
        "modelo_id": "12x36",
        "data_inicio": "01/07/2026",
        "hora_inicio": "07:00",
        "data_consulta": "01/07/2026",
        "hora_consulta": "10:00"
    }

    response = client.post("/api/v1/simulacao/status", json=payload)

    assert response.status_code == 200

    data = response.json()

    assert data["modelo_id"] == "12x36"
    assert data["status"] == "Trabalhando"


def test_consultar_status_deve_retornar_404_para_modelo_inexistente():
    payload = {
        "modelo_id": "modelo_inexistente",
        "data_inicio": "01/07/2026",
        "data_consulta": "01/07/2026"
    }

    response = client.post("/api/v1/simulacao/status", json=payload)

    assert response.status_code == 404


def test_consultar_status_deve_retornar_400_para_data_invalida():
    payload = {
        "modelo_id": "6x3",
        "data_inicio": "2026-07-01",
        "data_consulta": "01/07/2026"
    }

    response = client.post("/api/v1/simulacao/status", json=payload)

    assert response.status_code == 400


def test_consultar_status_12x36_deve_exigir_horas():
    payload = {
        "modelo_id": "12x36",
        "data_inicio": "01/07/2026",
        "data_consulta": "01/07/2026"
    }

    response = client.post("/api/v1/simulacao/status", json=payload)

    assert response.status_code == 400