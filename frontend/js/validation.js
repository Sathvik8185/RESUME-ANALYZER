/**
 * Form Validation Module
 * Provides validation functions for user inputs
 * Ready for backend integration
 */

const FormValidator = {
  /**
   * Validate entire form data
   * @param {object} data - Form data to validate
   * @returns {object} Validation result {valid: boolean, error: string}
   */
  validateForm(data) {
    const nameValidation = this.validateName(data.name);
    if (!nameValidation.valid) {
      return nameValidation;
    }

    const emailValidation = this.validateEmail(data.email);
    if (!emailValidation.valid) {
      return emailValidation;
    }

    return { valid: true, error: null };
  },

  /**
   * Validate name field
   * @param {string} name - Name to validate
   * @returns {object} Validation result
   */
  validateName(name) {
    if (!name || name.trim() === "") {
      return { valid: false, error: "Name is required" };
    }

    if (name.length < 2) {
      return { valid: false, error: "Name must be at least 2 characters long" };
    }

    if (name.length > 100) {
      return { valid: false, error: "Name must not exceed 100 characters" };
    }

    // Check for valid name characters (letters, spaces, hyphens, apostrophes)
    const namePattern = /^[a-zA-Z\s\-']+$/;
    if (!namePattern.test(name)) {
      return {
        valid: false,
        error:
          "Name can only contain letters, spaces, hyphens, and apostrophes",
      };
    }

    return { valid: true, error: null };
  },

  /**
   * Validate email field
   * @param {string} email - Email to validate
   * @returns {object} Validation result
   */
  validateEmail(email) {
    if (!email || email.trim() === "") {
      return { valid: false, error: "Email is required" };
    }

    // Basic email pattern validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return { valid: false, error: "Invalid email format" };
    }

    if (email.length > 254) {
      return { valid: false, error: "Email is too long" };
    }

    return { valid: true, error: null };
  },

  /**
   * Validate job description (optional field)
   * @param {string} jobDescription - Job description text
   * @returns {object} Validation result
   */
  validateJobDescription(jobDescription) {
    if (!jobDescription) {
      return { valid: true, error: null }; // Optional field
    }

    if (jobDescription.length > 5000) {
      return {
        valid: false,
        error: "Job description must not exceed 5000 characters",
      };
    }

    return { valid: true, error: null };
  },

  /**
   * Sanitize input to prevent XSS
   * @param {string} input - Input string
   * @returns {string} Sanitized string
   */
  sanitizeInput(input) {
    const div = document.createElement("div");
    div.textContent = input;
    return div.innerHTML;
  },
};

// Make FormValidator immutable
Object.freeze(FormValidator);
