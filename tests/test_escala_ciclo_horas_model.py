from tipos_escala import TIPO_CICLO_HORAS
from models.escala_base import EscalaBase


class EscalaCicloHoras(EscalaBase):
    def __init__(self, nome, horas_trabalho, horas_folga):
        super().__init__(nome, TIPO_CICLO_HORAS)

        self._validar_valor_positivo(horas_trabalho, "horas_trabalho")
        self._validar_valor_positivo(horas_folga, "horas_folga")

        self.horas_trabalho = horas_trabalho
        self.horas_folga = horas_folga

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