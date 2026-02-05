const CONFIG = {
  // CRITICAL CHANGE: Added "/index.php" to the end.
  // This ensures the browser hits your PHP script directly, bypassing 404 errors.
  BASE_URL: "http://localhost/RESUME-ANALYZER/backend/public/index.php",

  // Gemini API Configuration
  GEMINI: {
    API_KEY: "AIzaSyDKOFnIUYzRwjoq_1dWn5CoPidgtYEMxD0", 
    API_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
    MODEL: "gemini-pro",
    USE_GEMINI: false, 
  },

  DEMO_MODE: false, 

  // API Endpoints
  ENDPOINTS: {
    UPLOAD_RESUME: "/api/upload",
    ANALYZE_RESUME: "/api/analyze",
    GET_ANALYSIS: "/api/history",
    HEALTH_CHECK: "/api/health",
  },

  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, 
    ALLOWED_TYPES: ["application/pdf"],
    ALLOWED_EXTENSIONS: [".pdf"],
  },

  REQUEST_TIMEOUT: 60000,

  STATUS: {
    SUCCESS: "success",
    ERROR: "error",
    PROCESSING: "processing",
  },
};

Object.freeze(CONFIG);