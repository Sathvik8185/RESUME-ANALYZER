const APIService = {
  async analyzeResume(resumeFile, jdFile) {  // Change parameter name
    console.log("API: Sending resume:", resumeFile?.name);
    console.log("API: Sending JD file:", jdFile?.name);
    
    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("jd_file", jdFile);  // Change from "jd_text" to "jd_file"
    
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