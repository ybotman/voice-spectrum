import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders voice spectrum analyzer', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /Voice Spectrum Analyzer/i, level: 1 });
  expect(heading).toBeInTheDocument();
});

test('renders tab navigation', () => {
  render(<App />);
  // Check for tabs
  const spectrumTab = screen.getByText(/📊 Spectrum/i);
  expect(spectrumTab).toBeInTheDocument();
});

test('renders spectrum tab by default', () => {
  render(<App />);
  // Spectrum tab should show FilterControls
  const filterControls = screen.getByText(/Band-Pass Filter/i);
  expect(filterControls).toBeInTheDocument();
});
