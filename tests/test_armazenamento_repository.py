from repositories.json_escala_repository import JsonEscalaRepository
from services.escala_service import EscalaService
from services.escala_service_factory import (
    TIPO_REPOSITORY_JSON,
    TIPO_REPOSITORY_POSTGRES
)

from armazenamento import (
    obter_escala_service,
    obter_tipo_repository
)


def test_obter_tipo_repository_deve_usar_json_por_padrao(monkeypatch):
    monkeypatch.delenv("ESCALA_REPOSITORY", raising=False)

    resultado = obter_tipo_repository()

    assert resultado == TIPO_REPOSITORY_JSON


def test_obter_tipo_repository_deve_usar_valor_da_variavel_de_ambiente(monkeypatch):
    monkeypatch.setenv("ESCALA_REPOSITORY", TIPO_REPOSITORY_POSTGRES)

    resultado = obter_tipo_repository()

    assert resultado == TIPO_REPOSITORY_POSTGRES


def test_obter_tipo_repository_deve_normalizar_valor_da_variavel(monkeypatch):
    monkeypatch.setenv("ESCALA_REPOSITORY", " PostgreS ")

    resultado = obter_tipo_repository()

    assert resultado == TIPO_REPOSITORY_POSTGRES


def test_obter_escala_service_deve_retornar_service_com_json_por_padrao(monkeypatch):
    monkeypatch.delenv("ESCALA_REPOSITORY", raising=False)

    service = obter_escala_service()

    assert isinstance(service, EscalaService)
    assert isinstance(service.repository, JsonEscalaRepository)