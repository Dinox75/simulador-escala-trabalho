import json
import armazenamento


def test_salvar_e_carregar_escalas(tmp_path, monkeypatch):
    arquivo_teste = tmp_path / "escalas.json"

    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", arquivo_teste)

    escalas = [
        {
            "nome": "Escala teste 2x2",
            "dias_trabalho": 2,
            "dias_folga": 2
        }
    ]

    armazenamento.salvar_escalas(escalas)
    resultado = armazenamento.carregar_escalas()

    assert resultado == [
        {
            "nome": "Escala teste 2x2",
            "tipo": "ciclo_dias",
            "dias_trabalho": 2,
            "dias_folga": 2
        }
    ]


def test_adicionar_escala_com_sucesso(tmp_path, monkeypatch):
    arquivo_teste = tmp_path / "escalas.json"

    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", arquivo_teste)

    armazenamento.salvar_escalas([])

    resultado = armazenamento.adicionar_escala("Escala teste 3x2", 3, 2)

    assert resultado == "sucesso"

    escalas = armazenamento.carregar_escalas()

    assert len(escalas) == 1
    assert escalas[0]["nome"] == "Escala teste 3x2"
    assert escalas[0]["tipo"] == "ciclo_dias"
    assert escalas[0]["dias_trabalho"] == 3
    assert escalas[0]["dias_folga"] == 2


def test_adicionar_escala_com_nome_duplicado(tmp_path, monkeypatch):
    arquivo_teste = tmp_path / "escalas.json"

    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", arquivo_teste)

    escalas_iniciais = [
        {
            "nome": "Escala padrão 6x3",
            "dias_trabalho": 6,
            "dias_folga": 3
        }
    ]

    armazenamento.salvar_escalas(escalas_iniciais)

    resultado = armazenamento.adicionar_escala("Escala padrão 6x3", 5, 2)

    assert resultado == "nome_duplicado"


def test_adicionar_escala_com_configuracao_duplicada(tmp_path, monkeypatch):
    arquivo_teste = tmp_path / "escalas.json"

    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", arquivo_teste)

    escalas_iniciais = [
        {
            "nome": "Escala padrão 6x3",
            "dias_trabalho": 6,
            "dias_folga": 3
        }
    ]

    armazenamento.salvar_escalas(escalas_iniciais)

    resultado = armazenamento.adicionar_escala("Minha escala nova", 6, 3)

    assert resultado == "configuracao_duplicada"


def test_remover_escala_com_sucesso(tmp_path, monkeypatch):
    arquivo_teste = tmp_path / "escalas.json"

    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", arquivo_teste)

    escalas_iniciais = [
        {
            "nome": "Escala padrão 6x3",
            "dias_trabalho": 6,
            "dias_folga": 3
        },
        {
            "nome": "Escala administrativa 5x2",
            "dias_trabalho": 5,
            "dias_folga": 2
        }
    ]

    armazenamento.salvar_escalas(escalas_iniciais)

    resultado = armazenamento.remover_escala(0)

    assert resultado is True

    escalas = armazenamento.carregar_escalas()

    assert len(escalas) == 1
    assert escalas[0]["nome"] == "Escala administrativa 5x2"


def test_remover_escala_com_indice_invalido(tmp_path, monkeypatch):
    arquivo_teste = tmp_path / "escalas.json"

    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", arquivo_teste)

    escalas_iniciais = [
        {
            "nome": "Escala padrão 6x3",
            "dias_trabalho": 6,
            "dias_folga": 3
        }
    ]

    armazenamento.salvar_escalas(escalas_iniciais)

    resultado = armazenamento.remover_escala(10)

    assert resultado is False

    escalas = armazenamento.carregar_escalas()

    assert len(escalas) == 1


def test_editar_escala_com_sucesso(tmp_path, monkeypatch):
    arquivo_teste = tmp_path / "escalas.json"

    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", arquivo_teste)

    escalas_iniciais = [
        {
            "nome": "Escala padrão 6x3",
            "dias_trabalho": 6,
            "dias_folga": 3
        }
    ]

    armazenamento.salvar_escalas(escalas_iniciais)

    resultado = armazenamento.editar_escala(0, "Escala atualizada 5x2", 5, 2)

    assert resultado == "sucesso"

    escalas = armazenamento.carregar_escalas()

    assert escalas[0]["nome"] == "Escala atualizada 5x2"
    assert escalas[0]["tipo"] == "ciclo_dias"
    assert escalas[0]["dias_trabalho"] == 5
    assert escalas[0]["dias_folga"] == 2


