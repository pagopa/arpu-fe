import { IuvSearch } from 'components/IuvSearch';
import React from 'react';
import { InstallmentType } from 'utils/loaders';

export const DebtPositionsSearch = () => {
  return (
    <IuvSearch
      titleKey="app.debtPositionsSearch.title"
      descriptionKey="app.debtPositionsSearch.description"
      installmentType={InstallmentType.ALL}
    />
  );
};
