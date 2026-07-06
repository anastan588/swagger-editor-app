'use client';

import React, { useSyncExternalStore } from 'react';

import { CodeEditor } from '@/app/components/CodeEditor';
import { SwaggerViewer } from '@/app/components/SwaggerViewer';

const subscribe = (callback: () => void) => {
  const mediaQuery = window.matchMedia('(orientation: portrait)');
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
};

export const EditorWorkspace: React.FC = () => {
  const isPortrait = useSyncExternalStore(
    subscribe,
    () => window.matchMedia('(orientation: portrait)').matches,
    () => false,
  );

  return (
    <div
      className={`flex gap-4 p-4 transition-all duration-300 w-full h-full min-h-0 ${
        isPortrait ? 'flex-col' : 'flex-row'
      }`}
    >
      <div
        className={`flex flex-col min-h-0 min-w-0 transition-all duration-300 flex-1 h-full ${
          isPortrait ? 'w-full h-[calc(50vh-40px)]' : 'w-1/2'
        }`}
      >
        <CodeEditor />
      </div>
      <div
        className={`flex flex-col min-h-0 min-w-0 transition-all duration-300 flex-1 h-full ${
          isPortrait ? 'w-full h-[calc(50vh-40px)]' : 'w-1/2'
        }`}
      >
        <SwaggerViewer />
      </div>
    </div>
  );
};
