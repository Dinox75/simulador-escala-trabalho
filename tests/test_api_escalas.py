from urllib.parse import quote

from fastapi.testclient import TestClient

from api.app import app


client = TestClient(app)


def url_escala(nome):
    return f"/api/v1/escalas/{quote(nome)}"


def excluir_escala_se_existir(nome):
    client.delete(url_escala(nome))


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
    nome = "Escala API Teste 21x8"

    payload = {
        "nome": nome,
        "tipo": "ciclo_dias",
        "dias_trabalho": 21,
        "dias_folga": 8
    }

    excluir_escala_se_existir(nome)

    try:
        response = client.post("/api/v1/escalas", json=payload)

        assert response.status_code == 201

        data = response.json()

        assert data["message"] == "Escala criada com sucesso."
        assert data["escala"]["nome"] == nome
        assert data["escala"]["tipo"] == "ciclo_dias"

    finally:
        excluir_escala_se_existir(nome)


def test_criar_escala_ciclo_horas_deve_retornar_status_201():
    nome = "Escala API Teste 13x37"

    payload = {
        "nome": nome,
        "tipo": "ciclo_horas",
        "horas_trabalho": 13,
        "horas_folga": 37
    }

    excluir_escala_se_existir(nome)

    try:
        response = client.post("/api/v1/escalas", json=payload)

        assert response.status_code == 201

        data = response.json()

        assert data["escala"]["nome"] == nome
        assert data["escala"]["tipo"] == "ciclo_horas"

    finally:
        excluir_escala_se_existir(nome)


def test_criar_escala_turno_rotativo_deve_retornar_status_201():
    nome = "Escala API Teste Turno"

    payload = {
        "nome": nome,
        "tipo": "turno_rotativo",
        "sequencia_turnos": ["Manhã", "Tarde", "Noite", "Folga"]
    }

    excluir_escala_se_existir(nome)

    try:
        response = client.post("/api/v1/escalas", json=payload)

        assert response.status_code == 201

        data = response.json()

        assert data["escala"]["nome"] == nome
        assert data["escala"]["tipo"] == "turno_rotativo"

    finally:
        excluir_escala_se_existir(nome)


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


def test_buscar_escala_por_nome_deve_retornar_status_200():
    nome = "Escala API Busca 14x5"

    payload = {
        "nome": nome,
        "tipo": "ciclo_dias",
        "dias_trabalho": 14,
        "dias_folga": 5
    }

    excluir_escala_se_existir(nome)

    try:
        client.post("/api/v1/escalas", json=payload)

        response = client.get(url_escala(nome))

        assert response.status_code == 200

        data = response.json()

        assert data["escala"]["nome"] == nome
        assert data["escala"]["tipo"] == "ciclo_dias"

    finally:
        excluir_escala_se_existir(nome)


def test_buscar_escala_por_nome_inexistente_deve_retornar_404():
    response = client.get(url_escala("Escala Inexistente API"))

    assert response.status_code == 404

    data = response.json()

    assert data["detail"] == "Escala não encontrada."


def test_editar_escala_deve_retornar_status_200():
    nome_original = "Escala API Editar Original"
    nome_editado = "Escala API Editada"

    payload_original = {
        "nome": nome_original,
        "tipo": "ciclo_dias",
        "dias_trabalho": 31,
        "dias_folga": 11
    }

    payload_editado = {
        "nome": nome_editado,
        "tipo": "ciclo_dias",
        "dias_trabalho": 32,
        "dias_folga": 12
    }

    excluir_escala_se_existir(nome_original)
    excluir_escala_se_existir(nome_editado)

    try:
        client.post("/api/v1/escalas", json=payload_original)

        response = client.put(
            url_escala(nome_original),
            json=payload_editado
        )

        assert response.status_code == 200

        data = response.json()

        assert data["message"] == "Escala editada com sucesso."
        assert data["escala"]["nome"] == nome_editado
        assert data["escala"]["dias_trabalho"] == 32
        assert data["escala"]["dias_folga"] == 12

    finally:
        excluir_escala_se_existir(nome_original)
        excluir_escala_se_existir(nome_editado)


