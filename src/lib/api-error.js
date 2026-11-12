export class ApiError extends Error {
  constructor({ status = 500, code = "INTERNAL_ERROR", message = "خطایی در ارتباط با سرور رخ داد", details = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static async fromResponse(res) {
    let payload = null;
    try {
      payload = await res.json();
    } catch {
      payload = null;
    }

    return new ApiError({
      status: res.status,
      code: payload?.code || `HTTP_${res.status}`,
      message: payload?.message || "خطا در پردازش درخواست توسط سرور",
      details: payload?.details || null,
    });
  }
}
