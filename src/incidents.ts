import type { Incident } from './model.ts';

export const incidents: Incident[] = [
  { id: 'INC-118', title: 'Aumento de erros no checkout', service: 'Pagamentos', severity: 'critical', phase: 'open', date: '2026-11-26', summary: 'A taxa de erro subiu após uma mudança no roteamento de pagamentos. A equipe está comparando respostas dos provedores.' },
  { id: 'INC-117', title: 'Atraso na entrega de e-mails', service: 'Notificações', severity: 'major', phase: 'monitoring', date: '2026-11-26', summary: 'A fila voltou ao tamanho usual após o ajuste de capacidade. A equipe acompanha o tempo de entrega.' },
  { id: 'INC-116', title: 'Sessões expirando antes do previsto', service: 'Identidade', severity: 'major', phase: 'resolved', date: '2026-11-26', summary: 'O tempo de sessão foi restaurado após revisar a configuração de expiração.' },
  { id: 'INC-115', title: 'Latência elevada na consulta de pedidos', service: 'API pública', severity: 'major', phase: 'monitoring', date: '2026-11-25', summary: 'A consulta passou a usar o índice adequado. A equipe compara a latência antes e depois da alteração.' },
  { id: 'INC-114', title: 'Falha intermitente no Pix', service: 'Pagamentos', severity: 'major', phase: 'resolved', date: '2026-11-25', summary: 'O tráfego voltou ao normal após um ajuste no tratamento de respostas temporárias.' },
  { id: 'INC-113', title: 'Respostas lentas na API de clientes', service: 'API pública', severity: 'minor', phase: 'resolved', date: '2026-11-25', summary: 'A equipe otimizou a leitura de clientes e validou a redução de latência.' },
  { id: 'INC-112', title: 'Notificações duplicadas', service: 'Notificações', severity: 'minor', phase: 'resolved', date: '2026-11-25', summary: 'O tratamento de reentregas passou a impedir duplicatas.' },
  { id: 'INC-111', title: 'Falha ao redefinir senha', service: 'Identidade', severity: 'major', phase: 'open', date: '2026-11-24', summary: 'A redefinição falha para alguns domínios de e-mail. A equipe avalia a fila de solicitações.' },
  { id: 'INC-110', title: 'Erros na API de busca', service: 'API pública', severity: 'major', phase: 'resolved', date: '2026-11-24', summary: 'O serviço voltou a responder após ajuste no tempo limite das consultas.' },
  { id: 'INC-109', title: 'Instabilidade no envio de SMS', service: 'Notificações', severity: 'minor', phase: 'resolved', date: '2026-11-23', summary: 'As mensagens foram redirecionadas para o provedor secundário durante a recuperação.' },
  { id: 'INC-108', title: 'Atraso na confirmação de boletos', service: 'Pagamentos', severity: 'major', phase: 'resolved', date: '2026-11-23', summary: 'A fila de confirmação foi processada e os estados dos boletos foram conferidos.' },
  { id: 'INC-107', title: 'Limite de requisições incorreto', service: 'API pública', severity: 'minor', phase: 'resolved', date: '2026-11-23', summary: 'O teto de requisições foi corrigido para as chaves afetadas.' },
  { id: 'INC-106', title: 'Intermitência no login corporativo', service: 'Identidade', severity: 'critical', phase: 'resolved', date: '2026-11-22', summary: 'A configuração do provedor de identidade foi corrigida e os logins foram validados.' },
  { id: 'INC-105', title: 'Atraso na atualização de recibos', service: 'Pagamentos', severity: 'minor', phase: 'resolved', date: '2026-11-22', summary: 'A rotina de atualização dos recibos retomou a execução.' },
  { id: 'INC-104', title: 'Aumento de respostas 429', service: 'API pública', severity: 'major', phase: 'resolved', date: '2026-11-21', summary: 'O limite foi ajustado temporariamente enquanto a origem do pico era analisada.' },
  { id: 'INC-103', title: 'Não entrega de alertas por e-mail', service: 'Notificações', severity: 'major', phase: 'resolved', date: '2026-11-21', summary: 'Os alertas retidos foram reenviados após corrigir a configuração de entrega.' },
  { id: 'INC-102', title: 'Recibos sem número de pedido', service: 'Pagamentos', severity: 'minor', phase: 'resolved', date: '2026-11-20', summary: 'Os recibos afetados foram gerados novamente com o número correto.' },
  { id: 'INC-101', title: 'Atraso na criação de contas', service: 'Identidade', severity: 'major', phase: 'resolved', date: '2026-11-20', summary: 'O processamento das contas em espera foi concluído.' },
  { id: 'INC-100', title: 'Oscilação na autorização de cartão', service: 'Pagamentos', severity: 'major', phase: 'resolved', date: '2026-11-16', summary: 'As autorizações foram normalizadas após ajuste do tempo limite.' },
  { id: 'INC-099', title: 'Consulta de relatórios interrompida', service: 'API pública', severity: 'minor', phase: 'resolved', date: '2026-11-09', summary: 'A consulta de relatórios foi corrigida e teve seu retorno validado.' },
];
