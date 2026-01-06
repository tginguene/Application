type ApiError = { code: string; message: string };

async function parseJson(res: Response) {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return null; }
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`/api/v1${path}`);
  const json = await parseJson(res);
  if (!res.ok) throw (json?.error ?? { code: "HTTP_ERROR", message: "Erreur API" }) as ApiError;
  return json.data as T;
}

export async function apiSend<T>(path: string, method: "POST"|"PUT"|"DELETE", body?: any): Promise<T> {
  const res = await fetch(`/api/v1${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await parseJson(res);
  if (!res.ok) throw (json?.error ?? { code: "HTTP_ERROR", message: "Erreur API" }) as ApiError;
  return json.data as T;
}
