import agent from '../../agent';
import { isApiError, Status } from '../../common/utils';
import { initialStates, update, select } from '../../store';

/**
 * Get is authenticated. { isAuthenticated: <boolean> }
 */
export const selectIsAuthenticated = Object.freeze({
  isAuthenticated: { $allElementsTrue: [['$auth.token', '$auth.user']] },
});

/**
 * Get is loading - { isLoading: <boolean> }
 */
export const selectIsLoading = Object.freeze({
  isLoading: { $eq: ['$auth.status', Status.LOADING] },
});

/**
 * Get errors. { errors: <errors> }
 */
export const selectErrors = Object.freeze({
  errors: '$auth.errors',
});
export const selectUser = Object.freeze({
  user: '$auth.user',
});

const authFailed = (errors) => {
  if (!isApiError(errors)) throw errors;

  update({
    $set: {
      'auth.errors': errors,
      'auth.status': Status.FAILURE,
    },
  });
};

const authSuccess = (user, token, redirectTo) => {
  persistToken(token);
  update({
    $set: {
      redirectTo,
      auth: {
        errors: undefined,
        token,
        user,
        status: Status.SUCCESS,
      },
    },
  });
};

const persistToken = (token) => {
  if (token === undefined) {
    window.localStorage.removeItem('jwt');
  } else {
    window.localStorage.setItem('jwt', token);
  }
  agent.setToken(token);
};

/**
 * @typedef {object} User
 * @property {string} email
 * @property {string} username
 * @property {string} bio
 * @property {string} image
 *
 *
 * @typedef {object} AuthState
 * @property {Status} status
 * @property {string} token
 * @property {User}   user
 * @property {Record<string, string[]>} errors
 */

/**
 * Send a register request
 *
 * @param {object} argument
 * @param {string} argument.username
 * @param {string} argument.email
 * @param {string} argument.password
 */
export const register = ({ username, email, password }) => {
  if (select(selectIsLoading).inProgress) return;

  return agent.cancellable(
    () => agent.Auth.register(username, email, password),
    ({ user: { token, ...user } }) => {
      persistToken(token);
      authSuccess(user, token, '/');
    },
    authFailed
  );
};

/**
 * Send a login request
 *
 * @param {object} argument
 * @param {string} argument.email
 * @param {string} argument.password
 */
export const login = ({ email, password }) => {
  return agent.cancellable(
    () => agent.Auth.login(email, password),
    ({ user: { token, ...user } }) => authSuccess(user, token, '/'),
    authFailed
  );
};

export const logout = () => {
  persistToken(undefined);
  update({ $set: { auth: initialStates.auth, redirectTo: '/' } });
};

/**
 * Send a update user request
 *
 * @param {object} argument
 * @param {string} argument.email
 * @param {string} argument.username
 * @param {string} argument.bio
 * @param {string} argument.image
 * @param {string} argument.password
 */
export const updateUser = ({ email, username, bio, image, password }) => {
  return agent.cancellable(
    () => agent.Auth.save({ email, username, bio, image, password }),
    ({ user: { token, ...user } }) => {
      authSuccess(user, token, '/');
    },
    authFailed
  );
};

/**
 * Send a get current user request
 */
export const getUser = () => {
  return agent.cancellable(() => agent.Auth.current(), authSuccess);
};

export const setToken = (token) => {
  update({ $set: { 'auth.token': token } });
};
