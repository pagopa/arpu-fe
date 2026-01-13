import { signal } from '@preact/signals-react';
import { PreCartState } from 'models/PreCart';

const defaultPreCart: PreCartState = {
  isOpen: false,
  items: []
};

export const preCartState = signal<PreCartState>(defaultPreCart);

export function setPreCartItems(items: PreCartState['items']) {
  preCartState.value.items = items;
}

export function resetPreCart() {
  preCartState.value = defaultPreCart;
}

export function togglePreCartDrawer() {
  preCartState.value = { ...preCartState.value, isOpen: !preCartState.value.isOpen };
}

export function openPreCartDrawer() {
  preCartState.value = { ...preCartState.value, isOpen: true };
}

export function closePreCartDrawer() {
  preCartState.value = { ...preCartState.value, isOpen: false };
}