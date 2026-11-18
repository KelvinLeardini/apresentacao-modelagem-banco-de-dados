# DB_Streaming // 🗄️🎵

Landing Page Acadêmica em formato de **Wireframe Estrutural de Alta Fidelidade** para apresentação de Modelagem de Banco de Dados Relacional de um **Aplicativo de Streaming de Música**.

## 📌 Sobre o Projeto

Este projeto foi construído para servir como interface interativa de apresentação em sala de aula (projetor / telão), documentando todo o ciclo de engenharia de dados:
- **Etapa 01**: Descrição do Minimundo e 8 Regras de Negócio (RN01 a RN08);
- **Etapa 02**: Modelo Conceitual (DER) com métricas de normalização e modal de visualização em tela cheia;
- **Etapa 03**: Modelo Lógico Relacional com 12 tabelas normalizadas em 3FN e povoadas com dados de exemplo (divididas em 4 módulos interativos por abas);
- **Etapa 04**: Scripts SQL testados no MyCompiler (DDL: `CREATE TABLE`, DML: `INSERT INTO` e Constraints: `ALTER TABLE`);
- **Etapa 05**: Consultas SQL analíticas (DQL) com `INNER JOIN`, `GROUP BY`, agregações e suas respectivas saídas tabulares simuladas;
- **Equipe**: Rodapé institucional com os 7 integrantes da equipe e suas respectivas funções.

## 🚀 Tecnologias Utilizadas

- **HTML5 Semântico**: Estrutura modular, acessibilidade com `<dialog>` nativo e acordeões `<details>/<summary>`.
- **CSS3 Moderno**: Arquitetura BEM, Variáveis CSS (`:root`), Flexbox, CSS Grid e estética Wireframe Monocromática Técnica.
- **JavaScript Vanilla**: Código didático e limpo para controle de abas e modais nativos.
- **Zero Frameworks Externos**: Não utiliza Tailwind, Bootstrap, jQuery ou React.

## 📦 Estrutura dos Arquivos

```text
├── index.html        # Estrutura e marcação semântica completa
├── style.css         # Design system monocromático técnico
├── script.js         # Comportamento interativo (Abas e Modais)
├── .gitignore        # Arquivos ignorados pelo Git
└── README.md         # Documentação do projeto
```

## 🌐 Publicação no Vercel

O projeto é 100% estático e compatível com deploy instantâneo na **Vercel**, **GitHub Pages** ou qualquer provedor de hospedagem estática.
