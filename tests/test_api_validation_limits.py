import pytest
from fastapi.testclient import TestClient

from api.app import app


client = TestClient(app)


@pytest.mark.parametrize(
    "payload",
    [
        {"nome": "Ciclo sem períodos", "tipo": "ciclo_dias"},
        {"nome": "Ciclo zero", "tipo": "ciclo_dias", "dias_trabalho": 0, "dias_folga": 3},
        {"nome": "Ciclo negativo", "tipo": "ciclo_horas", "horas_trabalho": 12, "horas_folga": -1},
        {"nome": "Ciclo longo", "tipo": "ciclo_dias", "dias_trabalho": 100, "dias_folga": 21},
        {"nome": "Ciclo de horas longo", "tipo": "ciclo_horas", "horas_trabalho": 90, "horas_folga": 31},
        {"nome": "Sequência vazia", "tipo": "turno_rotativo", "sequencia_turnos": []},
        {"nome": "Sequência extensa", "tipo": "turno_rotativo", "sequencia_turnos": ["Manhã"] * 61},
    ],
    ids=["campos-vazios", "zero", "negativo", "ciclo-dias-acima-do-limite", "ciclo-horas-acima-do-limite", "sequencia-vazia", "sequencia-acima-do-limite"],
)
def test_api_rejeita_cadastros_com_parametros_invalidos(payload):
    response = client.post("/api/v1/escalas", json=payload)

    assert response.status_code == 400


@pytest.mark.parametrize("quantity", [0, -1, 61])
def test_api_rejeita_quantidades_de_linha_do_tempo_invalidas(quantity):
    response = client.post(
        "/api/v1/escalas/nao-existe/simulacao/proximos-dias",
        json={"data_inicio": "01/07/2026", "quantidade_dias": quantity},
    )

    assert response.status_code == 422
