import agent from '../agent';
import { profilePageUnloaded } from './profile';
import { initialStates, select, update } from '../store';
import { countViewChange } from './common';

export const homePageUnloaded = () => {
  update({
    $set: {
      articleList: initialStates.articleList,
    },
  });
  countViewChange();
};

export const getAllArticles = ({ page, author, tag, favorited } = {}) => {
  return agent.cancellable(
    () => {
      const { articleList } = select({ articleList: 1 });
      return articleList.tab === 'feed'
        ? agent.Articles.feed(page)
        : agent.Articles.all({
            page: page ?? articleList.currentPage,
            author: author ?? articleList.author,
            tag: tag ?? articleList.tag,
            favorited: favorited ?? articleList.favorited,
            limit: articleList.articlesPerPage ?? 10,
          });
    },
    (payload) => {
      update({
        $set: {
          'articleList.articles': payload.articles,
          'articleList.articlesCount': payload.articlesCount,
          'articleList.currentPage': page ?? 0,
        },
      });
    }
  );
};

export const changeTab = (tab) => {
  update({ $set: { 'articleList.tab': tab ?? 'all' } });
  update({ $unset: { 'articleList.tag': '' } });
  return getAllArticles();
};

export const getFavoriteArticles = ({ username, page } = {}) => {
  return agent.cancellable(
    () => agent.Articles.favoritedBy(username, page),
    (payload) => {
      update({
        $set: {
          articleList: {
            articles: payload.articles,
            articlesCount: payload.articlesCount,
            currentPage: page ?? 0,
            favorited: username,
            articlesPerPage: 5,
          },
        },
      });
    }
  );
};

export const getArticlesByAuthor = ({ author, page } = {}) => {
  return agent.cancellable(
    () => agent.Articles.byAuthor(author, page),
    (payload) => {
      update({
        $set: {
          articleList: {
            articles: payload.articles,
            articlesCount: payload.articlesCount,
            currentPage: page ?? 0,
            author: author,
            articlesPerPage: 5,
          },
        },
      });
    }
  );
};

export const getArticlesByTag = ({ tag, page } = {}) => {
  return agent.cancellable(
    () => agent.Articles.byTag(tag, page),
    (payload) => {
      update({
        $set: {
          articleList: {
            articles: payload.articles,
            articlesCount: payload.articlesCount,
            currentPage: page ?? 0,
            tag: tag,
            articlesPerPage: 10,
          },
        },
      });
    }
  );
};

// favorite actions
const updateFavoriteArticle = ({ article }) => {
  update(
    {
      $set: {
        'articleList.articles.$[elem].favorited': article.favorited,
        'articleList.articles.$[elem].favoritesCount': article.favoritesCount,
      },
    },
    {
      arrayFilters: [{ 'elem.slug': article.slug }],
    }
  );
};

export const favoriteArticle = (slug) => {
  return agent.cancellable(
    () => agent.Articles.favorite(slug),
    updateFavoriteArticle
  );
};

export const unfavoriteArticle = (slug) => {
  return agent.cancellable(
    () => agent.Articles.unfavorite(slug),
    updateFavoriteArticle
  );
};
