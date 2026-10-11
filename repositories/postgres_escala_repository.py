from contextlib import contextmanager

from models.escala_factory import criar_escala_a_partir_de_dict
from repositories.escala_repository import EscalaRepository, EscalaRepositoryError
from tipos_escala import TIPO_CICLO_DIAS, TIPO_CICLO_HORAS, TIPO_TURNO_ROTATIVO


class PostgresEscalaRepository(EscalaRepository):
    def __init__(self, conexao):
        self.conexao = conexao

    def listar(self):
        try:
            with self.conexao.cursor() as cursor:
                cursor.execute("SELECT id, nome, tipo FROM escalas ORDER BY id;")
                escalas_base = cursor.fetchall()
            return [self._montar_escala(*linha) for linha in escalas_base]
        except Exception:
            self._rollback()
            raise

    def salvar_todos(self, escalas):
        """Replace the collection atomically; callers should prefer targeted updates."""
        with self.transacao():
            with self.conexao.cursor() as cursor:
                cursor.execute("DELETE FROM escalas;")
                for escala in escalas:
                    self._inserir(cursor, escala)

    def adicionar(self, escala):
        with self.transacao():
            with self.conexao.cursor() as cursor:
                self._inserir(cursor, escala)

    def buscar_por_nome(self, nome):
        try:
            with self.conexao.cursor() as cursor:
                cursor.execute(
                    "SELECT id, nome, tipo FROM escalas WHERE nome = %s;", (nome,)
                )
                resultado = cursor.fetchone()
            return self._montar_escala(*resultado) if resultado else None
        except Exception:
            self._rollback()
            raise

    def atualizar_por_nome(self, nome, nova_escala):
        with self.transacao():
            with self.conexao.cursor() as cursor:
                cursor.execute(
                    "SELECT id FROM escalas WHERE nome = %s FOR UPDATE;", (nome,)
                )
                resultado = cursor.fetchone()
                if resultado is None:
                    return False

                escala_id = resultado[0]
                for tabela in (
                    "escalas_ciclo_dias",
                    "escalas_ciclo_horas",
                    "escalas_turnos",
                ):
                    cursor.execute(
                        f"DELETE FROM {tabela} WHERE escala_id = %s;", (escala_id,)
                    )
                dados = nova_escala.to_dict()
                cursor.execute(
                    "UPDATE escalas SET nome = %s, tipo = %s WHERE id = %s;",
                    (dados["nome"], dados["tipo"], escala_id),
                )
                self._inserir_dados_especificos(cursor, escala_id, dados)
            return True

    def excluir_por_nome(self, nome):
        with self.transacao():
            with self.conexao.cursor() as cursor:
                cursor.execute(
                    "DELETE FROM escalas WHERE nome = %s RETURNING id;", (nome,)
                )
                resultado = cursor.fetchone()
            return resultado is not None

    def close(self):
        self.conexao.close()

    @contextmanager
    def transacao(self):
        autocommit_anterior = getattr(self.conexao, "autocommit", False)
        if autocommit_anterior:
            self.conexao.autocommit = False
        try:
            yield
            self.conexao.commit()
        except Exception:
            self._rollback()
            raise
        finally:
            if autocommit_anterior:
                self.conexao.autocommit = True

    def _rollback(self):
        try:
            self.conexao.rollback()
        except Exception:
            # Preserve the original query/commit failure; request/CLI scope closes the connection.
            pass

    def _montar_escala(self, escala_id, nome, tipo):
        dados = {"nome": nome, "tipo": tipo}
        with self.conexao.cursor() as cursor:
            if tipo == TIPO_CICLO_HORAS:
                cursor.execute(
                    "SELECT horas_trabalho, horas_folga FROM escalas_ciclo_horas WHERE escala_id = %s;",
                    (escala_id,),
                )
                detalhe = cursor.fetchone()
                if detalhe is None:
                    raise EscalaRepositoryError(
                        f"Escala PostgreSQL {nome!r} sem configuração de ciclo por horas."
                    )
                dados["horas_trabalho"], dados["horas_folga"] = detalhe
            elif tipo == TIPO_TURNO_ROTATIVO:
                cursor.execute(
                    "SELECT turno FROM escalas_turnos WHERE escala_id = %s ORDER BY ordem;",
                    (escala_id,),
                )
                dados["sequencia_turnos"] = [linha[0] for linha in cursor.fetchall()]
            elif tipo == TIPO_CICLO_DIAS:
                cursor.execute(
                    "SELECT dias_trabalho, dias_folga FROM escalas_ciclo_dias WHERE escala_id = %s;",
                    (escala_id,),
                )
                detalhe = cursor.fetchone()
                if detalhe is None:
                    raise EscalaRepositoryError(
                        f"Escala PostgreSQL {nome!r} sem configuração de ciclo por dias."
                    )
                dados["dias_trabalho"], dados["dias_folga"] = detalhe
            else:
                raise EscalaRepositoryError(
                    f"Tipo de escala PostgreSQL desconhecido: {tipo!r}."
                )
        try:
            return criar_escala_a_partir_de_dict(dados)
        except (KeyError, TypeError, ValueError) as erro:
            raise EscalaRepositoryError(
                f"Configuração PostgreSQL inválida para escala {nome!r}: {erro}"
            ) from erro

    @staticmethod
    def _inserir(cursor, escala):
        dados = escala.to_dict()
        cursor.execute(
            "INSERT INTO escalas (nome, tipo) VALUES (%s, %s) RETURNING id;",
            (dados["nome"], dados["tipo"]),
        )
        escala_id = cursor.fetchone()[0]
        PostgresEscalaRepository._inserir_dados_especificos(
            cursor, escala_id, dados
        )

    @staticmethod
    def _inserir_dados_especificos(cursor, escala_id, dados):
        tipo = dados["tipo"]
        if tipo == TIPO_CICLO_HORAS:
            cursor.execute(
                "INSERT INTO escalas_ciclo_horas (escala_id, horas_trabalho, horas_folga) VALUES (%s, %s, %s);",
                (escala_id, dados["horas_trabalho"], dados["horas_folga"]),
            )
        elif tipo == TIPO_TURNO_ROTATIVO:
            cursor.executemany(
                "INSERT INTO escalas_turnos (escala_id, ordem, turno) VALUES (%s, %s, %s);",
                [
                    (escala_id, ordem, turno)
                    for ordem, turno in enumerate(dados["sequencia_turnos"], start=1)
                ],
            )
        elif tipo == TIPO_CICLO_DIAS:
            cursor.execute(
                "INSERT INTO escalas_ciclo_dias (escala_id, dias_trabalho, dias_folga) VALUES (%s, %s, %s);",
                (escala_id, dados["dias_trabalho"], dados["dias_folga"]),
            )
        else:
            raise EscalaRepositoryError(f"Tipo de escala inválido: {tipo!r}.")
