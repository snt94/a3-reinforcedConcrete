# 💥 Simulador de Desgaste em Concreto Armado

Um website interativo desenvolvido para fins educacionais, onde o usuário pode visualizar um bloco de concreto armado se desgastando com o passar do tempo. A visualização é controlada por um slider, e o bloco pode ser rotacionado com o mouse ou touch, permitindo uma exploração mais intuitiva.

## 🧱 Funcionalidades

- Bloco 3D interativo representando concreto armado.
- Controle de rotação livre com o mouse (Orbit Controls).
- Slider que simula o desgaste progressivo do material ao longo do tempo.
- Seção explicativa sobre concreto armado e os impactos da corrosão nas estruturas.

## 💠 Tecnologias Utilizadas

- [Three.js](https://threejs.org/) – para renderização 3D no navegador.
- HTML, CSS e JavaScript puro.
- OrbitControls (Three.js addon) – para rotação da câmera com o mouse.
- Input range (slider) – controle de tempo/desgaste.

## 🚀 Como executar o projeto

1. Clone o repositório:
   ```bash
   git clone https://github.com/snt94/a3-reinforcedConcrete
   cd a3-reinforcedConcrete
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Rode o projeto:
   ```bash
   npm run dev
   ```

4. Ou abra o `index.html` diretamente em seu navegador (se for Vanilla JS).

## 📂 Estrutura do Projeto

```
📁 public/            # Texturas e imagens
📁 src/               # Arquivos principais
 ┛ 📄 index.html
 ┛ 📄 style.css
 ┛ 📄 main.js         
```

## 📚 Sobre o projeto

Este projeto foi idealizado como uma forma de demonstrar visualmente os efeitos da corrosão em estruturas de concreto armado, com foco em tornar o conteúdo mais acessível, interativo e compreensível para estudantes e o público geral.

## 🧠 Conceitos Envolvidos

- Concreto armado e corrosão da armadura
- Interatividade com elementos 3D no navegador
- Aplicação de texturas e simulação visual de tempo

## 📚 Créditos e Referências

- [Three.js Documentation](https://threejs.org/docs/)
- [Poly Haven](https://polyhaven.com) – Texturas públicas e gratuitas
- Textos técnicos baseados em materiais acadêmicos sobre durabilidade do concreto

## 📩 Contato

Se quiser trocar ideias ou sugerir melhorias:
- ✉️ edu.santos200611@gmail.com
- 💼 [LinkedIn](https://www.linkedin.com/in/eduardo-luis-de-andrade-santos)

---

> Projeto criado com fins educacionais e de apresentação de trabalho acadêmico.