(function () {
  const message = document.getElementById("auth-message");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  const showMessage = (text, type) => {
    if (!message) return;
    message.textContent = text;
    message.className = `alert alert-${type} mt-3`;
  };

  const saveSession = (data) => {
    sessionStorage.setItem("authToken", data.token);
    sessionStorage.setItem("authUser", JSON.stringify(data.user));
  };

  const submitJson = async (url, payload) => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
      throw new Error(data.error || data.message || "Request failed. Please try again.");
    }

    return data;
  };

  if (loginForm && sessionStorage.getItem("authToken")) {
    window.location.replace("/");
    return;
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      loginForm.classList.add("was-validated");

      if (!loginForm.checkValidity()) {
        showMessage("Please check the highlighted fields.", "warning");
        return;
      }

      const formData = new FormData(loginForm);
      const payload = {
        email: String(formData.get("email")).trim(),
        password: String(formData.get("password")),
      };

      try {
        const data = await submitJson("/api/auth/login", payload);
        saveSession(data);
        showMessage("Signed in. Opening the dashboard.", "success");
        window.location.href = "/";
      } catch (error) {
        showMessage(error.message, "danger");
      }
    });
  }

  if (registerForm) {
    const existingToken = sessionStorage.getItem("authToken");

    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      registerForm.classList.add("was-validated");

      if (!registerForm.checkValidity()) {
        showMessage("Please check the highlighted fields.", "warning");
        return;
      }

      const formData = new FormData(registerForm);
      const payload = {
        fullName: String(formData.get("fullName")).trim(),
        email: String(formData.get("email")).trim(),
        password: String(formData.get("password")),
        role: String(formData.get("role")),
      };

      try {
        const data = await submitJson("/api/auth/register", payload);

        if (!existingToken) {
          saveSession(data);
          showMessage("Account created. Opening the dashboard.", "success");
          window.location.href = "/";
          return;
        }

        registerForm.reset();
        registerForm.classList.remove("was-validated");
        showMessage("Account created. New trainers are now available for task assignment.", "success");
      } catch (error) {
        showMessage(error.message, "danger");
      }
    });
  }
})();
