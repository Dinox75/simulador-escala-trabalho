import os
import re
import uuid
import json
from pathlib import Path

import psycopg2
import pytest

from models.escala_ciclo_dias import EscalaCicloDias
from models.escala_ciclo_horas import EscalaCicloHoras
from models.escala_turno_rotativo import EscalaTurnoRotativo
from psycopg2.extensions import parse_dsn
from repositories.postgres_escala_repository import PostgresEscalaRepository
from services.migracao_postgres import migrar_json_para_postgres


@pytest.fixture
def repository_postgres_teste():
    dsn = os.getenv("TEST_POSTGRES_DSN")
    if not dsn:
        pytest.skip(
            "Defina TEST_POSTGRES_DSN para habilitar testes em um banco PostgreSQL dedicado a testes."
        )

    database = parse_dsn(dsn).get("dbname", "")
    if not database or not re.search(r"(^|[_-])test($|[_-])", database, re.IGNORECASE):
        pytest.fail(
            "TEST_POSTGRES_DSN deve apontar para um banco dedicado cujo nome contenha 'test'.",
            pytrace=False,
        )

    # Erros de conexão e esquema permanecem visíveis com os testes habilitados.
    conexao = psycopg2.connect(dsn)
    repository = PostgresEscalaRepository(conexao)
    try:
        yield repository
    finally:
        conexao.close()


def gerar_nome_teste(prefixo):
    identificador = uuid.uuid4().hex[:8]
    return f"{prefixo} {identificador}"


def test_postgres_deve_adicionar_buscar_listar_e_excluir_escala_ciclo_dias(repository_postgres_teste):
    repository = repository_postgres_teste
    nome = gerar_nome_teste("Teste PostgreSQL 6x3")

    try:
        repository.excluir_por_nome(nome)

        escala = EscalaCicloDias(nome, 6, 3)
        repository.adicionar(escala)

        escala_encontrada = repository.buscar_por_nome(nome)
        escalas = repository.listar()

        assert escala_encontrada is not None
        assert escala_encontrada.nome == nome
        assert escala_encontrada.dias_trabalho == 6
        assert escala_encontrada.dias_folga == 3
        assert any(escala_salva.nome == nome for escala_salva in escalas)

        resultado_exclusao = repository.excluir_por_nome(nome)

        assert resultado_exclusao is True
        assert repository.buscar_por_nome(nome) is None

    finally:
        repository.excluir_por_nome(nome)


def test_postgres_deve_adicionar_e_buscar_escala_ciclo_horas(repository_postgres_teste):
    repository = repository_postgres_teste
    nome = gerar_nome_teste("Teste PostgreSQL 12x36")

    try:
        repository.excluir_por_nome(nome)

        escala = EscalaCicloHoras(nome, 12, 36)
        repository.adicionar(escala)

        escala_encontrada = repository.buscar_por_nome(nome)

        assert escala_encontrada is not None
        assert escala_encontrada.nome == nome
        assert escala_encontrada.horas_trabalho == 12
        assert escala_encontrada.horas_folga == 36

    finally:
        repository.excluir_por_nome(nome)


def test_postgres_deve_adicionar_e_buscar_escala_turno_rotativo(repository_postgres_teste):
    repository = repository_postgres_teste
    nome = gerar_nome_teste("Teste PostgreSQL Turno")

    try:
        repository.excluir_por_nome(nome)

        escala = EscalaTurnoRotativo(
            nome,
            ["Manhã", "Tarde", "Noite", "Folga"]
        )
        repository.adicionar(escala)

        escala_encontrada = repository.buscar_por_nome(nome)

        assert escala_encontrada is not None
        assert escala_encontrada.nome == nome
        assert escala_encontrada.sequencia_turnos == [
            "Manhã",
            "Tarde",
            "Noite",
            "Folga"
        ]

    finally:
        repository.excluir_por_nome(nome)


