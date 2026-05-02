import { render, screen, fireEvent } from '@testing-library/react';
import Timeline from './Timeline';

const mockSteps = [
  { id: 1, date: 'D1', title: 'Test 1', desc: 'Desc 1', icon: <span data-testid="icon1">1</span> },
  { id: 2, date: 'D2', title: 'Test 2', desc: 'Desc 2', icon: <span data-testid="icon2">2</span> },
];

describe('Timeline Component', () => {
  it('renders all steps', () => {
    const setActiveStep = vi.fn();
    render(<Timeline steps={mockSteps} activeStep={1} setActiveStep={setActiveStep} />);
    
    expect(screen.getByText('The Indian Election Timeline')).toBeInTheDocument();
    expect(screen.getByText('Test 1')).toBeInTheDocument();
    expect(screen.getByText('Test 2')).toBeInTheDocument();
  });

  it('calls setActiveStep when a step is clicked', () => {
    const setActiveStep = vi.fn();
    render(<Timeline steps={mockSteps} activeStep={1} setActiveStep={setActiveStep} />);
    
    const step2 = screen.getByText('Test 2').closest('.timeline-item');
    fireEvent.click(step2);
    
    expect(setActiveStep).toHaveBeenCalledWith(2);
  });

  it('has correct ARIA attributes', () => {
    const setActiveStep = vi.fn();
    render(<Timeline steps={mockSteps} activeStep={1} setActiveStep={setActiveStep} />);
    
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveAttribute('aria-current', 'step');
    expect(items[1]).not.toHaveAttribute('aria-current');
  });
});
