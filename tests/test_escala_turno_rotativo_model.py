from tipos_escala import TIPO_TURNO_ROTATIVO
from models.escala_base import EscalaBase


TURNOS_VALIDOS = ["Manhã", "Tarde", "Noite", "Folga"]


class EscalaTurnoRotativo(EscalaBase):
    def __init__(self, nome, sequencia_turnos):
        super().__init__(nome, TIPO_TURNO_ROTATIVO)

        self._validar_sequencia_turnos(sequencia_turnos)

        self.sequencia_turnos = list(sequencia_turnos)

    def obter_resumo(self):
        return " -> ".join(self.sequencia_turnos)

    def obter_total_dias_ciclo(self):
        return len(self.sequencia_turnos)

    def to_dict(self):
        return {
            "nome": self.nome,
            "tipo": self.tipo,
            "sequencia_turnos": self.sequencia_turnos
        }

    @classmethod
    def from_dict(cls, dados):
        return cls(
            dados["nome"],
            dados["sequencia_turnos"]
        )

    def _validar_sequencia_turnos(self, sequencia_turnos):
        if not isinstance(sequencia_turnos, list) or len(sequencia_turnos) == 0:
            raise ValueError("A sequência de turnos não pode ser vazia.")

        for turno in sequencia_turnos:
            if turno not in TURNOS_VALIDOS:
                raise ValueError(f"Turno inválido: {turno}.")