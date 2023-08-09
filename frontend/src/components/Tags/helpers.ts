import { TAG_TYPE } from "@/components/Tags/Tag";

type GetTagsParams = { task: string; type: string; libraries: string[] };

export const getTags = ({ task, type, libraries }: GetTagsParams) =>
  [
    { name: task, type: TAG_TYPE.task },
    { name: type, type: TAG_TYPE.type },
    ...libraries.map(library => ({
      name: library,
      type: TAG_TYPE.library,
    })),
  ].filter(tag => !!tag.name);
