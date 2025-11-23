# Agent State Site

Site estático para GitHub Pages promovendo o padrão Agent State.

## Sobre Agent State

Agent State é um padrão que define como agentes LLM compartilham ferramentas, scripts, memória persistente, utilitários e contexto através de um único repositório Git dedicado.

Este repositório atua como a "camada de estado" do agente, não vinculada a um único projeto, mas ao ecossistema de agentes em si.

## Estrutura do Projeto

```
agentstate-site/
├── index.html      # Página principal
├── styles.css      # Estilos do site
└── README.md       # Este arquivo
```

## Como Publicar no GitHub Pages

### Opção 1: Branch `gh-pages`

1. Faça commit e push dos arquivos para o repositório
2. Crie uma branch chamada `gh-pages`:
   ```bash
   git checkout -b gh-pages
   git push origin gh-pages
   ```
3. No GitHub, vá em Settings > Pages
4. Selecione a branch `gh-pages` como source
5. O site estará disponível em `https://[seu-usuario].github.io/agentstate-site/`

### Opção 2: Branch `main` (recomendado)

1. Faça commit e push dos arquivos para a branch `main`
2. No GitHub, vá em Settings > Pages
3. Selecione a branch `main` como source
4. O site estará disponível em `https://[seu-usuario].github.io/agentstate-site/`

### Opção 3: Pasta `docs`

1. Crie uma pasta `docs` na raiz do repositório
2. Mova os arquivos `index.html` e `styles.css` para a pasta `docs`
3. No GitHub, vá em Settings > Pages
4. Selecione a pasta `docs` como source
5. O site estará disponível em `https://[seu-usuario].github.io/agentstate-site/`

## Desenvolvimento Local

Para visualizar o site localmente, você pode usar qualquer servidor HTTP simples:

### Python 3
```bash
python3 -m http.server 8000
```

### Node.js (com http-server)
```bash
npx http-server -p 8000
```

### PHP
```bash
php -S localhost:8000
```

Depois, acesse `http://localhost:8000` no navegador.

## Personalização

- **Cores**: Edite as variáveis CSS em `styles.css` na seção `:root`
- **Conteúdo**: Edite o arquivo `index.html`
- **Estilos**: Modifique `styles.css` conforme necessário

## Licença

Este projeto é um padrão aberto para o ecossistema de agentes LLM.

