import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Box } from "@mui/system";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { parseISO, format } from "date-fns";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { z } from "zod";
import Link from "next/link";
import "swiper/css";
import "swiper/css/navigation";

import { Overview } from "@/components/Overview/Overview";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { PageTop } from "@/components/PageTop/PageTop";
import { VoteReport } from "@/features/Report/VoteReport/VoteReport";
import useVoteReducer, { VoteOption } from "@/features/Report/useVoteReducer";
import { SectionTitle } from "@/components/Typography/Typography";

import image1 from "public/images/image1.png";
import image2 from "public/images/image2.png";

import { query, schema } from "@/helpers/api";
import { GET_REPORT } from "@/endpoints";
import { ShareMeta } from "@/components/ShareMeta/ShareMeta";
import {
  getCookies,
  getSession,
  getTermsVersion,
  pageErrorHandler,
} from "@/helpers/server-side";
import { InfoIconTooltip } from "@/components/Tooltip/InfoTooltip";
import { Button } from "@/components/Button/Button";
import { ReactComponent as TwitterIcon } from "public/images/icons/twitter.svg";

const reportSchema = z.object({
  report: z.object({
    report_id: z.string(),
    created: z.string(),
    title: z.string(),
    description: z.string(),
    reference_uris: z.string().array(),
    purls: z.string().array(),
    upvoted: z.tuple([z.string(), z.string()]).array(),
    downvoted: z.tuple([z.string(), z.string()]).array(),
    domain: z.string(),
    vulnerabilities: z.string().array(),
  }),
  user: z.object({
    login: z.string(),
    avatar_url: z.string().url(),
    company: z.string(),
    report_upvotes_received: z.number(),
    report_downvotes_received: z.number(),
  }),
  versions: z.record(z.string(), z.string()),
});

type Report = z.infer<typeof reportSchema>["report"];

export const getDerivedData = (report: Report, sessionUserId: string) => {
  const { purls, upvoted, downvoted } = report;

  const model_name = purls[0] ? purls[0].split("@")[0] : "";
  const score = upvoted.length - downvoted.length;
  const totalVotes = upvoted.length + downvoted.length;

  const searchVote = ([user]: [string, string]) => user === sessionUserId;
  const hasUpvoted = upvoted.find(searchVote);
  const hasDownvoted = downvoted.find(searchVote);
  const vote: VoteOption = hasUpvoted ? "up" : hasDownvoted ? "down" : "none";

  return {
    model_name,
    score,
    vote,
    totalVotes,
  };
};

export const getServerSideProps = pageErrorHandler(
  async (ctx: GetServerSidePropsContext) => {
    const session = await getSession(ctx.req, ctx.res);
    const sessionUserId = session?.user.id as string;

    const { id } = ctx.params as { id: string };
    const [{ report, user, versions }] = await schema(reportSchema).get(
      GET_REPORT,
      {
        id,
      }
    );
    const derived = getDerivedData(report, sessionUserId);
    const termsVersion = getTermsVersion(getCookies(ctx));

    return {
      props: {
        modelURL: report.purls[0] || "",
        termsVersion,
        data: {
          user,
          report: {
            ...report,
            ...derived,
            versions: Object.entries(versions).map(([version, date]) => ({
              version,
              date,
            })),
          },
        },
      },
    };
  }
);

export type DerivedReport = InferGetServerSidePropsType<
  typeof getServerSideProps
>["data"];

const ImageLibrary = () => {
  const imgLibRef = useRef<HTMLElement>(null);
  const swiperContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const width = imgLibRef.current?.clientWidth;

    if (swiperContainerRef.current) {
      swiperContainerRef.current.style.width = `${width}px`;
    }
  });

  return (
    <Box ref={imgLibRef} className="box my-5">
      <SectionTitle>
        Image Library{" "}
        <span className="text-oslo-gray text-base">14 images</span>
      </SectionTitle>

      <div ref={swiperContainerRef} className="w-1/2">
        <Swiper
          slidesPerView={3}
          spaceBetween={14}
          navigation
          modules={[Navigation]}
        >
          <SwiperSlide>
            <Image src={image1} alt="image1" />
          </SwiperSlide>
          <SwiperSlide>
            <Image src={image2} alt="image2" />
          </SwiperSlide>
          <SwiperSlide>
            <Image src={image1} alt="image1" />
          </SwiperSlide>
          <SwiperSlide>
            <Image src={image2} alt="image2" />
          </SwiperSlide>
        </Swiper>
      </div>
    </Box>
  );
};

