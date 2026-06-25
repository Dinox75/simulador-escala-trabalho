from models.escala_ciclo_dias import EscalaCicloDias
from models.escala_ciclo_horas import EscalaCicloHoras
from repositories.json_escala_repository import JsonEscalaRepository
from services.escala_service import EscalaService


def test_service_lista_escalas(tmp_path):
    caminho = tmp_path / "escalas.json"
    repository = JsonEscalaRepository(caminho)
    service = EscalaService(repository)

    repository.salvar_todos([
        EscalaCicloDias("Escala 6x3", 6, 3),
        EscalaCicloHoras("Escala 12x36", 12, 36)
    ])

    resultado = service.listar_escalas()

    assert len(resultado) == 2
    assert resultado[0].nome == "Escala 6x3"
    assert resultado[1].nome == "Escala 12x36"


def test_service_busca_escala_por_nome(tmp_path):
    caminho = tmp_path / "escalas.json"
    repository = JsonEscalaRepository(caminho)
    service = EscalaService(repository)

    repository.salvar_todos([
        EscalaCicloDias("Escala 6x3", 6, 3)
    ])

    resultado = service.buscar_escala_por_nome("Escala 6x3")

    assert resultado is not None
    assert resultado.nome == "Escala 6x3"


def test_service_adiciona_escala_com_sucesso(tmp_path):
    caminho = tmp_path / "escalas.json"
    repository = JsonEscalaRepository(caminho)
    service = EscalaService(repository)

    escala = EscalaCicloDias("Escala 5x2", 5, 2)

    resultado = service.adicionar_escala(escala)
    escalas = service.listar_escalas()

    assert resultado == "sucesso"
    assert len(escalas) == 1
    assert escalas[0].nome == "Escala 5x2"


def test_service_nao_adiciona_escala_com_nome_duplicado(tmp_path):
    caminho = tmp_path / "escalas.json"
    repository = JsonEscalaRepository(caminho)
    service = EscalaService(repository)

    escala_1 = EscalaCicloDias("Escala 6x3", 6, 3)
    escala_2 = EscalaCicloDias("Escala 6x3", 6, 3)

    service.adicionar_escala(escala_1)
    resultado = service.adicionar_escala(escala_2)
    escalas = service.listar_escalas()

    assert resultado == "nome_duplicado"
    assert len(escalas) == 1


def test_service_exclui_escala_com_sucesso(tmp_path):
    caminho = tmp_path / "escalas.json"
    repository = JsonEscalaRepository(caminho)
    service = EscalaService(repository)

    repository.salvar_todos([
        EscalaCicloDias("Escala 6x3", 6, 3)
    ])

    resultado = service.excluir_escala_por_nome("Escala 6x3")
    escalas = service.listar_escalas()

    assert resultado == "sucesso"
    assert escalas == []


def test_service_retorna_nao_encontrada_ao_excluir_escala_inexistente(tmp_path):
    caminho = tmp_path / "escalas.json"
    repository = JsonEscalaRepository(caminho)
    service = EscalaService(repository)

    resultado = service.excluir_escala_por_nome("Escala inexistente")

    assert resultado == "nao_encontrada"