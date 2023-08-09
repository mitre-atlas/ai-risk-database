import { RiskStatus } from "@/types/modelSchema";
import { ReactComponent as NotTestedIcon } from "public/images/icons/not-tested.svg";
import { ReactComponent as ErrorIcon } from "public/images/icons/error.svg";
import { ReactComponent as CheckCircleIcon } from "public/images/icons/check-circle.svg";
import { ReactComponent as WarningIcon } from "public/images/icons/warning-small.svg";

const riskStatusElements: Record<RiskStatus, React.ReactNode> = {
  not_tested: (
    <div className="flex items-center text-oslo-gray">
      <NotTestedIcon className="w-4 h-4 fill-oslo-gray mr-2" />
      <span>n/a</span>
    </div>
  ),
  severe: (
    <div className="flex items-center text-error">
      <ErrorIcon className="w-4 h-4 fill-error mr-2" />
      <span>Alert</span>
    </div>
  ),
  warning: (
    <div className="flex items-center text-orange">
      <WarningIcon className="w-4 h-4 stroke-orange mr-2" />
      <span>Warning</span>
    </div>
  ),
  pass: (
    <div className="flex items-center text-success">
      <CheckCircleIcon className="w-4 h-4 stroke-success mr-2" />
      <span>Pass</span>
    </div>
  ),
};

export const getRiskStatusElement = (status: RiskStatus) => {
  return riskStatusElements[status] || riskStatusElements[RiskStatus.NotTested];
};

export const getPercentile = (rank: number) =>
  `${Math.trunc(rank)}th percentile`;
