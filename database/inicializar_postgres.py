from pathlib import Path

from database.postgres_connection import criar_conexao_postgres


def inicializar_banco_postgres(
    caminho_schema="database/schema_postgresql.sql",
    conexao=None
):
    caminho_schema = Path(caminho_schema)

    if not caminho_schema.exists():
        raise FileNotFoundError(f"Arquivo de schema não encontrado: {caminho_schema}")

    sql_schema = caminho_schema.read_text(encoding="utf-8")

    conexao_criada_localmente = False

    if conexao is None:
        conexao = criar_conexao_postgres()
        conexao_criada_localmente = True

    try:
        with conexao.cursor() as cursor:
            cursor.execute(sql_schema)

        conexao.commit()

    except Exception:
        conexao.rollback()
        raise

    finally:
        if conexao_criada_localmente:
            conexao.close()


if __name__ == "__main__":
    inicializar_banco_postgres()
    print("Banco PostgreSQL inicializado com sucesso.")