def test_editar_escala_inexistente_deve_retornar_404():
    payload = {
        "nome": "Escala API Editar Inexistente",
        "tipo": "ciclo_dias",
        "dias_trabalho": 41,
        "dias_folga": 13
    }

    response = client.put(
        url_escala("Escala Inexistente Para Editar"),
        json=payload
    )

    assert response.status_code == 404

    data = response.json()

    assert data["detail"] == "Escala não encontrada."


def test_editar_escala_deve_retornar_409_para_nome_duplicado():
    nome_a = "Escala API Editar A"
    nome_b = "Escala API Editar B"

    payload_a = {
        "nome": nome_a,
        "tipo": "ciclo_dias",
        "dias_trabalho": 42,
        "dias_folga": 14
    }

    payload_b = {
        "nome": nome_b,
        "tipo": "ciclo_dias",
        "dias_trabalho": 43,
        "dias_folga": 15
    }

    payload_editado = {
        "nome": nome_b,
        "tipo": "ciclo_dias",
        "dias_trabalho": 44,
        "dias_folga": 16
    }

    excluir_escala_se_existir(nome_a)
    excluir_escala_se_existir(nome_b)

    try:
        client.post("/api/v1/escalas", json=payload_a)
        client.post("/api/v1/escalas", json=payload_b)

        response = client.put(
            url_escala(nome_a),
            json=payload_editado
        )

        assert response.status_code == 409

        data = response.json()

        assert data["detail"] == "Já existe uma escala salva com esse nome."

    finally:
        excluir_escala_se_existir(nome_a)
        excluir_escala_se_existir(nome_b)


def test_editar_escala_deve_retornar_409_para_configuracao_duplicada():
    nome_a = "Escala API Config A"
    nome_b = "Escala API Config B"
    nome_editado = "Escala API Config A Editada"

    payload_a = {
        "nome": nome_a,
        "tipo": "ciclo_dias",
        "dias_trabalho": 45,
        "dias_folga": 17
    }

    payload_b = {
        "nome": nome_b,
        "tipo": "ciclo_dias",
        "dias_trabalho": 46,
        "dias_folga": 18
    }

    payload_editado = {
        "nome": nome_editado,
        "tipo": "ciclo_dias",
        "dias_trabalho": 46,
        "dias_folga": 18
    }

    excluir_escala_se_existir(nome_a)
    excluir_escala_se_existir(nome_b)
    excluir_escala_se_existir(nome_editado)

    try:
        client.post("/api/v1/escalas", json=payload_a)
        client.post("/api/v1/escalas", json=payload_b)

        response = client.put(
            url_escala(nome_a),
            json=payload_editado
        )

        assert response.status_code == 409

        data = response.json()

        assert data["detail"] == "Já existe uma escala salva com essa configuração."

    finally:
        excluir_escala_se_existir(nome_a)
        excluir_escala_se_existir(nome_b)
        excluir_escala_se_existir(nome_editado)


def test_excluir_escala_deve_retornar_status_200():
    nome = "Escala API Excluir 27x6"

    payload = {
        "nome": nome,
        "tipo": "ciclo_dias",
        "dias_trabalho": 27,
        "dias_folga": 6
    }

    excluir_escala_se_existir(nome)

    client.post("/api/v1/escalas", json=payload)

    response = client.delete(url_escala(nome))

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == "Escala excluída com sucesso."
    assert data["nome"] == nome

    excluir_escala_se_existir(nome)


def test_excluir_escala_inexistente_deve_retornar_404():
    response = client.delete(url_escala("Escala Inexistente Para Excluir"))

    assert response.status_code == 404

    data = response.json()

    assert data["detail"] == "Escala não encontrada."