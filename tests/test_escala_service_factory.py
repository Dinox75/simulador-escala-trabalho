import pytest

from models.escala_ciclo_dias import EscalaCicloDias
from repositories.json_escala_repository import JsonEscalaRepository
from repositories.postgres_escala_repository import PostgresEscalaRepository
from services.escala_service import EscalaService
from services.escala_service_factory import (
    criar_escala_service,
    TIPO_REPOSITORY_JSON,
    TIPO_REPOSITORY_POSTGRES
)


class FakeConexao:
    pass


def test_criar_escala_service_retorna_service_com_repository_json_por_padrao():
    service = criar_escala_service()

    assert isinstance(service, EscalaService)
    assert isinstance(service.repository, JsonEscalaRepository)


def test_criar_escala_service_com_caminho_personalizado(tmp_path):
    caminho = tmp_path / "escalas.json"

    service = criar_escala_service(caminho_arquivo=caminho)

    escala = EscalaCicloDias("Escala 6x3", 6, 3)

    resultado = service.adicionar_escala(escala)
    escalas = service.listar_escalas()

    assert resultado == "sucesso"
    assert len(escalas) == 1
    assert escalas[0].nome == "Escala 6x3"


def test_criar_escala_service_com_repository_json_explicito():
    service = criar_escala_service(tipo_repository=TIPO_REPOSITORY_JSON)

    assert isinstance(service, EscalaService)
    assert isinstance(service.repository, JsonEscalaRepository)


def test_criar_escala_service_com_repository_postgres_usando_conexao():
    conexao = FakeConexao()

    service = criar_escala_service(
        tipo_repository=TIPO_REPOSITORY_POSTGRES,
        conexao=conexao
    )

    assert isinstance(service, EscalaService)
    assert isinstance(service.repository, PostgresEscalaRepository)
    assert service.repository.conexao is conexao


def test_criar_escala_service_com_tipo_repository_invalido():
    with pytest.raises(ValueError):
        criar_escala_service(tipo_repository="invalido")