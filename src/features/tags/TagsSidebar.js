import React, { memo, useEffect } from 'react';

import { getArticlesByTag } from '../../reducers/articleList';
import { getAllTags, selectIsLoading, selectTags } from './tagsSlice';
import { useSelector } from '../../store';

/**
 * Show all tags in the sidebar
 *
 * @example
 * <TagsSidebar />
 */
function TagsSidebar() {
  const { tags, isLoading } = useSelector({
    ...selectTags,
    ...selectIsLoading,
  });

  useEffect(() => getAllTags(), []);

  /**
   * Dispatch get all articles by a tag
   *
   * @param {String} tag
   * @returns {React.MouseEventHandler}
   */
  const handleClickTag = (tag) => () => {
    getArticlesByTag({ tag });
  };

  return (
    <div className="sidebar">
      <p>Popular Tags</p>

      <div className="tag-list">
        {isLoading ? (
          <p>Loading Tags...</p>
        ) : (
          tags.map((tag) => (
            <button
              type="button"
              className="tag-default tag-pill"
              key={tag}
              onClick={handleClickTag(tag)}
            >
              {tag}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default memo(TagsSidebar);
