import Image from "next/image";
import styles from "../../../styles/user/dashboard/Manage.module.scss";
import {
  getManagedArtworks,
  type Artwork,
  deleteArtwork,
  updateArtwork,
  type EditingArtwork,
  type ManagedArtwork,
  Categories
} from "../../../utils/artwork-service";
import { getUser, IsLoggedIn, Logout, User } from '../../../utils/user-service';
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { NextPage } from "next";
import Nav from "../../../components/Nav";

const ManageArtworks: NextPage = () => {
  const router = useRouter();
  const [artworks, setArtworks] = useState<ManagedArtwork[]>([]);
  const [actionMenu, setActionMenu] = useState<number | null>(null);
  const [editingArtwork, setEditingArtwork] = useState<EditingArtwork | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    if (!IsLoggedIn()) {
      router.push('/user/login');
    } else {
      setUser(getUser());
    }
  }, [router]);

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

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this artwork?")) {
      await deleteArtwork(id);
      setArtworks(artworks.filter((art) => art.id !== id));
      setActionMenu(null);
    }
  };

  const handleEdit = (artwork: Artwork) => {
    const categoryArray = artwork.category 
      ? artwork.category.split(',').map(catName => ({
          name: catName.trim(),
          id: Categories.findIndex(cat => cat.name === catName.trim())
        }))
      : [];

    setEditingArtwork({
      ...artwork,
      categories: categoryArray
    });
    setActionMenu(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditingArtwork({ ...editingArtwork!, imageFile: file });
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingArtwork) {
      setIsSubmitting(true);
      try {
        let imageUrl = editingArtwork.image_url;

        if (editingArtwork.imageFile) {
          const base64 = await convertToBase64(editingArtwork.imageFile);
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ data: base64 }),
          });

          if (!uploadRes.ok) {
            const errorData = await uploadRes.json();
            throw new Error(errorData.message || 'Failed to upload image');
          }

          const { url } = await uploadRes.json();
          imageUrl = url;
        }

        const categoryString = editingArtwork.categories
          ? editingArtwork.categories.map(cat => cat.name).join(', ')
          : '';

        const artworkToUpdate: Artwork = {
          ...editingArtwork,
          image_url: imageUrl,
          category: categoryString
        };

        await updateArtwork(artworkToUpdate);
        setArtworks(
          artworks.map((art) =>
            art.id === editingArtwork.id 
              ? { 
                  ...artworkToUpdate, 
                  views: art.views, 
                  created_at: art.created_at, 
                  updated_at: new Date().toISOString() 
                } 
              : art
          )
        );
        setEditingArtwork(null);
        setImagePreview(null);
      } catch (error) {
        console.error("Error updating artwork:", error);
        alert(error instanceof Error ? error.message : "Failed to update artwork");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Dashboard - Amber Gallery</title>
        <meta name="description" content="Amber Gallery Dashboard" />
        <link rel="icon" href="/art-studies.png" />
      </Head>

      <Nav page="dashboard"/>

      <div className={styles.contentWrapper}>
        <aside className={styles.sidebar}>
          <div
            className={styles.menuItem}
            onClick={() => router.push("/user/dashboard")}
          >
            <span>Add Artwork</span>
          </div>
          <div
            className={styles.menuItem}
            onClick={() => router.push("/user/dashboard/manage")}
          >
            <span className={styles.active}>Manage Artworks</span>
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
          <h1 className={styles.title}>Manage Artworks <strong>({artworks?.length})</strong></h1>

{/*
        <div className={styles.filters}>
          <div className={styles.categorySelector}>
            <select
              value=""
              onChange={(e) => {
                const selectedValue = e.target.value;
                if (selectedValue && !selectedCategories.some(cat => cat.name === selectedValue)) {
                  const newCategory = {
                    name: selectedValue,
                    id: Categories.findIndex(cat => cat.name === selectedValue)
                  };
                  setSelectedCategories([...selectedCategories, newCategory]);
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

          {selectedCategories.length > 0 && (
            <div className={styles.selectedCategories}>
              {selectedCategories.length > 0 ? (
              <div className={styles.categoryTags}>
                {selectedCategories.map((cat, index) => (
                  <span key={index} className={styles.categoryTag} data-aos="fade-left">
                    {cat.name}
                    <button
                      type="button"
                      className={styles.removeCategory}
                      onClick={() => {
                        setSelectedCategories(
                          selectedCategories.filter((_, i) => i !== index)
                        );
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
          )}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title')}
            className={styles.filterSelect}
          >
            <option value="newest">Oldest First</option>
            <option value="oldest">Newest First</option>
            <option value="title">Title A-Z</option>
          </select>
        </div>
      </div>


*/}

          <div className={styles.artworksGrid}>
            {artworks.map((artwork) => (
              <div key={artwork.id} className={styles.artworkCard}>
                <div className={styles.imageWrapper}>
                  {artwork.image_url !== null && (
                    <>
                      <Image
                        src={artwork.image_url}
                        alt={artwork.title}
                        fill
                        style={{ objectFit: "cover" }}
                        className={styles.artworkImage}
                        priority={true}
                      />
                      <span className={styles.viewsCounter}>
                        <span>{artwork.views === 1 ? "1 view" : `${artwork.views} views`}</span>
                      </span>
                    </>
                  )}
                </div>
                <div className={styles.artworkInfo}>
                  <h2>{artwork.title}</h2>
                  <div className={styles.artworkDetails}>
                    <span>•</span>
                    <span>{new Date(artwork.date).toLocaleDateString()}</span>
                  </div>
                  <p className={styles.artworkDescription}>
                    {artwork.description}
                  </p>
                  <div className={styles.artworkMeta}>
                    <span className={styles.location}>{artwork.place}</span>
                    <button
                      className={styles.viewButton}
                      onClick={() => setActionMenu(!actionMenu ? artwork.id : null)}
                    >
                      Actions
                    </button>
                    {actionMenu === artwork.id && (
                      <div className={styles.actionMenu}>
                        <button onClick={() => handleEdit(artwork)}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(artwork.id)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {editingArtwork && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Edit Artwork</h2>
            <form onSubmit={handleUpdateSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  value={editingArtwork.title}
                  onChange={(e) =>
                    setEditingArtwork({
                      ...editingArtwork,
                      title: e.target.value,
                    })
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="image">Artwork Image</label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={styles.imageInput}
                />
                {imagePreview ? (
                  <div className={styles.imagePreview}>
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={200}
                      height={200}
                    />
                  </div>
                ) : (
                  editingArtwork?.image_url && (
                    <div className={styles.imagePreview}>
                      <Image
                        src={editingArtwork.image_url}
                        alt="Current"
                        width={200}
                        height={200}
                      />
                    </div>
                  )
                )}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={editingArtwork.description}
                  onChange={(e) =>
                    setEditingArtwork({
                      ...editingArtwork,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="place">Location</label>
                <input
                  type="text"
                  id="place"
                  value={editingArtwork.place}
                  onChange={(e) =>
                    setEditingArtwork({
                      ...editingArtwork,
                      place: e.target.value,
                    })
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="categories">Categories</label>
                <div className={styles.categorySelector}>
                  <select
                    id="categories"
                    value=""
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      if (selectedValue && !editingArtwork.categories?.some(cat => cat.name === selectedValue)) {
                        const newCategory = {
                          name: selectedValue,
                          id: Categories.findIndex(cat => cat.name === selectedValue)
                        };
                        setEditingArtwork({
                          ...editingArtwork,
                          categories: [...(editingArtwork.categories || []), newCategory]
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
                  {editingArtwork.categories?.length > 0 ? (
                    <div className={styles.categoryTags}>
                      {editingArtwork.categories.map((cat, index) => (
                        <span key={index} className={styles.categoryTag} data-aos="fade-left">
                          {cat.name}
                          <button
                            type="button"
                            className={styles.removeCategory}
                            onClick={() => {
                              setEditingArtwork({
                                ...editingArtwork,
                                categories: editingArtwork.categories.filter((_, i) => i !== index)
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
              <div className={styles.modalActions}>
                <button type="submit" className={styles.saveButton}>
                  Save Changes
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setEditingArtwork(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageArtworks;
