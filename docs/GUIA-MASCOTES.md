# Guia de mascotes Marsupi (v3, 50 mascotes)

Base: o símbolo oficial (canguru com filhote), vetorizado da logo com `tracar_logo.py` em `logo_path.txt`. A forma não é redesenhada.

## Paleta
primary #356B5B · support #A9C7B4 · accent #E3B477 · background #F7F7F1 · text #263D35. Sem sombra e sem gradiente.

## Regras
- O canguru é sempre o path da logo. Novas cenas mudam o entorno, não a forma.
- Peek (mãos no card): cabeça recortada acima do queixo (y<762 no símbolo), card cobre o resto, patas na borda com contorno na cor de fundo.
- Um adereço dourado por cena. Cards com raio 12px; avatar circular é a exceção.
- Tom acolhedor e adulto, sem texto no mascote. Animação só em "carregando" e "sucesso", com prefers-reduced-motion.

## Catálogo (50)
- Cards (11): peek-duas-patas, peek-aceno, peek-lupa, peek-inclinado, peek-mae-e-filhote, peek-filhote, peek-vazio, peek-botao, peek-campo, peek-lista, peek-aviso
- Estados (12): carregando, sucesso, tudo-certo, salvo, enviado, erro-404, sem-resultados, sem-conexao, dormindo-offline, manutencao, atencao, privado
- IA e pedagógico (11): pensando-ia, ideia-atividade, estudando, planejamento, checklist, meta, tempo, plano-pronto, privacidade, busca, ajuda
- Celebração (5): conquista, parabens, novidade, acolhimento, notificacao
- Adesivos (8): adesivo-amei, -ok, -duvida, -atencao, -parabens, -ideia, -busca, -privado
- Marca (3): simbolo, simbolo-reverso, avatar

## Criar uma cena nova
Em `gerar_mascotes_v3.py`: crie um adereço em `PROPS` (caixa local 300x300, só tokens da paleta), posicione em um slot (`TL` canto superior esquerdo é o mais livre) e registre em `SCENES`. Um adereço dourado por cena.

## Gerar
`python3 tracar_logo.py` (uma vez, precisa de `pip install potracer pillow numpy`) e depois `python3 gerar_mascotes_v3.py` (importa o v2) -> `svg_v2/`.
