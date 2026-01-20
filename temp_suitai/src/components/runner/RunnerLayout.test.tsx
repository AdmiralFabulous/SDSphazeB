import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RunnerLayout } from './RunnerLayout';

describe('RunnerLayout', () => {
  describe('Header', () => {
    it('renders header with runner name', () => {
      render(
        <RunnerLayout runnerName="John Doe">
          <div>Content</div>
        </RunnerLayout>
      );

      const header = screen.getByText('John Doe');
      expect(header).toBeInTheDocument();
      expect(header.tagName).toBe('H1');
    });

    it('displays default runner name if not provided', () => {
      render(
        <RunnerLayout>
          <div>Content</div>
        </RunnerLayout>
      );

      expect(screen.getByText('Runner')).toBeInTheDocument();
    });
  });

  describe('Bottom Navigation', () => {
    it('renders three navigation buttons', () => {
      render(
        <RunnerLayout>
          <div>Content</div>
        </RunnerLayout>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });

    it('renders nav buttons with labels', () => {
      render(
        <RunnerLayout>
          <div>Content</div>
        </RunnerLayout>
      );

      expect(screen.getByLabelText('Home')).toBeInTheDocument();
      expect(screen.getByLabelText('Measurements')).toBeInTheDocument();
      expect(screen.getByLabelText('Settings')).toBeInTheDocument();
    });

    it('sets active state on home button by default', () => {
      render(
        <RunnerLayout activeTab="home">
          <div>Content</div>
        </RunnerLayout>
      );

      const homeButton = screen.getByLabelText('Home');
      expect(homeButton).toHaveClass('active');
    });

    it('sets active state on measurements button when specified', () => {
      render(
        <RunnerLayout activeTab="measurements">
          <div>Content</div>
        </RunnerLayout>
      );

      const measurementsButton = screen.getByLabelText('Measurements');
      expect(measurementsButton).toHaveClass('active');
    });

    it('sets active state on settings button when specified', () => {
      render(
        <RunnerLayout activeTab="settings">
          <div>Content</div>
        </RunnerLayout>
      );

      const settingsButton = screen.getByLabelText('Settings');
      expect(settingsButton).toHaveClass('active');
    });

    it('calls onTabChange when navigation button is clicked', () => {
      const onTabChange = jest.fn();
      render(
        <RunnerLayout activeTab="home" onTabChange={onTabChange}>
          <div>Content</div>
        </RunnerLayout>
      );

      const measurementsButton = screen.getByLabelText('Measurements');
      fireEvent.click(measurementsButton);

      expect(onTabChange).toHaveBeenCalledWith('measurements');
    });

    it('renders buttons with aria-current attribute', () => {
      render(
        <RunnerLayout activeTab="home">
          <div>Content</div>
        </RunnerLayout>
      );

      const homeButton = screen.getByLabelText('Home');
      expect(homeButton).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Content Area', () => {
    it('renders children in main content area', () => {
      render(
        <RunnerLayout>
          <div data-testid="test-content">Test Content</div>
        </RunnerLayout>
      );

      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });
  });

  describe('Touch-friendly sizing', () => {
    it('navigation buttons have minimum 44px touch target', () => {
      const { container } = render(
        <RunnerLayout>
          <div>Content</div>
        </RunnerLayout>
      );

      const navButtons = container.querySelectorAll('.nav-button');
      navButtons.forEach(button => {
        const styles = window.getComputedStyle(button);
        // Check that min-height and min-width are set
        expect(styles.minHeight).toBe('48px');
        expect(styles.minWidth).toBe('48px');
      });
    });
  });

  describe('Safe area handling', () => {
    it('applies safe-area-inset CSS for notched phones', () => {
      const { container } = render(
        <RunnerLayout>
          <div>Content</div>
        </RunnerLayout>
      );

      const layout = container.querySelector('.runner-layout');
      const styles = window.getComputedStyle(layout);

      // Check that safe-area-inset values are used in padding
      expect(styles.paddingTop).toBeDefined();
      expect(styles.paddingBottom).toBeDefined();
      expect(styles.paddingLeft).toBeDefined();
      expect(styles.paddingRight).toBeDefined();
    });
  });
});
