import type { NextPage } from "next";
import Head from "next/head";
import { useState, useEffect } from "react";
import styles from "../../styles/user/Dashboard.module.scss";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import AOS from "aos"
import "aos/dist/aos.css"
import {
  getUser,
  Logout,
  type User,
  IsLoggedIn,
} from "../../utils/user-service";

import { type ManagedArtwork, type Analytics, type Category, getManagedArtworks, Categories } from "../../utils/artwork-service";
import Nav from "../../components/Nav";
const Dashboard: NextPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    AOS.init({
      offset: 0, 
      duration: 400, 
      easing: 'ease-in-out',
      delay: 10,
      once: true,
    });
  }, []);
  useEffect(() => {
    if (!IsLoggedIn()) {
      router.push("/user/login");
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
    categories: [] as Category[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics>({ count: 0, views: 0 });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [artworks, setArtworks] = useState<ManagedArtwork[]>([]);
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  useEffect(() => {
    getManagedArtworks().then(setArtworks);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!newArtwork.imageFile) {
        throw new Error("Please select an image");
      }

      const base64 = await convertToBase64(newArtwork.imageFile);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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
        categories: newArtwork.categories,
        createdAt: new Date().toISOString(),
      };

      const response = await fetch("/api/artworks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create artwork", { cause: response });
      }
      if(response.status === 401){
        Logout();
        router.push("/user/login");
      }
      setNewArtwork({
        title: "",
        date: "",
        place: "",
        description: "",
        imageFile: null,
        categories: [],
      });
      setImagePreview(null);
    } catch (error) {
      console.error("Error adding artwork:", error);
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
    fetch("/api/artworks/analytics", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setAnalytics(data))
      .catch((error) => console.error("Error fetching analytics:", error));
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Dashboard - Amber Gallery</title>
        <meta name="description" content="Amber Gallery Dashboard" />
        <link rel="icon" href="/art-studies.png" />
      </Head>

      <Nav page="dashboard" />

      <div className={styles.contentWrapper} style={{ zIndex: "1" }}>
        <aside className={styles.sidebar}>
          <div
            className={styles.menuItem}
            onClick={() => router.push("/user/dashboard")}
          >
            <span className={styles.active}>Add Artwork</span>
          </div>
          <div
            className={styles.menuItem}
            onClick={() => router.push("/user/dashboard/manage")}
          >
            <span>Manage Artworks</span>
          </div>
          <div
            className={styles.menuItem}
            onClick={() => router.push("/user/dashboard/analytics")}
          >
            <span>Analytics</span>
          </div>
          <div
            className={styles.menuItem}
            onClick={() => router.push("/user/dashboard/export")}
          >
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
              <h3>Last Added</h3>
              <p className={styles.statNumber}>{
                  artworks.length > 0 
                    ? (() => {
                        const mostRecent = artworks.reduce((latest, art) => {
                          if (!art.created_at) return latest;
                          const artDate = new Date(art.created_at);
                          if (!latest) return artDate;
                          return artDate > latest ? artDate : latest;
                        }, null as Date | null);
                        return mostRecent ? mostRecent.toLocaleDateString() : 'N/A';
                      })()
                    : 'N/A'
                }</p>
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
                onChange={(e) =>
                  setNewArtwork({ ...newArtwork, title: e.target.value })
                }
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
                  onChange={(e) =>
                    setNewArtwork({ ...newArtwork, date: e.target.value })
                  }
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="place">Place</label>
                <input
                  type="text"
                  id="place"
                  value={newArtwork.place}
                  onChange={(e) =>
                    setNewArtwork({ ...newArtwork, place: e.target.value })
                  }
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="category">Categories</label>
                <div className={styles.categorySelector}>
                  <select
                    id="category"
                    value=""
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      if (selectedValue && !newArtwork.categories.some(cat => cat.name === selectedValue)) {
                        const newCategory = {
                          name: selectedValue,
                          id: Categories.findIndex(cat => cat.name === selectedValue)
                        };
                        setNewArtwork({
                          ...newArtwork,
                          categories: [...newArtwork.categories, newCategory]
                        });
                      }
                      e.target.value = '';
                    }}
                    className={styles.categorySelect}
                  >
                    <option value="">Select a category</option>
                    {Categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.selectedCategories}>
                  <p>Selected categories:</p>
                  {newArtwork.categories.length > 0 ? (
                    <div className={styles.categoryTags}>
                      {newArtwork.categories.map((cat, index) => (
                        <span key={index} className={styles.categoryTag} data-aos="fade-left">
                          {cat.name}
                          <button
                            type="button"
                            className={styles.removeCategory}
                            onClick={() => {
                              setNewArtwork({
                                ...newArtwork,
                                categories: newArtwork.categories.filter((_, i) => i !== index)
                              });
                            }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className={styles.noCategoriesText}>No categories selected</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={newArtwork.description}
                onChange={(e) =>
                  setNewArtwork({ ...newArtwork, description: e.target.value })
                }
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
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={200}
                    height={200}
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Artwork"}
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
