import { useRouter } from "next/router";
import { z } from "zod";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

import { PageTop } from "@/components/PageTop/PageTop";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { Tab, Tabs } from "@/components/Tabs/Tabs";
import Link from "next/link";
import { ModelPageHeader } from "@/components/Header/ModelPageHeader";
import { schema, query } from "@/helpers/api";

import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { GET_MODEL_INFO, RELATED_MODELS } from "@/endpoints";
import {
  modelSchemaRelated,
  RelatedModel,
  relatedModelsSchema,
} from "@/features/model/types";
import Pagination from "@mui/material/Pagination";
import { renderPaginationItem } from "@/components/Pagination/Pagination";
import Box from "@mui/material/Box";
import classNames from "classnames";
import { Pill } from "@/components/Pill/Pill";
import { getRiskStatusElement } from "@/features/model/riskOverview";
import { pageErrorHandler } from "@/helpers/server-side";
import { Tooltip } from "@/components/Tooltip/Tooltip";
import { ShareMeta } from "@/components/ShareMeta/ShareMeta";

const inputSchema = z.object({
  p: z.coerce.number().optional().default(1).catch(1),
});

export const getServerSideProps = pageErrorHandler(
  async (context: GetServerSidePropsContext) => {
    const modelInfoId = context.query.modelInfoId as string;
    const params = inputSchema.parse(context.query);
    const { p: page } = params;

    const modelP = schema(modelSchemaRelated).get(GET_MODEL_INFO, {
      q: modelInfoId,
    });
    const relatedP = schema(relatedModelsSchema).get(RELATED_MODELS, {
      q: modelInfoId,
      page: page.toString(),
    });

    const [[modelData], [related]] = await Promise.all([modelP, relatedP]);

    const model = modelData.model_info;

    return { props: { params, model, related } };
  }
);

const defaultItemsPerPage = 20;

const renderCellLink =
  (className: string) =>
  // eslint-disable-next-line react/display-name
  (params: GridRenderCellParams<RelatedModel>) => {
    const { purl } = params.row;

    return (
      <Link
        href={`/model/overview/${encodeURIComponent(purl)}`}
        className={classNames("overflow-hidden text-ellipsis", className)}
      >
        {params.value}
      </Link>
    );
  };

const columns: GridColDef<RelatedModel>[] = [
  {
    field: "fullname",
    headerName: "Model",
    flex: 2,
    valueGetter: ({ row: { fullname, name, owner } }) =>
      fullname || `${owner}/${name}`,
    renderCell: renderCellLink("font-medium text-brand-blue"),
  },
  {
    field: "purl",
    headerName: "PURL",
    flex: 1,
    renderCell: renderCellLink("underline text-shuttle-gray"),
  },
  {
    field: "match",
    headerName: "Similarity",
    flex: 0.5,
    valueGetter: params => Math.trunc(params.row.match * 100) + "%",
    cellClassName: "underline",
  },
  {
    field: "task",
    headerName: "Task",
    flex: 1,
    valueGetter: params => params.row.task.replaceAll("-", " "),
    cellClassName: "capitalize",
    renderCell: params =>
      params.value && (
        <Pill className="capitalize bg-white-smoke !text-oslo-gray !text-sm">
          {params.value}
        </Pill>
      ),
  },
  {
    field: "performance",
    headerName: "Operational Score",
    description:
      "Assesses a model's performance, generalization ability, and robustness to minor transformations",
    flex: 1,
    renderCell: params => getRiskStatusElement(params.row.performance.status),
  },
  {
    field: "security",
    headerName: "Security Score",
    description:
      "Assesses the security and privacy of a model and its underlying dataset",
    flex: 1,
    renderCell: params => getRiskStatusElement(params.row.security.status),
  },
  {
    field: "ethics",
    headerName: "Fairness Score",
    description:
      "Assesses a model's fair treatment among protected classes and subcategories in the data",
    flex: 1,
    renderCell: params => getRiskStatusElement(params.row.ethics.status),
  },
];

const baseTooltip = ({
  children,
  title,
}: {
  children: React.ReactElement;
  title: React.ReactNode;
}) => <Tooltip title={title}>{children}</Tooltip>;

export default function RelatedModelsPage({
  params,
  model,
  related,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const modelInfoId = router.query.modelInfoId as string;
  const { p: page } = params;

  const handlePageChange = (_: unknown, page: number) => {
    const queryString = query({ p: page.toString() });
    router.push(
      `/model/related-models/${encodeURIComponent(modelInfoId)}` + queryString
    );
  };

  const title = `${model.owner && model.owner + "/"}${model.name}`;

  return (
    <>
      <ShareMeta title={`${title} | AI Risk Database Releated Models`} />
      <PageTop>
        <ModelPageHeader
          title={title}
          textToCopy={() => document.URL}
          modelURL={model.purl}
        />

        <Tabs activeIndex={1}>
          <Link href={`/model/overview/${encodeURIComponent(modelInfoId)}`}>
            <Tab label="Model Overview" active={false} />
          </Link>
          <Link
            href={`/model/related-models/${encodeURIComponent(modelInfoId)}`}
          >
            <Tab label="Related Models" active={true} />
          </Link>
        </Tabs>
      </PageTop>

      <PageContainer>
        <Box className="box p-0">
          <DataGrid
            columns={columns}
            rows={related.results}
            getRowId={(row: RelatedModel) => row.purl}
            initialState={{
              sorting: {
                sortModel: [{ field: "match", sort: "desc" }],
              },
            }}
            autoHeight
            hideFooter
            classes={{
              root: "rounded-none",
              cell: "text-shuttle-gray",
              columnHeader: "text-oslo-gray",
            }}
            slots={{
              baseTooltip,
            }}
          />
        </Box>

        {!!related.count && (
          <div className="mt-8 mb-8 flex items-center">
            <Pagination
              count={Math.trunc(related.count / defaultItemsPerPage) + 1}
              page={page}
              renderItem={renderPaginationItem}
              onChange={handlePageChange}
            />
          </div>
        )}
      </PageContainer>
    </>
  );
}
