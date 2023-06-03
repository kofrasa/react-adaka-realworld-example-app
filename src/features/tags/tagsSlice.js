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
