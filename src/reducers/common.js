import agent from '../agent';
import { getUser, setToken } from '../features/auth/authSlice';
import { update } from '../store';

export const redirectToHome = () => {
  update({ $set: { redirectTo: '/' } });
};

export const clearRedirect = () => {
  update({ $unset: { redirectTo: '' } });
};

export const countViewChange = () => {
  update({ $inc: { viewChangeCounter: 1 } });
};

// app actions
export const appLoad = (token) => {
  update({ $set: { appLoaded: true } });
  if (token) {
    agent.setToken(token);
    setToken(token);
    getUser();
  }
};
