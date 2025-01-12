import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useState } from "react";
import { useRouter } from "next/router";
import { getArtworks, type Artwork } from "../utils/artwork-service";
import { getUser, IsLoggedIn, type User } from "../utils/user-service";
import { useEffect } from "react";
import Link from "next/link";
import Nav from "../components/Nav";
const Home: NextPage = () => {
  const router = useRouter();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (IsLoggedIn()) {
      setUser(getUser());
    }
  }, []);

  useEffect(() => {
    const loadArtworks = async () => {
      setIsLoading(true);
      const data = await getArtworks();
      setArtworks(data);
      setIsLoading(false);
    };
    loadArtworks();
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Amber Gallery</title>
        <meta name="description" content="A gallery of beautiful artworks" />
        <link rel="icon" href="/art-studies.png" />
      </Head>

      <Nav page="home" />
      <div className={styles.contentWrapper}>
        <aside className={styles.sidebar}>
          {user && user.email === 'ambergijselhart@gmail.com' && user.id === 1 && <button className={styles.actionButton} onClick={() => router.push('/user/dashboard')}>Add New Artwork</button>}
        </aside>

        <main className={styles.main}>
          <h1 className={styles.title}>{`Amber's Gallery`}</h1>

          <div className={styles.grid}>
            {artworks.slice(0, 3).map((artwork) => (
              <div key={artwork.id} className={styles.card}>
                <div className={styles.imageContainer}>
                {artwork.image_url !== null && <Image
                    src={artwork.image_url}
                    alt={artwork.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    className={styles.artworkImage}
                    priority={true}
                    unoptimized
                  />}
                </div>
                <h2>{artwork.title}</h2>
                <div className={styles.details}>
                  <p><strong>Date:</strong> {new Date(artwork.date).toLocaleDateString()}</p>
                  <p><strong>Place:</strong> {artwork.place}</p>
                  <p>{artwork.description}</p>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3>Contact</h3>
            <p>Contact person: Levi</p>
            <p>Email: levi.laptop@gmail.com</p>
            <p>Owner: Amber</p>
          </div>
        </div>
        <div className={styles.copyright}>
          © 2024 Amber Gallery. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