def test_editar_escala_com_indice_invalido(tmp_path, monkeypatch):
    arquivo_teste = tmp_path / "escalas.json"

    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", arquivo_teste)

    escalas_iniciais = [
        {
            "nome": "Escala padrão 6x3",
            "dias_trabalho": 6,
            "dias_folga": 3
        }
    ]

    armazenamento.salvar_escalas(escalas_iniciais)

    resultado = armazenamento.editar_escala(10, "Nova escala", 4, 2)

    assert resultado == "indice_invalido"


def test_editar_escala_com_nome_duplicado(tmp_path, monkeypatch):
    arquivo_teste = tmp_path / "escalas.json"

    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", arquivo_teste)

    escalas_iniciais = [
        {
            "nome": "Escala padrão 6x3",
            "dias_trabalho": 6,
            "dias_folga": 3
        },
        {
            "nome": "Escala administrativa 5x2",
            "dias_trabalho": 5,
            "dias_folga": 2
        }
    ]

    armazenamento.salvar_escalas(escalas_iniciais)

    resultado = armazenamento.editar_escala(0, "Escala administrativa 5x2", 4, 4)

    assert resultado == "nome_duplicado"


def test_editar_escala_com_configuracao_duplicada(tmp_path, monkeypatch):
    arquivo_teste = tmp_path / "escalas.json"

    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", arquivo_teste)

    escalas_iniciais = [
        {
            "nome": "Escala padrão 6x3",
            "dias_trabalho": 6,
            "dias_folga": 3
        },
        {
            "nome": "Escala administrativa 5x2",
            "dias_trabalho": 5,
            "dias_folga": 2
        }
    ]

    armazenamento.salvar_escalas(escalas_iniciais)

    resultado = armazenamento.editar_escala(0, "Escala nova", 5, 2)

    assert resultado == "configuracao_duplicada"


def test_carregar_escala_antiga_sem_tipo(tmp_path, monkeypatch):
    arquivo_teste = tmp_path / "escalas.json"

    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", arquivo_teste)

    escalas_antigas = [
        {
            "nome": "Escala antiga 6x3",
            "dias_trabalho": 6,
            "dias_folga": 3
        }
    ]

    armazenamento.salvar_escalas(escalas_antigas)

    resultado = armazenamento.carregar_escalas()

    assert resultado[0]["tipo"] == "ciclo_dias"


def test_adicionar_escala_com_tipo_padrao(tmp_path, monkeypatch):
    arquivo_teste = tmp_path / "escalas.json"

    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", arquivo_teste)

    resultado = armazenamento.adicionar_escala("Escala teste 4x2", 4, 2)

    escalas = armazenamento.carregar_escalas()

    assert resultado == "sucesso"
    assert escalas[0]["tipo"] == "ciclo_dias"


def test_editar_escala_mantem_tipo(tmp_path, monkeypatch):
    arquivo_teste = tmp_path / "escalas.json"

    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", arquivo_teste)

    escalas = [
        {
            "nome": "Escala teste 5x2",
            "tipo": "ciclo_dias",
            "dias_trabalho": 5,
            "dias_folga": 2
        }
    ]

    armazenamento.salvar_escalas(escalas)

    resultado = armazenamento.editar_escala(0, "Escala editada 6x3", 6, 3)

    escalas_atualizadas = armazenamento.carregar_escalas()

    assert resultado == "sucesso"
    assert escalas_atualizadas[0]["tipo"] == "ciclo_dias"


def test_carregar_escala_antiga_migra_arquivo_json(tmp_path, monkeypatch):
    arquivo_teste = tmp_path / "escalas.json"

    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", arquivo_teste)

    escalas_antigas = [
        {
            "nome": "Escala antiga 6x3",
            "dias_trabalho": 6,
            "dias_folga": 3
        }
    ]

    armazenamento.salvar_escalas(escalas_antigas)

    armazenamento.carregar_escalas()

    with open(arquivo_teste, "r", encoding="utf-8") as arquivo:
        escalas_salvas = json.load(arquivo)

    assert escalas_salvas[0]["tipo"] == "ciclo_dias"


