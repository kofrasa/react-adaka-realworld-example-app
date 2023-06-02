import React, { memo } from 'react';

import ArticleList from '../ArticleList';
import { changeTab } from '../../reducers/articleList';
import { selectIsAuthenticated } from '../../features/auth/authSlice';
import { useSelector } from '../../store';

const selectCurrentTab = { currentTab: '$articleList.tab' };
const selectTag = { tag: '$articleList.tag' };

/**
 * Your feed tab
 *
 * @example
 * <YourFeedTab />
 */
function YourFeedTab() {
  const { currentTab, isAuthenticated } = useSelector({
    ...selectCurrentTab,
    ...selectIsAuthenticated,
  });
  const isActiveTab = currentTab === 'feed';

  if (!isAuthenticated) {
    return null;
  }

  const dispatchChangeTab = () => {
    changeTab('feed');
  };

  return (
    <li className="nav-item">
      <button
        type="button"
        className={isActiveTab ? 'nav-link active' : 'nav-link'}
        onClick={dispatchChangeTab}
      >
        Your Feed
      </button>
    </li>
  );
}

/**
 * Global feed tab
 *
 * @example
 * <GlobalFeedTab />
 */
function GlobalFeedTab() {
  const { currentTab } = useSelector(selectCurrentTab);
  const isActiveTab = currentTab === 'all';

  /**
   * Change to all tab
   * @type{React.MouseEventHandler}
   */
  const dispatchChangeTab = () => {
    changeTab('all');
  };

  return (
    <li className="nav-item">
      <button
        type="button"
        className={isActiveTab ? 'nav-link active' : 'nav-link'}
        onClick={dispatchChangeTab}
      >
        Global Feed
      </button>
    </li>
  );
}

/**
 * Tag tab
 *
 * @example
 * <TagFilterTab />
 */
function TagFilterTab() {
  const { tag } = useSelector(selectTag);

  if (!tag) {
    return null;
  }

  return (
    <li className="nav-item">
      <button type="button" className="nav-link active">
        <i className="ion-pound" /> {tag}
      </button>
    </li>
  );
}

/**
 * Show the tab navigation and the list of articles
 *
 * @example
 * <MainView />
 */
function MainView() {
  return (
    <div className="col-md-9">
      <div className="feed-toggle">
        <ul className="nav nav-pills outline-active">
          <YourFeedTab />

          <GlobalFeedTab />

          <TagFilterTab />
        </ul>
      </div>

      <ArticleList />
    </div>
  );
}

export default memo(MainView);
