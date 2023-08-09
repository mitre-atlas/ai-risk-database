import classNames from "classnames";
import Link from "next/link";
import { query } from "@/helpers/api";
import { useRouter } from "next/router";

export enum TAG_TYPE {
  task = "task",
  library = "library",
  type = "type",
  none = "none",
}

export type TagProps = {
  name: string;
  type: TAG_TYPE;
  className?: string;
};

type Params = { q: string; t: string; s: string };

const filters: {
  [Property in TAG_TYPE]: (name: string, params: Params) => string;
} = {
  [TAG_TYPE.type]: (name, { q, t, s }) =>
    `search${query({ q, t, s, f: `source:${name}` })}`,
  [TAG_TYPE.task]: (name, { q, t, s }) =>
    `search${query({ q, t, s, f: `task:${name}` })}`,
  [TAG_TYPE.library]: () => "",
  [TAG_TYPE.none]: () => "",
};

export const Tag = ({ name, className, type }: TagProps) => {
  const params = useRouter().query as Params;

  let href = filters[type](name, params);
  let canBeSearched = type === TAG_TYPE.type || type === TAG_TYPE.task;

  // Disable links until search-by-tag functionality works
  // Note that href is also currently relative, needs to be absolute
  href = "";
  canBeSearched = false;


  const tag = (
    <div
      className={classNames(
        "font-roboto rounded-full text-dark text-sm px-3 py-1",
        {
          "bg-bridesmaid": type === TAG_TYPE.library,
          "bg-granny-apple": type === TAG_TYPE.task,
          "bg-link-water": type === TAG_TYPE.type || type === TAG_TYPE.none,
          "cursor-pointer": canBeSearched,
          "hover:underline": canBeSearched,
        },
        className
      )}
    >
      {name}
    </div>
  );

  return href ? (
    <Link
      href={href}
      className={classNames({ "!cursor-default": !canBeSearched })}
    >
      {tag}
    </Link>
  ) : (
    tag
  );
};
