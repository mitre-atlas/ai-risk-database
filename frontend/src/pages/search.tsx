import { useEffect, useRef, useState } from "react";
import Pagination from "@mui/material/Pagination";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { PageTop } from "@/components/PageTop/PageTop";
import { useRouter } from "next/router";
import { SectionTitle } from "@/components/Typography/Typography";
import { query, schema } from "@/helpers/api";
import { Tab, Tabs } from "@/components/Tabs/Tabs";
import { SEARCH, TOP_MODELS, TOP_ORGS, TOP_USERS } from "@/endpoints";
import {
  ResultTypes,
  topModelsSchema,
  topUsersSchema,
  topOrgsSchema,
  searchResultsSchema,
  refinedSearchInputSchema,
} from "@/features/search/types";
import { Rankings } from "@/features/search/components/Rankings";
import { SearchResults } from "@/features/search/components/SearchResults";
import { SearchOptions } from "@/features/search/components/SearchOptions";
import { Filters } from "@/features/search/components/Filters/Filters";
import { renderPaginationItem } from "@/components/Pagination/Pagination";
import { ShareMeta } from "@/components/ShareMeta/ShareMeta";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const params = refinedSearchInputSchema.parse(context.query);
  if (!params.q) return { props: { data: null, params } };

  const { q: queryTerm, t: type, s: sort, f: filter, p: page } = params;
  const searchPromise = schema(searchResultsSchema).get(SEARCH, {
    q: queryTerm,
    page: page.toString(),
    type,
    s: sort,
    f: filter,
  });

  const topModelsPromise = schema(topModelsSchema).get(TOP_MODELS);
  const topUsersPromise = schema(topUsersSchema).get(TOP_USERS);
  const topOrgsPromise = schema(topOrgsSchema).get(TOP_ORGS);

  const [[data], [topModels], [topUsers], [topOrgs]] = await Promise.all([
    searchPromise,
    topModelsPromise,
    topUsersPromise,
    topOrgsPromise,
  ]);

  // filter options depend on query results
  const { results, count, filters } = data;

  return {
    props: {
      results,
      count,
      filters,
      params,
      rankings: {
        topModels: topModels.slice(0, 5),
        topUsers: topUsers.slice(0, 5),
        topOrgs: topOrgs.slice(0, 5),
      },
    },
  };
};

const tabIndexes: Record<ResultTypes, number> = {
  models: 0,
  reports: 1,
  artifacts: 2,
};
const defaultItemsPerPage = 20;

export default function Search({
  results,
  count,
  filters,
  params,
  rankings,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const { q: queryTerm, t: type, s: sort, f: filter, p: page } = params; // validated and parsed query params
  const previousQueryObj = useRef<Record<string, string>>({
    q: queryTerm,
    t: type,
    s: sort,
    f: filter,
  }); // remember to avoid repeating for the same query

  const [enableFilters, setEnableFilters] = useState(!!filter);

  const tabIndex = tabIndexes[type] || 0;

  const resultCount = count || 0;
  const emptyResultsMessage = `No ${type} found for "${queryTerm}".`;

  const pushUpdatedSearch = (queryObj: typeof previousQueryObj.current) => {
    const queryString = query(queryObj);
    const previousQueryString = query(previousQueryObj.current);

    if (queryString !== previousQueryString) {
      previousQueryObj.current = queryObj;
      router.push(`/search${queryString}`);
    }
  };

  const handlePageChange = (_: unknown, page: number) => {
    pushUpdatedSearch({
      q: queryTerm,
      t: type,
      s: sort,
      f: filter,
      p: page.toString(),
    });
  };

  const handleSort = (value: string) => {
    pushUpdatedSearch({ q: queryTerm, t: type, s: value || "", f: filter });
  };

  const handleFiltersButtonClick = () => {
    setEnableFilters(val => !val);

    if (enableFilters && filter) {
      router.push(`/search${query({ q: queryTerm, t: type, s: sort })}`);
    }
  };

  useEffect(() => {
    if (filter) {
      setEnableFilters(true);
    }
  }, [filter]);

  const handleCloseFilter = (filterString: string) => {
    pushUpdatedSearch({ q: queryTerm, t: type, s: sort, f: filterString });
  };

  return (
    <>
      <ShareMeta title={`${queryTerm} | AI Risk Database Search`} />
      <PageTop>
        <div className="flex mt-10 mb-8 items-baseline lg:items-center">
          <h1 className="h1 mr-2 lg:mr-8 text-[1.75rem] leading-[2.1rem] lg:leading-[3rem] lg:text-[2.5rem]">
            Search results
          </h1>
          <div className="text-oslo-gray lg:bg-wild-sand lg:rounded-full lg:px-4 lg:py-2 lg:text-sm leading-6 w-fit h-fit">
            {resultCount || 0} results
          </div>
        </div>

        {results && (
          <div className="flex justify-between">
            <Tabs activeIndex={tabIndex}>
              <Link href={`/search${query({ q: queryTerm, t: "models" })}`}>
                <Tab label="Models" active={type === "models"} />
              </Link>
              <Link href={`/search${query({ q: queryTerm, t: "reports" })}`}>
                <Tab label="Reports" active={type === "reports"} />
              </Link>
              <Link href={`/search${query({ q: queryTerm, t: "artifacts" })}`}>
                <Tab label="Artifacts" active={type === "artifacts"} />
              </Link>
            </Tabs>
            <SearchOptions
              onSortChange={handleSort}
              currentSort={sort}
              resultType={type}
              currentFilter={filter}
              onFiltersClick={handleFiltersButtonClick}
              className="hidden lg:block"
            />
          </div>
        )}
      </PageTop>

      <PageContainer>
        <SearchOptions
          onSortChange={handleSort}
          currentSort={sort}
          resultType={type}
          onFiltersClick={handleFiltersButtonClick}
          className="mx-6 mb-4 lg:hidden"
          sortClasses="rounded-full"
          filterClasses="rounded-full"
          currentFilter={filter}
        />
        {results && filters && enableFilters && (
          <div className="mb-8">
            <Filters
              className="mx-6 lg:mx-0"
              filters={filters}
              currentFilters={params.f}
              onClose={handleCloseFilter}
            />
          </div>
        )}

        <div className="grid lg:grid-cols-overview-columns lg:gap-x-8 w-full">
          <div>
            {!results && (
              <SectionTitle className="text-center">
                Please start by submitting something to search.
              </SectionTitle>
            )}

            {results && (
              <>
                <SearchResults data={results} type={type} />

                {!resultCount && (
                  <SectionTitle className="text-center">
                    {emptyResultsMessage}
                  </SectionTitle>
                )}

                {!!resultCount && (
                  <div className="mt-8 mb-8 flex justify-center items-center">
                    <Pagination
                      count={Math.trunc(resultCount / defaultItemsPerPage) + 1}
                      page={page}
                      renderItem={renderPaginationItem}
                      onChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {rankings && <Rankings data={rankings} />}
        </div>
      </PageContainer>
    </>
  );
}
