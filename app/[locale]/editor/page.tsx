'use client';

import React, { useEffect, useState } from 'react';

import { CodeEditor } from '@/app/components/CodeEditor';
import { SwaggerViewer } from '@/app/components/SwaggerViewer';
import { useAuth } from '@/app/components/useAuth';
import { SchemaProvider } from '@/app/context/SchemaContext';

const EditorWorkspace: React.FC = () => {
  const { isAuthReady } = useAuth();

  const [isPortrait, setIsPortrait] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(orientation: portrait)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(orientation: portrait)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsPortrait(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (!isAuthReady) {
    return (
      <div className="flex flex-1 items-center justify-center bg-white dark:bg-black h-full w-full">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent dark:border-white" />
      </div>
    );
  }

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

const EditorPage = () => {
  return (
    <SchemaProvider>
      <div className="w-full h-[calc(100vh-64px-48px)] min-h-0 overflow-hidden bg-white dark:bg-black flex flex-col">
        <EditorWorkspace />
      </div>
    </SchemaProvider>
  );
};

export default EditorPage;
