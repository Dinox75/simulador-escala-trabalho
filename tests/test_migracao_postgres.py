import json
from unittest.mock import MagicMock, patch

import pytest

from models.escala_factory import criar_escala_a_partir_de_dict
from repositories.escala_repository import EscalaRepositoryError
from repositories.postgres_escala_repository import PostgresEscalaRepository
from services.migracao_postgres import migrar_json_para_postgres
from services.migracao_postgres import prever_migracao_json_postgres


def test_previa_valida_origem_e_conta_tipos_sem_alterar_json_ou_conectar(tmp_path):
    origem = tmp_path / "escalas-teste.json"
    dados = [
        {"nome": "Ciclo dias", "tipo": "ciclo_dias", "dias_trabalho": 6, "dias_folga": 3},
        {"nome": "Ciclo horas", "tipo": "ciclo_horas", "horas_trabalho": 12, "horas_folga": 36},
        {"nome": "Turnos", "tipo": "turno_rotativo", "sequencia_turnos": ["Manhã", "Folga"]},
    ]
    bytes_originais = json.dumps(dados, ensure_ascii=False, indent=2).encode("utf-8")
    origem.write_bytes(bytes_originais)

    previa = prever_migracao_json_postgres(origem)

    assert previa["total"] == 3
    assert previa["por_tipo"] == {
        "ciclo_dias": 1,
        "ciclo_horas": 1,
        "turno_rotativo": 1,
    }
    assert previa["escalas"] == dados
    assert origem.read_bytes() == bytes_originais


@pytest.mark.parametrize(
    "dados",
    [
        {"nome": "JSON inválido"},
        [{"nome": "Tipo desconhecido", "tipo": "outro"}],
        [{"nome": "Ciclo sem campo", "tipo": "ciclo_dias", "dias_trabalho": 6}],
        [{"nome": "Turnos vazios", "tipo": "turno_rotativo", "sequencia_turnos": []}],
    ],
)
def test_previa_recusa_origem_invalida(tmp_path, dados):
    origem = tmp_path / "escalas.json"
    origem.write_text(json.dumps(dados, ensure_ascii=False), encoding="utf-8")

    with pytest.raises(EscalaRepositoryError):
        prever_migracao_json_postgres(origem)


def _conexao_falsa(quantidade_existente=0):
    conexao = MagicMock()
    conexao.autocommit = False
    cursor = conexao.cursor.return_value.__enter__.return_value
    cursor.fetchone.return_value = (quantidade_existente,)
    return conexao


def test_migracao_commit_unico_depois_de_validar_retorno(tmp_path):
    origem = tmp_path / "escalas.json"
    dados = [
        {"nome": "Ciclo dias", "tipo": "ciclo_dias", "dias_trabalho": 6, "dias_folga": 3},
        {"nome": "Ciclo horas", "tipo": "ciclo_horas", "horas_trabalho": 12, "horas_folga": 36},
    ]
    origem.write_text(json.dumps(dados), encoding="utf-8")
    conexao = _conexao_falsa()

    with patch.object(PostgresEscalaRepository, "_inserir") as inserir, patch.object(
        PostgresEscalaRepository,
        "listar",
        return_value=[criar_escala_a_partir_de_dict(dado) for dado in dados],
    ):
        assert migrar_json_para_postgres(origem, conexao) == 2

    assert inserir.call_count == 2
    conexao.commit.assert_called_once_with()
    conexao.rollback.assert_not_called()


def test_migracao_reverte_erro_apos_insercao_parcial(tmp_path):
    origem = tmp_path / "escalas.json"
    dados = [
        {"nome": "Ciclo dias", "tipo": "ciclo_dias", "dias_trabalho": 6, "dias_folga": 3},
        {"nome": "Ciclo horas", "tipo": "ciclo_horas", "horas_trabalho": 12, "horas_folga": 36},
    ]
    origem.write_text(json.dumps(dados), encoding="utf-8")
    conexao = _conexao_falsa()

    with patch.object(
        PostgresEscalaRepository,
        "_inserir",
        side_effect=[None, RuntimeError("falha simulada")],
    ) as inserir:
        with pytest.raises(RuntimeError, match="falha simulada"):
            migrar_json_para_postgres(origem, conexao)

    assert inserir.call_count == 2
    conexao.commit.assert_not_called()
    conexao.rollback.assert_called_once_with()


def test_migracao_recusa_destino_populado_antes_de_inserir(tmp_path):
    origem = tmp_path / "escalas.json"
    origem.write_text(
        json.dumps([{"nome": "Ciclo dias", "tipo": "ciclo_dias", "dias_trabalho": 6, "dias_folga": 3}]),
        encoding="utf-8",
    )
    conexao = _conexao_falsa(quantidade_existente=1)

    with patch.object(PostgresEscalaRepository, "_inserir") as inserir:
        with pytest.raises(ValueError, match="já contém escalas"):
            migrar_json_para_postgres(origem, conexao)

    inserir.assert_not_called()
    conexao.commit.assert_not_called()
    conexao.rollback.assert_called_once_with()
