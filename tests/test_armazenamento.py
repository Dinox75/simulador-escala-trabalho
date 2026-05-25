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

    assert resultado == escalas

def test_adicionar_escala_com_sucesso(tmp_path, monkeypatch):
    arquivo_teste = tmp_path / "escalas.json"
    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", arquivo_teste)

    armazenamento.salvar_escalas([])

    resultado = armazenamento.adicionar_escala("Escala teste 3x2", 3, 2)

    assert resultado == "sucesso"

    escalas = armazenamento.carregar_escalas()

    assert len(escalas) == 1
    assert escalas[0]["nome"] == "Escala teste 3x2"

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