import type { NextPage } from "next";
import Head from "next/head";
import { useState, useEffect } from "react";
import styles from "../../styles/user/Dashboard.module.scss";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { getUser, Logout, type User, IsLoggedIn } from "../../utils/user-service";
import { useTheme } from "../../utils/ThemeContext";
import { type Analytics } from "../../utils/artwork-service";
const Dashboard: NextPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    if (!IsLoggedIn()) {
      router.push('/user/login');
    } else {
      setUser(getUser());
    } 
  }, [router]);

  const [newArtwork, setNewArtwork] = useState({
    title: "",
    date: "",
    place: "",
    description: "",
    imageFile: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics>({ count: 0, views: 0 });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!newArtwork.imageFile) {
        throw new Error("Please select an image");
      }

      const base64 = await convertToBase64(newArtwork.imageFile);
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ data: base64 }),
      });
      
      const { url: imageUrl } = await uploadRes.json();

      const formData = {
        title: newArtwork.title,
        date: newArtwork.date,
        place: newArtwork.place,
        description: newArtwork.description,
        image: imageUrl,
        createdAt: new Date().toISOString()
      };

      const response = await fetch('/api/artworks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create artwork', { cause: response });
      }
      setNewArtwork({
        title: "",
        date: "",
        place: "",
        description: "",
        imageFile: null,
      });
      setImagePreview(null);
    } catch (error) {
      console.error('Error adding artwork:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewArtwork({ ...newArtwork, imageFile: file });
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };
  useEffect(() => {
    fetch('/api/artworks/analytics', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(error => console.error('Error fetching analytics:', error));
  }, []);

  const { theme, toggleTheme } = useTheme();

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
          <Link href="/gallery">View Gallery</Link>
          <Link href="/user/settings">Settings</Link>
          <button className={styles.logoutButton} onClick={() => Logout()}>Logout</button>
        </div>
      </nav>

      <div className={styles.contentWrapper}>
      <aside className={styles.sidebar}>
          <div className={styles.menuItem} onClick={() => router.push('/user/dashboard')}>
            <span className={styles.active}>Add Artwork</span>
          </div>
          <div className={styles.menuItem} onClick={() => router.push('/user/dashboard/manage')}>
            <span>Manage Artworks</span>
          </div>
          <div className={styles.menuItem} onClick={() => router.push('/user/dashboard/analytics')}>
            <span>Analytics</span>
          </div>
          <div className={styles.menuItem} onClick={() => router.push('/user/dashboard/export')}>
            <span>Export Gallery</span>
          </div>
        </aside>

        <main className={styles.main}>
          <h1 className={styles.title}>Add New Artwork</h1>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3>Total Artworks</h3>
              <p className={styles.statNumber}>{analytics.count}</p>
            </div>
            <div className={styles.statCard}>
              <h3>This Month</h3>
              <p className={styles.statNumber}>3</p>
            </div>
            <div className={styles.statCard}>
              <h3>Views</h3>
              <p className={styles.statNumber}>{analytics.views}</p>
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
                onChange={handleImageChange}
                required
                className={styles.imageInput}
              />
              {imagePreview && (
                <div className={styles.imagePreview}>
                  <Image src={imagePreview} alt="Preview" width={200} height={200} />
                </div>
              )}
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

      {/* <footer className={styles.footer}>
        <div className={styles.themeToggle}>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={theme === 'dark'}
              onChange={toggleTheme}
            />
            <span className={styles.slider}></span>
          </label>
          <span>{theme === 'dark' ? 'Dark' : 'Light'} Mode</span>
        </div>
      </footer> */}
    </div>
  );
};

export default Dashboard;
