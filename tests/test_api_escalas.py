from fastapi.testclient import TestClient

from api.app import app


client = TestClient(app)


def test_listar_escalas_salvas_deve_retornar_status_200():
    response = client.get("/api/v1/escalas")

    assert response.status_code == 200


def test_listar_escalas_salvas_deve_retornar_total_e_lista():
    response = client.get("/api/v1/escalas")

    data = response.json()

    assert "total" in data
    assert "escalas" in data
    assert isinstance(data["total"], int)
    assert isinstance(data["escalas"], list)