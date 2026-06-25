import unicodedata

from tipos_escala import (
    TIPO_ESCALA_PADRAO,
    TIPO_CICLO_DIAS,
    TIPO_CICLO_HORAS,
    TIPO_TURNO_ROTATIVO,
    validar_tipo_escala
)

from models.escala_factory import criar_escala_a_partir_de_dict
from services.escala_service_factory import criar_escala_service


CAMINHO_ESCALAS = "data/escalas.json"


TURNOS_PADRONIZADOS = {
    "manha": "Manhã",
    "tarde": "Tarde",
    "noite": "Noite",
    "folga": "Folga"
}


TURNOS_VALIDOS = list(TURNOS_PADRONIZADOS.values())


def obter_escala_service():
    return criar_escala_service(CAMINHO_ESCALAS)


def normalizar_nome(nome):
    return str(nome).lower().strip()


def normalizar_escala(escala):
    escala_normalizada = escala.copy()

    tipo = escala_normalizada.get("tipo", TIPO_ESCALA_PADRAO)

    if not validar_tipo_escala(tipo):
        tipo = TIPO_ESCALA_PADRAO

    escala_normalizada["tipo"] = tipo

    return escala_normalizada


def carregar_escalas():
    service = obter_escala_service()
    escalas = service.listar_escalas()

    return [
        escala.to_dict()
        for escala in escalas
    ]


def salvar_escalas(escalas):
    service = obter_escala_service()

    escalas_convertidas = []

    for escala in escalas:
        if hasattr(escala, "to_dict"):
            escalas_convertidas.append(escala)
        else:
            escala_normalizada = normalizar_escala(escala)
            escala_objeto = criar_escala_a_partir_de_dict(escala_normalizada)
            escalas_convertidas.append(escala_objeto)

    service.repository.salvar_todos(escalas_convertidas)


def obter_campos_configuracao(tipo):
    if tipo == TIPO_CICLO_HORAS:
        return "horas_trabalho", "horas_folga"

    return "dias_trabalho", "dias_folga"


def criar_escala_ciclo_dias(nome, dias_trabalho, dias_folga):
    return {
        "nome": nome.strip(),
        "tipo": TIPO_CICLO_DIAS,
        "dias_trabalho": dias_trabalho,
        "dias_folga": dias_folga
    }


def criar_escala_ciclo_horas(nome, horas_trabalho, horas_folga):
    return {
        "nome": nome.strip(),
        "tipo": TIPO_CICLO_HORAS,
        "horas_trabalho": horas_trabalho,
        "horas_folga": horas_folga
    }


def remover_acentos(texto):
    texto_normalizado = unicodedata.normalize("NFD", texto)

    return "".join(
        caractere
        for caractere in texto_normalizado
        if unicodedata.category(caractere) != "Mn"
    )


def normalizar_turno(turno):
    turno_limpo = str(turno).strip().lower()
    turno_sem_acento = remover_acentos(turno_limpo)

    return TURNOS_PADRONIZADOS.get(turno_sem_acento, str(turno).strip())


def normalizar_sequencia_turnos(sequencia_turnos):
    return [
        normalizar_turno(turno)
        for turno in sequencia_turnos
        if str(turno).strip()
    ]


def existe_turno_invalido(sequencia_turnos):
    sequencia_normalizada = normalizar_sequencia_turnos(sequencia_turnos)

    for turno in sequencia_normalizada:
        if turno not in TURNOS_VALIDOS:
            return True

    return False


def criar_escala_turno_rotativo(nome, sequencia_turnos):
    return {
        "nome": nome.strip(),
        "tipo": TIPO_TURNO_ROTATIVO,
        "sequencia_turnos": normalizar_sequencia_turnos(sequencia_turnos)
    }


def existe_nome_duplicado(escalas, nome, indice_ignorado=None):
    nome_normalizado = normalizar_nome(nome)

    for indice, escala in enumerate(escalas):
        if indice == indice_ignorado:
            continue

        nome_existente = normalizar_nome(escala.get("nome", ""))

        if nome_existente == nome_normalizado:
            return True

    return False


def existe_configuracao_duplicada(
    escalas,
    tipo,
    valor_trabalho,
    valor_folga,
    indice_ignorado=None
):
    campo_trabalho, campo_folga = obter_campos_configuracao(tipo)

    for indice, escala in enumerate(escalas):
        if indice == indice_ignorado:
            continue

        tipo_escala = escala.get("tipo", TIPO_ESCALA_PADRAO)

        if (
            tipo_escala == tipo
            and escala.get(campo_trabalho) == valor_trabalho
            and escala.get(campo_folga) == valor_folga
        ):
            return True

    return False


def existe_sequencia_turnos_duplicada(
    escalas,
    sequencia_turnos,
    indice_ignorado=None
):
    sequencia_normalizada = normalizar_sequencia_turnos(sequencia_turnos)

    for indice, escala in enumerate(escalas):
        if indice == indice_ignorado:
            continue

        if escala.get("tipo", TIPO_ESCALA_PADRAO) != TIPO_TURNO_ROTATIVO:
            continue

        sequencia_existente = normalizar_sequencia_turnos(
            escala.get("sequencia_turnos", [])
        )

        if sequencia_existente == sequencia_normalizada:
            return True

    return False


