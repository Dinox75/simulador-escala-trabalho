import armazenamento
import json

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

    assert resultado == True

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

    assert resultado == False

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