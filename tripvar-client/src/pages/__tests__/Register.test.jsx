import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import Register from '../Register';
import authSlice from '../../store/slices/authSlice';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
  },
}));

// Mock react-router-dom
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Navigate: ({ to }) => <div data-testid="navigate" data-to={to} />,
  };
});

// Test utilities
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: { auth: authSlice },
    preloadedState: {
      auth: {
        loading: false,
        error: null,
        isAuthenticated: false,
        user: null,
        ...initialState,
      },
    },
  });
};

const TestWrapper = ({ children, store }) => (
  <Provider store={store}>
    <BrowserRouter>{children}</BrowserRouter>
  </Provider>
);

describe('Register Component', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  const renderRegister = (storeState = {}) => {
    const store = createTestStore(storeState);
    return render(
      <TestWrapper store={store}>
        <Register />
      </TestWrapper>
    );
  };

  describe('Rendering', () => {
    it('renders registration form with all required elements', () => {
      renderRegister();

      expect(screen.getByText('Create Account')).toBeInTheDocument();
      expect(screen.getByText('Sign up to start your adventure')).toBeInTheDocument();
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
      expect(screen.getByText('Google')).toBeInTheDocument();
      expect(screen.getByText('GitHub')).toBeInTheDocument();
      expect(screen.getByText('Sign in')).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('updates form fields when user types', async () => {
      renderRegister();

      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(passwordInput, 'password123');

      expect(nameInput).toHaveValue('John Doe');
      expect(emailInput).toHaveValue('john@example.com');
      expect(passwordInput).toHaveValue('password123');
    });

    it('shows loading state when submitting', () => {
      renderRegister({ loading: true });

      const submitButton = screen.getByRole('button', { name: /creating account/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    it('dispatches register action when form is submitted', async () => {
      const store = createTestStore();
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      
      render(
        <TestWrapper store={store}>
          <Register />
        </TestWrapper>
      );

      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'john@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(dispatchSpy).toHaveBeenCalledWith(expect.any(Function));
    });

    it('navigates to home after successful registration', () => {
      renderRegister({ isAuthenticated: true });

      expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/');
    });
  });

  describe('Error Handling', () => {
    it('displays error message when registration fails', () => {
      renderRegister({ error: 'Email already exists' });

      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });

    it('does not display error message when no error', () => {
      renderRegister();

      expect(screen.queryByText('Email already exists')).not.toBeInTheDocument();
    });
  });

  describe('Authentication State', () => {
    it('redirects to home when already authenticated', () => {
      renderRegister({ isAuthenticated: true });

      expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/');
    });
  });

  describe('Form Validation', () => {
    it('requires all form fields', () => {
      renderRegister();

      expect(screen.getByLabelText(/name/i)).toBeRequired();
      expect(screen.getByLabelText(/email/i)).toBeRequired();
      expect(screen.getByLabelText(/password/i)).toBeRequired();
    });

    it('validates email format', () => {
      renderRegister();

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute('type', 'email');
    });
  });

  describe('Social Login Buttons', () => {
    it('renders and allows interaction with social login buttons', async () => {
      renderRegister();

      const googleButton = screen.getByRole('button', { name: /google/i });
      const githubButton = screen.getByRole('button', { name: /github/i });

      expect(googleButton).toBeInTheDocument();
      expect(githubButton).toBeInTheDocument();

      // Test that buttons are clickable
      await user.click(googleButton);
      await user.click(githubButton);

      expect(googleButton).toBeInTheDocument();
      expect(githubButton).toBeInTheDocument();
    });
  });
});