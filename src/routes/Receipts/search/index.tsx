import { IuvSearch } from 'components/IuvSearch';
import React from 'react';

export const ReceiptsSearch = () => {
  return (
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
      showResults={true}
    />
  );
};
