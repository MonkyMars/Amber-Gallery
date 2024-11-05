import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "../../styles/Login.module.css";
import { useRouter } from "next/router";
import { SetUser, type Credentials } from "../../utils/user-service";

const Login: NextPage = () => {
  const router = useRouter();
  const [credentials, setCredentials] = useState<Credentials>({
    email: "",
    password: "",
  });

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      if(response.ok) {
        SetUser(data.user, data.token);
        router.push('/user/dashboard');
      } else {
        alert(data.error || 'Invalid credentials');
      }
    } catch (error) {
      alert('An error occurred during login');
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Login - Amber Gallery</title>
        <meta name="description" content="Login to Amber Gallery" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className={styles.nav}>
        <div className={styles.logo}>Amber Gallery</div>
        <div className={styles.navLinks}>
          <Link href="/">Home</Link>
          <Link href="/gallery">Gallery</Link>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.loginCard}>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to manage your gallery</p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials({ ...credentials, email: e.target.value })
                }
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                required
              />
            </div>

            <div className={styles.forgotPassword}>
              <Link href="/forgot-password">Forgot password?</Link>
            </div>

            <button type="submit" className={styles.loginButton}>
              Sign In
            </button>
          </form>

          <div className={styles.registerPrompt}>
            <p>
              Don&apos;t have an account?{" "}
              <Link href="/register">Create an account</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;