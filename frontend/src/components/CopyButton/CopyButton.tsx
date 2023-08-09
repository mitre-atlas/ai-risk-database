import { ReactComponent as CopyIcon } from "public/images/icons/copy.svg";
import { Button } from "@/components/Button/Button";
import classNames from "classnames";

type StringFN = () => string;

type CopyButtonProps = {
  textToCopy: string | StringFN;
  className?: string;
};

/**
 * Since the copy to clipboard action can only happen at client-side,
 * we can defer the value to be copied by passing a function as parameter.
 * This solves the problem of document.URL at server-side without adding a dependency
 */
export const CopyButton = ({ textToCopy, className }: CopyButtonProps) => {
  const handleCopyLink = () => {
    const text =
      textToCopy instanceof Function
        ? (textToCopy as StringFN)()
        : (textToCopy as string);

    navigator.clipboard.writeText(text);
  };

  return (
    <Button
      title="Copy to clipboard"
      className={classNames("[&:hover_svg]:stroke-white", className)}
      onClick={handleCopyLink}
    >
      <CopyIcon className="stroke-primary" />
    </Button>
  );
};
