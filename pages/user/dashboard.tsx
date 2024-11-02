import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import styles from "../../styles/Dashboard.module.css";
import Link from "next/link";


const Dashboard: NextPage = () => {
  const [newArtwork, setNewArtwork] = useState({
    title: "",
    date: "",
    place: "",
    description: "",
    imageFile: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!newArtwork.imageFile) {
        throw new Error("Please select an image");
      }

      const imageUrl = newArtwork.imageFile;
      const response = await fetch('/api/artworks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...newArtwork,
          imageUrl,
          createdAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create artwork');
      }
      setNewArtwork({
        title: "",
        date: "",
        place: "",
        description: "",
        imageFile: null,
      });
      
      alert('Artwork added successfully!');
    } catch (error) {
      console.error('Error adding artwork:', error);
      alert(error.message || 'Failed to add artwork');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Dashboard - Amber Gallery</title>
        <meta name="description" content="Amber Gallery Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className={styles.nav}>
        <div className={styles.logo}>Amber Gallery Dashboard</div>
        <div className={styles.navLinks}>
          <Link href="/">View Gallery</Link>
          <Link href="/settings">Settings</Link>
          <button className={styles.logoutButton}>Logout</button>
        </div>
      </nav>

      <div className={styles.contentWrapper}>
        <aside className={styles.sidebar}>
          <div className={styles.menuItem}>
            <span className={styles.active}>Add Artwork</span>
          </div>
          <div className={styles.menuItem}>
            <span>Manage Artworks</span>
          </div>
          <div className={styles.menuItem}>
            <span>Analytics</span>
          </div>
          <div className={styles.menuItem}>
            <span>Messages</span>
          </div>
        </aside>

        <main className={styles.main}>
          <h1 className={styles.title}>Add New Artwork</h1>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3>Total Artworks</h3>
              <p className={styles.statNumber}>24</p>
            </div>
            <div className={styles.statCard}>
              <h3>This Month</h3>
              <p className={styles.statNumber}>3</p>
            </div>
            <div className={styles.statCard}>
              <h3>Views</h3>
              <p className={styles.statNumber}>1.2k</p>
            </div>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                value={newArtwork.title}
                onChange={(e) => setNewArtwork({ ...newArtwork, title: e.target.value })}
                required
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  value={newArtwork.date}
                  onChange={(e) => setNewArtwork({ ...newArtwork, date: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="place">Place</label>
                <input
                  type="text"
                  id="place"
                  value={newArtwork.place}
                  onChange={(e) => setNewArtwork({ ...newArtwork, place: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={newArtwork.description}
                onChange={(e) => setNewArtwork({ ...newArtwork, description: e.target.value })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="image">Artwork Image</label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={(e) => setNewArtwork({ 
                  ...newArtwork, 
                  imageFile: e.target.files ? e.target.files[0] : null 
                })}
                required
              />
            </div>

            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Artwork'}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
