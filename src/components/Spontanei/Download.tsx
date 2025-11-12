import { Button, Container, Link, Stack, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import IllusHourGlass from './IllusHourGlass';
import utils from 'utils';
import { useParams} from 'react-router-dom';

const Download = () => {
  const { t } = useTranslation();
  const { orgId, iuv } = useParams();
 
  const mutation = utils.loaders.getPaymentNotice(1,  parseInt(orgId || '0', 10), { iuv });
  
  const download = async () => {
    try {
      const { data, filename } = await mutation.mutateAsync();
      utils.files.downloadBlob(data, filename || `${iuv}.pdf`)
    } catch {
      utils.notify.emit('qualcosa è andato storto')
    }
  }


  useEffect( () => { download() }, []);
 
  return (
    <Container>
      <Stack alignItems="center" mt={22.5} mb={22.5} gap={4}>
        <IllusHourGlass />
        <Stack alignItems="center">
          <Typography variant="h4">{t('spontanei.download.title')}</Typography>
          <Typography variant="body1">
            <Trans
              i18nKey={t('spontanei.download.help')}
              components={{
                link1: <Link href="#" onClick={download} fontWeight={800} />
              }}
            />
          </Typography>
        </Stack>
        <Button variant="contained" size="large">
          {t('spontanei.download.close')}
        </Button>
        <Button href="https://www.pagopa.gov.it/it/cittadini/dove-pagare/" target="_blank">
          {t('spontanei.download.info')}
        </Button>
      </Stack>
    </Container>
  );
};

export default Download;
