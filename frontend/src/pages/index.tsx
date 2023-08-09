import Link from "next/link";
import Image from "next/image";
import { Box } from "@mui/system";

import { SearchInput } from "@/components/SearchInput/SearchInput";
import { ReactComponent as ArrowIcon } from "public/images/icons/arrow.svg";
import globeImg from "public/images/particleGlobeWhite.png";
import { List } from "@/components/List/List";
import { get } from "@/helpers/api";
import { TOP_MODELS, TOP_REPORTS } from "@/endpoints";
import { format } from "date-fns";
import { Score } from "@/types/modelSchema";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { ShareMeta } from "@/components/ShareMeta/ShareMeta";
import { pageErrorHandler } from "@/helpers/server-side";
import { InfoIconTooltip } from "@/components/Tooltip/InfoTooltip";

export const getServerSideProps = pageErrorHandler(async () => {
  const [[topReports], [topModels]] = await Promise.all([
    get(TOP_REPORTS),
    get(TOP_MODELS),
  ]);

  return {
    props: { topReports, topModels },
  };
});

type TopReports = {
  affects: number;
  domain: string;
  title: string;
  updated: string;
  user_id: string;
  report_id: string;
  login: string;
};

type TopModels = {
  security: Score;
  ethics: Score;
  performance: Score;
  overall: Score;
  date: string;
  name: string;
  owner: string;
  purl: string;
  reports: number;
  scans: number;
  vulnerabilities: string;
};

type HomeProps = {
  topReports?: TopReports[];
  topModels?: TopModels[];
};

export default function Home({ topReports, topModels }: HomeProps) {
  const { handleSearch, handleChange, searchInput, handleClear } =
    useGlobalSearch();

  return (
    <>
      <ShareMeta />
      <main>
        <div className="lg:hero-gradient bg-brand-blue relative z-10 overflow-hidden">
          <div className="lg:grid lg:grid-cols-homepage-hero-columns flex flex-col lg:py-14 pt-14 lg:pb-0 lg:pt-28 mx-6 sm:mx-12 lg:mx-[7.5rem] 3xl:mx-[22.5rem]">
            <Image
              src={globeImg}
              alt="Globe"
              className="block absolute lg:top-[58%] top-[10%] -z-10 lg:-translate-x-2/4 lg:h-auto h-[670px] lg:w-[1070px] w-auto max-w-fit lg:left-1/2 left-[40%]"
            />
            <div className="pb-10 lg:pb-0">
              <h1 className="h1 lg:text-7xl text-white">
                Explore AI Supply Chain Risk with the AI Risk Database
              </h1>
            </div>
            <div className="font-roboto lg:text-lg text-base text-white">
              <div>
                AI Risk Database is a tool for discovering and reporting the
                risks associated with public machine learning models. The
                database is specifically designed for organizations that rely on
                AI for their operations, providing them with a comprehensive and
                up-to-date overview of the risks and vulnerabilities associated
                with publicly available models.
              </div>
              <div className="mt-4">
                Our database is continuously updated with the latest models,
                file reputation, and model vulnerabilities to ensure that you
                have the most accurate and up-to-date information at your
                fingertips.
              </div>
            </div>
            <div className="pt-20 relative lg:pb-0 pb-14">
              <form onSubmit={handleSearch}>
                <SearchInput
                  name="search"
                  value={searchInput}
                  onChange={handleChange}
                  className="w-full text-oslo-gray py-6"
                  placeholder="Search by model name or URL, file hash, file artifact, or risk report..."
                  onClear={handleClear}
                />
              </form>
            </div>
            <div className="bg-dark-navy row-start-3 col-start-2">
              <div className="pt-8 pb-10 px-10 text-white">
                <div className="flex lg:justify-between lg:flex-row flex-col">
                  <div className="lg:w-3/5">
                    <h3 className="text-2xl font-haffer pb-4">
                      Report a Vulnerability
                    </h3>
                    <span className="text-base font-roboto">
                      Tell us about an AI vulnerability that you&apos;ve
                      discovered.
                    </span>
                  </div>
                  <Link
                    href="/report-vulnerability"
                    className="white-button lg:self-end p-2 lg:mt-0 mt-3 group"
                  >
                    <ArrowIcon className="group-hover:fill-dark" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-wild-sand">
          <div className="lg:grid lg:grid-cols-2 flex flex-col pt-14 pb-40 gap-6 mx-6 sm:mx-12 lg:mx-[7.5rem] 3xl:mx-[22.5rem]">
            {topReports && (
              <Box className="box mb-0">
                <h2 className="section-title px-0">Top Risk Reports</h2>
                <List
                  items={topReports.map(
                    ({ title, affects, login, report_id, updated }) => ({
                      report_id,
                      href: `/report/${report_id}`,
                      title,
                      icon: "warning",
                      description: `Affects ${affects} ${
                        affects === 1 ? "model" : "models"
                      }`,
                      indicators: [
                        <>
                          reported by{" "}
                          <a
                            href={`https://github.com/${login}`}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="text-secondary-dark-blue"
                          >
                            {login}
                          </a>
                        </>,
                        format(new Date(updated), "MMM dd, yy"),
                      ],
                    })
                  )}
                />
              </Box>
            )}
            {topModels && (
              <Box className="box">
                <h2 className="section-title flex items-center px-0">
                  <span>Top Public Models</span>
                  <InfoIconTooltip
                    title={
                      <p className="lg:p-1 p-0 text-primary text-xs font-medium">
                        Ordered by number of downloads
                      </p>
                    }
                    className="ml-6"
                  />
                </h2>
                <List
                  items={topModels.map(
                    ({ name, overall, owner, date, purl }) => ({
                      title: name,
                      href: `/model/overview/${encodeURIComponent(purl)}`,
                      icon: "cube",
                      description: `${Math.trunc(overall.rank)}th percentile`,
                      indicators: [
                        <>
                          <a
                            href={`https://github.com/${owner}`}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="text-secondary-dark-blue"
                          >
                            {owner}
                          </a>
                        </>,
                        format(new Date(date), "MMM dd, yy"),
                      ],
                    })
                  )}
                />
              </Box>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
