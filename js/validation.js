document.getElementById("userForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();

  if (name === "") {
    alert("Name is required");
    return;
  }

  if (email === "") {
    alert("Email is required");
    return;
  }

  if (!email.includes("@")) {
    alert("Invalid email format");
    return;
  }

  //  Simulate sending form data to backend
  const formData = {
    name: name,
    email: email,
  };

  showDummyResponse(formData);
});
