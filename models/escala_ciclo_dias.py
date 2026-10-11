from tipos_escala import MAX_CYCLE_LENGTH, TIPO_ESCALA_PADRAO
from models.escala_base import EscalaBase


class EscalaCicloDias(EscalaBase):
    def __init__(self, nome, dias_trabalho, dias_folga):
        super().__init__(nome, TIPO_ESCALA_PADRAO)

        self._validar_valor_positivo(dias_trabalho, "dias_trabalho")
        self._validar_valor_positivo(dias_folga, "dias_folga")
        if dias_trabalho + dias_folga > MAX_CYCLE_LENGTH:
            raise ValueError(f"O ciclo por dias não pode exceder {MAX_CYCLE_LENGTH} dias.")

        self.dias_trabalho = dias_trabalho
        self.dias_folga = dias_folga

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
