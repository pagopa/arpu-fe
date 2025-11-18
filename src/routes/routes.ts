import config from 'utils/config';
const deployPath = config.deployPath;

const brokerId = config.brokerId;

const rootPrefix = `${deployPath}/${brokerId}`;

export const ArcRoutes = {
  DASHBOARD: rootPrefix,
  RECEIPT: `${rootPrefix}/ricevute/:id`,
  RECEIPTS: `${rootPrefix}/ricevute/`,
  PAYMENT_NOTICES: `${rootPrefix}/avvisi/`,
  PAYMENT_NOTICE_DETAIL: `${rootPrefix}/avvisi/:id/:paTaxCode`,
  USER: `${rootPrefix}/profilo`,
  COURTESY_PAGE: `${rootPrefix}/errore/:error`,
  LOGIN: `${rootPrefix}/accesso`,
  ASSISTANCE: `${rootPrefix}/assistenza`,
  AUTH_CALLBACK: `${rootPrefix}/auth-callback`,
  TOS: `${rootPrefix}/termini-di-servizio`,
  PRIVACY_POLICY: `${rootPrefix}/informativa-privacy`,
  PAYMENTS_ON_THE_FLY: `${rootPrefix}/spontanei`,
  PAYMENTS_ON_THE_FLY_DOWNLOAD: `${rootPrefix}/spontanei/download/:orgId/:iuv`
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
