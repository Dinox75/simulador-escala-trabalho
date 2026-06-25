from models.escala_ciclo_dias import EscalaCicloDias
from repositories.json_escala_repository import JsonEscalaRepository
from services.escala_service import EscalaService
from services.escala_service_factory import criar_escala_service


def test_criar_escala_service_retorna_service_com_repository_json():
    service = criar_escala_service()

    assert isinstance(service, EscalaService)
    assert isinstance(service.repository, JsonEscalaRepository)


def test_criar_escala_service_com_caminho_personalizado(tmp_path):
    caminho = tmp_path / "escalas.json"

    service = criar_escala_service(caminho)

    escala = EscalaCicloDias("Escala 6x3", 6, 3)

    resultado = service.adicionar_escala(escala)
    escalas = service.listar_escalas()

    assert resultado == "sucesso"
    assert len(escalas) == 1
    assert escalas[0].nome == "Escala 6x3"