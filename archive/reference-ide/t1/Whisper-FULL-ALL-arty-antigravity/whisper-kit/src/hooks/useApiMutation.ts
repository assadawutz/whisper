"use client";

import { useCallback, useState } from "react";
import type { ApiFailLike } from "./useApiNotify";

type ApiOk<T> = { ok: true; data: T; status: number; url: string; method: string };
type ApiFail = ApiFailLike;
type ApiResult<T> = ApiOk<T> | ApiFail;

type Notify = {
  notifyFail: (fail: ApiFail, ctx?: { intent?: "read" | "write" | "critical"; modalOn?: number[] }) => void;
  notifySuccess: (ctx?: { intent?: "read" | "write" | "critical"; successTitle?: string; successMessage?: string; silentOnSuccess?: boolean }) => void;
};

type MutationIntent = "write" | "critical";

type MutationOptions = {
  intent?: MutationIntent;
  successTitle?: string;
  successMessage?: string;
  silentOnSuccess?: boolean;
  modalOn?: number[];
};

export function useApiMutation<TData = any, TArgs extends any[] = any[]>(
  fn: (...args: TArgs) => Promise<ApiResult<TData>>,
  notify?: Notify,
  options?: MutationOptions
) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<ApiFail | null>(null);

  const run = useCallback(
    async (...args: TArgs) => {
      setLoading(true);
      setError(null);

      let res: ApiResult<TData>;
      try {
        res = await fn(...args);
      } catch (e: any) {
        res = { ok: false, error: { code: "UNHANDLED", message: typeof e?.message === "string" ? e.message : String(e) } } as any;
      }

      setLoading(false);

      if (!res.ok) {
        setError(res as any);
        notify?.notifyFail(res as any, { intent: options?.intent || "write", modalOn: options?.modalOn });
        return res;
      }

      setData(res.data);
      notify?.notifySuccess({
        intent: options?.intent || "write",
        successTitle: options?.successTitle,
        successMessage: options?.successMessage,
        silentOnSuccess: options?.silentOnSuccess,
      });

      return res;
    },
    [fn, notify, options?.intent, options?.modalOn, options?.silentOnSuccess, options?.successMessage, options?.successTitle]
  );

  return { run, loading, data, error, setData };
}
