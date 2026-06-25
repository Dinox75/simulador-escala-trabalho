class EscalaService:
    def __init__(self, repository):
        self.repository = repository

    def listar_escalas(self):
        return self.repository.listar()

    def buscar_escala_por_nome(self, nome):
        return self.repository.buscar_por_nome(nome)

    def adicionar_escala(self, escala):
        if self._existe_nome_duplicado(escala.nome):
            return "nome_duplicado"

        if self._existe_configuracao_duplicada(escala):
            return "configuracao_duplicada"

        self.repository.adicionar(escala)
        return "sucesso"

    def remover_escala_por_indice(self, indice):
        escalas = self.repository.listar()

        if self._indice_invalido(indice, escalas):
            return False

        escalas.pop(indice)
        self.repository.salvar_todos(escalas)

        return True

    def editar_escala_por_indice(self, indice, nova_escala):
        escalas = self.repository.listar()

        if self._indice_invalido(indice, escalas):
            return "indice_invalido"

        if self._existe_nome_duplicado(nova_escala.nome, indice):
            return "nome_duplicado"

        if self._existe_configuracao_duplicada(nova_escala, indice):
            return "configuracao_duplicada"

        escalas[indice] = nova_escala
        self.repository.salvar_todos(escalas)

        return "sucesso"

    def excluir_escala_por_nome(self, nome):
        escala_excluida = self.repository.excluir_por_nome(nome)

        if escala_excluida:
            return "sucesso"

        return "nao_encontrada"

    def _indice_invalido(self, indice, escalas):
        return indice < 0 or indice >= len(escalas)

    def _existe_nome_duplicado(self, nome, indice_ignorado=None):
        nome_normalizado = self._normalizar_nome(nome)
        escalas_salvas = self.repository.listar()

        for indice, escala_salva in enumerate(escalas_salvas):
            if indice == indice_ignorado:
                continue

            nome_existente = self._normalizar_nome(escala_salva.nome)

            if nome_existente == nome_normalizado:
                return True

        return False

    def _existe_configuracao_duplicada(self, nova_escala, indice_ignorado=None):
        escalas_salvas = self.repository.listar()

        for indice, escala_salva in enumerate(escalas_salvas):
            if indice == indice_ignorado:
                continue

            if self._tem_mesma_configuracao(escala_salva, nova_escala):
                return True

        return False

    def _tem_mesma_configuracao(self, escala_a, escala_b):
        dados_a = escala_a.to_dict()
        dados_b = escala_b.to_dict()

        dados_a.pop("nome", None)
        dados_b.pop("nome", None)

        return dados_a == dados_b

    def _normalizar_nome(self, nome):
        return str(nome).lower().strip()