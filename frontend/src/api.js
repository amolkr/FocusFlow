const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
const TOKEN_KEY = "focus-flow-token";
const USER_KEY = "focus-flow-user";

export function getStoredSession() {
  const token = window.localStorage.getItem(TOKEN_KEY);
  const rawUser = window.localStorage.getItem(USER_KEY);
  return token && rawUser ? { token, user: JSON.parse(rawUser) } : null;
}

export function saveSession({ token, user }) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export async function apiRequest(path, options = {}) {
  const token = window.localStorage.getItem(TOKEN_KEY);
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export const authApi = {
  register: (payload) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  login: (payload) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  me: () => apiRequest("/auth/me"),
  updateMe: (payload) =>
    apiRequest("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(payload)
    })
};

export function createCrudApi(resource) {
  return {
    list: () => apiRequest(`/${resource}`),
    create: (payload) =>
      apiRequest(`/${resource}`, {
        method: "POST",
        body: JSON.stringify(payload)
      }),
    update: (id, payload) =>
      apiRequest(`/${resource}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload)
      }),
    remove: (id) =>
      apiRequest(`/${resource}/${id}`, {
        method: "DELETE"
      })
  };
}

export const tasksApi = createCrudApi("tasks");
export const assignmentsApi = createCrudApi("assignments");
export const notesApi = createCrudApi("notes");
export const eventsApi = createCrudApi("events");

export const habitsApi = {
  ...createCrudApi("habits"),
  complete: (id) =>
    apiRequest(`/habits/${id}/complete`, {
      method: "POST",
      body: JSON.stringify({ date: new Date().toISOString() })
    })
};

export const pomodoroApi = {
  list: () => apiRequest("/pomodoro"),
  create: (payload) =>
    apiRequest("/pomodoro", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  finish: (id) =>
    apiRequest(`/pomodoro/${id}/finish`, {
      method: "PATCH"
    })
};

export const analyticsApi = {
  summary: () => apiRequest("/analytics/summary")
};
