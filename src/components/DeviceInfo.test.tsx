import { render, screen } from '@testing-library/react';
import { DeviceInfo } from './DeviceInfo';

describe('DeviceInfo', () => {
  it('renders device information component', () => {
    render(<DeviceInfo />);
    expect(screen.getByText(/Audio Devices/i)).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<DeviceInfo />);
    expect(screen.getByText(/Loading device information/i)).toBeInTheDocument();
  });
});
