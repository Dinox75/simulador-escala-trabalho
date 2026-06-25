from models.escala_ciclo_dias import EscalaCicloDias
from models.escala_ciclo_horas import EscalaCicloHoras
from models.escala_turno_rotativo import EscalaTurnoRotativo

from repositories.json_escala_repository import JsonEscalaRepository


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