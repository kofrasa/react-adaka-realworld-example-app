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
