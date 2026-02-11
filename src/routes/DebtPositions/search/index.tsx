import { IuvSearch } from 'components/IuvSearch';
import React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { InstallmentType } from 'utils/loaders';

export const DebtPositionsSearch = () => {
  const { t } = useTranslation();
  return (
    <>
      <Helmet>
        <title>{`${t('pageTitles.debtPositionsSearch')} - ${t('app.title')}`}</title>
      </Helmet>
      <IuvSearch
        titleKey="app.debtPositionsSearch.title"
        descriptionKey="app.debtPositionsSearch.description"
        installmentType={InstallmentType.ALL}
      />
    </>
  );
};
