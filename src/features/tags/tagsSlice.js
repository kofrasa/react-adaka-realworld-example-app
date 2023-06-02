import agent from '../../agent';
import { Status } from '../../common/utils';
import { update } from '../../store';

export const selectTags = { tags: '$tags.tags' };
export const selectIsLoading = {
  isLoading: { $eq: ['$tags.status', Status.LOADING] },
};

/**
 * @typedef {object}    TagsState
 * @property {Status}   status
 * @property {string[]} tags
 */

/**
 * Fetch all tags
 */
export const getAllTags = () => {
  return agent.cancellable(
    () => {
      update({ $set: { tags: { status: Status.LOADING } } });
      return agent.Tags.getAll();
    },
    ({ tags }) => {
      update({
        $set: { tags: { status: Status.SUCCESS, tags } },
      });
    }
  );
};

// /**
//  * Tags state
//  *
//  * @type {TagsState}
//  */
// const initialState = {
//   status: Status.IDLE,
//   tags: [],
// };

// const tagsSlice = createSlice({
//   name: 'tags',
//   initialState,
//   reducers: {},
//   extraReducers(builder) {
//     builder
//       .addCase(getAllTags.pending, (state) => {
//         state.status = Status.LOADING;
//       })
//       .addCase(getAllTags.fulfilled, (_, action) => ({
//         status: Status.SUCCESS,
//         tags: action.payload,
//       }));
//   },
// });

// /**
//  * Get tags slice
//  *
//  * @param {object} state
//  * @returns {TagsState}
//  */
// const selectTagsState = (state) => state.tags;

// /**
//  * Get tags from state
//  *
//  * @param {object} state
//  * @returns {string[]}
//  */
// export const selectTags = (state) => selectTagsState(state).tags;

// /**
//  * Is loading
//  *
//  * @param {object} state
//  * @returns {boolean}
//  */
// export const selectIsLoading = (state) =>
//   selectTagsState(state).status === Status.LOADING;

// export default tagsSlice.reducer;
