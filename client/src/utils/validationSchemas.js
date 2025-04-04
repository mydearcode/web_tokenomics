import * as Yup from 'yup';

// User registration form validation schema
export const registerSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
});

// User login form validation schema
export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required'),
});

// Project creation/editing form validation schema
export const projectSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Project name must be at least 2 characters')
    .max(100, 'Project name cannot exceed 100 characters')
    .required('Project name is required'),
  description: Yup.string()
    .min(10, 'Project description must be at least 10 characters')
    .max(1000, 'Project description cannot exceed 1000 characters')
    .required('Project description is required'),
  isPublic: Yup.boolean(),
  tokenomics: Yup.object().shape({
    tokenName: Yup.string()
      .min(2, 'Token name must be at least 2 characters')
      .max(50, 'Token name cannot exceed 50 characters')
      .required('Token name is required'),
    tokenSymbol: Yup.string()
      .min(2, 'Token symbol must be at least 2 characters')
      .max(10, 'Token symbol cannot exceed 10 characters')
      .required('Token symbol is required'),
    totalSupply: Yup.number()
      .min(1, 'Total supply must be greater than 0')
      .required('Total supply is required'),
    allocation: Yup.object().shape({
      team: Yup.number()
        .min(0, 'Team allocation cannot be negative')
        .max(100, 'Team allocation cannot exceed 100%')
        .required('Team allocation is required'),
      marketing: Yup.number()
        .min(0, 'Marketing allocation cannot be negative')
        .max(100, 'Marketing allocation cannot exceed 100%')
        .required('Marketing allocation is required'),
      development: Yup.number()
        .min(0, 'Development allocation cannot be negative')
        .max(100, 'Development allocation cannot exceed 100%')
        .required('Development allocation is required'),
      liquidity: Yup.number()
        .min(0, 'Liquidity allocation cannot be negative')
        .max(100, 'Liquidity allocation cannot exceed 100%')
        .required('Liquidity allocation is required'),
      treasury: Yup.number()
        .min(0, 'Treasury allocation cannot be negative')
        .max(100, 'Treasury allocation cannot exceed 100%')
        .required('Treasury allocation is required'),
      community: Yup.number()
        .min(0, 'Community allocation cannot be negative')
        .max(100, 'Community allocation cannot exceed 100%')
        .required('Community allocation is required'),
      advisors: Yup.number()
        .min(0, 'Advisors allocation cannot be negative')
        .max(100, 'Advisors allocation cannot exceed 100%')
        .required('Advisors allocation is required'),
      partners: Yup.number()
        .min(0, 'Partners allocation cannot be negative')
        .max(100, 'Partners allocation cannot exceed 100%')
        .required('Partners allocation is required'),
    }).test(
      'total-allocation',
      'Total allocation must equal 100%',
      (value) => {
        const total = Object.values(value).reduce((sum, val) => sum + val, 0);
        return Math.abs(total - 100) < 0.01;
      }
    ),
  }),
});

// Profile update form validation schema
export const profileSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

// Password change form validation schema
export const passwordChangeSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required('Current password is required'),
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
    )
    .required('New password is required'),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Please confirm your new password'),
}); 