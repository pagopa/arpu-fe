import { IuvSearch } from 'components/IuvSearch';
import React from 'react';
import { InstallmentType } from 'utils/loaders';

export const DebtPositionsSearch = () => {
  return (
    <IuvSearch
      descriptionKey="app.debtPositionsSearch.description"
      installmentType={InstallmentType.ALL}
      noDataTextKey="app.debtPositionsSearch.noData.text"
      noDataTitleKey="app.debtPositionsSearch.noData.title"
      resultKey="app.debtPositionsSearch.result"
      searchErrorKey="app.debtPositionsSearch.searchError"
      subtitleKey="app.debtPositionsSearch.sub"
      tab1DescriptionKey="app.debtPositionsSearch.tab1.description"
      tab2DescriptionKey="app.debtPositionsSearch.tab2.description"
      titleKey="app.debtPositionsSearch.title"
    />
  );
};
