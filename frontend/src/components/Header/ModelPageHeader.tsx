import { query } from "@/helpers/api";
import Link from "next/link";
import classNames from "classnames";

import { Button } from "../Button/Button";
import { CopyButton } from "../CopyButton/CopyButton";
import { ReactComponent as TwitterIcon } from "public/images/icons/twitter.svg";
import { useEffect, useState } from "react";

type HeaderProps = {
  title: string;
  textToCopy: string | (() => string);
  modelURL: string;
  smallMarginBottom?: boolean;
};

export const ModelPageHeader = ({
  title,
  textToCopy,
  modelURL,
  smallMarginBottom = false,
}: HeaderProps) => {
  const queryString = query({ modelURL });

  const [url, setURL] = useState("");

  useEffect(() => {
    setURL(document.URL);
  }, []);

  return (
    <div
      className={classNames("flex justify-between mt-16 mb-14 lg:gap-4", {
        "mb-6": smallMarginBottom,
      })}
    >
      <h1 className="h1 lg:break-all">{title}</h1>
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
        <CopyButton textToCopy={textToCopy} className="mr-4" />
        <Link href={`/report-vulnerability${queryString}`}>
          <Button>Report Vulnerability</Button>
        </Link>
      </div>
    </div>
  );
};
