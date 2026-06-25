from models.escala_ciclo_dias import EscalaCicloDias
from models.escala_ciclo_horas import EscalaCicloHoras
from models.escala_turno_rotativo import EscalaTurnoRotativo
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

from models.escala_turno_rotativo import EscalaTurnoRotativo


def test_service_nao_adiciona_escala_com_configuracao_duplicada(tmp_path):
    caminho = tmp_path / "escalas.json"
    repository = JsonEscalaRepository(caminho)
    service = EscalaService(repository)

    escala_1 = EscalaCicloDias("Escala 6x3", 6, 3)
    escala_2 = EscalaCicloDias("Minha escala 6x3", 6, 3)

    service.adicionar_escala(escala_1)
    resultado = service.adicionar_escala(escala_2)
    escalas = service.listar_escalas()

    assert resultado == "configuracao_duplicada"
    assert len(escalas) == 1


def test_service_identifica_configuracao_duplicada_em_turno_rotativo(tmp_path):
    caminho = tmp_path / "escalas.json"
    repository = JsonEscalaRepository(caminho)
    service = EscalaService(repository)

    sequencia = ["Manhã", "Tarde", "Noite", "Folga"]

    escala_1 = EscalaTurnoRotativo("Turno rotativo simples", sequencia)
    escala_2 = EscalaTurnoRotativo("Outro nome", sequencia)

    service.adicionar_escala(escala_1)
    resultado = service.adicionar_escala(escala_2)
    escalas = service.listar_escalas()

    assert resultado == "configuracao_duplicada"
    assert len(escalas) == 1

def test_service_nao_adiciona_escala_com_nome_duplicado_normalizado(tmp_path):
    caminho = tmp_path / "escalas.json"
    repository = JsonEscalaRepository(caminho)
    service = EscalaService(repository)

    escala_1 = EscalaCicloDias("Escala 6x3", 6, 3)
    escala_2 = EscalaCicloDias(" escala 6x3 ", 5, 2)

    service.adicionar_escala(escala_1)
    resultado = service.adicionar_escala(escala_2)
    escalas = service.listar_escalas()

    assert resultado == "nome_duplicado"
    assert len(escalas) == 1

def test_service_remove_escala_por_indice(tmp_path):
    caminho = tmp_path / "escalas.json"
    repository = JsonEscalaRepository(caminho)
    service = EscalaService(repository)

    repository.salvar_todos([
        EscalaCicloDias("Escala 6x3", 6, 3),
        EscalaCicloHoras("Escala 12x36", 12, 36)
    ])

    resultado = service.remover_escala_por_indice(0)
    escalas = service.listar_escalas()

    assert resultado is True
    assert len(escalas) == 1
    assert escalas[0].nome == "Escala 12x36"


def test_service_nao_remove_indice_invalido(tmp_path):
    caminho = tmp_path / "escalas.json"
    repository = JsonEscalaRepository(caminho)
    service = EscalaService(repository)

    repository.salvar_todos([
        EscalaCicloDias("Escala 6x3", 6, 3)
    ])

    resultado = service.remover_escala_por_indice(99)
    escalas = service.listar_escalas()

    assert resultado is False
    assert len(escalas) == 1


def test_service_edita_escala_por_indice(tmp_path):
    caminho = tmp_path / "escalas.json"
    repository = JsonEscalaRepository(caminho)
    service = EscalaService(repository)

    repository.salvar_todos([
        EscalaCicloDias("Escala 6x3", 6, 3)
    ])

    nova_escala = EscalaCicloDias("Escala 5x2", 5, 2)

    resultado = service.editar_escala_por_indice(0, nova_escala)
    escalas = service.listar_escalas()

    assert resultado == "sucesso"
    assert len(escalas) == 1
    assert escalas[0].nome == "Escala 5x2"
    assert escalas[0].dias_trabalho == 5
    assert escalas[0].dias_folga == 2


def test_service_nao_edita_indice_invalido(tmp_path):
    caminho = tmp_path / "escalas.json"
    repository = JsonEscalaRepository(caminho)
    service = EscalaService(repository)

    nova_escala = EscalaCicloDias("Escala 5x2", 5, 2)

    resultado = service.editar_escala_por_indice(99, nova_escala)

    assert resultado == "indice_invalido"


def test_service_nao_edita_com_nome_duplicado(tmp_path):
    caminho = tmp_path / "escalas.json"
    repository = JsonEscalaRepository(caminho)
    service = EscalaService(repository)

    repository.salvar_todos([
        EscalaCicloDias("Escala 6x3", 6, 3),
        EscalaCicloHoras("Escala 12x36", 12, 36)
    ])

    nova_escala = EscalaCicloDias("Escala 12x36", 5, 2)

    resultado = service.editar_escala_por_indice(0, nova_escala)
    escalas = service.listar_escalas()

    assert resultado == "nome_duplicado"
    assert escalas[0].nome == "Escala 6x3"


def test_service_nao_edita_com_configuracao_duplicada(tmp_path):
    caminho = tmp_path / "escalas.json"
    repository = JsonEscalaRepository(caminho)
    service = EscalaService(repository)

    repository.salvar_todos([
        EscalaCicloDias("Escala 6x3", 6, 3),
        EscalaCicloDias("Escala 5x2", 5, 2)
    ])

    nova_escala = EscalaCicloDias("Outra escala", 5, 2)

    resultado = service.editar_escala_por_indice(0, nova_escala)
    escalas = service.listar_escalas()

    assert resultado == "configuracao_duplicada"
    assert escalas[0].nome == "Escala 6x3"


def test_service_edita_turno_rotativo_por_indice(tmp_path):
    caminho = tmp_path / "escalas.json"
    repository = JsonEscalaRepository(caminho)
    service = EscalaService(repository)

    repository.salvar_todos([
        EscalaTurnoRotativo("Turno simples", ["Manhã", "Folga"])
    ])

    nova_escala = EscalaTurnoRotativo(
        "Turno atualizado",
        ["Tarde", "Noite", "Folga"]
    )

    resultado = service.editar_escala_por_indice(0, nova_escala)
    escalas = service.listar_escalas()

    assert resultado == "sucesso"
    assert escalas[0].nome == "Turno atualizado"
    assert escalas[0].sequencia_turnos == ["Tarde", "Noite", "Folga"]