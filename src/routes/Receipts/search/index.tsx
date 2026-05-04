import { IuvSearch } from 'components/IuvSearch';
import React from 'react';
import { InstallmentType } from 'utils/loaders';

export const ReceiptsSearch = () => {
  return (
    <IuvSearch
      descriptionKey="app.receiptsSearch.description"
      installmentType={InstallmentType.RECEIPTS}
      noDataTextKey="app.receiptsSearch.noData.text"
      noDataTitleKey="app.receiptsSearch.noData.title"
      resultKey="app.receiptsSearch.result"
      searchErrorKey="app.receiptsSearch.searchError"
      subtitleKey="app.receiptsSearch.sub"
      tab1DescriptionKey="app.receiptsSearch.tab1.description"
      tab2DescriptionKey="app.receiptsSearch.tab2.description"
      titleKey="app.receiptsSearch.title"
    />
  );
};
