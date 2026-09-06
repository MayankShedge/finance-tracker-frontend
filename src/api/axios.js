import axios from "axios";

import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from "./tokenStore";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",

  withCredentials: true,
});

let refreshPromise = null;

api.interceptors.request.use(
  (config) => {
    const token =
      getAccessToken();

    if (token) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) =>
    Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest =
      error.config;

    const status =
      error.response?.status;

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest._skipAuthRefresh ||
      originalRequest.url?.includes(
        "/auth/"
      )
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = api
        .post(
          "/auth/refresh",
          {},
          {
            _skipAuthRefresh: true,
          }
        )
        .then((response) => {
          const newAccessToken =
            response.data.accessToken;

          setAccessToken(
            newAccessToken
          );

          window.dispatchEvent(
            new CustomEvent(
              "auth:refreshed",
              {
                detail:
                  response.data,
              }
            )
          );

          return newAccessToken;
        })
        .catch((refreshError) => {
          clearAccessToken();

          window.dispatchEvent(
            new Event("auth:logout")
          );

          throw refreshError;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    try {
      const newAccessToken =
        await refreshPromise;

      originalRequest.headers =
        originalRequest.headers || {};

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      return Promise.reject(
        refreshError
      );
    }
  }
);

export default api;