import React from 'react';
import appStore from 'store/appStore';

export const ProductLogo = () => (
  <img
    data-testid="header-product-logo"
    src={appStore.value.brokerInfo?.brokerLogo ?? ''}
    alt={appStore.value.brokerInfo?.brokerName ?? ''}
    width="56px"
  />
);
