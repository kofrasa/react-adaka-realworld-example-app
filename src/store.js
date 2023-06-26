import { createStore, createSelectorHook } from 'react-adaka';
import { Context, initOptions } from 'mingo/core';
import { $allElementsTrue } from 'mingo/operators/expression/set';
import { Status } from './common/utils';

// initial states
// ----------------
export const initialStates = Object.freeze({
  article: {
    article: undefined,
    inProgress: false,
    errors: undefined,
  },

  articleList: {
    articles: [],
    articlesCount: 0,
    currentPage: 0,
    articlesPerPage: 10,
    tab: undefined,
    tag: undefined,
    author: undefined,
    favorited: undefined,
  },

  auth: {
    status: Status.IDLE,
    token: undefined,
    user: undefined,
    errors: undefined,
  },

  tags: {
    status: Status.IDLE,
    tags: [],
  },

  comments: {
    status: Status.IDLE,
    comments: [],
  },
});

// top-level
const app = {
  appName: 'Conduit',
  appLoaded: false,
  viewChangeCounter: 0,
  redirectTo: undefined,
};

// store
// -----
const store = createStore(
  { ...initialStates, ...app },
  {
    queryOptions: initOptions({
      context: Context.init({
        expression: { $allElementsTrue },
      }),
    }),
  }
);

// selector hook - only need a single one
// --------------------------------
export const useSelector = createSelectorHook(store);

// exposing via functions to support middlewares
export const update = (expr, arrayFilters, condition) =>
  store.update(expr, arrayFilters, condition);

export const select = (projection, condition) =>
  store.select(projection, condition).get();
