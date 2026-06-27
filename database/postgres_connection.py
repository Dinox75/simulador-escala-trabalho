import psycopg2

from config.database_config import obter_configuracao_postgres


def criar_conexao_postgres(configuracao=None):
    if configuracao is None:
        configuracao = obter_configuracao_postgres()

    return psycopg2.connect(**configuracao)