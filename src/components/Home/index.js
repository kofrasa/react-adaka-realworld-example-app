import React, { memo, useEffect } from 'react';

import { changeTab, homePageUnloaded } from '../../reducers/articleList';
import Banner from './Banner';
import MainView from './MainView';
import TagsSidebar from '../../features/tags/TagsSidebar';
import { selectIsAuthenticated } from '../../features/auth/authSlice';
import { useSelector } from '../../store';

/**
 * Home screen component
 *
 * @example
 * <Home />
 */
function Home() {
  const { isAuthenticated } = useSelector(selectIsAuthenticated);

  useEffect(() => {
    const defaultTab = isAuthenticated ? 'feed' : 'all';
    const fetchArticlesAbort = changeTab(defaultTab);

    return () => {
      homePageUnloaded();
      fetchArticlesAbort();
    };
  }, []);

  return (
    <div className="home-page">
      <Banner />

      <div className="container page">
        <div className="row">
          <MainView />

          <div className="col-md-3">
            <TagsSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(Home);
