import json

import pytest

from models.escala_ciclo_dias import EscalaCicloDias
from models.escala_ciclo_horas import EscalaCicloHoras
from models.escala_turno_rotativo import EscalaTurnoRotativo

from repositories.json_escala_repository import JsonEscalaRepository
from repositories.escala_repository import EscalaRepositoryError


def test_listar_retorna_lista_vazia_quando_arquivo_nao_existe(tmp_path):
    caminho = tmp_path / "escalas.json"
    repository = JsonEscalaRepository(caminho)

    resultado = repository.listar()

    assert resultado == []


def test_salvar_e_listar_escalas(tmp_path):
    caminho = tmp_path / "escalas.json"
    repository = JsonEscalaRepository(caminho)

    escalas = [
        EscalaCicloDias("Escala 6x3", 6, 3),
        EscalaCicloHoras("Escala 12x36", 12, 36),
        EscalaTurnoRotativo("Turno rotativo simples", ["Manhã", "Tarde", "Noite", "Folga"])
    ]

    repository.salvar_todos(escalas)

    resultado = repository.listar()

    assert len(resultado) == 3
    assert resultado[0].nome == "Escala 6x3"
    assert resultado[1].nome == "Escala 12x36"
    assert resultado[2].nome == "Turno rotativo simples"


def test_adicionar_escala(tmp_path):
    caminho = tmp_path / "escalas.json"
    repository = JsonEscalaRepository(caminho)

    escala = EscalaCicloDias("Escala 5x2", 5, 2)

    repository.adicionar(escala)

    resultado = repository.listar()

    assert len(resultado) == 1
    assert resultado[0].nome == "Escala 5x2"
    assert resultado[0].dias_trabalho == 5
    assert resultado[0].dias_folga == 2


def test_buscar_escala_por_nome(tmp_path):
    caminho = tmp_path / "escalas.json"
    repository = JsonEscalaRepository(caminho)

    repository.salvar_todos([
        EscalaCicloDias("Escala 6x3", 6, 3),
        EscalaCicloHoras("Escala 12x36", 12, 36)
    ])

    resultado = repository.buscar_por_nome("Escala 12x36")

    assert resultado is not None
    assert resultado.nome == "Escala 12x36"
    assert resultado.horas_trabalho == 12
    assert resultado.horas_folga == 36


def test_buscar_escala_por_nome_inexistente_retorna_none(tmp_path):
    caminho = tmp_path / "escalas.json"
    repository = JsonEscalaRepository(caminho)

    repository.salvar_todos([
        EscalaCicloDias("Escala 6x3", 6, 3)
    ])

    resultado = repository.buscar_por_nome("Escala inexistente")

    assert resultado is None


def test_excluir_escala_por_nome(tmp_path):
    caminho = tmp_path / "escalas.json"
    repository = JsonEscalaRepository(caminho)

    repository.salvar_todos([
        EscalaCicloDias("Escala 6x3", 6, 3),
        EscalaCicloHoras("Escala 12x36", 12, 36)
    ])

    resultado = repository.excluir_por_nome("Escala 6x3")
    escalas_restantes = repository.listar()

    assert resultado is True
    assert len(escalas_restantes) == 1
    assert escalas_restantes[0].nome == "Escala 12x36"


def test_excluir_escala_inexistente_retorna_false(tmp_path):
    caminho = tmp_path / "escalas.json"
    repository = JsonEscalaRepository(caminho)

    repository.salvar_todos([
        EscalaCicloDias("Escala 6x3", 6, 3)
    ])

    resultado = repository.excluir_por_nome("Escala inexistente")

    assert resultado is False


@pytest.mark.parametrize("conteudo", [b"{invalido", b"{}", b"[null]"])
def test_arquivo_invalido_impede_leitura_e_gravacao_sem_alterar_bytes(tmp_path, conteudo):
    caminho = tmp_path / "escalas.json"
    caminho.write_bytes(conteudo)
    repository = JsonEscalaRepository(caminho)

    with pytest.raises(EscalaRepositoryError):
        repository.listar()
    with pytest.raises(EscalaRepositoryError):
        repository.salvar_todos([EscalaCicloDias("Escala válida", 5, 2)])

    assert caminho.read_bytes() == conteudo


def test_estrutura_incompativel_impede_escrita(tmp_path):
    caminho = tmp_path / "escalas.json"
    conteudo = json.dumps([{"nome": "Escala antiga", "tipo": "tipo_desconhecido"}]).encode()
    caminho.write_bytes(conteudo)
    repository = JsonEscalaRepository(caminho)

    with pytest.raises(EscalaRepositoryError, match="Tipo de escala inválido"):
        repository.salvar_todos([])

    assert caminho.read_bytes() == conteudo


def test_falha_na_substituicao_atomica_preserva_arquivo_anterior(tmp_path, monkeypatch):
    caminho = tmp_path / "escalas.json"
    repository = JsonEscalaRepository(caminho)
    repository.salvar_todos([EscalaCicloDias("Escala antiga", 5, 2)])
    bytes_anteriores = caminho.read_bytes()

    def falhar_replace(_origem, _destino):
        raise OSError("falha simulada de substituição")

    monkeypatch.setattr("repositories.json_escala_repository.os.replace", falhar_replace)
    with pytest.raises(EscalaRepositoryError, match="falha simulada"):
        repository.salvar_todos([EscalaCicloDias("Escala nova", 6, 3)])

    assert caminho.read_bytes() == bytes_anteriores
    assert list(tmp_path.glob("*.tmp")) == []


def test_falha_de_leitura_impede_adicao_sem_alterar_arquivo(tmp_path, monkeypatch):
    caminho = tmp_path / "escalas.json"
    caminho.write_text("[]", encoding="utf-8")
    bytes_anteriores = caminho.read_bytes()
    repository = JsonEscalaRepository(caminho)
    abrir_original = type(caminho).open

    def falhar_leitura(self, *args, **kwargs):
        if self == caminho and args and args[0] == "r":
            raise OSError("falha simulada de leitura")
        return abrir_original(self, *args, **kwargs)

    monkeypatch.setattr(type(caminho), "open", falhar_leitura)
    with pytest.raises(EscalaRepositoryError, match="falha simulada de leitura"):
        repository.adicionar(EscalaCicloDias("Nova escala", 5, 2))

    assert caminho.read_bytes() == bytes_anteriores
