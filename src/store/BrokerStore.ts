import { signal } from '@preact/signals-react';
import { BrokerInfoDTO } from '../../generated/data-contracts';

const BrokerInfoDefault: BrokerInfoDTO = {
  brokerName: '',
  brokerFiscalCode: '',
  brokerLogo: undefined
};

export const brokerInfoState = signal<BrokerInfoDTO>(BrokerInfoDefault);

export function setBrokerInfo(info: BrokerInfoDTO) {
  brokerInfoState.value = info;
}

export function resetBrokerInfo() {
  brokerInfoState.value = BrokerInfoDefault;
}
