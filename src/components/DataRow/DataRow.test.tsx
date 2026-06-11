import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { DataRow } from '../DataRow';

describe('DataRow', () => {
  it('renders the label', () => {
    render(<DataRow label="Amount" value="€100.00" />);
    expect(screen.getByText('Amount')).toBeInTheDocument();
  });

  it('renders the value', () => {
    render(<DataRow label="Amount" value="€100.00" />);
    expect(screen.getByText('€100.00')).toBeInTheDocument();
  });

  it('renders both label and value together', () => {
    render(<DataRow label="Beneficiary" value="Comune di Roma" />);
    expect(screen.getByText('Beneficiary')).toBeInTheDocument();
    expect(screen.getByText('Comune di Roma')).toBeInTheDocument();
  });

  it('renders with empty value', () => {
    render(<DataRow label="Notice code" value="" />);
    expect(screen.getByText('Notice code')).toBeInTheDocument();
  });

  it('renders with empty label', () => {
    render(<DataRow label="" value="some value" />);
    expect(screen.getByText('some value')).toBeInTheDocument();
  });

  it('applies correct typography variant to label', () => {
    render(<DataRow label="Amount" value="€100.00" />);
    const label = screen.getByText('Amount');
    expect(label.tagName).toBe('P'); // body2 renders as <p>
  });

  it('renders long values without crashing', () => {
    const longValue = 'A'.repeat(200);
    render(<DataRow label="Long field" value={longValue} />);
    expect(screen.getByText(longValue)).toBeInTheDocument();
  });

  it('renders special characters in label and value', () => {
    render(<DataRow label="Codice fiscale" value="RSSMRA80A01H501U" />);
    expect(screen.getByText('Codice fiscale')).toBeInTheDocument();
    expect(screen.getByText('RSSMRA80A01H501U')).toBeInTheDocument();
  });
});
