import { useEffect } from "react";
import classNames from "classnames";
import { useSession, signIn } from "next-auth/react";
import { post } from "@/helpers/api";
import { ReactComponent as ArrowIcon } from "public/images/icons/arrow.svg";
import { shouldAcceptTerms } from "@/helpers/user";
import { Session } from "@/types/auth";
import { useRouter } from "next/router";
import useVoteReducer from "../useVoteReducer";
import { logClientError } from "@/helpers/client-error-logging";

interface VoteReportProps {
  report_id: string;
  state: ReturnType<typeof useVoteReducer>["state"];
  actions: ReturnType<typeof useVoteReducer>["actions"];
  termsVersion: number | null;
  author: string;
}

export const VoteReport = ({
  report_id,
  state,
  actions,
  termsVersion,
  author,
}: VoteReportProps) => {
  const { lastAction, sync, reportHelpfulnessPct } = state;
  const { upvote, downvote } = actions;

  const router = useRouter();
  const { data: session, status } = useSession() as ReturnType<
    typeof useSession
  > & { data: Session };

  const isUserAnAuthor = session?.user.login === author;

  useEffect(() => {
    if (sync) {
      try {
        post("/client-api/report/vote", { state: lastAction, report_id });
      } catch (error: any) {
        logClientError(error);
      }
    }
  }, [lastAction, sync, report_id]);

  const handleUpvote = () => {
    if (status === "unauthenticated") {
      signIn();
      return;
    }
    if (session && shouldAcceptTerms(termsVersion)) {
      router.push(
        `/auth/terms-signature?redirectURL=${encodeURIComponent(document.URL)}`
      );
      return;
    }

    upvote();
  };

  const handleDownvote = () => {
    if (status === "unauthenticated") {
      signIn();
      return;
    }

    downvote();
  };

  const upvoteClasses = classNames(
    "mx-2 cursor-pointer",
    "first:ml-0 -rotate-90",
    {
      "stroke-shuttle-gray": lastAction !== "up",
      "stroke-brand-blue": lastAction === "up",
    }
  );
  const downvoteClasses = classNames(
    "mx-2 cursor-pointer",
    "last:mr-0 rotate-90",
    {
      "stroke-shuttle-gray": lastAction !== "down",
      "stroke-brand-blue": lastAction === "down",
    }
  );

  return (
    <div className="flex items-center">
      {!isUserAnAuthor && (
        <div className="rounded-full bg-wild-sand w-fit px-3 py-3 border-wild-sand-2 border flex mr-4">
          <ArrowIcon className={upvoteClasses} onClick={handleUpvote} />
          <ArrowIcon className={downvoteClasses} onClick={handleDownvote} />
        </div>
      )}
      <span>{reportHelpfulnessPct}% found this helpful</span>
    </div>
  );
};
