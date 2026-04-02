import { api } from "./api";

function submitHostedForm({ action, method, fields }) {
  const form = document.createElement("form");
  form.method = method || "POST";
  form.action = action;
  form.style.display = "none";

  Object.entries(fields || {}).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value ?? "";
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

export const payEntity = async ({ entityType, entityId }) => {
  const response = await api.post("/payments/create-order", {
    entityType,
    entityId,
  });

  const paymentSession = response.data.data;
  const action = paymentSession.action?.startsWith("http")
    ? paymentSession.action
    : "https://test.payu.in/_payment";

  submitHostedForm({ ...paymentSession, action });
  return { mode: "payu-redirect" };
};
