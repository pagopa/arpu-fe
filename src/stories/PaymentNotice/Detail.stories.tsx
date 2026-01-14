import { Meta } from '@storybook/react';
import { PaymentNotice } from 'components/PaymentNotice';
import { PaymentNoticeDetailsType } from 'models/PaymentNotice';
import React from 'react';
import { mockConvertedNotice } from 'stories/utils/PaymentNoticeMocks';

const meta: Meta = {
  title: 'Payment Notice',
  args: {
    paymentNotice: mockConvertedNotice[0]
  }
};

export default meta;

export const Detail = {
  render: (args: { paymentNotice: PaymentNoticeDetailsType }) => <PaymentNotice.Detail {...args} />
};
