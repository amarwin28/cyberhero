export interface ApiError {
  message: string;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('/') ? endpoint : `/api/${endpoint}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = typeof window !== 'undefined' ? localStorage.getItem('cyberhero_token') : null;
  if (token) {
    (defaultHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Include HTTP-only cookies
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (err: any) {
    throw new Error('Unable to connect to the CyberHero server. Please check your network connection.');
  }

  // Handle Excel download or binary streams
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/vnd.openxmlformats-officedocument')) {
    const blob = await response.blob();
    return blob as unknown as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status >= 500) {
      throw new Error(data?.error || 'A server error occurred. Please try again later.');
    }
    const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}
