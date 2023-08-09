import { voteReducer, State, getHelpfulness } from "./useVoteReducer";

describe("voting buttons reducer logic", () => {
  const initialState: State = {
    votes: 0, // the voting score: upvotes - downvotes
    lastAction: "none", // the previous action
    sync: false, // should sync state to server
    total: 0, // upvotes + downvotes
    userUpvotes: 0,
    userDownvotes: 0,
  };

  test("Initial state", () => {
    const state = voteReducer(initialState, { type: "none" });
    expect(state).toEqual(initialState);
    expect(state).toBe(initialState);
  });

  test("Upvote a report with no votes", () => {
    const state = voteReducer(initialState, { type: "up" });

    expect(state).toEqual({
      ...state,
      lastAction: "up",
      votes: 1,
      sync: true,
      total: 1,
      userUpvotes: 1,
      userDownvotes: 0,
    });
  });

  test("Upvote twice from zeroed state", () => {
    const state = voteReducer(initialState, { type: "up" });

    expect(state).toEqual({
      lastAction: "up",
      votes: 1,
      sync: true,
      total: 1,
      userUpvotes: 1,
      userDownvotes: 0,
    });

    const state2 = voteReducer(state, { type: "up" });

    expect(state2).toEqual({
      lastAction: "none",
      votes: 0,
      sync: true,
      total: 0,
      userUpvotes: 0,
      userDownvotes: 0,
    });
  });

  test("Downvote twice from zeroed state", () => {
    const state = voteReducer(initialState, { type: "down" });

    expect(state).toEqual({
      lastAction: "down",
      votes: -1,
      sync: true,
      total: 1,
      userUpvotes: 0,
      userDownvotes: 1,
    });

    const state2 = voteReducer(state, { type: "down" });

    expect(state2).toEqual({
      lastAction: "none",
      votes: 0,
      sync: true,
      total: 0,
      userUpvotes: 0,
      userDownvotes: 0,
    });
  });

  test("Upvote then downvote from zeroed state", () => {
    const state = voteReducer(initialState, { type: "up" });

    expect(state).toEqual({
      lastAction: "up",
      votes: 1,
      sync: true,
      total: 1,
      userUpvotes: 1,
      userDownvotes: 0,
    });

    const state2 = voteReducer(state, { type: "down" });

    expect(state2).toEqual({
      lastAction: "down",
      votes: -1,
      sync: true,
      total: 1,
      userUpvotes: 0,
      userDownvotes: 1,
    });
  });

  test("Downvote then upvote from zeroed state", () => {
    const state = voteReducer(initialState, { type: "down" });

    expect(state).toEqual({
      lastAction: "down",
      votes: -1,
      sync: true,
      total: 1,
      userUpvotes: 0,
      userDownvotes: 1,
    });

    const state2 = voteReducer(state, { type: "up" });

    expect(state2).toEqual({
      lastAction: "up",
      votes: 1,
      sync: true,
      total: 1,
      userUpvotes: 1,
      userDownvotes: 0,
    });
  });

  test("Upvote, downvote, 6 times", () => {
    let state = initialState;

    for (let i = 0; i < 6; i++) {
      state = voteReducer(state, { type: "up" });
      state = voteReducer(state, { type: "down" });
    }

    expect(state).toEqual({
      lastAction: "down",
      votes: -1,
      sync: true,
      total: 1,
      userUpvotes: 0,
      userDownvotes: 1,
    });

    const helpfulness = getHelpfulness(state);

    expect(helpfulness).toEqual({
      reportHelpfulnessPct: 0,
      userHelpfulness: -1,
    });
  });

  test("Downvote, upvote, 6 times", () => {
    let state = initialState;

    for (let i = 0; i < 6; i++) {
      state = voteReducer(state, { type: "down" });
      state = voteReducer(state, { type: "up" });
    }

    expect(state).toEqual({
      lastAction: "up",
      votes: 1,
      sync: true,
      total: 1,
      userUpvotes: 1,
      userDownvotes: 0,
    });

    const helpfulness = getHelpfulness(state);

    expect(helpfulness).toEqual({
      reportHelpfulnessPct: 100,
      userHelpfulness: 1,
    });
  });

  test("From a custom number of votes, downvote 4 times, upvote 5 times", () => {
    const initialState: State = {
      votes: 42,
      lastAction: "up",
      sync: false,
      total: 48,
      userUpvotes: 45,
      userDownvotes: 3,
    };

    let state = voteReducer(initialState, { type: "none" });

    for (let i = 0; i < 4; i++) {
      state = voteReducer(state, { type: "down" });
      state = voteReducer(state, { type: "up" });
    }

    state = voteReducer(state, { type: "up" });

    expect(state).toEqual({
      votes: 41,
      lastAction: "none",
      total: 47,
      sync: true,
      userDownvotes: 3,
      userUpvotes: 44,
    });

    expect(getHelpfulness(state)).toEqual({
      reportHelpfulnessPct: 87,
      userHelpfulness: 41,
    });
  });
});
