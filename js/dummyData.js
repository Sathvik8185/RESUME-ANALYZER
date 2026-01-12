function showDummyResponse(formData) {
  const dummyResponse = {
    status: "success",
    message: "Form submitted successfully",
    data: {
      userId: 101,
      name: formData.name,
      role: "Frontend Intern",
    },
  };

  document.getElementById("result").innerHTML = `
    <h3>Dummy Backend Response</h3>
    <p>Status: ${dummyResponse.status}</p>
    <p>Message: ${dummyResponse.message}</p>
    <p>User ID: ${dummyResponse.data.userId}</p>
    <p>Name: ${dummyResponse.data.name}</p>
    <p>Role: ${dummyResponse.data.role}</p>
  `;
}
