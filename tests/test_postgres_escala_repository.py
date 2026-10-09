import os
import re
import uuid

import psycopg2
import pytest

from models.escala_ciclo_dias import EscalaCicloDias
from models.escala_ciclo_horas import EscalaCicloHoras
from models.escala_turno_rotativo import EscalaTurnoRotativo
from psycopg2.extensions import parse_dsn
from repositories.postgres_escala_repository import PostgresEscalaRepository


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