def adicionar_escala(nome, dias_trabalho, dias_folga):
    escalas = carregar_escalas()

    if existe_nome_duplicado(escalas, nome):
        return "nome_duplicado"

    if existe_configuracao_duplicada(
        escalas,
        TIPO_CICLO_DIAS,
        dias_trabalho,
        dias_folga
    ):
        return "configuracao_duplicada"

    nova_escala = criar_escala_ciclo_dias(
        nome,
        dias_trabalho,
        dias_folga
    )

    escalas.append(nova_escala)
    salvar_escalas(escalas)

    return "sucesso"


def adicionar_escala_ciclo_horas(nome, horas_trabalho, horas_folga):
    escalas = carregar_escalas()

    if existe_nome_duplicado(escalas, nome):
        return "nome_duplicado"

    if existe_configuracao_duplicada(
        escalas,
        TIPO_CICLO_HORAS,
        horas_trabalho,
        horas_folga
    ):
        return "configuracao_duplicada"

    nova_escala = criar_escala_ciclo_horas(
        nome,
        horas_trabalho,
        horas_folga
    )

    escalas.append(nova_escala)
    salvar_escalas(escalas)

    return "sucesso"


def adicionar_escala_turno_rotativo(nome, sequencia_turnos):
    escalas = carregar_escalas()

    sequencia_normalizada = normalizar_sequencia_turnos(sequencia_turnos)

    if not sequencia_normalizada:
        return "sequencia_vazia"

    if existe_turno_invalido(sequencia_normalizada):
        return "turno_invalido"

    if existe_nome_duplicado(escalas, nome):
        return "nome_duplicado"

    if existe_sequencia_turnos_duplicada(escalas, sequencia_normalizada):
        return "configuracao_duplicada"

    nova_escala = criar_escala_turno_rotativo(
        nome,
        sequencia_normalizada
    )

    escalas.append(nova_escala)
    salvar_escalas(escalas)

    return "sucesso"


def remover_escala(indice):
    escalas = carregar_escalas()

    if indice < 0 or indice >= len(escalas):
        return False

    escalas.pop(indice)
    salvar_escalas(escalas)

    return True


def editar_escala(indice, novo_nome, novos_dias_trabalho, novos_dias_folga):
    escalas = carregar_escalas()

    if indice < 0 or indice >= len(escalas):
        return "indice_invalido"

    if existe_nome_duplicado(escalas, novo_nome, indice):
        return "nome_duplicado"

    if existe_configuracao_duplicada(
        escalas,
        TIPO_CICLO_DIAS,
        novos_dias_trabalho,
        novos_dias_folga,
        indice
    ):
        return "configuracao_duplicada"

    escalas[indice] = criar_escala_ciclo_dias(
        novo_nome,
        novos_dias_trabalho,
        novos_dias_folga
    )

    salvar_escalas(escalas)

    return "sucesso"


def editar_escala_ciclo_horas(
    indice,
    novo_nome,
    novas_horas_trabalho,
    novas_horas_folga
):
    escalas = carregar_escalas()

    if indice < 0 or indice >= len(escalas):
        return "indice_invalido"

    if existe_nome_duplicado(escalas, novo_nome, indice):
        return "nome_duplicado"

    if existe_configuracao_duplicada(
        escalas,
        TIPO_CICLO_HORAS,
        novas_horas_trabalho,
        novas_horas_folga,
        indice
    ):
        return "configuracao_duplicada"

    escalas[indice] = criar_escala_ciclo_horas(
        novo_nome,
        novas_horas_trabalho,
        novas_horas_folga
    )

    salvar_escalas(escalas)

    return "sucesso"


def editar_escala_turno_rotativo(indice, novo_nome, nova_sequencia_turnos):
    escalas = carregar_escalas()

    if indice < 0 or indice >= len(escalas):
        return "indice_invalido"

    sequencia_normalizada = normalizar_sequencia_turnos(nova_sequencia_turnos)

    if not sequencia_normalizada:
        return "sequencia_vazia"

    if existe_turno_invalido(sequencia_normalizada):
        return "turno_invalido"

    if existe_nome_duplicado(escalas, novo_nome, indice):
        return "nome_duplicado"

    if existe_sequencia_turnos_duplicada(
        escalas,
        sequencia_normalizada,
        indice
    ):
        return "configuracao_duplicada"

    escalas[indice] = criar_escala_turno_rotativo(
        novo_nome,
        sequencia_normalizada
    )

    salvar_escalas(escalas)

    return "sucesso"


def montar_sequencia_por_blocos(blocos):
    sequencia = []

    for turno, quantidade in blocos:
        turno_normalizado = normalizar_turno(turno)

        if turno_normalizado not in TURNOS_VALIDOS:
            return None

        if quantidade <= 0:
            return None

        sequencia.extend([turno_normalizado] * quantidade)

    return sequencia