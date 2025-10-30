# Guia de Arquitetura do Bot - Eternal Guide

Este documento estabelece as regras, padrões e convenções para o desenvolvimento e manutenção do bot. O objetivo é garantir que o projeto permaneça **modular, escalável, limpo e fácil de manter**. Todas as alterações e novas implementações devem seguir estritamente estas diretrizes.

---

## 1. Princípios Fundamentais

1.  **Separação de Responsabilidades (SoC):** Cada arquivo (módulo) deve ter uma única responsabilidade. Comandos são para comandos, eventos para eventos, serviços para lógica de negócio reutilizável.
2.  **Injeção de Dependência (DI-Lite):** Um objeto `container` centralizado é usado para fornecer acesso a instâncias compartilhadas como `client`, `config`, `logger` e `services`. Módulos não devem criar suas próprias instâncias de serviços globais.
3.  **Carregamento Dinâmico (Loaders):** A inicialização do bot é orquestrada por `loaders`. Nenhum módulo se auto-registra. O ponto de entrada (`index.js`) delega a responsabilidade de carregar e validar cada tipo de módulo aos seus respectivos loaders.
4.  **Contratos Explícitos:** Cada tipo de módulo deve exportar uma estrutura (objeto) bem definida, respeitando um "contrato" para que o loader possa validá-lo e carregá-lo corretamente.

---

## 2. Estrutura de Diretórios

A estrutura de arquivos é a espinha dorsal da nossa arquitetura.

```
/
├── src/
│   ├── index.js                 # Ponto de entrada, bootstrap, inicializa o container e os loaders.
│   ├── loaders/                 # Módulos responsáveis por carregar outras partes do bot.
│   │   ├── commandLoader.js
│   │   ├── eventLoader.js
│   │   ├── interactionLoader.js
│   │   ├── serviceLoader.js
│   │   └── jobLoader.js
│   ├── commands/                # Contém todos os comandos de barra (slash commands).
│   │   └── utility/             # Sub-pasta para categoria de comandos.
│   │       └── ping.js
│   ├── events/                  # Lógica para cada evento do Discord (ready, messageCreate, etc.).
│   │   ├── client/
│   │   │   └── ready.js
│   │   └── guild/
│   │       └── interactionCreate.js
│   ├── interactions/            # Manipuladores para componentes (botões, menus, modais).
│   │   ├── buttons/
│   │   └── modals/
│   ├── services/                # Lógica de negócio, clientes de API, acesso ao banco de dados.
│   │   └── firebaseService.js
│   ├── jobs/                    # Tarefas agendadas (cron jobs) que rodam em intervalos.
│   │   └── dailyMessage.js
│   ├── utils/                   # Funções puras e auxiliares (logger, formatadores, etc.).
│   │   └── logger.js
│   ├── config/                  # Carregamento e validação de variáveis de ambiente.
│   │   └── loader.js
│   └── data/                    # Dados estáticos, como a knowledge base da IA.
│       └── wiki-data.js
├── .env                         # Variáveis de ambiente (TOKEN, IDs, etc.).
└── package.json                 # Dependências e scripts.
```

---

## 3. Contratos dos Módulos

Cada módulo deve aderir a um contrato específico para ser carregado corretamente.

### a. Comandos (`src/commands/**/*.js`)

-   **Responsabilidade:** Definir um comando de barra e sua lógica de execução.
-   **Contrato:**
    ```javascript
    module.exports = {
      data: new SlashCommandBuilder(), // Obrigatório
      async execute(interaction) { /* ... */ } // Obrigatório
    };
    ```

### b. Eventos (`src/events/**/*.js`)

-   **Responsabilidade:** Executar uma lógica quando um evento específico do Discord é emitido.
-   **Contrato:**
    ```javascript
    module.exports = {
      name: 'ready', // Nome do evento de discord.js (Obrigatório)
      once: true, // Opcional, default é false
      async execute(client, container) { /* ... */ } // Obrigatório
    };
    ```

### c. Handlers de Interação (`src/interactions/**/*.js`)

-   **Responsabilidade:** Lidar com interações de componentes como botões, menus e modais.
-   **Contrato:**
    ```javascript
    module.exports = {
      customIdPrefix: 'meu-prefixo', // Prefixo para identificar o handler (Obrigatório)
      async handleInteraction(interaction, { client }) { /* ... */ } // Obrigatório
    };
    ```

### d. Serviços (`src/services/*.js`)

-   **Responsabilidade:** Encapsular lógica de negócio complexa ou acesso a recursos externos (APIs, DBs).
-   **Contrato:**
    ```javascript
    module.exports = {
      name: 'meuServico', // Nome para registrar no container (Obrigatório)
      async init(container) { /* Inicializa e retorna a instância do serviço */ }, // Obrigatório
      async shutdown(container) { /* Lógica de limpeza, opcional */ }
    };
    ```

### e. Jobs (`src/jobs/*.js`)

-   **Responsabilidade:** Executar tarefas em intervalos de tempo definidos ou em horários agendados.
-   **Contrato:**
    ```javascript
    module.exports = {
      name: 'nomeDoJob', // Nome para logging (Obrigatório)
      schedule: '0 * * * *', // Padrão Cron (Obrigatório, se não usar intervalMs)
      intervalMs: 60000, // Intervalo em ms (Obrigatório, se não usar schedule)
      async run(container) { /* ... */ } // Lógica do job (Obrigatório)
    };
    ```

---

## 4. Regras de Implementação

1.  **Não Crie Efeitos Colaterais no Topo do Módulo:** Toda a lógica de inicialização e execução deve estar dentro das funções exportadas (`execute`, `init`, `run`, `handleInteraction`). Não execute código globalmente no arquivo.
2.  **Use o Container:** Sempre que precisar de acesso ao `client`, `config`, `logger` ou a outros `services`, obtenha-os a partir do `container` passado como argumento. Não importe diretamente, exceto em casos muito específicos e justificados.
3.  **Use Funções `async`:** Todas as funções de execução (`execute`, `handleInteraction`, `run`) devem ser `async` para lidar corretamente com promessas.
4.  **Tratamento de Erros:** Envolva a lógica principal dos seus módulos em blocos `try/catch`. Use o `logger` do container para registrar erros de forma padronizada.
5.  **Nomenclatura:**
    *   **Arquivos:** Use `kebab-case` (ex: `command-loader.js`).
    *   **Prefixos de `customId`:** Use um padrão claro, como `prefixo:acao:id_unico` (ex: `soling:confirm:request123`).

## 5. Processo de Modificação

Ao adicionar ou modificar uma funcionalidade, siga estes passos:

1.  **Consulte este Guia:** Verifique qual tipo de módulo é o mais apropriado para a sua necessidade.
2.  **Crie o Arquivo no Local Correto:** Coloque o novo arquivo no diretório correspondente (`src/commands`, `src/events`, etc.).
3.  **Implemente o Contrato:** Exporte o objeto com as propriedades corretas (`data`, `name`, `execute`, etc.).
4.  **Deixe o Loader Fazer o Trabalho:** O loader correspondente irá detectar e carregar seu novo módulo automaticamente na inicialização. Não é necessário modificar os loaders ou o `index.js` para adicionar um novo comando ou evento.
