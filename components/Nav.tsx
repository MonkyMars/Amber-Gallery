import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import styles from "../styles/components/Nav.module.scss";
import { Logout } from "../utils/user-service";

const Nav = ({page}) => {
  const router = useRouter();
  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.logo}>Amber {page === "dashboard" ? "Dashboard" : "Gallery"}</div>
        <div className={styles.navLinks}>
          {page === "dashboard" || page === "home" && <Link href="/gallery">Gallery</Link>}
          {page !== "home" && <Link href="/">Home</Link>}
          <button className={styles.logoutButton} onClick={() => Logout()}>
            Logout
          </button>
        </div>
      </nav>
    </>
  );
};

export default Nav;
