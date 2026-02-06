const CONFIG = {
  BASE_URL: "http://localhost:3000",  // Backend URL
  ENDPOINTS: {
    ANALYZE: "/api/analyze"
  },
  REQUEST_TIMEOUT: 30000,
  // ADD UPLOAD CONFIG for FileValidator
  UPLOAD: {
    ALLOWED_TYPES: ["application/pdf"],
    ALLOWED_EXTENSIONS: [".pdf"],
    MAX_FILE_SIZE: 5 * 1024 * 1024  // 5MB
  }
};