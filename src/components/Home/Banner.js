import React, { memo } from 'react';
import { selectIsAuthenticated } from '../../features/auth/authSlice';
import { useSelector } from '../../store';

/**
 * Shows a banner for new users
 *
 * @example
 * <Banner />
 */
function Banner() {
  const { appName, isAuthenticated } = useSelector({
    appName: 1,
    ...selectIsAuthenticated,
  });

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="banner">
      <div className="container">
        <h1 className="logo-font">{appName.toLowerCase()}</h1>
        <p>A place to share your knowledge.</p>
      </div>
    </div>
  );
}

export default memo(Banner);
