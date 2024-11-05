import { useEffect } from "react";
import { useState } from "react";
import { getUser, IsLoggedIn, Logout, User } from "../../utils/user-service";
import { useRouter } from "next/router";
import React from 'react';

const Settings: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    if (!IsLoggedIn()) {
      router.push('/user/login');
    } else {
      setUser(getUser());
    }
  }, [router]);

  return <div>Settings</div>;
};

export default Settings;  