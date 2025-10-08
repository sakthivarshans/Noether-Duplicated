'use client';
// This file is now a simple pass-through provider as authentication is removed.
import React from 'react';
export const FirebaseProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
