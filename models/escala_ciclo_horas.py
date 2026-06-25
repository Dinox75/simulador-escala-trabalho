from tipos_escala import TIPO_CICLO_HORAS


class EscalaCicloHoras:
    def __init__(self, nome, horas_trabalho, horas_folga):
        self.nome = nome
        self.horas_trabalho = horas_trabalho
        self.horas_folga = horas_folga
        self.tipo = TIPO_CICLO_HORAS

    def obter_resumo(self):
        return f"{self.horas_trabalho}x{self.horas_folga} horas"

    def to_dict(self):
        return {
            "nome": self.nome,
            "tipo": self.tipo,
            "horas_trabalho": self.horas_trabalho,
            "horas_folga": self.horas_folga
        }

    @classmethod
    def from_dict(cls, dados):
        return cls(
            dados["nome"],
            dados["horas_trabalho"],
            dados["horas_folga"]
        )