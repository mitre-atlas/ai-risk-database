import { PageContainer } from "@/components/PageContainer/PageContainer";
import { PageTop } from "@/components/PageTop/PageTop";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import Link from "next/link";
import { Tabs, Tab } from "@/components/Tabs/Tabs";
import { ModelPageHeader } from "@/components/Header/ModelPageHeader";
import { ShareMeta } from "@/components/ShareMeta/ShareMeta";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const sha256 = context.query.hash as string;
  const purl = context.query.purl as string;
  const filename = context.query.filename as string;

  return { props: { file: { sha256, filename, purl } } };
};

export const FileModelsPage = ({
  file,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { filename, purl, sha256 } = file;

  return (
    <>
      <ShareMeta title={`${filename} | AI Risk Database Related Files`} />
      <PageTop>
        <ModelPageHeader
          title={filename}
          textToCopy={() => document.URL}
          modelURL={purl}
        />

        <Tabs activeIndex={1}>
          <Link
            href={`/model/file/${encodeURIComponent(
              purl
            )}/${filename}/${sha256}`}
          >
            <Tab label="File info" />
          </Link>
          <Link
            href={`/model/file/related/${encodeURIComponent(
              purl
            )}/${filename}/${sha256}`}
          >
            <Tab label="Models using this file" active={true} />
          </Link>
        </Tabs>
      </PageTop>

      <PageContainer>Models Using This File</PageContainer>
    </>
  );
};

export default FileModelsPage;
