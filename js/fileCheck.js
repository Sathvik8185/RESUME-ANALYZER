const FileValidator = {
  /**
   * Validate uploaded file
   * @param {File} file - File object to validate
   * @returns {object} Validation result {valid: boolean, error: string}
   */
  validateFile(file) {
    if (!file) {
      return { valid: false, error: "No file selected" };
    }

    // Validate file type
    const typeValidation = this.validateFileType(file);
    if (!typeValidation.valid) {
      return typeValidation;
    }

    // Validate file size
    const sizeValidation = this.validateFileSize(file);
    if (!sizeValidation.valid) {
      return sizeValidation;
    }

    // Validate file extension
    const extensionValidation = this.validateFileExtension(file);
    if (!extensionValidation.valid) {
      return extensionValidation;
    }

    return { valid: true, error: null };
  },

  /**
   * Validate file MIME type
   * @param {File} file - File object
   * @returns {object} Validation result
   */
  validateFileType(file) {
    const allowedTypes = CONFIG.UPLOAD.ALLOWED_TYPES;

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type. Only PDF files are allowed. Selected: ${
          file.type || "unknown"
        }`,
      };
    }

    return { valid: true, error: null };
  },

  /**
   * Validate file size
   * @param {File} file - File object
   * @returns {object} Validation result
   */
  validateFileSize(file) {
    const maxSize = CONFIG.UPLOAD.MAX_FILE_SIZE;

    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return {
        valid: false,
        error: `File size too large. Maximum allowed: ${maxSizeMB}MB, Current: ${fileSizeMB}MB`,
      };
    }

    if (file.size === 0) {
      return { valid: false, error: "File is empty" };
    }

    return { valid: true, error: null };
  },

  /**
   * Validate file extension
   * @param {File} file - File object
   * @returns {object} Validation result
   */
  validateFileExtension(file) {
    const allowedExtensions = CONFIG.UPLOAD.ALLOWED_EXTENSIONS;
    const fileName = file.name.toLowerCase();

    const hasValidExtension = allowedExtensions.some((ext) =>
      fileName.endsWith(ext.toLowerCase())
    );

    if (!hasValidExtension) {
      return {
        valid: false,
        error: `Invalid file extension. Allowed: ${allowedExtensions.join(
          ", "
        )}`,
      };
    }

    return { valid: true, error: null };
  },

  /**
   * Get file info for display
   * @param {File} file - File object
   * @returns {object} File information
   */
  getFileInfo(file) {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified),
      sizeFormatted: this.formatFileSize(file.size),
    };
  },

  /**
   * Format file size to human readable format
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  },
};

// Make FileValidator immutable
Object.freeze(FileValidator);
