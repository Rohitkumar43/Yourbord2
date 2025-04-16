


// SignUpPage.tsx
import React from 'react';
import { Authpage } from "@/components/Authpage";

export default function signUp() {
  return (
    <div className="bg-gradient-to-br from-purple-900 to-purple-700 min-h-screen">
      <Authpage isSignin={false} />
    </div>
  );
}
