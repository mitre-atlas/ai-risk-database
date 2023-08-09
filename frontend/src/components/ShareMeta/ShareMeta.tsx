import Head from "next/head";
import { useRouter } from "next/router";
import linkPreviewStatic from "public/images/link_preview.png";

type ShareMetaProps = {
  title?: string;
  description?: string;
  image?: string;
};

// use open graph properties instead if a social network supports both
export const ShareMeta = ({
  title = "AI Risk Database",
  description = "A comprehensive and up-to-date database to manage and mitigate the risks associated with AI systems.",
  image = linkPreviewStatic.src,
}: ShareMetaProps) => {
  const { asPath } = useRouter();

  return (
    <Head>
      <meta name="twitter:card" content="summary_large_image" />
      <meta property="og:title" content={title} />
      <meta name="twitter:site" content="@robusthq" />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`https://airisk.io/${asPath}`} />
    </Head>
  );
};
