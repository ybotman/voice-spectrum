import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders voice spectrum analyzer', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /Voice Spectrum Analyzer/i, level: 1 });
  expect(heading).toBeInTheDocument();
});

test('renders audio recorder component', () => {
  render(<App />);
  const recorderHeading = screen.getByText(/Audio Recorder/i);
  expect(recorderHeading).toBeInTheDocument();
});

test('renders start recording button', () => {
  render(<App />);
  const startButton = screen.getByRole('button', { name: /● Start Recording/i });
  expect(startButton).toBeInTheDocument();
});
