from fastapi.testclient import TestClient

from api.app import app


client = TestClient(app)


def test_health_deve_retornar_status_ok():
    response = client.get("/health")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "ok"
    assert data["version"] == "0.11.0"
    assert "Simulador de Escala de Trabalho" in data["message"]