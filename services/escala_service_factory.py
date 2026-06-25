from repositories.json_escala_repository import JsonEscalaRepository
from services.escala_service import EscalaService


def criar_escala_service(caminho_arquivo="data/escalas.json"):
    repository = JsonEscalaRepository(caminho_arquivo)
    return EscalaService(repository)