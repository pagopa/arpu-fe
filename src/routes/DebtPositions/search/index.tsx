import { IuvSearch } from 'components/IuvSearch';
import React from 'react';

export const DebtPositionsSearch = () => {
  return (
    <IuvSearch
      titleKey="app.debtPositionsSearch.title"
      descriptionKey="app.debtPositionsSearch.description"
      showResults={false}
    />
  );
};
