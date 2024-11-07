import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import styles from "../styles/components/Nav.module.scss";
import { Logout } from "../utils/user-service";
import { useTheme } from "next-themes";

const Nav = ({page}) => {
  const router = useRouter();
  const [mounted, setMounted] = useState<boolean>(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.logo}>{page === "dashboard" && "Dashboard"}{ page === 'gallery' && "Gallery"} {page === 'home' && 'Home'}</div>
        <div className={styles.navLinks}>
          {/* Theme switcher */}
          {mounted && (
            <button
              className={styles.themeSwitch}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
          )}
          {page === "dashboard" || page === "home" && <Link href="/gallery">Gallery</Link>}
          {page !== "home" && <Link href="/">Home</Link>}
          {page === "dashboard" && <button className={styles.logoutButton} onClick={() => Logout()}>
            Logout
          </button>}
          {page !== "dashboard" && <Link href="/user/dashboard">Dashboard</Link>}
        </div>
      </nav>
    </>
  );
};

export default Nav;
