import pytest

from migrar_json_postgres import _dsn_de_teste


def test_migracao_exige_dsn_de_banco_dedicado(monkeypatch):
    monkeypatch.delenv("TEST_POSTGRES_DSN", raising=False)
    with pytest.raises(ValueError, match="TEST_POSTGRES_DSN"):
        _dsn_de_teste()

    monkeypatch.setenv("TEST_POSTGRES_DSN", "host=localhost dbname=simulador_escala user=postgres")
    with pytest.raises(ValueError, match="nome contenha 'test'"):
        _dsn_de_teste()


def test_migracao_aceita_apenas_dsn_de_teste_nomeado(monkeypatch):
    dsn = "host=localhost dbname=simulador_escala_test user=postgres"
    monkeypatch.setenv("TEST_POSTGRES_DSN", dsn)

    assert _dsn_de_teste() == dsn
