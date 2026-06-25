from tipos_escala import TIPO_ESCALA_PADRAO


class EscalaCicloDias:
    def __init__(self, nome, dias_trabalho, dias_folga):
        self._validar_nome(nome)
        self._validar_valor_positivo(dias_trabalho, "dias_trabalho")
        self._validar_valor_positivo(dias_folga, "dias_folga")

        self.nome = nome
        self.dias_trabalho = dias_trabalho
        self.dias_folga = dias_folga
        self.tipo = TIPO_ESCALA_PADRAO

    def obter_resumo(self):
        return f"{self.dias_trabalho}x{self.dias_folga} dias"

    def to_dict(self):
        return {
            "nome": self.nome,
            "tipo": self.tipo,
            "dias_trabalho": self.dias_trabalho,
            "dias_folga": self.dias_folga
        }

    @classmethod
    def from_dict(cls, dados):
        return cls(
            dados["nome"],
            dados["dias_trabalho"],
            dados["dias_folga"]
        )

    def _validar_nome(self, nome):
        if not isinstance(nome, str) or not nome.strip():
            raise ValueError("O nome da escala não pode ser vazio.")

    def _validar_valor_positivo(self, valor, campo):
        if not isinstance(valor, int) or valor <= 0:
            raise ValueError(f"O campo {campo} deve ser um número inteiro positivo.")