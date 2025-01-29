import React from 'react';
import Image from 'next/image';

// eslint-disable-next-line no-restricted-imports
import logoIcon from 'icons/networks/logo-placeholder.svg';

interface Props {
  w?: string;
  h?: string;
}

const ChartWatermarkIcon = ({ w = '162px', h = '15%' }: Props) => {
  return (
    <div
      style={{
        position: 'absolute',
        opacity: 0.1,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        width: w,
        height: h
      }}
    >
      <Image
        src={logoIcon}
        alt="Watermark"
        fill
        style={{ objectFit: 'contain' }}
      />
    </div>
  );
};

export default ChartWatermarkIcon;
