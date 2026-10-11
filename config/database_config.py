import os


def obter_configuracao_postgres():
    dsn = os.getenv("POSTGRES_DSN")
    if dsn:
        return {"dsn": dsn}

    required = ("POSTGRES_HOST", "POSTGRES_DB", "POSTGRES_USER", "POSTGRES_PASSWORD")
    missing = [name for name in required if not os.getenv(name)]
    if missing:
        raise RuntimeError(
            "PostgreSQL foi selecionado, mas a configuração está incompleta. "
            "Defina POSTGRES_DSN ou todas as variáveis: " + ", ".join(required) + "."
        )

    return {
        "host": os.environ["POSTGRES_HOST"],
        "port": int(os.getenv("POSTGRES_PORT", "5432")),
        "database": os.environ["POSTGRES_DB"],
        "user": os.environ["POSTGRES_USER"],
        "password": os.environ["POSTGRES_PASSWORD"],
    }
