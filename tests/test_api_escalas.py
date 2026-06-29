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

def test_buscar_escala_por_nome_deve_retornar_status_200():
    payload = {
        "nome": "Escala API Busca 14x5",
        "tipo": "ciclo_dias",
        "dias_trabalho": 14,
        "dias_folga": 5
    }

    client.delete("/api/v1/escalas/Escala API Busca 14x5")
    client.post("/api/v1/escalas", json=payload)

    response = client.get("/api/v1/escalas/Escala API Busca 14x5")

    assert response.status_code == 200

    data = response.json()

    assert data["escala"]["nome"] == "Escala API Busca 14x5"
    assert data["escala"]["tipo"] == "ciclo_dias"

    client.delete("/api/v1/escalas/Escala API Busca 14x5")


def test_buscar_escala_por_nome_inexistente_deve_retornar_404():
    response = client.get("/api/v1/escalas/Escala Inexistente API")

    assert response.status_code == 404

    data = response.json()

    assert data["detail"] == "Escala não encontrada."

def test_editar_escala_deve_retornar_status_200():
    payload_original = {
        "nome": "Escala API Editar Original",
        "tipo": "ciclo_dias",
        "dias_trabalho": 31,
        "dias_folga": 11
    }

    payload_editado = {
        "nome": "Escala API Editada",
        "tipo": "ciclo_dias",
        "dias_trabalho": 32,
        "dias_folga": 12
    }

    client.delete("/api/v1/escalas/Escala API Editar Original")
    client.delete("/api/v1/escalas/Escala API Editada")

    client.post("/api/v1/escalas", json=payload_original)

    response = client.put(
        "/api/v1/escalas/Escala API Editar Original",
        json=payload_editado
    )

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == "Escala editada com sucesso."
    assert data["escala"]["nome"] == "Escala API Editada"
    assert data["escala"]["dias_trabalho"] == 32
    assert data["escala"]["dias_folga"] == 12

    client.delete("/api/v1/escalas/Escala API Editada")


def test_editar_escala_inexistente_deve_retornar_404():
    payload = {
        "nome": "Escala API Editar Inexistente",
        "tipo": "ciclo_dias",
        "dias_trabalho": 41,
        "dias_folga": 13
    }

    response = client.put(
        "/api/v1/escalas/Escala Inexistente Para Editar",
        json=payload
    )

    assert response.status_code == 404

    data = response.json()

    assert data["detail"] == "Escala não encontrada."


def test_editar_escala_deve_retornar_409_para_nome_duplicado():
    payload_a = {
        "nome": "Escala API Editar A",
        "tipo": "ciclo_dias",
        "dias_trabalho": 42,
        "dias_folga": 14
    }

    payload_b = {
        "nome": "Escala API Editar B",
        "tipo": "ciclo_dias",
        "dias_trabalho": 43,
        "dias_folga": 15
    }

    payload_editado = {
        "nome": "Escala API Editar B",
        "tipo": "ciclo_dias",
        "dias_trabalho": 44,
        "dias_folga": 16
    }

    client.delete("/api/v1/escalas/Escala API Editar A")
    client.delete("/api/v1/escalas/Escala API Editar B")

    client.post("/api/v1/escalas", json=payload_a)
    client.post("/api/v1/escalas", json=payload_b)

    response = client.put(
        "/api/v1/escalas/Escala API Editar A",
        json=payload_editado
    )

    assert response.status_code == 409

    data = response.json()

    assert data["detail"] == "Já existe uma escala salva com esse nome."

    client.delete("/api/v1/escalas/Escala API Editar A")
    client.delete("/api/v1/escalas/Escala API Editar B")


def test_editar_escala_deve_retornar_409_para_configuracao_duplicada():
    payload_a = {
        "nome": "Escala API Config A",
        "tipo": "ciclo_dias",
        "dias_trabalho": 45,
        "dias_folga": 17
    }

    payload_b = {
        "nome": "Escala API Config B",
        "tipo": "ciclo_dias",
        "dias_trabalho": 46,
        "dias_folga": 18
    }

    payload_editado = {
        "nome": "Escala API Config A Editada",
        "tipo": "ciclo_dias",
        "dias_trabalho": 46,
        "dias_folga": 18
    }

    client.delete("/api/v1/escalas/Escala API Config A")
    client.delete("/api/v1/escalas/Escala API Config B")
    client.delete("/api/v1/escalas/Escala API Config A Editada")

    client.post("/api/v1/escalas", json=payload_a)
    client.post("/api/v1/escalas", json=payload_b)

    response = client.put(
        "/api/v1/escalas/Escala API Config A",
        json=payload_editado
    )

    assert response.status_code == 409

    data = response.json()

    assert data["detail"] == "Já existe uma escala salva com essa configuração."

    client.delete("/api/v1/escalas/Escala API Config A")
    client.delete("/api/v1/escalas/Escala API Config B")
    client.delete("/api/v1/escalas/Escala API Config A Editada")