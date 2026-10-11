from api.routes import escalas
from api.app import app
from fastapi.testclient import TestClient
from fastapi import HTTPException
from types import SimpleNamespace
import pytest
from services.escala_service_factory import criar_escala_service


def test_dependency_api_fecha_service_ao_finalizar(monkeypatch):
    class ServiceFalso:
        fechado = False

        def close(self):
            self.fechado = True

    service = ServiceFalso()
    monkeypatch.setattr(escalas, "obter_service", lambda: service)
    dependencia = escalas.obter_service_por_requisicao()

    assert next(dependencia) is service
    dependencia.close()

    assert service.fechado is True


def test_service_api_json_por_padrao_e_postgres_somente_se_pedido(monkeypatch):
    chamadas = []
    monkeypatch.delenv("ESCALA_REPOSITORY", raising=False)
    monkeypatch.setattr(escalas, "criar_escala_service", lambda **kwargs: chamadas.append(kwargs) or object())

    escalas.obter_service()
    monkeypatch.setenv("ESCALA_REPOSITORY", "postgres")
    escalas.obter_service()

    assert chamadas == [{}, {"tipo_repository": "postgres"}]


def test_api_informa_json_invalido_sem_apagar_arquivo(tmp_path, monkeypatch):
    caminho = tmp_path / "escalas.json"
    conteudo = b"{json quebrado"
    caminho.write_bytes(conteudo)
    monkeypatch.setattr(
        escalas,
        "obter_service",
        lambda: criar_escala_service(caminho_arquivo=caminho),
    )

    response = TestClient(app).get("/api/v1/escalas")

    assert response.status_code == 500
    assert "JSON de escalas inv\u00e1lido" in response.json()["detail"]
    assert caminho.read_bytes() == conteudo


def test_api_recusa_escritas_de_cliente_remoto():
    request = SimpleNamespace(client=SimpleNamespace(host="198.51.100.10"))

    with pytest.raises(HTTPException) as erro:
        escalas.validar_acesso_local(request)

    assert erro.value.status_code == 403


@pytest.mark.parametrize("host", ["127.0.0.1", "::1", "testclient"])
def test_api_permite_escrita_local_e_testclient(host):
    request = SimpleNamespace(client=SimpleNamespace(host=host))

    assert escalas.validar_acesso_local(request) is None
