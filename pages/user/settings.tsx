import { useEffect } from "react";
import { useState } from "react";
import { getUser, IsLoggedIn, Logout, User } from "../../utils/user-service";
import { NextPage } from "next";
import { useRouter } from "next/router";

const Settings: NextPage = () => {
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