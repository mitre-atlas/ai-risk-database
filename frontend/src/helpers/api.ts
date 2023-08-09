import { z } from "zod";

type FetcherProps = {
  endpoint: string;
  queryString?: string;
  method?: string;
  body?: any;
};

export const fetcher = ({
  endpoint,
  queryString,
  method = "GET",
  body,
}: FetcherProps) => {
  const queryParams = queryString ? `?q=${queryString}` : "";

  return fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint + queryParams}`, {
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
    },
    method,
    body: JSON.stringify(body),
  });
};

export interface FetcherError extends Error {
  response: Response;
}

export const fetchWrapper = async <T>(
  resource: string,
  options?: RequestInit
) => {
  const [endpoint, opts] = process.env.API_URL
    ? [
        `${process.env.API_URL}${resource}`,
        {
          ...options,
          headers: {
            Authorization: `Bearer ${process.env.API_KEY}`,
            ...options?.headers,
          },
        },
      ]
    : [resource, options];

  const response = await fetch(endpoint, opts);

  if (response.ok) {
    const data: T = await response.json();
    return [data, response] as [T, Response];
  }

  const error = new Error(response.statusText) as FetcherError;
  error.response = response;

  throw error;
};

export const query = (queryObject: Record<string, string>) => {
  // do this to remove entries with falsy values
  const trimmedQuery = Object.entries(queryObject).reduce(
    (acc, [key, value]) => {
      if (value) {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, string>
  );
  const queryString = new URLSearchParams(trimmedQuery).toString();

  // do not return ? without any params
  return queryString ? `?${queryString}` : "";
};

export const get = <T>(
  resource: string,
  queryObj?: Record<string, string>,
  options?: RequestInit
) => {
  const getOpts = { method: "GET" };
  const opts = options ? { ...getOpts, ...options } : getOpts;

  const endpoint = queryObj ? `${resource}${query(queryObj)}` : resource;

  return fetchWrapper<T>(endpoint, opts);
};

export const post = <T>(resource: string, body: any, options?: RequestInit) => {
  const postOpts = {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  };

  const opts = options ? { ...postOpts, ...options } : postOpts;
  return fetchWrapper<T>(resource, opts);
};

export const schema = <T>(schema: z.Schema<T>) => {
  const getData = async (
    resource: string,
    queryObj?: Record<string, string>,
    options?: RequestInit
  ): Promise<[T, Response]> => {
    const [data, response] = await get(resource, queryObj, options);
    const parsedData = schema.parse(data);

    return [parsedData, response];
  };

  return { get: getData };
};
