const FormValidator = {
  validateForm(data) {
    const { name, email } = data;  
    
    // Check name
    if (!name || name.trim().length < 2) {
      return { valid: false, error: "Please enter a valid name" };
    }
    
    // Check email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return { valid: false, error: "Please enter a valid email address" };
    }

    
    return { valid: true, error: null };
  }
};

Object.freeze(FormValidator);