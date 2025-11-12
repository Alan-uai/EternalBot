// src/ai/response-styles.js

export const responseStyles = {
  detailed: {
    name: 'Detalhada (Padrão)',
    instruction: 'Gere uma resposta completa, com múltiplas seções ("texto_introdutorio", "meio", "fim"), incluindo análises estratégicas, dicas extras e tabelas quando aplicável. Este é o comportamento padrão.'
  },
  short: {
    name: 'Curta',
    instruction: 'ATENÇÃO: RESPOSTA CURTA SOLICITADA! Sua resposta DEVE conter apenas a seção "texto_introdutorio" com a solução principal. Seja o mais direto e conciso possível. NÃO adicione seções de análise, dicas extras ou tabelas.'
  },
  medium: {
    name: 'Média',
    instruction: 'ATENÇÃO: RESPOSTA MÉDIA SOLICITADA! Sua resposta deve conter a seção "texto_introdutorio" com a solução direta, e no máximo UMA ÚNICA seção "meio" com os detalhes mais importantes ou uma tabela. NÃO adicione a seção "fim" ou dicas extras.'
  },
  bullets: {
    name: 'Tópicos (Bullet Points)',
    instruction: 'ATENÇÃO: RESPOSTA EM TÓPICOS SOLICITADA! Formate toda a sua resposta como uma lista de tópicos curtos e diretos (bullet points ou hífens). Evite parágrafos longos. Foque em clareza e escaneabilidade.'
  },
  tables: {
    name: 'Foco em Tabelas',
    instruction: 'ATENÇÃO: FOCO EM TABELAS SOLICITADO! Se a sua resposta contiver dados que possam ser tabelados (stats, custos, drops), sua prioridade MÁXIMA é a criação do objeto `table`. Mantenha o conteúdo em texto (`conteudo`) no mínimo absoluto, apenas para introduzir a tabela.'
  },
  strategy: {
    name: 'Análise Estratégica',
    instruction: 'ATENÇÃO: ANÁLISE ESTRATÉGICA SOLICITADA! Além da resposta direta, sua principal tarefa é fornecer uma análise estratégica aprofundada. Compare a opção perguntada com alternativas de mundos futuros. Discuta o custo-benefício, sinergias e as melhores táticas de longo prazo. Vá além da informação básica.'
  },
  beginner: {
    name: 'Para Iniciantes',
    instruction: 'ATENÇÃO: RESPOSTA PARA INICIANTES SOLICITADA! Assuma que o usuário é um novato completo. Explique todos os termos e conceitos do jogo passo a passo, como se estivesse ensinando pela primeira vez. Não presuma nenhum conhecimento prévio do jogo. Seja didático e paciente.'
  }
};
