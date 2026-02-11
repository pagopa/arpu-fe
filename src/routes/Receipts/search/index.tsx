import { IuvSearch } from 'components/IuvSearch';
import React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { InstallmentType } from 'utils/loaders';

export const ReceiptsSearch = () => {
  const { t } = useTranslation();
  return (
    <>
      <Helmet>
        <title>{`${t('pageTitles.receiptsSearch')} - ${t('app.title')}`}</title>
      </Helmet>
      <IuvSearch
        titleKey="app.receiptsSearch.title"
        descriptionKey="app.receiptsSearch.description"
        subtitleKey="app.receiptsSearch.sub"
        tab1DescriptionKey="app.receiptsSearch.tab1.description"
        tab2DescriptionKey="app.receiptsSearch.tab2.description"
        noDataTitleKey="app.receiptsSearch.noData.title"
        noDataTextKey="app.receiptsSearch.noData.text"
        searchErrorKey="app.receiptsSearch.searchError"
        resultKey="app.receiptsSearch.result"
        installmentType={InstallmentType.RECEIPTS}
      />
    </>
  );
};
