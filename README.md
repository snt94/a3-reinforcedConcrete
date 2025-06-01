# Reinforced Concrete Visualization

Este projeto é uma simulação interativa 3D feita com [Three.js](https://threejs.org/), com o objetivo de representar blocos de concreto armado com desgaste visual progressivo. A interface permite visualizar diferentes níveis de dano, ferrugem e carbonatação por meio de controles deslizantes (sliders), além de alternar entre a visualização sólida e a estrutura interna do concreto.

## Objetivo

Desenvolver uma visualização didática e interativa da deterioração do concreto armado, útil para fins educacionais ou como protótipo em aplicações de engenharia civil.

## Estrutura do Projeto

```
reinforcedConcrete/
├── dist/                      # Pasta de build gerada automaticamente
├── node_modules/             # Dependências do Node.js
├── src/
│   ├── assets/               # Texturas utilizadas no modelo 3D
│   │   ├── aco_textura.jpg
│   │   ├── carbonatacao.jpg
│   │   ├── concreto_textura.jpg
│   │   ├── dano.png
│   │   └── ferrugem.png
│   ├── css/
│   │   └── style.css         # Estilos da aplicação
│   ├── js/
│   │   ├── functionalities.js# Lógica de sliders e efeitos visuais
│   │   └── scripts.js        # Inicialização da cena Three.js
│   └── index.html            # Estrutura principal da página
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Como Executar

1. Certifique-se de ter o [Node.js](https://nodejs.org/) instalado.
2. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/reinforcedConcrete.git
   cd reinforcedConcrete
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Inicie o projeto em modo desenvolvimento:
   ```bash
   npx parcel src/index.html
   ```

O projeto estará disponível em `http://localhost:1234/` por padrão.

## Funcionalidades

- Visualização 3D de um bloco de concreto armado.
- Sliders para ajustar:
  - Dano (profundidade e opacidade)
  - Ferrugem (intensidade nas armaduras)
  - Carbonatação (nível visual de contaminação)
- Alternar estrutura interna (wireframe + estribos e barras).
- Reset visual para restaurar o modelo original.

## Tecnologias Utilizadas

- [Three.js](https://threejs.org/)
- [Parcel](https://parceljs.org/)
- HTML5, CSS3 e JavaScript (ES6)

## Texturas

As texturas estão localizadas em `src/assets/`, representando:
- Concreto base
- Aço das barras
- Dano superficial
- Ferrugem
- Carbonatação

## Status

Projeto em desenvolvimento. As funcionalidades principais estão implementadas, e melhorias visuais continuam em andamento.

## Licença

Este projeto é de uso educacional. Licenciamento formal pode ser definido futuramente.