const FormValidator = {
  validateForm(data) {
    const { name, email, jobDescription } = data;
    
    // Check name
    if (!name || name.trim().length < 2) {
      return { valid: false, error: "Please enter a valid name" };
    }
    
    // Check email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return { valid: false, error: "Please enter a valid email address" };
    }
    
    // Check job description
    if (!jobDescription || jobDescription.trim().length < 10) {
      return { valid: false, error: "Please enter a job description (minimum 10 characters)" };
    }
    
    return { valid: true, error: null };
  }
};

Object.freeze(FormValidator);