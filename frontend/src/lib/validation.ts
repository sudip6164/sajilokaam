// Validation utilities

export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  
  return { valid: true };
};

export const validatePassword = (password: string): { 
  valid: boolean; 
  strength: 'weak' | 'medium' | 'strong';
  errors: string[];
} => {
  const errors: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  
  if (!password) {
    return { valid: false, strength: 'weak', errors: ['Password is required'] };
  }
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  
  if (password.length >= 6 && password.length < 8) {
    strength = 'weak';
  } else if (password.length >= 8 && password.length < 12) {
    strength = 'medium';
  } else if (password.length >= 12) {
    strength = 'strong';
  }
  
  // Check for uppercase
  if (!/[A-Z]/.test(password)) {
    if (password.length >= 8) {
      // Only suggest if password is long enough
    }
  }
  
  // Check for lowercase
  if (!/[a-z]/.test(password)) {
    if (password.length >= 8) {
      // Only suggest if password is long enough
    }
  }
  
  // Check for numbers
  if (!/[0-9]/.test(password)) {
    if (password.length >= 8) {
      // Only suggest if password is long enough
    }
  }
  
  // Check for special characters
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    if (password.length >= 8) {
      // Only suggest if password is long enough
    }
  }
  
  // Calculate strength based on criteria
  let criteriaMet = 0;
  if (password.length >= 8) criteriaMet++;
  if (/[A-Z]/.test(password)) criteriaMet++;
  if (/[a-z]/.test(password)) criteriaMet++;
  if (/[0-9]/.test(password)) criteriaMet++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) criteriaMet++;
  
  if (criteriaMet <= 2) {
    strength = 'weak';
  } else if (criteriaMet <= 4) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }
  
  const valid = password.length >= 6 && errors.length === 0;
  
  return { valid, strength, errors };
};

export const validateName = (name: string): { valid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Name is required' };
  }
  
  if (name.trim().length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }
  
  return { valid: true };
};

