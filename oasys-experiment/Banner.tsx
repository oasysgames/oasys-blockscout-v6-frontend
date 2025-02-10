import Image from 'next/image';
import React from 'react';

import { getEnvValue } from 'configs/app/utils';
import { useAppContext } from 'lib/contexts/app';
import * as cookies from 'lib/cookies';

const Banner: React.FC = () => {
  const appProps = useAppContext();
  const cookiesString = appProps.cookies;
  const isNavBarCollapsedCookie = cookies.get(cookies.NAMES.NAV_BAR_COLLAPSED, cookiesString);
  const isNavBarCollapsed = isNavBarCollapsedCookie === 'true';

  const bannerImageUrl = getEnvValue('NEXT_PUBLIC_BANNER_IMAGE_URL');

  if (!bannerImageUrl || isNavBarCollapsed) return null;

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
