const form = document.querySelector("#login-form");
const message = document.querySelector("#message");

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "";
  const password = new FormData(form).get("password")?.toString() ?? "";
  const response = await fetch("./api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    message.textContent = "密码不正确。";
    return;
  }

  message.textContent = "已登录。";
});
