/**
 * Sistema de Microcopys Persuasivas
 * 
 * Baseado em princípios de Tecnologia Persuasiva:
 * - Redução de fricção
 * - Urgência sutil
 * - Social proof
 * - Personalização contextual
 * - Compromisso e progresso
 */

export interface PersuasiveCopy {
  // Onboarding e primeira experiência
  onboarding: {
    welcome: string;
    valueProposition: string;
    firstStep: string;
    getStarted: string;
  };

  // Empty states
  emptyStates: {
    noSubscriptions: {
      title: string;
      description: string;
      cta: string;
    };
    noItems: {
      title: string;
      description: string;
      cta: string;
    };
    noSearchResults: {
      title: string;
      description: string;
      cta: string;
    };
  };

  // Adicionar subscription
  addSubscription: {
    site: {
      title: string;
      subtitle: string;
      placeholder: string;
      examples: string;
      cta: string;
      success: string;
    };
    youtube: {
      title: string;
      subtitle: string;
      placeholder: string;
      examples: string;
      cta: string;
      success: string;
    };
  };

  // Autenticação
  auth: {
    login: {
      title: string;
      tagline: string;
      button: string;
      loading: string;
      noAccount: string;
      registerLink: string;
    };
    register: {
      title: string;
      subtitle: string;
      button: string;
      loading: string;
      success: string;
    };
  };

  // Progresso e gamificação
  progress: {
    streak: {
      current: (days: number) => string;
      milestone: (days: number) => string;
      encouragement: string;
    };
    achievements: {
      unlocked: (name: string) => string;
      progress: (current: number, target: number) => string;
      almost: (name: string, remaining: number) => string;
    };
    level: {
      up: (level: number) => string;
      current: (level: number) => string;
    };
  };

  // Notificações e urgência
  urgency: {
    newContent: (count: number) => string;
    streakWarning: (days: number) => string;
    milestoneNear: (remaining: number) => string;
  };

  // Social proof
  socialProof: {
    popularSites: string;
    trendingNow: string;
    othersAlsoRead: string;
    joinThousands: string;
  };

  // Redução de fricção
  frictionReduction: {
    quickAdd: string;
    suggestions: string;
    autoDetect: string;
    oneClick: string;
  };

  // Compromisso
  commitment: {
    setGoal: string;
    dailyGoal: string;
    weeklyGoal: string;
    reminder: string;
    goalSet: string;
  };

  challenges: {
    newTitle: string;
    complete: string;
    allComplete: string;
    news: {
      read: string;
      explore: string;
    };
    videos: {
      watch: string;
      explore: string;
    };
  };

  celebration: {
    achievementUnlocked: string;
    share: string;
    continue: string;
    levelUp: string;
  };
}

