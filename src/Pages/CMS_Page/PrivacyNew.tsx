import React from 'react';
import { useAppSelector } from '../../Hooks/Hooks';

function PrivacyNew() {
  const privacy_policy = useAppSelector((state) => state.appConfig.config?.privacy_policy);

  return (
    <div className="w-screen min-h-screen px-4 py-8 bg-white text-black overflow-y-auto">
      <div
        className="  w-full  h-full"
        dangerouslySetInnerHTML={{ __html: privacy_policy || "<p></p>" }}
      />
    </div>
  );
}

export default PrivacyNew;
