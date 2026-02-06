const FileValidator = {
  validateFile(file) {
    console.log("Validating file:", file?.name);
    
    if (!file) {
      return { valid: false, error: "No file selected" };
    }

    // Check if it's a PDF
    const isPDF = file.type === "application/pdf" || 
                  file.name.toLowerCase().endsWith('.pdf');
    
    if (!isPDF) {
      return {
        valid: false,
        error: "Only PDF files are allowed. Selected: " + file.type
      };
    }

    // Check file size (5MB = 5 * 1024 * 1024 bytes)
    if (file.size > 5242880) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      return {
        valid: false,
        error: `File size (${sizeMB}MB) exceeds 5MB limit`
      };
    }

    return { valid: true, error: null };
  }
};

Object.freeze(FileValidator);