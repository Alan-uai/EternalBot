# Bot de Discord - Guia Eterno

Este é um bot para Discord construído com Node.js, TypeScript, discord.js e Genkit, projetado para fornecer informações e ajuda sobre o jogo Anime Eternal.

## Configuração

1.  **Instalar Dependências:**
    ```bash
    npm install
    ```

2.  **Variáveis de Ambiente:**
    *   Copie o arquivo `.env.example` para um novo arquivo chamado `.env`.
    *   Preencha as variáveis no arquivo `.env`:
        *   `DISCORD_TOKEN`: O token do seu bot, obtido no Portal de Desenvolvedores do Discord.
        *   `CLIENT_ID`: O ID da aplicação do seu bot.
        *   `GUILD_ID`: O ID do servidor onde você irá testar e registrar os comandos de barra.

3.  **Registrar Comandos:**
    Antes de iniciar o bot pela primeira vez, você precisa registrar os comandos de barra (`/`) no seu servidor.
    ```bash
    npm run deploy-commands
    ```

## Executando o Bot

*   **Para iniciar o bot:**
    ```bash
    npm start
    ```

*   **Para iniciar em modo de desenvolvimento (reinicia automaticamente ao salvar alterações):**
    ```bash
    npm run watch
    ```

## Estrutura do Projeto

*   `src/bot.ts`: O ponto de entrada principal do bot. Ele inicializa o cliente do Discord, carrega os comandos e lida com os eventos.
*   `src/deploy-commands.ts`: Script para registrar os comandos de barra na API do Discord.
*   `src/commands/`: Contém as definições dos comandos do bot, organizados em subpastas por categoria.
*   `src/ai/`: Contém toda a lógica relacionada à IA com Genkit.
*   `src/firebase/`: Configuração e inicialização do Firebase.
*   `src/lib/`: Contém os dados estáticos e a lógica para compilar a "base de conhecimento" da IA.