def test_carregar_escala_com_tipo_invalido_corrige_para_padrao(tmp_path, monkeypatch):
    arquivo_teste = tmp_path / "escalas.json"

    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", arquivo_teste)

    escalas = [
        {
            "nome": "Escala com tipo inválido",
            "tipo": "tipo_errado",
            "dias_trabalho": 6,
            "dias_folga": 3
        }
    ]

    armazenamento.salvar_escalas(escalas)

    resultado = armazenamento.carregar_escalas()

    assert resultado[0]["tipo"] == "ciclo_dias"

def test_adicionar_escala_ciclo_horas_com_sucesso(tmp_path, monkeypatch):
    arquivo_teste = tmp_path / "escalas.json"

    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", arquivo_teste)

    armazenamento.salvar_escalas([])

    resultado = armazenamento.adicionar_escala_ciclo_horas(
        "Escala 12x36",
        12,
        36
    )

    escalas = armazenamento.carregar_escalas()

    assert resultado == "sucesso"
    assert len(escalas) == 1
    assert escalas[0]["nome"] == "Escala 12x36"
    assert escalas[0]["tipo"] == "ciclo_horas"
    assert escalas[0]["horas_trabalho"] == 12
    assert escalas[0]["horas_folga"] == 36


def test_adicionar_escala_ciclo_horas_com_configuracao_duplicada(tmp_path, monkeypatch):
    arquivo_teste = tmp_path / "escalas.json"

    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", arquivo_teste)

    escalas_iniciais = [
        {
            "nome": "Escala 12x36",
            "tipo": "ciclo_horas",
            "horas_trabalho": 12,
            "horas_folga": 36
        }
    ]

    armazenamento.salvar_escalas(escalas_iniciais)

    resultado = armazenamento.adicionar_escala_ciclo_horas(
        "Outra escala 12x36",
        12,
        36
    )

    assert resultado == "configuracao_duplicada"


def test_adicionar_escala_por_dias_nao_quebra_com_escala_por_horas_existente(tmp_path, monkeypatch):
    arquivo_teste = tmp_path / "escalas.json"

    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", arquivo_teste)

    escalas_iniciais = [
        {
            "nome": "Escala 12x36",
            "tipo": "ciclo_horas",
            "horas_trabalho": 12,
            "horas_folga": 36
        }
    ]

    armazenamento.salvar_escalas(escalas_iniciais)

    resultado = armazenamento.adicionar_escala(
        "Escala 6x3",
        6,
        3
    )

    escalas = armazenamento.carregar_escalas()

    assert resultado == "sucesso"
    assert len(escalas) == 2
    assert escalas[1]["tipo"] == "ciclo_dias"
    assert escalas[1]["dias_trabalho"] == 6
    assert escalas[1]["dias_folga"] == 3


def test_editar_escala_por_dias_nao_quebra_com_escala_por_horas_existente(tmp_path, monkeypatch):
    arquivo_teste = tmp_path / "escalas.json"

    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", arquivo_teste)

    escalas_iniciais = [
        {
            "nome": "Escala 12x36",
            "tipo": "ciclo_horas",
            "horas_trabalho": 12,
            "horas_folga": 36
        },
        {
            "nome": "Escala 6x3",
            "tipo": "ciclo_dias",
            "dias_trabalho": 6,
            "dias_folga": 3
        }
    ]

    armazenamento.salvar_escalas(escalas_iniciais)

    resultado = armazenamento.editar_escala(
        1,
        "Escala 5x2",
        5,
        2
    )

    escalas = armazenamento.carregar_escalas()

    assert resultado == "sucesso"
    assert escalas[1]["nome"] == "Escala 5x2"
    assert escalas[1]["tipo"] == "ciclo_dias"
    assert escalas[1]["dias_trabalho"] == 5
    assert escalas[1]["dias_folga"] == 2

def test_editar_escala_ciclo_horas_com_sucesso(tmp_path, monkeypatch):
    arquivo_teste = tmp_path / "escalas.json"

    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", arquivo_teste)

    escalas_iniciais = [
        {
            "nome": "Escala 12x36",
            "tipo": "ciclo_horas",
            "horas_trabalho": 12,
            "horas_folga": 36
        }
    ]

    armazenamento.salvar_escalas(escalas_iniciais)

    resultado = armazenamento.editar_escala_ciclo_horas(
        0,
        "Escala 24x72",
        24,
        72
    )

    escalas = armazenamento.carregar_escalas()

    assert resultado == "sucesso"
    assert escalas[0]["nome"] == "Escala 24x72"
    assert escalas[0]["tipo"] == "ciclo_horas"
    assert escalas[0]["horas_trabalho"] == 24
    assert escalas[0]["horas_folga"] == 72


