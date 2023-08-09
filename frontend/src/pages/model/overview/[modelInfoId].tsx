import { Box } from "@mui/system";
import { format } from "date-fns";
import { useRouter } from "next/router";
import Link from "next/link";

import { List } from "@/components/List/List";
import { SimpleList } from "@/components/SimpleList/SimpleList";
import { Overview } from "@/components/Overview/Overview";
import { schema } from "@/helpers/api";
import { GET_MODEL_INFO } from "@/endpoints";
import { SectionTitle } from "@/components/Typography/Typography";
import { Pill } from "@/components/Pill/Pill";
import { PageTop } from "@/components/PageTop/PageTop";
import { Tab, Tabs } from "@/components/Tabs/Tabs";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { ModelPageHeader } from "@/components/Header/ModelPageHeader";
import { modelOverviewSchema } from "@/types/modelSchema";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { Button } from "@/components/Button/Button";
import { ShareMeta } from "@/components/ShareMeta/ShareMeta";
import { pageErrorHandler } from "@/helpers/server-side";
import { Tags, getTags } from "@/components/Tags";
import { InfoIconTooltip } from "@/components/Tooltip/InfoTooltip";

export const getServerSideProps = pageErrorHandler(
  async (
    context: GetServerSidePropsContext & { query: { modelInfoId: string } }
  ) => {
    const modelInfoId = context.query.modelInfoId;

    const [{ model_info, repos, sbom, risk_overview, reports }] = await schema(
      modelOverviewSchema
    ).get(GET_MODEL_INFO, {
      q: modelInfoId,
    });

    return {
      props: {
        modelURL: model_info.purl,
        model: model_info,
        scans: risk_overview,
        repos,
        sbom,
        reports,
      },
    };
  }
);

