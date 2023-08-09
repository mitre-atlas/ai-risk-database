import { useState } from "react";
import classNames from "classnames";

import { Tag, TAG_TYPE, TagProps } from "@/components/Tags/Tag";
import { ReactComponent as ChevronIcon } from "public/images/icons/chevron.svg";

type TagsProps = {
  tags: TagProps[];
  tagsToShow?: number;
  className?: string;
  variant?: "search" | "overview";
};

export const Tags = ({
  tags,
  tagsToShow = 10,
  className,
  variant = "overview",
}: TagsProps) => {
  const numberOfTags = tags.length;
  const [showAllTags, setShowAllTags] = useState(numberOfTags < tagsToShow);
  const items = showAllTags ? tags : tags.slice(0, tagsToShow);

  const overviewVariantButton = (
    <button
      onClick={() => setShowAllTags(showAllTags => !showAllTags)}
      className="flex bg-white items-center border border-shuttle-gray cursor-pointer font-roboto rounded-full text-dark text-sm px-3 py-1"
    >
      {showAllTags ? "Show less" : `Show ${numberOfTags - tagsToShow} more`}
      <ChevronIcon
        className={classNames("ml-1", { "rotate-180": showAllTags })}
      />
    </button>
  );

  const searchVariantIndicator = (
    <Tag name={`+${numberOfTags - tagsToShow} more`} type={TAG_TYPE.none} />
  );

  return (
    <div className={classNames("flex gap-2 flex-wrap", className)}>
      {items.map((tag, idx) => (
        <Tag key={idx} {...tag} />
      ))}
      {numberOfTags > tagsToShow &&
        (variant === "search" ? searchVariantIndicator : overviewVariantButton)}
    </div>
  );
};
