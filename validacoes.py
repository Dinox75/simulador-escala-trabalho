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