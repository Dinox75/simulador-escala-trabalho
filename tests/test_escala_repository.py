import pytest

from repositories.escala_repository import EscalaRepository
from repositories.json_escala_repository import JsonEscalaRepository


def test_escala_repository_nao_pode_ser_instanciado_diretamente():
    with pytest.raises(TypeError):
        EscalaRepository()


def test_json_escala_repository_implementa_contrato():
    repository = JsonEscalaRepository()

    assert isinstance(repository, EscalaRepository)