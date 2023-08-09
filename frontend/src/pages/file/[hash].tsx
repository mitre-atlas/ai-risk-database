import { PageContainer } from "@/components/PageContainer/PageContainer";
import { PageTop } from "@/components/PageTop/PageTop";
import { InferGetServerSidePropsType } from "next";
import { z } from "zod";
import Link from "next/link";
import { Box } from "@mui/system";
import { query, schema } from "@/helpers/api";
import { GET_FILE_INFO } from "@/endpoints";
import { Button } from "@/components/Button/Button";
import { Tabs, Tab } from "@/components/Tabs/Tabs";
import { ReactComponent as DownloadIcon } from "public/images/icons/download.svg";
import { SectionTitle } from "@/components/Typography/Typography";
import { Overview } from "@/components/Overview/Overview";
import { TwoColumnsList } from "@/components/List/TwoColumnsList";
import { createJSONFileURL, downloadDataURL } from "@/helpers/dom";
import { Pill } from "@/components/Pill/Pill";
import { ModelPageHeader } from "@/components/Header/ModelPageHeader";
import { ShareMeta } from "@/components/ShareMeta/ShareMeta";
import { pageErrorHandler } from "@/helpers/server-side";
import classNames from "classnames";

/**
 * Schema for the data on the File Info page
 */
const fileSchema = z.object({
  sha256: z.string(),
  count: z.number(),
  size: z.string(),
  purls: z.string().array(),
  filenames: z.record(z.string(), z.number()),
  artifacts: z
    .object({
      name: z.string(),
      rare: z.boolean().optional(),
    })
    .array(),
});

const fileURLInputSchema = z.object({
  hash: z.string(),
  modelURL: z.string().optional().default("").catch(""),
  filename: z.string().optional().default("").catch(""),
});

export const getServerSideProps = pageErrorHandler(async ctx => {
  const {
    hash: sha256,
    modelURL: purl,
    filename,
  } = fileURLInputSchema.parse(ctx.query);

  const [data] = await schema(fileSchema).get(GET_FILE_INFO, { sha256 });

  // check the input filename, or get the filename with most occurrences
  const actualFilename =
    filename && data.filenames[filename]
      ? filename
      : Object.entries(data.filenames).reduce(
          (acc, [filename, count]) =>
            count > acc.count ? { filename, count } : acc,
          { filename: "", count: 0 }
        ).filename;

  return { props: { file: { ...data, filename: actualFilename, purl } } };
});

const ExportJSONButton = ({
  onClick,
  className = "",
}: {
  onClick: () => void;
  className?: string;
}) => {
  return (
    <Button
      className={classNames(
        className,
        "font-bold [&:hover_svg]:stroke-white flex"
      )}
      onClick={onClick}
    >
      <DownloadIcon className="stroke-primary mr-2" /> Export JSON
    </Button>
  );
};

export const FilePage = ({
  file,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const fileOverviewItems = [
    { name: "File Size", value: file.size },
    { name: "This File Is Seen In", value: `${file.count} models` },
    { name: "File Hash", value: file.sha256 },
  ];

  const filenamesItems = Object.entries(file.filenames).map(
    ([filename, count]) => ({
      name: <div className="text-sm text-oslo-gray">{filename}</div>,
      value: (
        <div className="text-right text-sm text-oslo-gray">
          <strong className="text-primary">{count}</strong> Times
        </div>
      ),
    })
  );

  const handleExportFileJSON = () => {
    const fileJSON = JSON.stringify(file, undefined, 2);
    const filename = `file-${file.filename}.json`;

    const fileURL = createJSONFileURL(fileJSON, filename);
    downloadDataURL(fileURL, filename);
  };

  const handleExportArtifactsJSON = () => {
    const fileJSON = JSON.stringify(file.artifacts, undefined, 2);
    const filename = `artifacts-${file.filename}.json`;

    const fileURL = createJSONFileURL(fileJSON, filename);
    downloadDataURL(fileURL, filename);
  };

  const { filename, purl, sha256 } = file;

  const queryString = query({ filename, modelURL: purl });

  return (
    <>
      <ShareMeta title={`${filename} | AI Risk Database File`} />
      <PageTop>
        <ModelPageHeader
          title={filename}
          textToCopy={() => document.URL}
          modelURL={purl}
        />

        <Tabs activeIndex={0}>
          <Link href={`/file/${sha256}${queryString}`}>
            <Tab label="File info" active={true} />
          </Link>
          {/* <Link
            href={`/model/file/related/${encodeURIComponent(
              purl
            )}/${filename}/${sha256}`}
          >
            <Tab label="Models using this file" />
          </Link> */}
        </Tabs>
      </PageTop>

      <PageContainer>
        <div className="lg:grid lg:grid-cols-overview-columns lg:gap-x-8">
          <div>
            <Box className="box">
              <div className="sm:flex justify-between items-center mb-8">
                <SectionTitle className="pb-0">{file.filename}</SectionTitle>
                <ExportJSONButton
                  className="mt-2 sm:mt-0"
                  onClick={handleExportFileJSON}
                />
              </div>

              <Overview items={fileOverviewItems} />
            </Box>

            {!!file.artifacts.length && (
              <Box className="box my-6">
                <div className="mb-10">
                  <div className="sm:flex justify-between items-center mb-8">
                    <SectionTitle className="pb-0">Dependencies</SectionTitle>
                    {file.artifacts.length && (
                      <ExportJSONButton
                        className="mt-2 sm:mt-0"
                        onClick={handleExportArtifactsJSON}
                      />
                    )}
                  </div>
                </div>
                <table className="w-full text-left text-sm leading-6">
                  <thead>
                    <tr className="border-b border-athens">
                      <th className="w-1/2 py-3 text-oslo-gray pl-6">Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {file.artifacts.map(({ name, rare }) => (
                      <tr key={name} className="border-b border-athens">
                        <td className="py-3 pl-6 font-medium">
                          {name}
                          {rare && <Pill className="ml-3">Rare Artifact</Pill>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            )}
          </div>

          <div>
            <Box className="box w-full mt-6 lg:mt-0">
              <SectionTitle>Also Appears As</SectionTitle>
              <TwoColumnsList items={filenamesItems} />
            </Box>
          </div>
        </div>
      </PageContainer>
    </>
  );
};

export default FilePage;
