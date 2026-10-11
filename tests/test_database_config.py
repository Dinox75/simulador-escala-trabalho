import pytest

from config.database_config import obter_configuracao_postgres


def test_postgres_nao_inventa_conexao_padrao(monkeypatch):
    for variavel in (
        "POSTGRES_DSN",
        "POSTGRES_HOST",
        "POSTGRES_DB",
        "POSTGRES_USER",
        "POSTGRES_PASSWORD",
    ):
        monkeypatch.delenv(variavel, raising=False)

    with pytest.raises(RuntimeError, match="configuração está incompleta"):
        obter_configuracao_postgres()


def test_postgres_aceita_dsn_explicito(monkeypatch):
    monkeypatch.setenv("POSTGRES_DSN", "host=127.0.0.1 dbname=mercado user=teste password=senha")

    assert obter_configuracao_postgres() == {
        "dsn": "host=127.0.0.1 dbname=mercado user=teste password=senha"
    }