export default function ReportPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const [url, setURL] = useState("");
  const { user, report } = props.data;
  const { state: voteState, actions: voteActions } = useVoteReducer(props.data);

  useEffect(() => {
    setURL(document.URL);
  }, []);

  const overviewItems = [
    {
      name: "Model Name",
      value: (
        <Link
          className="hover:underline"
          href={`/model/overview/${encodeURIComponent(props.modelURL)}`}
        >
          {report.model_name}
        </Link>
      ),
    },
    {
      name: "Vulnerability Type",
      value: <span className="capitalize">{report.domain}</span>,
    },
    { name: "CVE Number", value: report.vulnerabilities.join(", ") },
    {
      name: "Created Date",
      value: format(parseISO(report.created), "yyyy/MM/dd"),
    },
    { name: "Reported By", value: `@${user.login}` },
    {
      name: "References",
      value: (
        <ul>
          {report.reference_uris.map(link => (
            <li key={link}>
              <a className="hover:underline" href={link}>
                {link}
              </a>
            </li>
          ))}
        </ul>
      ),
    },
  ];

  // Needed to do this to not call useLayoutEffect on the ImageLibrary component on server-side
  // Next.js warns about that
  const [showImageLibrary, setShowImageLibrary] = useState(false);
  useEffect(() => {
    setShowImageLibrary(false);
  }, []);

  return (
    <>
      <ShareMeta title={`${report.title} | AI Risk Database Report`} />
      <PageTop>
        <div className="flex justify-between mt-16 mb-9 lg:gap-4">
          <h1 className="h1 lg:break-all">{report.title}</h1>
          <div className="lg:flex lg:mr-0 mr-6 items-center hidden">
            <a
              target="_blank"
              rel="noreferrer noopener"
              href={`https://twitter.com/intent/tweet${query({
                url,
              })}`}
            >
              <Button className="mr-4">
                <TwitterIcon className="h-5" />
              </Button>
            </a>
          </div>
        </div>
        <div className="mb-14">
          <VoteReport
            report_id={report.report_id}
            state={voteState}
            actions={voteActions}
            termsVersion={props.termsVersion}
            author={user.login}
          />
        </div>
      </PageTop>
      <PageContainer>
        <div className="lg:grid lg:grid-cols-overview-columns lg:gap-x-8">
          <div className="flex flex-col">
            <Box className="box my-5">
              <SectionTitle>Vulnerability Info</SectionTitle>
              <Overview items={overviewItems} />
            </Box>
            <Box className="box my-5">
              <SectionTitle>Affected Versions</SectionTitle>
              <div className="flex flex-col">
                {report.versions.map(({ version, date }) => (
                  <div
                    key={version}
                    className="flex lg:flex-row flex-col justify-between text-sm font-roboto py-4 border-b border-athens last:border-0"
                  >
                    <span className="text-dark break-words">@{version}</span>
                    <span className="text-oslo-gray">
                      {format(new Date(date), "dd LLLL yyyy")}
                    </span>
                  </div>
                ))}
              </div>
            </Box>
            <Box className="box my-5">
              <SectionTitle>Description</SectionTitle>
              <Markdown
                className="py-2 font-roboto text-sm text-shuttle-gray prose lg:prose-xl break-words"
                remarkPlugins={[remarkGfm]}
              >
                {report.description}
              </Markdown>
            </Box>
            {showImageLibrary && <ImageLibrary />}
          </div>
          <div>
            <Box className="box my-5 py-8 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full mb-4">
                <Image
                  src={user.avatar_url}
                  width={80}
                  height={80}
                  alt="contributor image"
                />
              </div>
              <div className="font-haffer text-secondary-dark-blue font-medium mb-1 hover:underline">
                <a
                  href={`https://github.com/${user.login}`}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  @{user.login}
                </a>
              </div>
              <div className="text-oslo-gray text-sm leading-5 mb-2">
                {user.company}
              </div>

              <div className="text-sm leading-6 font-roboto text-center text-oslo-gray flex items-center">
                <span>Helpfulness score: {voteState.userHelpfulness}</span>

                <InfoIconTooltip
                  placement="bottom"
                  className="ml-2 w-3.5 h-3.5"
                  title={
                    <div className="bg-white text-primary text-xs leading-5 px-3 py-1">
                      <p>{voteState.userUpvotes} upvotes received</p>
                      <p>{voteState.userDownvotes} downvotes received</p>
                    </div>
                  }
                />
              </div>
            </Box>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
