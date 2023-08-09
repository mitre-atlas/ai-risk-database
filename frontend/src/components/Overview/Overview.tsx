import classNames from "classnames";

import {
  getPercentile,
  getRiskStatusElement,
} from "@/features/model/riskOverview";
import { Score } from "@/types/modelSchema";
import { ObjTable } from '@/components/Overview/ObjTable'

type OverviewProps = {
  items: { name: string; value: any }[];
  variant?: "default" | "risk";
};

const renderRiskOverview = ({ status, rank }: Score) => {
  return (
    <div className="flex justify-end">
      <div>
        <div className="flex justify-end">{getRiskStatusElement(status)}</div>
        {rank > 0 && <div>{getPercentile(rank)}</div>}
      </div>
    </div>
  );
};

export const Overview = ({ items, variant = "default" }: OverviewProps) => {
  const isRisk = variant === "risk";

  return (
    <div className="flex flex-col">
      {items.map(({ name, value }) => (
        <div key={name} className="flex w-full py-3 lg:flex-row flex-col">
          <span
            className={classNames(
              "lg:w-1/5 text-oslo-gray text-sm font-normal lg:mb-0 mb-1 lg:mr-2",
              {
                ["lg:w-1/2 mr-2"]: isRisk,
              }
            )}
          >
            {name}
          </span>
          <span
            className={classNames("lg:w-4/5 text-sm font-normal break-all", {
              ["lg:w-1/2 text-oslo-gray text-right"]: isRisk,
            })}
          >
            {/* Render the risk overview as needed, otherwise render the object table for reputation JSON, else as-is*/}
            {(isRisk) ? renderRiskOverview(value) : ((name === 'Reputation') ? <ObjTable obj={value}/> : value)}
          </span>
        </div>
      ))}
    </div>
  );
};
