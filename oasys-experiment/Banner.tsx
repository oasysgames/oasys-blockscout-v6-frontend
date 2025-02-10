import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import { getEnvValue } from 'configs/app/utils';
import { useAppContext } from 'lib/contexts/app';
import * as cookies from 'lib/cookies';

const Banner: React.FC = () => {
  const appProps = useAppContext();
  const [ isNavBarCollapsed, setIsNavBarCollapsed ] = useState<boolean | null>(null);
  const [ bannerImageUrl, setBannerImageUrl ] = useState<string | null>(null);

  useEffect(() => {
    const cookiesString = appProps.cookies;
    const isNavBarCollapsedCookie = cookies.get(cookies.NAMES.NAV_BAR_COLLAPSED, cookiesString);
    setIsNavBarCollapsed(isNavBarCollapsedCookie === 'true');

    // 環境変数をクライアント側で確定
    setBannerImageUrl(getEnvValue('NEXT_PUBLIC_BANNER_IMAGE_URL'));
  }, [ appProps.cookies ]);

  // マウント前はレンダリングしない
  if (isNavBarCollapsed === null || !bannerImageUrl) return null;

  return (
    <div style={{
      width: '100%',
      padding: '8px',
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      backgroundColor: 'transparent',
    }}>
      <Image
        src={ bannerImageUrl }
        alt="Banner"
        width={ 160 }
        height={ 80 }
        priority
        unoptimized
        style={{
          maxWidth: '160px',
          maxHeight: '80px',
          display: 'block',
        }}
      />
    </div>
  );
};

export default Banner;
