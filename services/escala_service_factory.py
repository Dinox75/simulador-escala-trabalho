from database.postgres_connection import criar_conexao_postgres
from repositories.json_escala_repository import JsonEscalaRepository
from repositories.postgres_escala_repository import PostgresEscalaRepository
from services.escala_service import EscalaService


TIPO_REPOSITORY_JSON = "json"
TIPO_REPOSITORY_POSTGRES = "postgres"


def criar_escala_service(
    caminho_arquivo="data/escalas.json",
    tipo_repository=TIPO_REPOSITORY_JSON,
    conexao=None,
    configuracao_postgres=None
):
    if tipo_repository == TIPO_REPOSITORY_JSON:
        repository = JsonEscalaRepository(caminho_arquivo)
        return EscalaService(repository)

    if tipo_repository == TIPO_REPOSITORY_POSTGRES:
        if conexao is None:
            conexao = criar_conexao_postgres(configuracao_postgres)

        repository = PostgresEscalaRepository(conexao)
        return EscalaService(repository)

    raise ValueError(f"Tipo de repository inválido: {tipo_repository}")