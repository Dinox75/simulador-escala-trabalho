from urllib.parse import quote

from fastapi.testclient import TestClient

from api.app import app


client = TestClient(app)


def url_escala(nome):
    return f"/api/v1/escalas/{quote(nome)}"


def url_status_escala(nome):
    return f"/api/v1/escalas/{quote(nome)}/simulacao/status"


def url_proximos_dias_escala(nome):
    return f"/api/v1/escalas/{quote(nome)}/simulacao/proximos-dias"


def excluir_escala_se_existir(nome):
    client.delete(url_escala(nome))


def criar_escala_para_teste(payload):
    excluir_escala_se_existir(payload["nome"])
    response = client.post("/api/v1/escalas", json=payload)
    assert response.status_code == 201


def test_simular_status_escala_salva_ciclo_dias_deve_retornar_folga():
    nome = "Escala API Simulacao Dias 2x1"

    payload_escala = {
        "nome": nome,
        "tipo": "ciclo_dias",
        "dias_trabalho": 2,
        "dias_folga": 1
    }

    payload_simulacao = {
        "data_inicio": "01/07/2026",
        "data_consulta": "03/07/2026"
    }

    try:
        criar_escala_para_teste(payload_escala)

        response = client.post(url_status_escala(nome), json=payload_simulacao)

        assert response.status_code == 200

        data = response.json()

        assert data["escala_nome"] == nome
        assert data["tipo"] == "ciclo_dias"
        assert data["status"] == "Folga"

    finally:
        excluir_escala_se_existir(nome)


def test_simular_proximos_dias_escala_salva_ciclo_dias_deve_retornar_lista():
    nome = "Escala API Proximos Dias 2x1"

    payload_escala = {
        "nome": nome,
        "tipo": "ciclo_dias",
        "dias_trabalho": 2,
        "dias_folga": 1
    }

    payload_simulacao = {
        "data_inicio": "01/07/2026",
        "quantidade_dias": 4
    }

    try:
        criar_escala_para_teste(payload_escala)

        response = client.post(url_proximos_dias_escala(nome), json=payload_simulacao)

        assert response.status_code == 200

        data = response.json()

        assert data["escala_nome"] == nome
        assert data["quantidade_dias"] == 4
        assert len(data["dias"]) == 4
        assert data["dias"][0]["status"] == "Trabalhando"
        assert data["dias"][1]["status"] == "Trabalhando"
        assert data["dias"][2]["status"] == "Folga"

    finally:
        excluir_escala_se_existir(nome)


def test_simular_status_escala_salva_ciclo_horas_deve_retornar_trabalhando():
    nome = "Escala API Simulacao Horas 10x14"

    payload_escala = {
        "nome": nome,
        "tipo": "ciclo_horas",
        "horas_trabalho": 10,
        "horas_folga": 14
    }

    payload_simulacao = {
        "data_inicio": "01/07/2026",
        "hora_inicio": "08:00",
        "data_consulta": "01/07/2026",
        "hora_consulta": "12:00"
    }

    try:
        criar_escala_para_teste(payload_escala)

        response = client.post(url_status_escala(nome), json=payload_simulacao)

        assert response.status_code == 200

        data = response.json()

        assert data["escala_nome"] == nome
        assert data["tipo"] == "ciclo_horas"
        assert data["status"] == "Trabalhando"

    finally:
        excluir_escala_se_existir(nome)


def test_simular_proximos_dias_escala_salva_ciclo_horas_deve_retornar_hora_consulta():
    nome = "Escala API Proximos Horas 10x14"

    payload_escala = {
        "nome": nome,
        "tipo": "ciclo_horas",
        "horas_trabalho": 10,
        "horas_folga": 14
    }

    payload_simulacao = {
        "data_inicio": "01/07/2026",
        "hora_inicio": "08:00",
        "hora_consulta": "12:00",
        "quantidade_dias": 2
    }

    try:
        criar_escala_para_teste(payload_escala)

        response = client.post(url_proximos_dias_escala(nome), json=payload_simulacao)

        assert response.status_code == 200

        data = response.json()

        assert data["escala_nome"] == nome
        assert len(data["dias"]) == 2
        assert data["dias"][0]["hora_consulta"] == "12:00"

    finally:
        excluir_escala_se_existir(nome)


def test_simular_status_escala_salva_turno_rotativo_deve_retornar_turno():
    nome = "Escala API Simulacao Turnos"

    payload_escala = {
        "nome": nome,
        "tipo": "turno_rotativo",
        "sequencia_turnos": ["Manhã", "Tarde", "Folga"]
    }

    payload_simulacao = {
        "data_inicio": "01/07/2026",
        "data_consulta": "03/07/2026"
    }

    try:
        criar_escala_para_teste(payload_escala)

        response = client.post(url_status_escala(nome), json=payload_simulacao)

        assert response.status_code == 200

        data = response.json()

        assert data["escala_nome"] == nome
        assert data["tipo"] == "turno_rotativo"
        assert data["status"] == "Folga"

    finally:
        excluir_escala_se_existir(nome)


