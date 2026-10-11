import pytest

from models.escala_ciclo_dias import EscalaCicloDias
from repositories.postgres_escala_repository import PostgresEscalaRepository


class CursorPostgresFalso:
    def __init__(self, conexao):
        self.conexao = conexao

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def execute(self, sql, _params=None):
        self.conexao.operacoes.append(" ".join(sql.split()))
        if self.conexao.falhar_em and self.conexao.falhar_em in sql:
            raise RuntimeError("falha de inserção simulada")

    def fetchone(self):
        return (42,)


class ConexaoPostgresFalsa:
    def __init__(self, falhar_em=None):
        self.operacoes = []
        self.commits = 0
        self.rollbacks = 0
        self.falhar_em = falhar_em
        self.autocommit = False

    def cursor(self):
        return CursorPostgresFalso(self)

    def commit(self):
        self.commits += 1

    def rollback(self):
        self.rollbacks += 1

    def close(self):
        pass


def test_salvar_todos_confirma_delete_e_insercoes_em_um_commit():
    conexao = ConexaoPostgresFalsa()
    repository = PostgresEscalaRepository(conexao)

    repository.salvar_todos([EscalaCicloDias("Escala teste", 6, 3)])

    assert conexao.operacoes[0] == "DELETE FROM escalas;"
    assert any(sql.startswith("INSERT INTO escalas ") for sql in conexao.operacoes)
    assert any("INSERT INTO escalas_ciclo_dias" in sql for sql in conexao.operacoes)
    assert conexao.commits == 1
    assert conexao.rollbacks == 0


def test_salvar_todos_reverte_delete_e_insercoes_se_um_detalhe_falhar():
    conexao = ConexaoPostgresFalsa(falhar_em="INSERT INTO escalas_ciclo_dias")
    repository = PostgresEscalaRepository(conexao)

    with pytest.raises(RuntimeError, match="falha de inserção"):
        repository.salvar_todos([EscalaCicloDias("Escala teste", 6, 3)])

    assert conexao.commits == 0
    assert conexao.rollbacks == 1


def test_salvar_todos_desativa_autocommit_durante_substituicao():
    conexao = ConexaoPostgresFalsa()
    conexao.autocommit = True
    repository = PostgresEscalaRepository(conexao)

    repository.salvar_todos([EscalaCicloDias("Escala teste", 6, 3)])

    assert conexao.commits == 1
    assert conexao.autocommit is True
