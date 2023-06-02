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

// /**
//  * @typedef {object} User
//  * @property {string} email
//  * @property {string} username
//  * @property {string} bio
//  * @property {string} image
//  *
//  *
//  * @typedef {object} AuthState
//  * @property {Status} status
//  * @property {string} token
//  * @property {User}   user
//  * @property {Record<string, string[]>} errors
//  */

// /**
//  * Send a register request
//  *
//  * @param {object} argument
//  * @param {string} argument.username
//  * @param {string} argument.email
//  * @param {string} argument.password
//  */
// export const register = createAsyncThunk(
//   'auth/register',
//   async ({ username, email, password }, thunkApi) => {
//     try {
//       const {
//         user: { token, ...user },
//       } = await agent.Auth.register(username, email, password);

//       return { token, user };
//     } catch (error) {
//       if (isApiError(error)) {
//         return thunkApi.rejectWithValue(error);
//       }

//       throw error;
//     }
//   },
//   {
//     condition: (_, { getState }) => !selectIsLoading(getState()),
//   }
// );

// /**
//  * Send a login request
//  *
//  * @param {object} argument
//  * @param {string} argument.email
//  * @param {string} argument.password
//  */
// export const login = createAsyncThunk(
//   'auth/login',
//   async ({ email, password }, thunkApi) => {
//     try {
//       const {
//         user: { token, ...user },
//       } = await agent.Auth.login(email, password);

//       return { token, user };
//     } catch (error) {
//       if (isApiError(error)) {
//         return thunkApi.rejectWithValue(error);
//       }

//       throw error;
//     }
//   },
//   {
//     condition: (_, { getState }) => !selectIsLoading(getState()),
//   }
// );

// /**
//  * Send a get current user request
//  */
// export const getUser = createAsyncThunk(
//   'auth/getUser',
//   async () => {
//     const {
//       user: { token, ...user },
//     } = await agent.Auth.current();

//     return { token, user };
//   },
//   {
//     condition: (_, { getState }) => Boolean(selectAuthSlice(getState()).token),
//   }
// );

// /**
//  * Send a update user request
//  *
//  * @param {object} argument
//  * @param {string} argument.email
//  * @param {string} argument.username
//  * @param {string} argument.bio
//  * @param {string} argument.image
//  * @param {string} argument.password
//  */
// export const updateUser = createAsyncThunk(
//   'auth/updateUser',
//   async ({ email, username, bio, image, password }, thunkApi) => {
//     try {
//       const {
//         user: { token, ...user },
//       } = await agent.Auth.save({ email, username, bio, image, password });

//       return { token, user };
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
//   }
// );

// /**
//  * @type {AuthState}
//  */
// const initialState = {
//   status: Status.IDLE,
// };

// /**
//  * @param {import('@reduxjs/toolkit').Draft<AuthState>} state
//  * @param {import('@reduxjs/toolkit').PayloadAction<{token: string, user: User}>} action
//  */
// function successReducer(state, action) {
//   state.status = Status.SUCCESS;
//   state.token = action.payload.token;
//   state.user = action.payload.user;
//   delete state.errors;
// }

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     /**
//      * Log out the user
//      */
//     logout: () => initialState,
//     /**
//      * Update token
//      *
//      * @param {import('@reduxjs/toolkit').Draft<AuthState>} state
//      * @param {import('@reduxjs/toolkit').PayloadAction<string>} action
//      */
//     setToken(state, action) {
//       state.token = action.payload;
//     },
//   },
//   extraReducers(builder) {
//     builder
//       .addCase(login.fulfilled, successReducer)
//       .addCase(register.fulfilled, successReducer)
//       .addCase(getUser.fulfilled, successReducer)
//       .addCase(updateUser.fulfilled, successReducer);

//     builder
//       .addCase(login.rejected, failureReducer)
//       .addCase(register.rejected, failureReducer)
//       .addCase(updateUser.rejected, failureReducer);

//     builder.addMatcher(
//       (action) => /auth\/.*\/pending/.test(action.type),
//       loadingReducer
//     );
//   },
// });

// export const { setToken, logout } = authSlice.actions;

// /**
//  * Get auth slice
//  *
//  * @param {object} state
//  * @returns {AuthState}
//  */
// const selectAuthSlice = (state) => state.auth;

// /**
//  * Get current user
//  *
//  * @param {object} state
//  * @returns {User}
//  */
// export const selectUser = (state) => selectAuthSlice(state).user;

// /**
//  * Get errors
//  *
//  * @param {object} state
//  * @returns {Record<string, string[]}
//  */
// export const selectErrors = (state) => selectAuthSlice(state).errors;

// /**
//  * Get is loading
//  *
//  * @param {object} state
//  * @returns {boolean} There are pending effects
//  */
// export const selectIsLoading = (state) =>
//   selectAuthSlice(state).status === Status.LOADING;

// /**
//  * Get is authenticated
//  *
//  * @param {object} state
//  * @returns {boolean}
//  */
// export const selectIsAuthenticated = createSelector(
//   (state) => selectAuthSlice(state).token,
//   selectUser,
//   (token, user) => Boolean(token && user)
// );

// export default authSlice.reducer;
