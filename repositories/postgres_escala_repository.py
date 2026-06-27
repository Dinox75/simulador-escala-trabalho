from models.escala_factory import criar_escala_a_partir_de_dict
from repositories.escala_repository import EscalaRepository
from tipos_escala import (
    TIPO_CICLO_HORAS,
    TIPO_TURNO_ROTATIVO
)


class PostgresEscalaRepository(EscalaRepository):
    def __init__(self, conexao):
        self.conexao = conexao

    def listar(self):
        with self.conexao.cursor() as cursor:
            cursor.execute("""
                SELECT id, nome, tipo
                FROM escalas
                ORDER BY id;
            """)

            escalas_base = cursor.fetchall()

        return [
            self._montar_escala(escala_id, nome, tipo)
            for escala_id, nome, tipo in escalas_base
        ]

    def salvar_todos(self, escalas):
        with self.conexao.cursor() as cursor:
            cursor.execute("DELETE FROM escalas;")

        for escala in escalas:
            self.adicionar(escala)

        self.conexao.commit()

    def adicionar(self, escala):
        dados = escala.to_dict()

        with self.conexao.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO escalas (nome, tipo)
                VALUES (%s, %s)
                RETURNING id;
                """,
                (dados["nome"], dados["tipo"])
            )

            escala_id = cursor.fetchone()[0]

            self._inserir_dados_especificos(cursor, escala_id, dados)

        self.conexao.commit()

    def buscar_por_nome(self, nome):
        with self.conexao.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, nome, tipo
                FROM escalas
                WHERE nome = %s;
                """,
                (nome,)
            )

            resultado = cursor.fetchone()

        if resultado is None:
            return None

        escala_id, nome, tipo = resultado
        return self._montar_escala(escala_id, nome, tipo)

    def excluir_por_nome(self, nome):
        with self.conexao.cursor() as cursor:
            cursor.execute(
                """
                DELETE FROM escalas
                WHERE nome = %s
                RETURNING id;
                """,
                (nome,)
            )

            resultado = cursor.fetchone()

        self.conexao.commit()

        return resultado is not None

    def _montar_escala(self, escala_id, nome, tipo):
        dados = {
            "nome": nome,
            "tipo": tipo
        }

        with self.conexao.cursor() as cursor:
            if tipo == TIPO_CICLO_HORAS:
                cursor.execute(
                    """
                    SELECT horas_trabalho, horas_folga
                    FROM escalas_ciclo_horas
                    WHERE escala_id = %s;
                    """,
                    (escala_id,)
                )

                horas_trabalho, horas_folga = cursor.fetchone()
                dados["horas_trabalho"] = horas_trabalho
                dados["horas_folga"] = horas_folga

            elif tipo == TIPO_TURNO_ROTATIVO:
                cursor.execute(
                    """
                    SELECT turno
                    FROM escalas_turnos
                    WHERE escala_id = %s
                    ORDER BY ordem;
                    """,
                    (escala_id,)
                )

                dados["sequencia_turnos"] = [
                    linha[0]
                    for linha in cursor.fetchall()
                ]

            else:
                cursor.execute(
                    """
                    SELECT dias_trabalho, dias_folga
                    FROM escalas_ciclo_dias
                    WHERE escala_id = %s;
                    """,
                    (escala_id,)
                )

                dias_trabalho, dias_folga = cursor.fetchone()
                dados["dias_trabalho"] = dias_trabalho
                dados["dias_folga"] = dias_folga

        return criar_escala_a_partir_de_dict(dados)

    def _inserir_dados_especificos(self, cursor, escala_id, dados):
        tipo = dados["tipo"]

        if tipo == TIPO_CICLO_HORAS:
            cursor.execute(
                """
                INSERT INTO escalas_ciclo_horas (
                    escala_id,
                    horas_trabalho,
                    horas_folga
                )
                VALUES (%s, %s, %s);
                """,
                (
                    escala_id,
                    dados["horas_trabalho"],
                    dados["horas_folga"]
                )
            )

        elif tipo == TIPO_TURNO_ROTATIVO:
            for ordem, turno in enumerate(dados["sequencia_turnos"], start=1):
                cursor.execute(
                    """
                    INSERT INTO escalas_turnos (
                        escala_id,
                        ordem,
                        turno
                    )
                    VALUES (%s, %s, %s);
                    """,
                    (escala_id, ordem, turno)
                )

        else:
            cursor.execute(
                """
                INSERT INTO escalas_ciclo_dias (
                    escala_id,
                    dias_trabalho,
                    dias_folga
                )
                VALUES (%s, %s, %s);
                """,
                (
                    escala_id,
                    dados["dias_trabalho"],
                    dados["dias_folga"]
                )
            )