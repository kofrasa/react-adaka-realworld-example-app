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
