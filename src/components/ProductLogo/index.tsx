import React from 'react';
import appStore from 'store/appStore';

export const ProductLogo = ({ maxWidth = '160px' }: { maxWidth?: string }) => (
  <img
    data-testid="header-product-logo"
    src={appStore.value.brokerInfo?.brokerLogo ?? ''}
    alt={appStore.value.brokerInfo?.brokerName ?? ''}
    style={{ maxWidth }}
  />
);
