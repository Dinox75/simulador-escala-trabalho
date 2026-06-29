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


def test_criar_escala_ciclo_dias_deve_retornar_status_201():
    payload = {
        "nome": "Escala API Teste 6x3",
        "tipo": "ciclo_dias",
        "dias_trabalho": 6,
        "dias_folga": 3
    }

    client.delete("/api/v1/escalas/Escala API Teste 6x3")
    response = client.post("/api/v1/escalas", json=payload)

    assert response.status_code == 201

    data = response.json()

    assert data["message"] == "Escala criada com sucesso."
    assert data["escala"]["nome"] == "Escala API Teste 6x3"
    assert data["escala"]["tipo"] == "ciclo_dias"


def test_criar_escala_ciclo_horas_deve_retornar_status_201():
    payload = {
        "nome": "Escala API Teste 13x37",
        "tipo": "ciclo_horas",
        "horas_trabalho": 13,
        "horas_folga": 37
    }

    client.delete("/api/v1/escalas/Escala API Teste 13x37")
    response = client.post("/api/v1/escalas", json=payload)

    assert response.status_code == 201

    data = response.json()

    assert data["escala"]["nome"] == "Escala API Teste 13x37"
    assert data["escala"]["tipo"] == "ciclo_horas"


def test_criar_escala_turno_rotativo_deve_retornar_status_201():
    payload = {
        "nome": "Escala API Teste Turno",
        "tipo": "turno_rotativo",
        "sequencia_turnos": ["Manhã", "Tarde", "Noite", "Folga"]
    }

    client.delete("/api/v1/escalas/Escala API Teste Turno")
    response = client.post("/api/v1/escalas", json=payload)

    assert response.status_code == 201

    data = response.json()

    assert data["escala"]["nome"] == "Escala API Teste Turno"
    assert data["escala"]["tipo"] == "turno_rotativo"


def test_criar_escala_deve_retornar_400_para_tipo_invalido():
    payload = {
        "nome": "Escala Inválida",
        "tipo": "tipo_inexistente"
    }

    response = client.post("/api/v1/escalas", json=payload)

    assert response.status_code == 400


def test_criar_escala_ciclo_dias_deve_exigir_campos_obrigatorios():
    payload = {
        "nome": "Escala Incompleta",
        "tipo": "ciclo_dias"
    }

    response = client.post("/api/v1/escalas", json=payload)

    assert response.status_code == 400


def test_criar_escala_ciclo_dias_deve_retornar_status_201():
    payload = {
        "nome": "Escala API Teste 21x8",
        "tipo": "ciclo_dias",
        "dias_trabalho": 21,
        "dias_folga": 8
    }

    client.delete("/api/v1/escalas/Escala API Teste 21x8")
    response = client.post("/api/v1/escalas", json=payload)

    assert response.status_code == 201

    data = response.json()

    assert data["message"] == "Escala criada com sucesso."
    assert data["escala"]["nome"] == "Escala API Teste 21x8"
    assert data["escala"]["tipo"] == "ciclo_dias"