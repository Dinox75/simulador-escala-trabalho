import armazenamento


def configurar_arquivo_temporario(monkeypatch, tmp_path):
    caminho = tmp_path / "escalas.json"
    monkeypatch.setattr(armazenamento, "CAMINHO_ESCALAS", str(caminho))
    return caminho


def test_salvar_e_carregar_escalas_usando_service(monkeypatch, tmp_path):
    configurar_arquivo_temporario(monkeypatch, tmp_path)

    escalas = [
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
        },
        {
            "nome": "Turno rotativo simples",
            "tipo": "turno_rotativo",
            "sequencia_turnos": ["Manhã", "Tarde", "Noite", "Folga"]
        }
    ]

    armazenamento.salvar_escalas(escalas)
    resultado = armazenamento.carregar_escalas()

    assert resultado == escalas


def test_adicionar_escala_ciclo_dias_usando_service(monkeypatch, tmp_path):
    configurar_arquivo_temporario(monkeypatch, tmp_path)

    resultado = armazenamento.adicionar_escala("Escala 6x3", 6, 3)
    escalas = armazenamento.carregar_escalas()

    assert resultado == "sucesso"
    assert len(escalas) == 1
    assert escalas[0]["nome"] == "Escala 6x3"
    assert escalas[0]["tipo"] == "ciclo_dias"
    assert escalas[0]["dias_trabalho"] == 6
    assert escalas[0]["dias_folga"] == 3


def test_nao_adiciona_escala_ciclo_dias_com_nome_duplicado(monkeypatch, tmp_path):
    configurar_arquivo_temporario(monkeypatch, tmp_path)

    armazenamento.adicionar_escala("Escala 6x3", 6, 3)
    resultado = armazenamento.adicionar_escala(" escala 6x3 ", 5, 2)
    escalas = armazenamento.carregar_escalas()

    assert resultado == "nome_duplicado"
    assert len(escalas) == 1


def test_nao_adiciona_escala_ciclo_dias_com_configuracao_duplicada(monkeypatch, tmp_path):
    configurar_arquivo_temporario(monkeypatch, tmp_path)

    armazenamento.adicionar_escala("Escala 6x3", 6, 3)
    resultado = armazenamento.adicionar_escala("Outra escala 6x3", 6, 3)
    escalas = armazenamento.carregar_escalas()

    assert resultado == "configuracao_duplicada"
    assert len(escalas) == 1


def test_adicionar_escala_ciclo_horas_usando_service(monkeypatch, tmp_path):
    configurar_arquivo_temporario(monkeypatch, tmp_path)

    resultado = armazenamento.adicionar_escala_ciclo_horas("Escala 12x36", 12, 36)
    escalas = armazenamento.carregar_escalas()

    assert resultado == "sucesso"
    assert len(escalas) == 1
    assert escalas[0]["nome"] == "Escala 12x36"
    assert escalas[0]["tipo"] == "ciclo_horas"
    assert escalas[0]["horas_trabalho"] == 12
    assert escalas[0]["horas_folga"] == 36


def test_nao_adiciona_escala_ciclo_horas_com_configuracao_duplicada(monkeypatch, tmp_path):
    configurar_arquivo_temporario(monkeypatch, tmp_path)

    armazenamento.adicionar_escala_ciclo_horas("Escala 12x36", 12, 36)
    resultado = armazenamento.adicionar_escala_ciclo_horas("Outra 12x36", 12, 36)
    escalas = armazenamento.carregar_escalas()

    assert resultado == "configuracao_duplicada"
    assert len(escalas) == 1


def test_adicionar_escala_turno_rotativo_usando_service(monkeypatch, tmp_path):
    configurar_arquivo_temporario(monkeypatch, tmp_path)

    resultado = armazenamento.adicionar_escala_turno_rotativo(
        "Turno rotativo simples",
        ["manha", "Tarde", "NOITE", "folga"]
    )

    escalas = armazenamento.carregar_escalas()

    assert resultado == "sucesso"
    assert len(escalas) == 1
    assert escalas[0]["nome"] == "Turno rotativo simples"
    assert escalas[0]["tipo"] == "turno_rotativo"
    assert escalas[0]["sequencia_turnos"] == ["Manhã", "Tarde", "Noite", "Folga"]


def test_nao_adiciona_turno_rotativo_com_sequencia_vazia(monkeypatch, tmp_path):
    configurar_arquivo_temporario(monkeypatch, tmp_path)

    resultado = armazenamento.adicionar_escala_turno_rotativo(
        "Turno vazio",
        []
    )

    assert resultado == "sequencia_vazia"


def test_nao_adiciona_turno_rotativo_com_turno_invalido(monkeypatch, tmp_path):
    configurar_arquivo_temporario(monkeypatch, tmp_path)

    resultado = armazenamento.adicionar_escala_turno_rotativo(
        "Turno inválido",
        ["Manhã", "Madrugada", "Folga"]
    )

    assert resultado == "turno_invalido"