export default function OverviewPage({
  model,
  repos,
  sbom,
  scans,
  reports,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { query } = useRouter();
  const modelInfoId = query.modelInfoId as string;
  const { libraries, task, type } = repos;
  const tags = getTags({ libraries, task, type });

  const hasRareArtifacts = sbom.files?.some(file => file.rare?.length);
  const overviewItems = [
    {
      name: "Repository URL",
      value: (
        <a
          className="hover:underline"
          href={model.repo_uri}
          target="_blank"
          rel="noreferrer noopener"
        >
          {model.repo_uri}
        </a>
      ),
    },
    { name: "Repository Type", value: repos.type },
    {
      name: "Commit Date",
      value: format(new Date(model.commitdate), "MMM dd, yyyy"),
    },
    { name: "Commit Hash", value: model.commithash },
    { name: "Author", value: model.owner },
    { name: "Reputation", value: repos.reputation },
    {
      name: "Vulnerabilities",
      value: model.vulnerabilities.join().replaceAll(",", ", ") || "None",
    },
  ];

  const { security, ethics, performance, overall } = scans;

  const riskOverviewItems = [
    {
      name: "Overall Risk Score",
      value: overall,
    },
    {
      name: "Operational Risk Score",
      value: performance,
    },
    {
      name: "Security Risk Score",
      value: security,
    },
    {
      name: "Fairness Risk Score",
      value: ethics,
    },
  ];

  const title = `${model.owner && model.owner + "/"}${model.name}`;

  return (
    <>
      <ShareMeta title={`${title} | AI Risk Database Model`} />
      <PageTop>
        <ModelPageHeader
          title={title}
          textToCopy={() => document.URL}
          modelURL={model.purl}
          smallMarginBottom={!!tags.length}
        />
        {tags.length && <Tags className="mb-4 " tags={tags} />}
        <Tabs activeIndex={0}>
          <Link href={`/model/overview/${encodeURIComponent(modelInfoId)}`}>
            <Tab label="Model Overview" active={true} />
          </Link>
          <Link
            href={`/model/related-models/${encodeURIComponent(modelInfoId)}`}
          >
            <Tab label="Related Models" active={false} />
          </Link>
        </Tabs>
      </PageTop>

      <PageContainer>
        <div className="grid lg:grid-cols-overview-columns lg:gap-x-8 w-full">
          <div className="flex flex-col">
            <Box className="box my-3">
              <div className="flex justify-between items-start">
                <SectionTitle>Model</SectionTitle>
                {hasRareArtifacts && <Pill>Rare Artifacts</Pill>}
              </div>
              <Overview items={overviewItems} />
            </Box>

            <Box className="box my-3">
              <SectionTitle className="pb-3">
                Top Vulnerability Reports
              </SectionTitle>
              {!!reports?.length ? (
                <List
                  items={reports.map(
                    ({
                      title,
                      models_affected,
                      user_id,
                      updated,
                      report_id,
                    }) => ({
                      report_id,
                      href: `/report/${report_id}`,
                      title,
                      icon: "warning",
                      description: `Affects ${models_affected} ${
                        models_affected === 1 ? "model" : "models"
                      }`,
                      indicators: [
                        <>
                          reported by{" "}
                          <a
                            href={`https://github.com/${user_id}`}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="text-secondary-dark-blue"
                          >
                            {user_id}
                          </a>
                        </>,
                        format(new Date(updated), "MMM dd, yy"),
                      ],
                    })
                  )}
                />
              ) : (
                <div className="flex flex-col">
                  <span className="mt-3 text-sm">
                    No vulnerabilities reported
                  </span>
                  <Link
                    className="mt-6"
                    href={`/report-vulnerability?modelURL=${model.purl}`}
                  >
                    <Button>Report Vulnerability</Button>
                  </Link>
                </div>
              )}
            </Box>

            <Box className="box my-5">
              <SectionTitle>Model Versions</SectionTitle>
              <div className="flex flex-col">
                {Object.entries(repos.versions).map(([version, date]) => (
                  <div
                    key={version}
                    className="flex lg:flex-row flex-col justify-between text-sm font-roboto py-4 border-b border-athens last:border-0"
                  >
                    <span className="text-dark">@{version}</span>
                    <span className="text-oslo-gray">
                      {format(new Date(date), "dd LLLL yyyy")}
                    </span>
                  </div>
                ))}
              </div>
            </Box>

            {!!sbom.files?.length && (
              <Box className="box my-3">
                <SectionTitle className="pb-3">
                  Software Bill of Materials
                </SectionTitle>
                <SimpleList
                  showOnDefault={4}
                  items={sbom.files?.map(
                    ({ filename, size, sha256, rare }) => ({
                      title: filename,
                      indicator: size,
                      href: `/file/${sha256}?filename=${filename}&modelURL=${encodeURIComponent(
                        model.purl
                      )}`,
                      isRare: !!rare?.length,
                    })
                  )}
                />
              </Box>
            )}
          </div>
          <div>
            <Box className="box my-3">
              <SectionTitle className="pb-3 flex items-center">
                <span>Risk Overview</span>{" "}
                <InfoIconTooltip
                  className="ml-6"
                  title={
                    <div className="bg-white">
                      <h6 className="font-medium text-xs text-primary leading-5">
                        How this is tested
                      </h6>
                      <div className="text-oslo-gray text-sm leading-6 font-normal">
                        Based on Robust Intelligence automated testing.
                        <ul className="list-disc ml-5">
                          <li>
                            Operational: Assesses a model&apos;s performance,
                            generalization ability, and robustness to minor
                            transformations
                          </li>
                          <li>
                            Security: Assesses the security and privacy of a
                            model and its underlying dataset
                          </li>
                          <li>
                            Fairness: Assesses a model&apos;s fair treatment
                            among protected classes and subcategories in the
                            data
                          </li>
                        </ul>
                      </div>
                    </div>
                  }
                />
              </SectionTitle>
              <Overview items={riskOverviewItems} variant="risk" />
            </Box>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
