import agent from '../agent';
import { countViewChange, redirectToHome } from './common';
import { update, initialStates } from '../store';

export const articlePageUnloaded = () => {
  update({ $set: { article: initialStates.article } });
  countViewChange();
};

export const createArticle = (article) => {
  onInit();
  agent.Articles.create(article).then(onUpdateSuccess).catch(onUpdateError);
};

export const updateArticle = (article) => {
  onInit();
  agent.Articles.update(article).then(onUpdateSuccess).catch(onUpdateError);
};

export const getArticle = (slug) => {
  onInit();
  return agent.cancellable(
    () => agent.Articles.get(slug),
    (payload) => {
      update({
        $set: {
          'article.article': payload.article,
          'article.inProgress': false,
        },
      });
    },
    null,
    onComplete
  );
};

export const deleteArticle = (slug) => {
  onInit();
  agent.Articles.del(slug).then(redirectToHome).finally(onComplete);
};

function onInit() {
  update({ $set: { 'article.inProgress': true } });
}

function onUpdateSuccess(payload) {
  update({
    $set: {
      'article.inProgress': false,
      redirectTo: `/article/${payload.article.slug}`,
    },
  });
}

function onUpdateError(error) {
  update({
    $set: {
      'article.inProgress': false,
      'article.errors': error,
    },
  });
}

function onComplete() {
  update({ $set: { 'article.inProgress': false } });
}
