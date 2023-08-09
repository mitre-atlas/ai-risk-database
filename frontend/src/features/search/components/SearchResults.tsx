import { z } from "zod";
import { Box } from "@mui/system";
import Link from "next/link";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { formatFromISO } from "@/helpers/date";
import {
  modelResultItemSchema,
  reportResultItemSchema,
  SearchResults as SearchResultsType,
  ResultTypes,
  ModelsResultSet,
  ReportsResultSet,
  ArtifactsResultSet,
  artifactResultItemSchema,
} from "../types";
import { ReactComponent as ModelCubeIcon } from "public/images/icons/modelcube.svg";
import { ReactComponent as EllipisIcon } from "public/images/icons/ellipsis.svg";
import { ReactComponent as ReportIcon } from "public/images/icons/report.svg";
import { ReactComponent as FileIcon } from "public/images/icons/file.svg";
import { Pill } from "@/components/Pill/Pill";
import { Tags, getTags } from "@/components/Tags";
import {
  getPercentile,
  getRiskStatusElement,
} from "@/features/model/riskOverview";
import { useMenuHandlers } from "@/hooks/useMenuHandlers";

type MoreMenuProps = {
  purl: string;
  open: boolean;
  anchorEl: HTMLElement | null;
  handleClose: () => void;
};

const MoreMenu = ({ purl, open, anchorEl, handleClose }: MoreMenuProps) => {
  return (
    <Menu open={open} anchorEl={anchorEl} onClose={handleClose}>
      <MenuItem>
        <Link
          href={`/report-vulnerability?modelURL=${encodeURIComponent(purl)}`}
        >
          Report Vulnerability
        </Link>
      </MenuItem>
    </Menu>
  );
};

const ModelSearchResultItem = ({
  model,
}: {
  model: z.infer<typeof modelResultItemSchema>;
}) => {
  const {
    name,
    purl,
    owner,
    date,
    libraries,
    type,
    task,
    overall: { status, rank },
  } = model;
  const tags = getTags({ libraries, task, type });

  const { open, anchorEl, handleOpen, handleClose } = useMenuHandlers();

  return (
    <Box className="box my-4 first:mt-0">
      <div className="flex justify-between">
        <div className="flex">
          <div className="rounded-lg bg-wild-sand mr-4 p-2 lg:p-4 w-fit h-fit">
            <ModelCubeIcon className="stroke-oslo-gray w-4 h-4 lg:w-6 lg:h-6" />
          </div>
          <div>
            <Link
              href={`/model/overview/${encodeURIComponent(purl)}`}
              className="hover:underline"
            >
              <span className="text-oslo-gray text-sm">{owner} / </span>
              <span className="text-sm">{name}</span>
            </Link>
            <div className="text-xs leading-6 text-shuttle-gray flex flex-wrap">
              Version date: {date ? formatFromISO(date) : "not available"}.
              <div className="flex mx-1">
                Overall Risk:
                <div className="ml-1 flex">{getRiskStatusElement(status)}</div>.
              </div>
              {rank ? `Score: ${getPercentile(rank)}` : ""}
            </div>
            {tags.length && (
              <Tags
                variant="search"
                className="mt-4"
                tags={tags}
                tagsToShow={4}
              />
            )}
          </div>
        </div>
        <div onClick={handleOpen} className="h-fit">
          <EllipisIcon className="stroke-oslo-gray cursor-pointer " />
        </div>
        <MoreMenu
          purl={purl}
          open={open}
          anchorEl={anchorEl}
          handleClose={handleClose}
        />
      </div>
    </Box>
  );
};

const ReportSearchResultItem = ({
  report,
}: {
  report: z.infer<typeof reportResultItemSchema>;
}) => {
  const { open, anchorEl, handleOpen, handleClose } = useMenuHandlers();

  return (
    <Box className="box my-4 first:mt-0">
      <div className="flex justify-between">
        <div className="flex">
          <div className="rounded-lg bg-wild-sand mr-4 p-2 lg:p-4 w-fit h-fit">
            <ReportIcon className="stroke-oslo-gray w-4 h-4 lg:w-6 lg:h-6" />
          </div>
          <div>
            <Link
              href={`/report/${report.report_id}`}
              className="hover:underline mb-2"
            >
              <span className="text-sm">{report.title}</span>
            </Link>
            <div className="text-sm text-oslo-gray">
              {report.models_affected} Affected models
            </div>
          </div>
        </div>
        <div className="flex">
          <div className="text-sm text-oslo-gray text-right">
            <div className="mb-2">{formatFromISO(report.updated)}</div>
            <div>
              reported by{" "}
              <a
                href={`https://github.com/${report.author}`}
                className="text-secondary-dark-blue hover:underline"
                target="_blank"
                rel="noreferrer noopener"
              >
                @{report.author}
              </a>
            </div>
          </div>
          {report.purls && report.purls[0] && (
            <>
              <div className="h-fit" onClick={handleOpen}>
                <EllipisIcon className="ml-6 stroke-oslo-gray cursor-pointer " />
              </div>
              <MoreMenu
                purl={report.purls[0]}
                open={open}
                anchorEl={anchorEl}
                handleClose={handleClose}
              />
            </>
          )}
        </div>
      </div>
    </Box>
  );
};

const ArtifactSearchResultItem = ({
  artifact,
}: {
  artifact: z.infer<typeof artifactResultItemSchema>;
}) => {
  const { name, count, rare, purls } = artifact;

  const { open, anchorEl, handleOpen, handleClose } = useMenuHandlers();

  return (
    <Box className="box my-4 first:mt-0">
      <div className="flex justify-between">
        <div className="flex">
          <div className="rounded-lg bg-wild-sand mr-4 p-2 lg:p-4 w-fit h-fit">
            <FileIcon className="stroke-oslo-gray w-4 h-4 lg:w-6 lg:h-6" />
          </div>
          <div>
            <span className="text-sm">
              {purls[0] ? (
                <Link
                  href={`/model/overview/${encodeURIComponent(purls[0])}`}
                  className="hover:underline"
                >
                  {name}
                </Link>
              ) : (
                name
              )}
            </span>

            <div className="text-xs leading-6 text-shuttle-gray">
              Ocurrences: {count}
            </div>
            {rare && (
              <div className="mt-2">
                <Pill>Rare Artifact</Pill>
              </div>
            )}
          </div>
        </div>
        {purls[0] && (
          <>
            <div className="h-fit" onClick={handleOpen}>
              <EllipisIcon className="stroke-oslo-gray cursor-pointer " />
            </div>
            <MoreMenu
              purl={purls[0]}
              open={open}
              anchorEl={anchorEl}
              handleClose={handleClose}
            />
          </>
        )}
      </div>
    </Box>
  );
};

export const SearchResults = ({
  data,
  type,
}: {
  data: SearchResultsType;
  type: ResultTypes;
}) => {
  const models: ModelsResultSet | false =
    type === "models" && (data as ModelsResultSet);
  const reports: ReportsResultSet | false =
    type === "reports" && (data as ReportsResultSet);
  const artifacts: ArtifactsResultSet | false =
    type === "artifacts" && (data as ArtifactsResultSet);

  return (
    <>
      {models &&
        models.map(model => (
          <ModelSearchResultItem key={model.purl} model={model} />
        ))}

      {reports &&
        reports.map(report => (
          <ReportSearchResultItem key={report.report_id} report={report} />
        ))}

      {artifacts &&
        artifacts.map((artifact, i) => (
          <ArtifactSearchResultItem
            key={`${artifact.name}_${i}`}
            artifact={artifact}
          />
        ))}
    </>
  );
};