def test_editar_escala_ciclo_horas_com_indice_invalido(tmp_path, monkeypatch):
    arquivo_teste = tmp_path / "escalas.json"

    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", arquivo_teste)

    armazenamento.salvar_escalas([])

    resultado = armazenamento.editar_escala_ciclo_horas(
        10,
        "Escala inválida",
        12,
        36
    )

    assert resultado == "indice_invalido"


def test_editar_escala_ciclo_horas_com_nome_duplicado(tmp_path, monkeypatch):
    arquivo_teste = tmp_path / "escalas.json"

    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", arquivo_teste)

    escalas_iniciais = [
        {
            "nome": "Escala 12x36",
            "tipo": "ciclo_horas",
            "horas_trabalho": 12,
            "horas_folga": 36
        },
        {
            "nome": "Escala 24x72",
            "tipo": "ciclo_horas",
            "horas_trabalho": 24,
            "horas_folga": 72
        }
    ]

    armazenamento.salvar_escalas(escalas_iniciais)

    resultado = armazenamento.editar_escala_ciclo_horas(
        0,
        "Escala 24x72",
        18,
        54
    )

    assert resultado == "nome_duplicado"


def test_editar_escala_ciclo_horas_com_configuracao_duplicada(tmp_path, monkeypatch):
    arquivo_teste = tmp_path / "escalas.json"

    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", arquivo_teste)

    escalas_iniciais = [
        {
            "nome": "Escala 12x36",
            "tipo": "ciclo_horas",
            "horas_trabalho": 12,
            "horas_folga": 36
        },
        {
            "nome": "Escala 24x72",
            "tipo": "ciclo_horas",
            "horas_trabalho": 24,
            "horas_folga": 72
        }
    ]

    armazenamento.salvar_escalas(escalas_iniciais)

    resultado = armazenamento.editar_escala_ciclo_horas(
        0,
        "Escala nova",
        24,
        72
    )

    assert resultado == "configuracao_duplicada"


def test_editar_escala_ciclo_horas_nao_quebra_com_escala_por_dias_existente(tmp_path, monkeypatch):
    arquivo_teste = tmp_path / "escalas.json"

    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", arquivo_teste)

    escalas_iniciais = [
        {
            "nome": "Escala 6x3",
            "tipo": "ciclo_dias",
            "dias_trabalho": 6,
            "dias_folga": 3
        },
        {
            "nome": "Escala 12x36",
            "tipo": "ciclo_horas",
            "horas_trabalho": 12,
            "horas_folga": 36
        }
    ]

    armazenamento.salvar_escalas(escalas_iniciais)

    resultado = armazenamento.editar_escala_ciclo_horas(
        1,
        "Escala 18x54",
        18,
        54
    )

    escalas = armazenamento.carregar_escalas()

    assert resultado == "sucesso"
    assert escalas[1]["nome"] == "Escala 18x54"
    assert escalas[1]["tipo"] == "ciclo_horas"
    assert escalas[1]["horas_trabalho"] == 18
    assert escalas[1]["horas_folga"] == 54

def test_adicionar_escala_turno_rotativo_com_sucesso(tmp_path, monkeypatch):
    arquivo_teste = tmp_path / "escalas.json"

    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", arquivo_teste)

    armazenamento.salvar_escalas([])

    resultado = armazenamento.adicionar_escala_turno_rotativo(
        "Escala revezamento",
        ["Manhã", "Tarde", "Noite", "Folga"]
    )

    escalas = armazenamento.carregar_escalas()

    assert resultado == "sucesso"
    assert len(escalas) == 1
    assert escalas[0]["nome"] == "Escala revezamento"
    assert escalas[0]["tipo"] == "turno_rotativo"
    assert escalas[0]["sequencia_turnos"] == ["Manhã", "Tarde", "Noite", "Folga"]


def test_adicionar_escala_turno_rotativo_com_nome_duplicado(tmp_path, monkeypatch):
    arquivo_teste = tmp_path / "escalas.json"

    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", arquivo_teste)

    armazenamento.salvar_escalas([
        {
            "nome": "Escala revezamento",
            "tipo": "turno_rotativo",
            "sequencia_turnos": ["Manhã", "Tarde", "Noite", "Folga"]
        }
    ])

    resultado = armazenamento.adicionar_escala_turno_rotativo(
        "Escala revezamento",
        ["Manhã", "Manhã", "Folga"]
    )

    assert resultado == "nome_duplicado"


