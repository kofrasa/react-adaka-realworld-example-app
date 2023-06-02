import React, { memo } from 'react';

import { getAllArticles } from '../reducers/articleList';
import { useSelector } from '../store';

/**
 * Show a list with the available pages
 *
 * @example
 * <ListPagination />
 */
function ListPagination() {
  const { articlesCount, currentPage, articlesPerPage } = useSelector({
    articlesCount: '$articleList.articlesCount',
    currentPage: '$articleList.currentPage',
    articlesPerPage: '$articleList.articlesPerPage',
  });

  if (articlesCount <= articlesPerPage) {
    return null;
  }

  const pages = Array.from(
    { length: Math.ceil(articlesCount / articlesPerPage) },
    (_, number) => number
  );

  const handleClickPage = (page) => () => {
    getAllArticles({ page });
  };

  return (
    <nav>
      <ul className="pagination">
        {pages.map((page) => {
          const isActivePage = page === currentPage;

          return (
            <li
              className={isActivePage ? 'page-item active' : 'page-item'}
              onClick={handleClickPage(page)}
              key={page.toString()}
            >
              <button type="button" className="page-link">
                {page + 1}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default memo(ListPagination);