def test_simular_proximos_dias_escala_salva_turno_rotativo_deve_retornar_lista():
    nome = "Escala API Proximos Turnos"

    payload_escala = {
        "nome": nome,
        "tipo": "turno_rotativo",
        "sequencia_turnos": ["Manhã", "Tarde", "Noite", "Folga"]
    }

    payload_simulacao = {
        "data_inicio": "01/07/2026",
        "quantidade_dias": 5
    }

    try:
        criar_escala_para_teste(payload_escala)

        response = client.post(url_proximos_dias_escala(nome), json=payload_simulacao)

        assert response.status_code == 200

        data = response.json()

        assert data["escala_nome"] == nome
        assert len(data["dias"]) == 5
        assert data["dias"][0]["status"] == "Manhã"
        assert data["dias"][1]["status"] == "Tarde"
        assert data["dias"][2]["status"] == "Noite"
        assert data["dias"][3]["status"] == "Folga"

    finally:
        excluir_escala_se_existir(nome)


def test_simular_status_escala_salva_inexistente_deve_retornar_404():
    payload_simulacao = {
        "data_inicio": "01/07/2026",
        "data_consulta": "01/07/2026"
    }

    response = client.post(
        url_status_escala("Escala Inexistente Simulacao"),
        json=payload_simulacao
    )

    assert response.status_code == 404

    data = response.json()

    assert data["detail"] == "Escala não encontrada."


def test_simular_status_escala_salva_deve_retornar_400_para_data_invalida():
    nome = "Escala API Data Invalida 2x1"

    payload_escala = {
        "nome": nome,
        "tipo": "ciclo_dias",
        "dias_trabalho": 2,
        "dias_folga": 1
    }

    payload_simulacao = {
        "data_inicio": "2026-07-01",
        "data_consulta": "01/07/2026"
    }

    try:
        criar_escala_para_teste(payload_escala)

        response = client.post(url_status_escala(nome), json=payload_simulacao)

        assert response.status_code == 400

    finally:
        excluir_escala_se_existir(nome)


def test_simular_status_escala_salva_ciclo_horas_deve_exigir_horas():
    nome = "Escala API Horas Sem Hora 10x14"

    payload_escala = {
        "nome": nome,
        "tipo": "ciclo_horas",
        "horas_trabalho": 10,
        "horas_folga": 14
    }

    payload_simulacao = {
        "data_inicio": "01/07/2026",
        "data_consulta": "01/07/2026"
    }

    try:
        criar_escala_para_teste(payload_escala)

        response = client.post(url_status_escala(nome), json=payload_simulacao)

        assert response.status_code == 400

        data = response.json()

        assert data["detail"] == "Para ciclo_horas, informe hora_inicio e hora_consulta no formato HH:MM."

    finally:
        excluir_escala_se_existir(nome)


def test_simular_proximos_dias_escala_salva_deve_validar_quantidade_limite():
    nome = "Escala API Quantidade Limite 2x1"

    payload_escala = {
        "nome": nome,
        "tipo": "ciclo_dias",
        "dias_trabalho": 2,
        "dias_folga": 1
    }

    payload_simulacao = {
        "data_inicio": "01/07/2026",
        "quantidade_dias": 100
    }

    try:
        criar_escala_para_teste(payload_escala)

        response = client.post(url_proximos_dias_escala(nome), json=payload_simulacao)

        assert response.status_code == 422

    finally:
        excluir_escala_se_existir(nome)


def test_proximos_dias_escala_salva_inicia_na_data_consultada_e_virada_de_mes():
    nome = "Escala API Calendario Virada Mes"
    payload = {"nome": nome, "tipo": "ciclo_dias", "dias_trabalho": 2, "dias_folga": 1}
    try:
        criar_escala_para_teste(payload)
        response = client.post(url_proximos_dias_escala(nome), json={
            "data_inicio": "29/08/2026",
            "data_consulta": "31/08/2026",
            "quantidade_dias": 3,
        })
        assert response.status_code == 200
        dias = response.json()["dias"]
        assert [dia["data"] for dia in dias] == ["31/08/2026", "01/09/2026", "02/09/2026"]
        assert [dia["status"] for dia in dias] == ["Folga", "Trabalhando", "Trabalhando"]
    finally:
        excluir_escala_se_existir(nome)


def test_proximos_dias_ciclo_horas_usa_data_consultada_como_inicio_da_linha_do_tempo():
    nome = "Escala API Horas Linha Tempo"
    payload = {"nome": nome, "tipo": "ciclo_horas", "horas_trabalho": 12, "horas_folga": 36}
    try:
        criar_escala_para_teste(payload)
        response = client.post(url_proximos_dias_escala(nome), json={
            "data_inicio": "31/07/2026",
            "data_consulta": "31/08/2026",
            "hora_inicio": "08:00",
            "hora_consulta": "08:00",
            "quantidade_dias": 2,
        })
        assert response.status_code == 200
        dias = response.json()["dias"]
        assert [dia["data"] for dia in dias] == ["31/08/2026", "01/09/2026"]
        assert [dia["status"] for dia in dias] == ["Folga", "Trabalhando"]
    finally:
        excluir_escala_se_existir(nome)