def test_nao_adiciona_turno_rotativo_com_configuracao_duplicada(monkeypatch, tmp_path):
    configurar_arquivo_temporario(monkeypatch, tmp_path)

    armazenamento.adicionar_escala_turno_rotativo(
        "Turno simples",
        ["Manhã", "Folga"]
    )

    resultado = armazenamento.adicionar_escala_turno_rotativo(
        "Outro turno",
        ["manha", "folga"]
    )

    escalas = armazenamento.carregar_escalas()

    assert resultado == "configuracao_duplicada"
    assert len(escalas) == 1


def test_remover_escala_usando_service(monkeypatch, tmp_path):
    configurar_arquivo_temporario(monkeypatch, tmp_path)

    armazenamento.adicionar_escala("Escala 6x3", 6, 3)
    armazenamento.adicionar_escala_ciclo_horas("Escala 12x36", 12, 36)

    resultado = armazenamento.remover_escala(0)
    escalas = armazenamento.carregar_escalas()

    assert resultado is True
    assert len(escalas) == 1
    assert escalas[0]["nome"] == "Escala 12x36"


def test_nao_remove_escala_com_indice_invalido(monkeypatch, tmp_path):
    configurar_arquivo_temporario(monkeypatch, tmp_path)

    armazenamento.adicionar_escala("Escala 6x3", 6, 3)

    resultado = armazenamento.remover_escala(99)
    escalas = armazenamento.carregar_escalas()

    assert resultado is False
    assert len(escalas) == 1


def test_editar_escala_ciclo_dias_usando_service(monkeypatch, tmp_path):
    configurar_arquivo_temporario(monkeypatch, tmp_path)

    armazenamento.adicionar_escala("Escala 6x3", 6, 3)

    resultado = armazenamento.editar_escala(0, "Escala 5x2", 5, 2)
    escalas = armazenamento.carregar_escalas()

    assert resultado == "sucesso"
    assert escalas[0]["nome"] == "Escala 5x2"
    assert escalas[0]["dias_trabalho"] == 5
    assert escalas[0]["dias_folga"] == 2


def test_nao_edita_escala_ciclo_dias_com_indice_invalido(monkeypatch, tmp_path):
    configurar_arquivo_temporario(monkeypatch, tmp_path)

    resultado = armazenamento.editar_escala(99, "Escala 5x2", 5, 2)

    assert resultado == "indice_invalido"


def test_editar_escala_ciclo_horas_usando_service(monkeypatch, tmp_path):
    configurar_arquivo_temporario(monkeypatch, tmp_path)

    armazenamento.adicionar_escala_ciclo_horas("Escala 12x36", 12, 36)

    resultado = armazenamento.editar_escala_ciclo_horas(
        0,
        "Escala 24x72",
        24,
        72
    )

    escalas = armazenamento.carregar_escalas()

    assert resultado == "sucesso"
    assert escalas[0]["nome"] == "Escala 24x72"
    assert escalas[0]["horas_trabalho"] == 24
    assert escalas[0]["horas_folga"] == 72


def test_editar_escala_turno_rotativo_usando_service(monkeypatch, tmp_path):
    configurar_arquivo_temporario(monkeypatch, tmp_path)

    armazenamento.adicionar_escala_turno_rotativo(
        "Turno simples",
        ["Manhã", "Folga"]
    )

    resultado = armazenamento.editar_escala_turno_rotativo(
        0,
        "Turno atualizado",
        ["Tarde", "Noite", "Folga"]
    )

    escalas = armazenamento.carregar_escalas()

    assert resultado == "sucesso"
    assert escalas[0]["nome"] == "Turno atualizado"
    assert escalas[0]["sequencia_turnos"] == ["Tarde", "Noite", "Folga"]


def test_nao_edita_turno_rotativo_com_sequencia_vazia(monkeypatch, tmp_path):
    configurar_arquivo_temporario(monkeypatch, tmp_path)

    armazenamento.adicionar_escala_turno_rotativo(
        "Turno simples",
        ["Manhã", "Folga"]
    )

    resultado = armazenamento.editar_escala_turno_rotativo(
        0,
        "Turno atualizado",
        []
    )

    assert resultado == "sequencia_vazia"


def test_montar_sequencia_por_blocos_continua_funcionando():
    blocos = [
        ("tarde", 3),
        ("noite", 3),
        ("folga", 2)
    ]

    resultado = armazenamento.montar_sequencia_por_blocos(blocos)

    assert resultado == [
        "Tarde", "Tarde", "Tarde",
        "Noite", "Noite", "Noite",
        "Folga", "Folga"
    ]