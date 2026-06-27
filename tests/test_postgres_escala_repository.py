import uuid

import psycopg2
import pytest

from database.postgres_connection import criar_conexao_postgres
from models.escala_ciclo_dias import EscalaCicloDias
from models.escala_ciclo_horas import EscalaCicloHoras
from models.escala_turno_rotativo import EscalaTurnoRotativo
from repositories.postgres_escala_repository import PostgresEscalaRepository


def criar_repository_postgres_ou_pular():
    try:
        conexao = criar_conexao_postgres()
    except psycopg2.OperationalError as erro:
        pytest.skip(f"PostgreSQL não disponível para teste: {erro}")

    repository = PostgresEscalaRepository(conexao)
    return repository, conexao


def gerar_nome_teste(prefixo):
    identificador = uuid.uuid4().hex[:8]
    return f"{prefixo} {identificador}"


def test_postgres_deve_adicionar_buscar_listar_e_excluir_escala_ciclo_dias():
    repository, conexao = criar_repository_postgres_ou_pular()
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
        conexao.close()


def test_postgres_deve_adicionar_e_buscar_escala_ciclo_horas():
    repository, conexao = criar_repository_postgres_ou_pular()
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
        conexao.close()


def test_postgres_deve_adicionar_e_buscar_escala_turno_rotativo():
    repository, conexao = criar_repository_postgres_ou_pular()
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
        conexao.close()


def test_postgres_deve_retornar_none_quando_nome_nao_existir():
    repository, conexao = criar_repository_postgres_ou_pular()
    nome = gerar_nome_teste("Teste PostgreSQL Inexistente")

    try:
        repository.excluir_por_nome(nome)

        resultado = repository.buscar_por_nome(nome)

        assert resultado is None

    finally:
        repository.excluir_por_nome(nome)
        conexao.close()


def test_postgres_deve_retornar_false_quando_excluir_nome_inexistente():
    repository, conexao = criar_repository_postgres_ou_pular()
    nome = gerar_nome_teste("Teste PostgreSQL Exclusao Inexistente")

    try:
        repository.excluir_por_nome(nome)

        resultado = repository.excluir_por_nome(nome)

        assert resultado is False

    finally:
        repository.excluir_por_nome(nome)
        conexao.close()