import { DerivedReport } from "@/pages/report/[id]";
import { useReducer } from "react";

export type VoteOption = "up" | "down" | "none";
export type Action = { type: VoteOption };

export type State = {
  votes: number;
  lastAction: VoteOption;
  sync: boolean;
  total: number;
  userUpvotes: number;
  userDownvotes: number;
};

const action: Record<string, Action> = {
  upvote: { type: "up" },
  downvote: { type: "down" },
};

const upvoteCountRules = { up: -1, down: 2, none: 1 };
const downvoteCountRules = { up: -2, down: 1, none: -1 };

export const voteReducer = (state: State, { type }: Action) => {
  const { votes, lastAction, total, userUpvotes, userDownvotes } = state;

  if (type === "up") {
    const sumVotes = upvoteCountRules[lastAction];

    const resultAction: VoteOption = lastAction === "up" ? "none" : "up";
    const newTotal =
      total + (resultAction === "none" ? -1 : lastAction === "down" ? 0 : 1);

    return {
      lastAction: resultAction,
      votes: votes + sumVotes,
      sync: true,
      total: newTotal,
      userUpvotes: userUpvotes + (resultAction === "up" ? 1 : -1),
      userDownvotes: userDownvotes - (lastAction === "down" ? 1 : 0),
    };
  }
  if (type === "down") {
    const sumVotes = downvoteCountRules[lastAction];

    const resultAction: VoteOption = lastAction === "down" ? "none" : "down";
    const newTotal =
      total + (resultAction === "none" ? -1 : lastAction === "up" ? 0 : 1);

    return {
      lastAction: resultAction,
      votes: votes + sumVotes,
      sync: true,
      total: newTotal,
      userUpvotes: userUpvotes + (lastAction === "up" ? -1 : 0),
      userDownvotes: userDownvotes + (resultAction === "down" ? 1 : -1),
    };
  }

  return state;
};

export const getHelpfulness = (state: State) => {
  const reportHelpfulnessPct =
    state.votes > 0 ? Math.trunc((state.votes / state.total) * 100) : 0;
  const userHelpfulness = state.userUpvotes - state.userDownvotes;

  return { reportHelpfulnessPct, userHelpfulness };
};

export default function useVoteReducer(data: DerivedReport) {
  const { score, vote, totalVotes } = data.report;
  const { report_upvotes_received, report_downvotes_received } = data.user;

  const initialState = {
    votes: score,
    lastAction: vote,
    sync: false,
    total: totalVotes,
    userUpvotes: report_upvotes_received,
    userDownvotes: report_downvotes_received,
  };
  const [state, dispatch] = useReducer(voteReducer, initialState);

  const upvote = () => dispatch(action.upvote);
  const downvote = () => dispatch(action.downvote);

  const helpfulness = getHelpfulness(state);

  return {
    state: {
      ...state,
      ...helpfulness,
    },
    actions: { upvote, downvote },
  };
}
