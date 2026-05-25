from datetime import datetime

def ler_numero(mensagem):

    while True:
        numero = input(mensagem).strip()

        if numero == '':
                print("Entrada invalida, digite um numero!")
                continue

        try:
            convert_num = int(numero)

            if convert_num <= 0:
                print("Digite um número maior que zero.")
                continue

            return convert_num

        except ValueError:
            print("Digite apenas números.")

def ler_data(mensagem):
    while True:
        data_texto = input(mensagem).strip()

        if data_texto == "":
            print("Data inválida. Digite uma data.")
            continue

        try:
            data_convertida = datetime.strptime(data_texto, "%d/%m/%Y").date()
            return data_convertida

        except ValueError:
            print("Data inválida. Use o formato dd/mm/aaaa.")

def ler_opcao_menu(mensagem, opcoes_validas):
    while True:
        opcao = input(mensagem).strip()

        if opcao in opcoes_validas:
            return opcao

        print("Opção inválida. Escolha uma opção válida.")

def ler_indice_lista(mensagem, tamanho_lista):
    while True:
        indice = ler_numero(mensagem)

        if 1 <= indice <= tamanho_lista:
            return indice - 1

        print("Opção inválida. Escolha um número da lista.")