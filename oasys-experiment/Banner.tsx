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
      padding: '10px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderRadius: '8px',
      marginTop: '10px',
    }}>
      <Image
        src={ bannerImageUrl }
        alt="Banner"
        width={ 200 }
        height={ 100 }
        style={{
          maxWidth: '200px',
          maxHeight: '100px',
          display: 'block',
        }}
      />
    </div>
  );
};

export default Banner;
