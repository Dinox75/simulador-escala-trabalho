from collections import Counter
import json

from repositories.json_escala_repository import JsonEscalaRepository
from repositories.postgres_escala_repository import PostgresEscalaRepository
from tipos_escala import TIPO_CICLO_DIAS, TIPO_CICLO_HORAS, TIPO_TURNO_ROTATIVO


TIPOS_SUPORTADOS = (TIPO_CICLO_DIAS, TIPO_CICLO_HORAS, TIPO_TURNO_ROTATIVO)


def carregar_origem_json(caminho_origem):
    """Load and validate every JSON row through the production repository."""
    escalas = JsonEscalaRepository(caminho_origem).listar()
    nomes = set()
    configuracoes = set()
    for escala in escalas:
        if escala.tipo not in TIPOS_SUPORTADOS:
            raise ValueError(f"Tipo de escala não suportado: {escala.tipo!r}.")
        if escala.tipo == TIPO_TURNO_ROTATIVO and not escala.sequencia_turnos:
            raise ValueError(f"A escala {escala.nome!r} tem sequência de turnos vazia.")
        nome_normalizado = escala.nome.strip().casefold()
        if nome_normalizado in nomes:
            raise ValueError(f"Nome de escala repetido na origem: {escala.nome!r}.")
        nomes.add(nome_normalizado)
        configuracao = escala.to_dict()
        configuracao.pop("nome", None)
        assinatura = json.dumps(configuracao, sort_keys=True, ensure_ascii=False)
        if assinatura in configuracoes:
            raise ValueError(f"Configuração de escala repetida na origem: {escala.nome!r}.")
        configuracoes.add(assinatura)
    return escalas


def prever_migracao_json_postgres(caminho_origem):
    escalas = carregar_origem_json(caminho_origem)
    contagem = Counter(escala.tipo for escala in escalas)
    return {
        "total": len(escalas),
        "por_tipo": {tipo: contagem.get(tipo, 0) for tipo in TIPOS_SUPORTADOS},
        "escalas": [escala.to_dict() for escala in escalas],
    }


def migrar_json_para_postgres(caminho_origem, conexao):
    """Import into an empty, initialized schema in a single transaction."""
    escalas = carregar_origem_json(caminho_origem)
    repository = PostgresEscalaRepository(conexao)
    esperado = [escala.to_dict() for escala in escalas]

    with repository.transacao():
        with conexao.cursor() as cursor:
            cursor.execute("LOCK TABLE escalas IN EXCLUSIVE MODE;")
            cursor.execute("SELECT COUNT(*) FROM escalas;")
            if cursor.fetchone()[0]:
                raise ValueError(
                    "O destino PostgreSQL já contém escalas; nenhuma escala foi importada."
                )

            for escala in escalas:
                repository._inserir(cursor, escala)

        obtido = [escala.to_dict() for escala in repository.listar()]
        if obtido != esperado:
            raise ValueError(
                "A validação após importação não corresponde ao JSON de origem."
            )
    return len(escalas)
