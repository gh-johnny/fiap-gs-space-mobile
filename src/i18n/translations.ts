export type Locale = 'en' | 'pt'

const en = {
  // Settings
  'settings.title': 'SETTINGS',
  'settings.globe': 'Globe',
  'settings.display': 'Display',
  'settings.day': '☀ DAY',
  'settings.night': '☾ NIGHT',
  'settings.technical': 'TEC',
  'settings.simple': 'SIM',
  'settings.language': 'Language',
  'settings.notifications': 'Alerts',
  'settings.location': 'Beacon',
  'settings.on': 'ON',
  'settings.off': 'OFF',

  // Globe screen
  'globe.conjunctions': 'CONJUNCTIONS',
  'globe.monitor': 'MONITOR',

  // Dashboard
  'dashboard.title': 'ORBITAL INTEL',
  'dashboard.subtitle': 'Space Situational Awareness',
  'dashboard.activeAlert': 'ACTIVE ALERT',
  'dashboard.riskIndex': 'RISK INDEX',
  'dashboard.tracked': 'TRACKED',
  'dashboard.corrected': 'CORRECTED',
  'dashboard.conjunctions': 'DETECTED CONJUNCTIONS',
  'dashboard.upcoming': 'UPCOMING EVENTS',
  'dashboard.zones': 'ORBITAL ZONES',
  'dashboard.riskHigh': 'HIGH',
  'dashboard.riskMedium': 'MODERATE',
  'dashboard.riskLow': 'LOW',
  'dashboard.orbitalObjects': 'objects in orbit',
  'dashboard.noEvents': 'No events loaded — open the Globe first',
  'dashboard.openGlobe': 'Open the Globe to load zones',

  // Onboarding
  'onboarding.title': 'Orbital Guardian',
  'onboarding.subtitle': 'Real-time monitoring of satellites and orbital debris',
  'onboarding.bullet1': 'Visualise orbiting objects on the 3D globe',
  'onboarding.bullet2': 'Detect conjunctions and collision risks',
  'onboarding.bullet3': 'Access the complete alert history',
  'onboarding.start': 'START MONITORING',

  // Severity
  'severity.critical': 'CRITICAL',
  'severity.warning': 'WARNING',
  'severity.info': 'INFO',

  // Recommendations
  'rec.critical': 'Immediate action required — imminent collision risk',
  'rec.warning': 'Monitor closely — manoeuvre window available',
  'rec.info': 'Situation under control — continue monitoring',

  // Alert
  'alert.probability': 'Probability',
  'alert.distance': 'Distance',
  'alert.when': 'When',
  'alert.time': 'Time',
  'alert.pc': 'Pc',
  'alert.missDistance': 'Miss Distance',
  'alert.tcpa': 'TCPA',
  'alert.window': 'UTC Window',
  'alert.close': 'CLOSE',
  'alert.acknowledge': 'ACKNOWLEDGE',
  'alert.viewDetails': 'VIEW DETAILS ›',
  'alert.status': 'Status',
  'alert.details': 'DETAILS',

  // Conjunction list
  'conjunction.title': 'ACTIVE CONJUNCTIONS',
  'conjunction.active': 'ACTIVE',
  'conjunction.corrected': 'CORRECTED',
  'conjunction.none': 'No active conjunctions',
  'conjunction.correctedBadge': '✓ CORRECTED',
  'conjunction.correct': 'CORRECT ›',
  'conjunction.remove': 'REMOVE',

  // Tabs
  'tab.globe': 'GLOBE',
  'tab.intel': 'INTEL',

  // Format strings (used in format-simple.ts)
  'format.now': 'now',
  'format.separation.m': 'm separation',
  'format.separation.km': 'km separation',
  'format.inMin': 'in {m}min',
  'format.inHours': 'in {h}h',
  'format.inHoursMin': 'in {h}h {m}min',
  'format.oneIn': '1 in',
  'format.months': 'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec',

  // Satellite control sheet
  'sat.controlPanel': 'CONTROL PANEL',
  'sat.noSignal': 'NO SIGNAL',
  'sat.typeOperational': 'OPERATIONAL',
  'sat.typeDebris': 'DEBRIS',
  'sat.typeRocket': 'ORBITAL STAGE',
  'sat.typeAsteroid': 'ASTEROID',
  'sat.fragmentLabel': 'UNCONTROLLED FRAGMENT',
  'sat.asteroidLabel': 'NATURAL BODY · NO CONTROL',
  'sat.propellant': 'PROPELLANT',
  'sat.opMode': 'OPERATING MODE',
  'sat.systems': 'SYSTEMS',
  'sat.modeNominal': 'NOMINAL',
  'sat.modeEco': 'ECO',
  'sat.modeSafe': 'SAFE',
  'sat.phase0': 'CALCULATING TRAJECTORY…',
  'sat.phase1': 'ACTIVATING THRUSTERS…',
  'sat.phase2': 'Δv +0.3 m/s APPLIED',
  'sat.executeCorrection': 'EXECUTE ORBITAL CORRECTION',
  'sat.commsOffline': 'SILENCE',
  'sat.cameraValue': 'OPTICAL · STANDBY',
  'sat.observationalData': 'OBSERVATIONAL DATA',
  'sat.uncontrolledInfo': 'No control interface available for this object. Trajectory tracking only.',
} as const

