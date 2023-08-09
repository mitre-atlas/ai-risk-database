import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { z } from "zod";
import { schema } from "@/helpers/api";
import { VALIDATE_SEARCH_QUERY } from "@/endpoints";
import { searchInputSchema } from "@/features/search/types";
import { useGlobalProgress } from "@/components/GlobalProgress/GlobalProgress";

const simpleSearchInputSchema = searchInputSchema.pick({ q: true, t: true });

const validateQueryResponseSchema = z.object({
  purl: z.string().optional(),
  sha256: z.string().optional(),
});

export const useGlobalSearch = () => {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const { setEnableGlobalProgress } = useGlobalProgress();

  // make sure we have sane defaults for search
  const params = simpleSearchInputSchema.parse(router.query);

  // when navigating, keep the search input in sync with the query param
  useEffect(() => {
    setSearchInput(params.q);
  }, [params.q]);

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const q = searchInput.trim();

    if (q) {
      setEnableGlobalProgress(true);

      try {
        const [data] = await schema(validateQueryResponseSchema).get(
          `/client-api${VALIDATE_SEARCH_QUERY}`,
          { q }
        );

        if (data.purl) {
          return await router.push(`/model/overview/${encodeURIComponent(q)}`);
        }
        if (data.sha256) {
          return await router.push(`/file/${encodeURIComponent(q)}`);
        }
      } catch {
        // keep the selected type of result or use "models" as default
        await router.push({ pathname: "/search", query: { q, t: params.t } });
      }
    }
  };

  const handleChange = (value: string) => {
    setSearchInput(value);
  };

  const handleClear = () => {
    setSearchInput("");
  };

  return {
    handleChange,
    handleSearch,
    searchInput,
    setSearchInput,
    handleClear,
  };
};
