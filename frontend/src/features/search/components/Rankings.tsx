import { Box } from "@mui/system";
import { SectionTitle } from "@/components/Typography/Typography";
import { ReactComponent as ModelCubeIcon } from "public/images/icons/modelcube.svg";
import { ReactComponent as UserIcon } from "public/images/icons/user.svg";
import { ReactComponent as CompanyIcon } from "public/images/icons/company.svg";
import Link from "next/link";
import { TwoColumnsList } from "@/components/List/TwoColumnsList";
import { SideColumnData } from "../types";

type SearchSideColumnSectionProps = {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
};

export const RankingsSection = ({
  title,
  icon,
  children,
}: SearchSideColumnSectionProps) => {
  return (
    <Box className="box my-4 first:mt-0">
      <div className="flex justify-between">
        <SectionTitle>{title}</SectionTitle>
        {icon}
      </div>
      {children}
    </Box>
  );
};

export const Rankings = ({
  data: { topModels, topUsers, topOrgs },
}: {
  data: SideColumnData;
}) => {
  return (
    <div>
      {topModels && (
        <RankingsSection
          title="Top Public Models"
          icon={<ModelCubeIcon className="stroke-light-gray w-7 h-7" />}
        >
          {topModels.map(({ name, purl }) => (
            <div key={purl} className="mt-3">
              <Link
                className="hover:underline text-sm leading-6"
                href={`/model/overview/${encodeURIComponent(purl)}`}
              >
                {name}
              </Link>
            </div>
          ))}
        </RankingsSection>
      )}
      {topUsers && (
        <RankingsSection
          title="Top Users"
          icon={<UserIcon className="stroke-light-gray w-7 h-7" />}
        >
          <TwoColumnsList
            items={topUsers.map(({ login, count }) => ({
              name: <span className="text-sm">@{login}</span>,
              value: (
                <div className="text-sm text-oslo-gray text-right">
                  <span className="text-dark">{count}</span> submissions
                </div>
              ),
            }))}
          />
        </RankingsSection>
      )}
      {topOrgs && (
        <RankingsSection
          title="Top Organizations"
          icon={<CompanyIcon className="stroke-light-gray w-7 h-7" />}
        >
          <TwoColumnsList
            items={topOrgs.map(({ company, count }) => ({
              name: <span className="text-sm">{company}</span>,
              value: (
                <div className="text-sm text-oslo-gray text-right">
                  <span className="text-dark">{count}</span> models
                </div>
              ),
            }))}
          />
        </RankingsSection>
      )}
    </div>
  );
};