const pt: typeof en = {
  // Settings
  'settings.title': 'CONFIGURAÇÕES',
  'settings.globe': 'Globo',
  'settings.display': 'Exibição',
  'settings.day': '☀ DIA',
  'settings.night': '☾ NOITE',
  'settings.technical': 'TÉC',
  'settings.simple': 'SIM',
  'settings.language': 'Idioma',
  'settings.notifications': 'Alertas',
  'settings.location': 'Beacon',
  'settings.on': 'ON',
  'settings.off': 'OFF',

  // Globe screen
  'globe.conjunctions': 'CONJUNÇÕES',
  'globe.monitor': 'MONITOR',

  // Dashboard
  'dashboard.title': 'ORBITAL INTEL',
  'dashboard.subtitle': 'Space Situational Awareness',
  'dashboard.activeAlert': 'ALERTA ATIVO',
  'dashboard.riskIndex': 'ÍNDICE DE RISCO',
  'dashboard.tracked': 'RASTREADOS',
  'dashboard.corrected': 'CORRIGIDAS',
  'dashboard.conjunctions': 'CONJUNÇÕES DETECTADAS',
  'dashboard.upcoming': 'PRÓXIMOS EVENTOS',
  'dashboard.zones': 'ZONAS ORBITAIS',
  'dashboard.riskHigh': 'ALTO',
  'dashboard.riskMedium': 'MODERADO',
  'dashboard.riskLow': 'BAIXO',
  'dashboard.orbitalObjects': 'objetos em órbita',
  'dashboard.noEvents': 'Sem eventos carregados — abra o Globo primeiro',
  'dashboard.openGlobe': 'Abra o Globo para carregar as zonas',

  // Onboarding
  'onboarding.title': 'Orbital Guardian',
  'onboarding.subtitle': 'Monitoramento em tempo real de satélites e detritos orbitais',
  'onboarding.bullet1': 'Visualize objetos em órbita no globo 3D',
  'onboarding.bullet2': 'Detecte conjunções e riscos de colisão',
  'onboarding.bullet3': 'Acesse o histórico completo de alertas',
  'onboarding.start': 'COMEÇAR MONITORAMENTO',

  // Severity
  'severity.critical': 'CRÍTICO',
  'severity.warning': 'ALERTA',
  'severity.info': 'INFO',

  // Recommendations
  'rec.critical': 'Ação imediata necessária — risco de colisão iminente',
  'rec.warning': 'Monitorar de perto — janela de manobra disponível',
  'rec.info': 'Situação sob controle — continuar monitoramento',

  // Alert
  'alert.probability': 'Probabilidade',
  'alert.distance': 'Distância',
  'alert.when': 'Quando',
  'alert.time': 'Horário',
  'alert.pc': 'Pc',
  'alert.missDistance': 'Miss Distance',
  'alert.tcpa': 'TCPA',
  'alert.window': 'Janela UTC',
  'alert.close': 'FECHAR',
  'alert.acknowledge': 'RECONHECER',
  'alert.viewDetails': 'VER DETALHES ›',
  'alert.status': 'Status',
  'alert.details': 'DETALHES',

  // Conjunction list
  'conjunction.title': 'CONJUNÇÕES ATIVAS',
  'conjunction.active': 'ATIVAS',
  'conjunction.corrected': 'CORRIGIDAS',
  'conjunction.none': 'Nenhuma conjunção ativa',
  'conjunction.correctedBadge': '✓ CORRIGIDO',
  'conjunction.correct': 'CORRIGIR ›',
  'conjunction.remove': 'REMOVER',

  // Tabs
  'tab.globe': 'GLOBO',
  'tab.intel': 'INTEL',

  // Format strings
  'format.now': 'agora',
  'format.separation.m': 'm de separação',
  'format.separation.km': 'km de separação',
  'format.inMin': 'em {m}min',
  'format.inHours': 'em {h}h',
  'format.inHoursMin': 'em {h}h {m}min',
  'format.oneIn': '1 em',
  'format.months': 'jan,fev,mar,abr,mai,jun,jul,ago,set,out,nov,dez',

  // Satellite control sheet
  'sat.controlPanel': 'PAINEL DE CONTROLE',
  'sat.noSignal': 'SEM SINAL',
  'sat.typeOperational': 'OPERACIONAL',
  'sat.typeDebris': 'DETRITO',
  'sat.typeRocket': 'ESTÁGIO ORBITAL',
  'sat.typeAsteroid': 'ASTEROIDE',
  'sat.fragmentLabel': 'FRAGMENTO NÃO CONTROLADO',
  'sat.asteroidLabel': 'CORPO NATURAL · SEM CONTROLE',
  'sat.propellant': 'PROPELENTE',
  'sat.opMode': 'MODO DE OPERAÇÃO',
  'sat.systems': 'SISTEMAS',
  'sat.modeNominal': 'NOMINAL',
  'sat.modeEco': 'ECO',
  'sat.modeSafe': 'SEGURO',
  'sat.phase0': 'CALCULANDO TRAJETÓRIA…',
  'sat.phase1': 'ATIVANDO PROPULSORES…',
  'sat.phase2': 'Δv +0.3 m/s APLICADO',
  'sat.executeCorrection': 'EXECUTAR CORREÇÃO ORBITAL',
  'sat.commsOffline': 'SILÊNCIO',
  'sat.cameraValue': 'ÓPTICA · STANDBY',
  'sat.observationalData': 'DADOS OBSERVACIONAIS',
  'sat.uncontrolledInfo': 'Nenhuma interface de controle disponível para este objeto. Somente rastreamento de trajetória.',
}

export const TRANSLATIONS: Record<Locale, typeof en> = { en, pt }
export type TranslationKey = keyof typeof en
