import config from 'utils/config';
const deployPath = config.deployPath;

const brokerId = config.brokerId;

export const ArcRoutes = {
  DASHBOARD: `${deployPath}/${brokerId}`,
  TRANSACTION: `${deployPath}/${brokerId}/ricevute/:id`,
  TRANSACTIONS: `${deployPath}/${brokerId}/ricevute/`,
  PAYMENT_NOTICES: `${deployPath}/${brokerId}/avvisi/`,
  PAYMENT_NOTICE_DETAIL: `${deployPath}/${brokerId}/avvisi/:id/:paTaxCode`,
  USER: `${deployPath}/${brokerId}/profilo`,
  COURTESY_PAGE: `${deployPath}/${brokerId}/errore/:error`,
  LOGIN: `${deployPath}/${brokerId}/accesso`,
  ASSISTANCE: `${deployPath}/${brokerId}/assistenza`,
  AUTH_CALLBACK: `${deployPath}/auth-callback`,
  TOS: `${deployPath}/${brokerId}/termini-di-servizio`,
  PRIVACY_POLICY: `${deployPath}/${brokerId}/informativa-privacy`,
  SPONTANEI: `${deployPath}/${brokerId}/spontanei`
};

export enum ArcErrors {
  /** generic error */
  'sconosciuto' = 400,
  'sessione-scaduta' = 401,
  /** whitelist: user not authorized to access the resource */
  'accesso-non-autorizzato' = 403,
  /** resource not found */
  'risorsa-non-trovata' = 404,
  /** something went wrong with the login */
  'accesso-non-riuscito' = 408,
  'avviso-non-pagabile' = 422,
  'avvio-pagamento' = 423
}
