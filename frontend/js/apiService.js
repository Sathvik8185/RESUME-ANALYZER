const APIService = {
  async analyzeResume(file, jdText) {
    console.log("API: Sending file:", file.name, "JD length:", jdText.length);
    
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jd_text", jdText);
    
    try {
      const response = await fetch(`${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.ANALYZE}`, {
        method: "POST",
        body: formData
      });
      
      const data = await response.json();
      console.log("API Response:", data);
      
      if (data.status === "error") {
        return { success: false, error: data.message };
      }
      
      return { 
        success: true, 
        data: data.data,
        message: data.message || "Analysis successful"
      };
      
    } catch (err) {
      console.error("API Error:", err);
      return {
        success: false,
        error: "Cannot connect to server. Make sure backend is running.",
        isNetworkError: true
      };
    }
  }
};

Object.freeze(APIService);