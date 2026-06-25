from tipos_escala import TIPO_ESCALA_PADRAO


class EscalaCicloDias:
    def __init__(self, nome, dias_trabalho, dias_folga):
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