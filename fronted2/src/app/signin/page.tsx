

import React from 'react';
import { Authpage } from "@/components/Authpage";

export default function signin() {
  return (
    <div className="bg-gradient-to-br from-purple-900 to-purple-700 min-h-screen">
      <Authpage isSignin={true} />
    </div>
  );
}

