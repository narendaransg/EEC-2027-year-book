'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function RouteTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || '/book';

  const isMap = pathname.startsWith('/map');
  const isJukebox = pathname.startsWith('/jukebox');
  const isRaven = pathname.startsWith('/raven');
  const isQuiz = pathname.startsWith('/quiz');

  const wrapperAnimClass = isMap
    ? 'anim-tome-unseal'
    : isJukebox
    ? 'anim-lantern-flare'
    : isRaven
    ? 'anim-wax-stamp'
    : isQuiz
    ? 'anim-forge-spark'
    : 'anim-tome-unseal';

  return (
    <div key={pathname} className={`relative ${wrapperAnimClass}`}>
      {isMap && (
        <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
          <img
            src="/assets/cloud-cluster-1.png"
            alt=""
            className="anim-cloud-left absolute top-8 left-0 w-[62vw] max-w-2xl object-contain opacity-90"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <img
            src="/assets/cloud-cluster-2.png"
            alt=""
            className="anim-cloud-right absolute top-24 right-0 w-[62vw] max-w-2xl object-contain opacity-90"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
      {children}
    </div>
  );
}
