document.getElementById("resume").addEventListener("change", function () {
  const file = this.files[0];

  if (!file) return;

  if (file.type !== "application/pdf") {
    alert("Only PDF files are allowed");
    this.value = "";
  }
});