def test_adicionar_escala_turno_rotativo_com_configuracao_duplicada(tmp_path, monkeypatch):
    arquivo_teste = tmp_path / "escalas.json"

    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", arquivo_teste)

    armazenamento.salvar_escalas([
        {
            "nome": "Escala A",
            "tipo": "turno_rotativo",
            "sequencia_turnos": ["Manhã", "Tarde", "Noite", "Folga"]
        }
    ])

    resultado = armazenamento.adicionar_escala_turno_rotativo(
        "Escala B",
        ["Manhã", "Tarde", "Noite", "Folga"]
    )

    assert resultado == "configuracao_duplicada"


def test_adicionar_escala_turno_rotativo_com_sequencia_vazia(tmp_path, monkeypatch):
    arquivo_teste = tmp_path / "escalas.json"

    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", arquivo_teste)

    armazenamento.salvar_escalas([])

    resultado = armazenamento.adicionar_escala_turno_rotativo(
        "Escala vazia",
        []
    )

    assert resultado == "sequencia_vazia"

def test_editar_escala_turno_rotativo_com_sucesso(tmp_path, monkeypatch):
    arquivo_teste = tmp_path / "escalas.json"

    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", arquivo_teste)

    armazenamento.salvar_escalas([
        {
            "nome": "Escala antiga",
            "tipo": "turno_rotativo",
            "sequencia_turnos": ["Manhã", "Tarde", "Folga"]
        }
    ])

    resultado = armazenamento.editar_escala_turno_rotativo(
        0,
        "Escala atualizada",
        ["Manhã", "Tarde", "Noite", "Folga"]
    )

    escalas = armazenamento.carregar_escalas()

    assert resultado == "sucesso"
    assert escalas[0]["nome"] == "Escala atualizada"
    assert escalas[0]["tipo"] == "turno_rotativo"
    assert escalas[0]["sequencia_turnos"] == ["Manhã", "Tarde", "Noite", "Folga"]


def test_editar_escala_turno_rotativo_com_indice_invalido(tmp_path, monkeypatch):
    arquivo_teste = tmp_path / "escalas.json"

    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", arquivo_teste)

    armazenamento.salvar_escalas([])

    resultado = armazenamento.editar_escala_turno_rotativo(
        5,
        "Escala atualizada",
        ["Manhã", "Folga"]
    )

    assert resultado == "indice_invalido"


def test_editar_escala_turno_rotativo_com_nome_duplicado(tmp_path, monkeypatch):
    arquivo_teste = tmp_path / "escalas.json"

    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", arquivo_teste)

    armazenamento.salvar_escalas([
        {
            "nome": "Escala A",
            "tipo": "turno_rotativo",
            "sequencia_turnos": ["Manhã", "Tarde"]
        },
        {
            "nome": "Escala B",
            "tipo": "turno_rotativo",
            "sequencia_turnos": ["Noite", "Folga"]
        }
    ])

    resultado = armazenamento.editar_escala_turno_rotativo(
        0,
        "Escala B",
        ["Manhã", "Tarde", "Noite"]
    )

    assert resultado == "nome_duplicado"


def test_editar_escala_turno_rotativo_com_configuracao_duplicada(tmp_path, monkeypatch):
    arquivo_teste = tmp_path / "escalas.json"

    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", arquivo_teste)

    armazenamento.salvar_escalas([
        {
            "nome": "Escala A",
            "tipo": "turno_rotativo",
            "sequencia_turnos": ["Manhã", "Tarde"]
        },
        {
            "nome": "Escala B",
            "tipo": "turno_rotativo",
            "sequencia_turnos": ["Noite", "Folga"]
        }
    ])

    resultado = armazenamento.editar_escala_turno_rotativo(
        0,
        "Escala C",
        ["Noite", "Folga"]
    )

    assert resultado == "configuracao_duplicada"


def test_editar_escala_turno_rotativo_com_sequencia_vazia(tmp_path, monkeypatch):
    arquivo_teste = tmp_path / "escalas.json"

    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", arquivo_teste)

    armazenamento.salvar_escalas([
        {
            "nome": "Escala A",
            "tipo": "turno_rotativo",
            "sequencia_turnos": ["Manhã", "Tarde"]
        }
    ])

    resultado = armazenamento.editar_escala_turno_rotativo(
        0,
        "Escala A atualizada",
        []
    )

    assert resultado == "sequencia_vazia"