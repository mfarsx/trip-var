import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import Login from '../Login';
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
const mockLocation = { 
  state: null,
  pathname: '/login',
  search: '',
  hash: '',
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
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

describe('Login Component', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
    mockLocation.state = null;
  });

  const renderLogin = (storeState = {}) => {
    const store = createTestStore(storeState);
    return render(
      <TestWrapper store={store}>
        <Login />
      </TestWrapper>
    );
  };

  describe('Rendering', () => {
    it('renders login form with all required elements', () => {
      renderLogin();

      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByText('Sign in to continue your adventure')).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByText('Google')).toBeInTheDocument();
      expect(screen.getByText('GitHub')).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('updates form fields when user types', async () => {
      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');
    });

    it('toggles remember me checkbox', async () => {
      renderLogin();

      const rememberMeCheckbox = screen.getByLabelText(/remember me/i);
      
      expect(rememberMeCheckbox).not.toBeChecked();
      await user.click(rememberMeCheckbox);
      expect(rememberMeCheckbox).toBeChecked();
    });

    it('shows loading state when submitting', () => {
      renderLogin({ loading: true });

      const submitButton = screen.getByRole('button', { name: /signing in/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    it('dispatches login action when form is submitted', async () => {
      const store = createTestStore();
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      
      render(
        <TestWrapper store={store}>
          <Login />
        </TestWrapper>
      );

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(dispatchSpy).toHaveBeenCalledWith(expect.any(Function));
    });

    it('navigates to intended destination after successful login', async () => {
      mockLocation.state = { from: { pathname: '/dashboard' } };
      
      const store = createTestStore();
      vi.spyOn(store, 'dispatch').mockImplementation((action) => {
        if (typeof action === 'function') {
          return Promise.resolve({ 
            payload: { user: { id: 1, email: 'test@example.com' }, token: 'mock-token' },
            error: undefined 
          });
        }
        return action;
      });
      
      render(
        <TestWrapper store={store}>
          <Login />
        </TestWrapper>
      );

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('navigates to home when no intended destination', () => {
      renderLogin({ isAuthenticated: true });

      expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/');
    });
  });

  describe('Error Handling', () => {
    it('displays error message when login fails', () => {
      renderLogin({ error: 'Invalid credentials' });

      expect(screen.getByText(/we're sorry.*something's gone wrong/i)).toBeInTheDocument();
    });

    it('does not display error message when no error', () => {
      renderLogin();

      expect(screen.queryByText(/we're sorry.*something's gone wrong/i)).not.toBeInTheDocument();
    });
  });

  describe('Authentication State', () => {
    it('redirects to home when already authenticated', () => {
      renderLogin({ isAuthenticated: true });

      expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/');
    });
  });

  describe('Form Validation', () => {
    it('requires email and password fields', () => {
      renderLogin();

      expect(screen.getByLabelText(/email/i)).toBeRequired();
      expect(screen.getByLabelText(/password/i)).toBeRequired();
    });

    it('validates email format', () => {
      renderLogin();

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute('type', 'email');
    });
  });
});