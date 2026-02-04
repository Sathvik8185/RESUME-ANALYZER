const CONFIG = {
  // Base URL for backend API
  BASE_URL: "http://localhost:3000/api",

  // Gemini API Configuration
  GEMINI: {
    API_KEY: "AIzaSyDKOFnIUYzRwjoq_1dWn5CoPidgtYEMxD0", // move to .env in prod

    // Using stable gemini-pro (text only)
    API_URL:
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",

    MODEL: "gemini-pro",
    USE_GEMINI: false, // Disabled - using mock data
  },

  // Demo mode
  DEMO_MODE: true, // Using mock data for now

  // API Endpoints
  ENDPOINTS: {
    UPLOAD_RESUME: "/resume/upload",
    ANALYZE_RESUME: "/resume/analyze",
    GET_ANALYSIS: "/resume/analysis/:id",
    HEALTH_CHECK: "/health",
  },

  // File upload settings
  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ["application/pdf"],
    ALLOWED_EXTENSIONS: [".pdf"],
  },

  // Request timeout
  REQUEST_TIMEOUT: 60000,

  // Response status codes
  STATUS: {
    SUCCESS: "success",
    ERROR: "error",
    PROCESSING: "processing",
  },
};

// Freeze config to prevent modifications
Object.freeze(CONFIG);
