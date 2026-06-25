class EscalaService:
    def __init__(self, repository):
        self.repository = repository

    def listar_escalas(self):
        return self.repository.listar()

    def buscar_escala_por_nome(self, nome):
        return self.repository.buscar_por_nome(nome)

    def adicionar_escala(self, escala):
        escala_existente = self.repository.buscar_por_nome(escala.nome)

        if escala_existente is not None:
            return "nome_duplicado"

        self.repository.adicionar(escala)
        return "sucesso"

    def excluir_escala_por_nome(self, nome):
        escala_excluida = self.repository.excluir_por_nome(nome)

        if escala_excluida:
            return "sucesso"

        return "nao_encontrada"