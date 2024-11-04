import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useState } from "react";
import Link from 'next/link';

const Home: NextPage = () => {
  const [artworks, setArtworks] = useState([
    {
      id: 1,
      title: "Sunset at the Beach",
      date: "2023-06-15",
      place: "Santa Monica", 
      description: "A watercolor painting of the sunset over the ocean",
      imageUrl: "/images/sunset.jpg"
    },
    // Add more artwork entries as needed
  ]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Amber Gallery</title>
        <meta name="description" content="A gallery of beautiful artworks" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className={styles.nav}>
        <div className={styles.logo}>Amber Gallery</div>
        <div className={styles.navLinks}>
          <Link href="/gallery">Gallery</Link>
          <a href="#about">About</a>
          <Link href="/user/login">Login</Link>
        </div>
      </nav>

      <div className={styles.contentWrapper}>
        <aside className={styles.sidebar}>
          <button className={styles.actionButton}>Add New Artwork</button>
          <button className={styles.actionButton}>Sort by Date</button>
          <button className={styles.actionButton}>Filter by Location</button>
          <button className={styles.actionButton}>Export Gallery</button>
        </aside>

        <main className={styles.main}>
          <h1 className={styles.title}>My Art Gallery</h1>

          <div className={styles.grid}>
            {artworks.map((artwork) => (
              <div key={artwork.id} className={styles.card}>
                <div className={styles.imageContainer}>
                  <Image
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    width={300}
                    height={200}
                    objectFit="cover"
                  />
                </div>
                <h2>{artwork.title}</h2>
                <div className={styles.details}>
                  <p><strong>Date:</strong> {artwork.date}</p>
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
          </div>
          <div className={styles.footerSection}>
            <h3>Follow</h3>
          </div>
          <div className={styles.footerSection}>
            <button className={styles.subscribeButton}>Subscribe to Updates</button>
          </div>
        </div>
        <div className={styles.copyright}>
          © 2023 Amber Gallery. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