def test_postgres_deve_retornar_none_quando_nome_nao_existir(repository_postgres_teste):
    repository = repository_postgres_teste
    nome = gerar_nome_teste("Teste PostgreSQL Inexistente")

    try:
        repository.excluir_por_nome(nome)

        resultado = repository.buscar_por_nome(nome)

        assert resultado is None

    finally:
        repository.excluir_por_nome(nome)


def test_postgres_deve_retornar_false_quando_excluir_nome_inexistente(repository_postgres_teste):
    repository = repository_postgres_teste
    nome = gerar_nome_teste("Teste PostgreSQL Exclusao Inexistente")

    try:
        repository.excluir_por_nome(nome)

        resultado = repository.excluir_por_nome(nome)

        assert resultado is False

    finally:
        repository.excluir_por_nome(nome)


def test_postgres_migracao_importa_tipos_e_configuracoes_em_schema_isolado(tmp_path):
    dsn = os.getenv("TEST_POSTGRES_DSN")
    if not dsn:
        pytest.skip("Defina TEST_POSTGRES_DSN para habilitar integração PostgreSQL real.")

    database = parse_dsn(dsn).get("dbname", "")
    if not re.search(r"(^|[_-])test($|[_-])", database, re.IGNORECASE):
        pytest.fail("TEST_POSTGRES_DSN deve apontar para banco dedicado com 'test' no nome.", pytrace=False)

    nome_schema = f"migracao_test_{uuid.uuid4().hex[:12]}"
    conexao = psycopg2.connect(dsn)
    schema = Path(__file__).resolve().parents[1] / "database" / "schema_postgresql.sql"
    origem = tmp_path / "escalas.json"
    escalas = [
        {"nome": "Migração dias", "tipo": "ciclo_dias", "dias_trabalho": 6, "dias_folga": 3},
        {"nome": "Migração horas", "tipo": "ciclo_horas", "horas_trabalho": 12, "horas_folga": 36},
        {"nome": "Migração turnos", "tipo": "turno_rotativo", "sequencia_turnos": ["Manhã", "Noite", "Folga"]},
    ]
    origem.write_text(json.dumps(escalas, ensure_ascii=False), encoding="utf-8")
    bytes_origem = origem.read_bytes()

    try:
        with conexao.cursor() as cursor:
            cursor.execute(f'CREATE SCHEMA "{nome_schema}";')
            cursor.execute(f'SET search_path TO "{nome_schema}";')
            cursor.execute(schema.read_text(encoding="utf-8"))
            cursor.execute("""
                CREATE FUNCTION rejeitar_migracao_teste() RETURNS trigger AS $$
                BEGIN
                    IF NEW.nome = 'Migração horas' THEN
                        RAISE EXCEPTION 'falha de teste' USING ERRCODE = '23514';
                    END IF;
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
                CREATE TRIGGER rejeitar_migracao_teste
                BEFORE INSERT ON escalas
                FOR EACH ROW EXECUTE FUNCTION rejeitar_migracao_teste();
            """)
        conexao.commit()

        with pytest.raises(psycopg2.IntegrityError):
            migrar_json_para_postgres(origem, conexao)
        assert PostgresEscalaRepository(conexao).listar() == []

        with conexao.cursor() as cursor:
            cursor.execute("DROP TRIGGER rejeitar_migracao_teste ON escalas;")
            cursor.execute("DROP FUNCTION rejeitar_migracao_teste();")
        conexao.commit()

        assert migrar_json_para_postgres(origem, conexao) == 3
        obtidas = PostgresEscalaRepository(conexao).listar()
        assert [escala.to_dict() for escala in obtidas] == escalas
        assert origem.read_bytes() == bytes_origem
        with pytest.raises(ValueError, match="já contém escalas"):
            migrar_json_para_postgres(origem, conexao)
        assert len(PostgresEscalaRepository(conexao).listar()) == 3

    finally:
        conexao.rollback()
        with conexao.cursor() as cursor:
            cursor.execute(f'DROP SCHEMA IF EXISTS "{nome_schema}" CASCADE;')
        conexao.commit()
        conexao.close()
