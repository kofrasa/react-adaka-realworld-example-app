import agent from '../../agent';
import { Status } from '../../common/utils';
import { selectIsAuthenticated, selectUser } from '../auth/authSlice';
import { update, select } from '../../store';

export const selectAllComments = { comments: '$comments.comments' };

export const selectIsLoading = {
  isLoading: { $eq: ['$comments.status', Status.LOADING] },
};

export const selectErrors = { error: '$comments.errors' };

export const selectIsAuthor = (commentId) => {
  // query the store for the current user and comment if exists.
  const { username, index } = select({
    username: '$auth.user.username',
    index: {
      $indexOfArray: ['$comments.comments.id', commentId],
    },
  }).get();

  // get the comment author if we found the comment.
  const commentAuthor =
    username && index !== -1
      ? `$comments.comments.${index}.author.username`
      : false;

  return {
    isAuthor: {
      $eq: [username, commentAuthor],
    },
  };
};

// https://stackoverflow.com/a/1349426
function makeid(length) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

/**
 * Send a create request
 *
 * @param {object} argument
 * @param {string} argument.articleSlug
 * @param {object} argument.comment
 * @param {string} argument.comment.body
 */
export const createComment = ({ articleSlug, comment: newComment }) => {
  const {
    isAuthenticated,
    isLoading,
    user: author,
  } = select({
    ...selectIsAuthenticated,
    ...selectIsLoading,
    ...selectUser,
  }).get();

  if (isAuthenticated && !isLoading && newComment.body) {
    // set status to loading
    update({ $set: { 'comments.status': Status.LOADING } });

    // create comment object
    const commentId = makeid(10);
    const comment = {
      ...newComment,
      author,
      id: commentId,
      article: articleSlug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // add to the store, and keep sorted descending by created date.
    update({
      $push: { comments: { $each: [comment], $sort: { createdAt: -1 } } },
    });

    // update the comment
    agent.Comments.create(articleSlug, newComment)
      .then((payload) => {
        update(
          {
            $set: {
              'comments.comments.$[elem]': { ...payload, id: commentId },
              'comments.status': Status.SUCCESS,
              'comments.errors': undefined,
            },
          },
          [{ 'elem.id': commentId }]
        );
      })
      .catch((_) => {
        // remove comment
        update({
          $pull: {
            'comments.comments': { id: commentId },
          },
        });
        update({ $set: { 'comments.status': Status.FAILURE } });
      });
  }
};

/**
 * Send a remove request
 *
 * @param {object} argument
 * @param {string} argument.articleSlug
 * @param {number} argument.commentId
 */
export const removeComment = ({ articleSlug, commentId }) => {
  const { isAuthenticated, isLoading, index } = select({
    ...selectIsAuthenticated,
    ...selectIsLoading,
    index: {
      $indexOfArray: ['$comments.comments.id', commentId],
    },
  }).get();

  return agent.cancellable(
    () => {
      return isAuthenticated && !isLoading && index !== -1
        ? agent.Comments.delete(articleSlug, commentId)
        : Promise.reject();
    },
    () => {
      update({
        $pull: {
          'comments.comments': { id: commentId },
        },
      });
      update({ $set: { 'comments.status': Status.SUCCESS } });
    }
  );
};

/**
 * Send a get all request
 *
 * @param {string} articleSlug
 */
export const getCommentsForArticle = (articleSlug) => {
  return agent.cancellable(
    () => {
      const { isLoading } = select(selectIsLoading).get();
      if (isLoading) return Promise.reject();
      update({ $set: { 'comments.status': Status.LOADING } });
      return agent.Comments.forArticle(articleSlug);
    },
    ({ comments }) => {
      update({
        $set: {
          'comments.status': Status.SUCCESS,
          'comments.comments': comments,
        },
      });
    }
  );
};

// /**
//  * @typedef  {object}   CommentsState
//  * @property {Status}   status
//  * @property {number[]} ids
//  * @property {Record<string, import('../../agent').Comment>} entities
//  * @property {Record<string, string[]>} errors
//  */

// const commentAdapter = createEntityAdapter({
//   sortComparer: (a, b) => b.createdAt.localeCompare(a.createdAt),
// });

// /**
//  * Send a create request
//  *
//  * @param {object} argument
//  * @param {string} argument.articleSlug
//  * @param {object} argument.comment
//  * @param {string} argument.comment.body
//  */
// export const createComment = createAsyncThunk(
//   'comments/createComment',
//   async ({ articleSlug, comment: newComment }, thunkApi) => {
//     try {
//       const { comment } = await agent.Comments.create(articleSlug, newComment);

//       return comment;
//     } catch (error) {
//       if (isApiError(error)) {
//         return thunkApi.rejectWithValue(error);
//       }

//       throw error;
//     }
//   },
//   {
//     condition: (_, { getState }) =>
//       selectIsAuthenticated(getState()) && !selectIsLoading(getState()),
//     getPendingMeta: (_, { getState }) => ({ author: selectUser(getState()) }),
//   }
// );

// /**
//  * Send a get all request
//  *
//  * @param {string} articleSlug
//  */
// export const getCommentsForArticle = createAsyncThunk(
//   'comments/getCommentsForArticle',
//   async (articleSlug) => {
//     const { comments } = await agent.Comments.forArticle(articleSlug);

//     return comments;
//   },
//   {
//     condition: (_, { getState }) => !selectIsLoading(getState()),
//   }
// );

// /**
//  * Send a remove request
//  *
//  * @param {object} argument
//  * @param {string} argument.articleSlug
//  * @param {number} argument.commentId
//  */
// export const removeComment = createAsyncThunk(
//   'comments/removeComment',
//   async ({ articleSlug, commentId }) => {
//     await agent.Comments.delete(articleSlug, commentId);
//   },
//   {
//     condition: ({ commentId }, { getState }) =>
//       selectIsAuthenticated(getState()) &&
//       selectCommentsSlice(getState()).ids.includes(commentId) &&
//       !selectIsLoading(getState()),
//   }
// );

// /**
//  * @type {CommentsState}
//  */
// const initialState = commentAdapter.getInitialState({
//   status: Status.IDLE,
// });

// const commentsSlice = createSlice({
//   name: 'comments',
//   initialState,
//   reducers: {},
//   extraReducers(builder) {
//     builder
//       .addCase(createComment.pending, (state, action) => {
//         state.status = Status.LOADING;

//         if (action.meta.arg.comment.body) {
//           commentAdapter.addOne(state, {
//             ...action.meta.arg.comment,
//             author: action.meta.author,
//             id: action.meta.requestId,
//             createdAt: new Date().toISOString(),
//             updatedAt: new Date().toISOString(),
//           });
//         }
//       })
//       .addCase(createComment.fulfilled, (state, action) => {
//         state.status = Status.SUCCESS;
//         commentAdapter.updateOne(state, {
//           id: action.meta.requestId,
//           changes: action.payload,
//         });
//         delete state.errors;
//       })
//       .addCase(createComment.rejected, (state, action) => {
//         state.status = Status.FAILURE;
//         state.errors = action.payload?.errors;
//         commentAdapter.removeOne(state, action.meta.requestId);
//       });

//     builder.addCase(getCommentsForArticle.fulfilled, (state, action) => {
//       state.status = Status.SUCCESS;
//       commentAdapter.setAll(state, action.payload);
//     });

//     builder.addCase(removeComment.fulfilled, (state, action) => {
//       state.status = Status.SUCCESS;
//       commentAdapter.removeOne(state, action.meta.arg.commentId);
//     });

//     builder.addMatcher(
//       (action) => /comments\/.*\/pending/.test(action.type),
//       loadingReducer
//     );
//   },
// });
//
// /**
//  * Get comments state
//  *
//  * @param {object} state
//  * @returns {CommentsState}
//  */
// const selectCommentsSlice = (state) => state.comments;

// const commentSelectors = commentAdapter.getSelectors(selectCommentsSlice);

// /**
//  * Get all comments
//  *
//  * @param {object} state
//  * @returns {import('../../agent').Comment[]}
//  */
// export const selectAllComments = commentSelectors.selectAll;

// /**
//  * Get one comment
//  *
//  * @param {number} commentId
//  * @returns {import('@reduxjs/toolkit').Selector<object, import('../../agent').Comment>}
//  */
// const selectCommentById = (commentId) => (state) =>
//   commentSelectors.selectById(state, commentId);

// /**
//  * Get is the comment's author
//  *
//  * @param {number} commentId
//  * @returns {import('@reduxjs/toolkit').Selector<object, boolean>}
//  */
// export const selectIsAuthor = (commentId) =>
//   createSelector(
//     selectCommentById(commentId),
//     selectUser,
//     (comment, currentUser) => currentUser?.username === comment?.author.username
//   );

// /**
//  * Get is loading
//  *
//  * @param {object} state
//  * @returns {boolean}
//  */
// export const selectIsLoading = (state) =>
//   selectCommentsSlice(state).status === Status.LOADING;

// /**
//  * Get is errors
//  *
//  * @param {object} state
//  * @returns {Record<string, string[]>}
//  */
// export const selectErrors = (state) => selectCommentsSlice(state).errors;

// export default commentsSlice.reducer;
