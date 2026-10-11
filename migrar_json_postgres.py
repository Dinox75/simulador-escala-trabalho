import argparse
import os
import re
from pathlib import Path

import psycopg2
from psycopg2.extensions import parse_dsn

from services.migracao_postgres import (
    migrar_json_para_postgres,
    prever_migracao_json_postgres,
)


def _dsn_de_teste():
    dsn = os.getenv("TEST_POSTGRES_DSN")
    if not dsn:
        raise ValueError(
            "Para --apply, defina TEST_POSTGRES_DSN apontando para banco dedicado a testes."
        )
    database = parse_dsn(dsn).get("dbname", "")
    if not re.search(r"(^|[_-])test($|[_-])", database, re.IGNORECASE):
        raise ValueError(
            "TEST_POSTGRES_DSN deve apontar para um banco cujo nome contenha 'test'."
        )
    return dsn


def main():
    parser = argparse.ArgumentParser(
        description="Pré-visualiza ou importa JSON para um schema PostgreSQL vazio."
    )
    parser.add_argument("--source", required=True, help="Cópia JSON a validar; nunca será modificada.")
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Executa a importação transacional no banco TEST_POSTGRES_DSN.",
    )
    args = parser.parse_args()

    try:
        if not args.apply:
            resumo = prever_migracao_json_postgres(args.source)
            print(f"Prévia: {resumo['total']} escala(s)")
            for tipo, quantidade in resumo["por_tipo"].items():
                print(f"  {tipo}: {quantidade}")
            print("Nenhum banco foi conectado e nenhum arquivo foi alterado.")
            return

        dsn = _dsn_de_teste()
        conexao = psycopg2.connect(dsn)
        try:
            quantidade = migrar_json_para_postgres(args.source, conexao)
        finally:
            conexao.close()
        print(
            f"Importação concluída: {quantidade} escala(s). "
            f"JSON preservado: {Path(args.source)}"
        )
    except (OSError, ValueError, RuntimeError, psycopg2.Error) as erro:
        parser.error(str(erro))


if __name__ == "__main__":
    main()
