import agent from '../agent';
import { update } from '../store';
import { countViewChange } from './common';

export const profilePageUnloaded = () => {
  countViewChange();
};

export const follow = (username) => {
  return agent.cancellable(() => agent.Profile.follow(username), onSuccess);
};

export const unfollow = (username) => {
  return agent.cancellable(() => agent.Profile.unfollow(username), onSuccess);
};

export const getProfile = (username) => {
  return agent.cancellable(() => agent.Profile.get(username), onSuccess);
};

function onSuccess({ profile }) {
  update({ $set: { profile } });
}

// export const getProfile = createAsyncThunk(
//   'profile/getProfile',
//   agent.Profile.get
// );

// export const follow = createAsyncThunk('profile/follow', agent.Profile.follow);

// export const unfollow = createAsyncThunk(
//   'profile/unfollow',
//   agent.Profile.unfollow
// );

// const profileSlice = createSlice({
//   name: 'profile',
//   initialState: {},
//   reducers: {
//     profilePageUnloaded: () => ({}),
//   },
//   extraReducers: (builder) => {
//     const successCaseReducer = (_, action) => ({
//       ...action.payload.profile,
//     });

//     builder.addCase(getProfile.fulfilled, successCaseReducer);
//     builder.addCase(follow.fulfilled, successCaseReducer);
//     builder.addCase(unfollow.fulfilled, successCaseReducer);
//   },
// });

// export const { profilePageUnloaded } = profileSlice.actions;

// export default profileSlice.reducer;
