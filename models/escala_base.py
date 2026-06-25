class EscalaBase:
    def __init__(self, nome, tipo):
        self._validar_nome(nome)

        self.nome = nome
        self.tipo = tipo

    def obter_resumo(self):
        raise NotImplementedError("As classes filhas devem implementar obter_resumo().")

    def to_dict(self):
        raise NotImplementedError("As classes filhas devem implementar to_dict().")

    @staticmethod
    def _validar_nome(nome):
        if not isinstance(nome, str) or not nome.strip():
            raise ValueError("O nome da escala não pode ser vazio.")

    @staticmethod
    def _validar_valor_positivo(valor, campo):
        if not isinstance(valor, int) or valor <= 0:
            raise ValueError(f"O campo {campo} deve ser um número inteiro positivo.")