// Microcopys otimizadas com técnicas persuasivas
export const persuasiveCopy: PersuasiveCopy = {
  onboarding: {
    welcome: 'Bem-vindo ao seu hub de notícias',
    valueProposition: 'Todas as suas fontes favoritas em um só lugar. Sem distrações, sem algoritmos.',
    firstStep: 'Vamos começar adicionando seu primeiro site ou canal',
    getStarted: 'Começar agora',
  },

  emptyStates: {
    noSubscriptions: {
      title: 'Sua biblioteca está vazia',
      description: 'Adicione sites e canais para criar seu feed personalizado. Comece com um clique.',
      cta: 'Adicionar Primeiro Site',
    },
    noItems: {
      title: 'Aguardando novos conteúdos',
      description: 'Seus sites estão sendo monitorados. Novos artigos aparecerão aqui em breve.',
      cta: 'Atualizar Agora',
    },
    noSearchResults: {
      title: 'Nada encontrado',
      description: 'Tente outros termos ou explore novos sites para encontrar conteúdo interessante.',
      cta: 'Limpar Busca',
    },
  },

  addSubscription: {
    site: {
      title: 'Adicionar Site',
      subtitle: 'Cole a URL e nós descobrimos o feed automaticamente. Simples assim.',
      placeholder: 'exemplo.com ou https://exemplo.com',
      examples: 'Exemplos: techcrunch.com, theverge.com, g1.globo.com',
      cta: 'Adicionar Site',
      success: 'Site adicionado! Novos artigos chegarão em breve.',
    },
    youtube: {
      title: 'Adicionar Canal YouTube',
      subtitle: 'Digite o nome, @handle ou URL. Encontramos tudo automaticamente.',
      placeholder: '@nomedocanal ou URL do canal',
      examples: 'Exemplos: @GoogleDevelopers, Fireship, MKBHD',
      cta: 'Adicionar Canal',
      success: 'Canal adicionado! Novos vídeos aparecerão aqui.',
    },
  },

  auth: {
    login: {
      title: 'RSS Aggregator',
      tagline: 'Suas notícias em um só lugar',
      button: 'Entrar',
      loading: 'Entrando...',
      noAccount: 'Não tem uma conta?',
      registerLink: 'Cadastre-se',
    },
    register: {
      title: 'Criar conta',
      subtitle: 'Comece a organizar suas notícias em segundos',
      button: 'Criar conta',
      loading: 'Criando conta...',
      success: 'Conta criada! Bem-vindo ao seu novo hub de notícias.',
    },
  },

  progress: {
    streak: {
      current: (days: number) => {
        if (days === 1) return '🔥 Primeiro dia! Continue assim';
        if (days < 7) return `🔥 ${days} dias seguidos! Você está no caminho certo`;
        if (days < 30) return `🔥 ${days} dias consecutivos! Impressionante`;
        return `🔥 ${days} dias! Você é um mestre da consistência`;
      },
      milestone: (days: number) => {
        if (days === 3) return '🎉 3 dias! Você está criando um hábito';
        if (days === 7) return '🎉 Uma semana completa! Continue assim';
        if (days === 30) return '🎉 Um mês! Você é dedicado';
        return `🎉 ${days} dias! Continue mantendo sua sequência`;
      },
      encouragement: 'Não quebre sua sequência! Abra o app hoje.',
    },
    achievements: {
      unlocked: (name: string) => `🏆 Conquista desbloqueada: ${name}`,
      progress: (current: number, target: number) =>
        `${current}/${target} - Continue assim!`,
      almost: (name: string, remaining: number) =>
        `Quase lá! Falta ${remaining} para desbloquear "${name}"`,
    },
    level: {
      up: (level: number) => `🎊 Nível ${level}! Continue evoluindo`,
      current: (level: number) => `Nível ${level}`,
    },
  },

  urgency: {
    newContent: (count: number) => {
      if (count === 1) return '📰 1 novo artigo esperando por você';
      if (count < 5) return `📰 ${count} novos artigos esperando por você`;
      return `📰 ${count} novos artigos! Tem muita coisa boa para ler`;
    },
    streakWarning: (days: number) =>
      `⚠️ Cuidado! Você tem ${days} dias de sequência. Não perca hoje!`,
    milestoneNear: (remaining: number) =>
      `🎯 Falta apenas ${remaining} para sua próxima conquista!`,
  },

  socialProof: {
    popularSites: 'Sites populares entre nossos usuários',
    trendingNow: 'Em alta agora',
    othersAlsoRead: 'Outros também leram',
    joinThousands: 'Junte-se a milhares de leitores informados',
  },

  frictionReduction: {
    quickAdd: 'Adicionar rapidamente',
    suggestions: 'Sugestões para você',
    autoDetect: 'Detecção automática',
    oneClick: 'Um clique e pronto',
  },

  commitment: {
    setGoal: 'Defina sua meta diária',
    dailyGoal: 'Ler X artigos por dia',
    weeklyGoal: 'Ler X artigos por semana',
    reminder: 'Lembre-me de ler todos os dias',
    goalSet: 'Meta definida! Estamos juntos nessa.',
  },

  challenges: {
    newTitle: 'Novos desafios disponíveis!',
    complete: 'Desafio completado! +{xp} XP',
    allComplete: 'Todos os desafios do dia completados! Você é incrível.',
    news: {
      read: 'Expanda seu conhecimento com {count} leituras hoje.',
      explore: 'Descubra algo novo para seu feed de notícias.',
    },
    videos: {
      watch: 'Assista a {count} vídeos para se manter atualizado.',
      explore: 'Encontre um novo canal para seguir.',
    },
  },

  celebration: {
    achievementUnlocked: 'Conquista Desbloqueada!',
    share: 'Compartilhar Conquista',
    continue: 'Continuar Jornada',
    levelUp: 'Level Up! Você alcançou o nível {level}',
  },
};

// Funções auxiliares para copys contextuais
export const getContextualCopy = {
  // Baseado no número de subscriptions
  subscriptionCount: (count: number) => {
    if (count === 0) return persuasiveCopy.emptyStates.noSubscriptions;
    if (count === 1) return {
      title: 'Ótimo começo!',
      description: 'Adicione mais sites para ter um feed ainda mais rico.',
      cta: 'Adicionar Mais Sites',
    };
    if (count < 5) return {
      title: 'Bom progresso!',
      description: `Você tem ${count} sites. Adicione mais para diversificar seu feed.`,
      cta: 'Adicionar Mais',
    };
    return {
      title: 'Feed completo!',
      description: `Você está seguindo ${count} sites. Continue explorando!`,
      cta: 'Adicionar Mais',
    };
  },

  // Baseado no tempo do dia
  timeOfDay: () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return {
      greeting: 'Bom dia!',
      suggestion: 'Comece o dia bem informado',
    };
    if (hour >= 12 && hour < 18) return {
      greeting: 'Boa tarde!',
      suggestion: 'Veja o que aconteceu hoje',
    };
    if (hour >= 18 && hour < 22) return {
      greeting: 'Boa noite!',
      suggestion: 'Relaxe lendo suas notícias favoritas',
    };
    return {
      greeting: 'Boa madrugada!',
      suggestion: 'Conteúdo fresco esperando por você',
    };
  },

  // Baseado no progresso do usuário
  progressBased: (progress: {
    subscriptions: number;
    itemsRead: number;
    streak: number;
    level: number;
  }) => {
    const messages = [];

    if (progress.subscriptions === 0) {
      messages.push('Adicione seu primeiro site para começar');
    } else if (progress.itemsRead === 0) {
      messages.push('Explore os artigos disponíveis');
    } else if (progress.streak === 0) {
      messages.push('Volte amanhã para começar sua sequência');
    } else if (progress.streak < 3) {
      messages.push(persuasiveCopy.progress.streak.encouragement);
    }

    return messages;
  },
};

