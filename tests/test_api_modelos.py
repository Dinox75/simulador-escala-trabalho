from fastapi.testclient import TestClient

from api.app import app


client = TestClient(app)


def test_listar_modelos_deve_retornar_status_200():
    response = client.get("/api/v1/modelos")

    assert response.status_code == 200


def test_listar_modelos_deve_retornar_lista_de_modelos():
    response = client.get("/api/v1/modelos")

    data = response.json()

    assert "modelos" in data
    assert isinstance(data["modelos"], list)
    assert len(data["modelos"]) >= 1


def test_listar_modelos_deve_conter_modelo_6x3():
    response = client.get("/api/v1/modelos")

    data = response.json()
    ids_modelos = [modelo["id"] for modelo in data["modelos"]]

    assert "6x3" in ids_modelos


def test_listar_modelos_deve_conter_modelo_12x36():
    response = client.get("/api/v1/modelos")

    data = response.json()
    ids_modelos = [modelo["id"] for modelo in data["modelos"]]

    assert "12x36" in ids_modelos


def test_modelos_devem_ter_campos_esperados():
    response = client.get("/api/v1/modelos")

    data = response.json()
    primeiro_modelo = data["modelos"][0]

    assert "id" in primeiro_modelo
    assert "nome" in primeiro_modelo
    assert "tipo" in primeiro_modelo
    assert "descricao" in primeiro_modelo