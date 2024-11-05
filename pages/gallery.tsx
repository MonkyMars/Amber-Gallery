import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import styles from "../styles/Gallery.module.scss";
import { getArtworks, searchArtworks, type Artwork, incrementArtworkViews } from '../utils/artwork-service';
import { getUser, IsLoggedIn, type User } from "../utils/user-service";
import { useRouter } from "next/router";
import { useTheme } from '../utils/ThemeContext';
const Gallery: NextPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const loadArtworks = async () => {
      setIsLoading(true);
      const data = await getArtworks();
      setArtworks(data);
      setIsLoading(false);
    };
    
    loadArtworks();
  }, []);

  useEffect(() => {
    const fetchFilteredArtworks = async () => {
      setIsLoading(true);
      const data = await searchArtworks(searchTerm, selectedCategory);
      setArtworks(data);
      setIsLoading(false);
    };

    const timeoutId = setTimeout(() => {
      fetchFilteredArtworks();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory]);

  // Modify the filteredAndSortedArtworks to only handle sorting
  const filteredAndSortedArtworks = useMemo(() => {
    return [...artworks].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }, [artworks, sortBy]);

  // Get unique categories from artworks
  const categories = useMemo(() => {
    const uniqueCategories = new Set(artworks.map(artwork => artwork.category).filter(Boolean));
    return ["all", ...Array.from(uniqueCategories)] as string[];
  }, [artworks]);

  // Debounced search handler
  const debouncedSetSearchTerm = useMemo(
    () => debounce((value: string) => setSearchTerm(value), 300),
    []
  );


  useEffect(() => {
    if (IsLoggedIn()) {
      setUser(getUser());
    } else {
      setUser(null);
    } 
  }, [])

  const handleViewDetails = async (artwork: Artwork) => {
    try {
      await incrementArtworkViews(artwork.id);
      setSelectedArtwork(artwork);
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Amber Gallery</title>
        <meta name="description" content="Browse Amber's artwork collection" />
        <link rel="icon" href="/art-studies.png" />
      </Head>

      <nav className={styles.nav}>
        <div className={styles.logo} onClick={() => router.push('/')}>Amber Gallery</div>
        <div className={styles.navLinks}>
          <Link href="/">Home</Link>
          {user && user.email === 'ambergijselhart@gmail.com' && user.id === 1 && <Link href="/user/dashboard">Dashboard</Link>}
          {!user && <Link href="/user/login">Login</Link>}
        </div>
      </nav>

      <div className={styles.topBar}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search artworks..."
            onChange={(e) => debouncedSetSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filters}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.filterSelect}
          >
            {categories.map((category) => (
              <option key={category} value={category.toLowerCase()}>
                {category === "all" ? "All Categories" : category}
              </option>
            ))}
          </select>

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

      <main className={styles.main}>
        <div className={styles.galleryGrid}>
          {isLoading ? (
            <div className={styles.loading}>Loading...</div>
          ) : filteredAndSortedArtworks.length > 0 ? (
            filteredAndSortedArtworks.map((artwork) => (
              <div key={artwork.id} className={styles.artworkCard}>
                <div className={styles.imageWrapper}>
                  {artwork.image_url !== null && <Image
                    src={artwork.image_url}
                    alt={artwork.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    className={styles.artworkImage}
                    priority={true}
                  />}
                </div>
                <div className={styles.artworkInfo}>
                  <h2>{artwork.title}</h2>
                  <div className={styles.artworkDetails}>
                    <span>•</span>
                    <span>{new Date(artwork.date).toLocaleDateString()}</span>
                  </div>
                  <p className={styles.artworkDescription}>{artwork.description}</p>
                  <div className={styles.artworkMeta}>
                    <span className={styles.location}>{artwork.place}</span>
                    <button 
                      className={styles.viewButton}
                      onClick={() => handleViewDetails(artwork)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noResults}>
              <p>No artworks found matching your criteria</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {selectedArtwork && (
        <div className={styles.modalOverlay} onClick={() => setSelectedArtwork(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button 
              className={styles.closeButton}
              onClick={() => setSelectedArtwork(null)}
            >
              ×
            </button>
            <div className={styles.modalContent}>
              <div className={styles.modalImageWrapper}>
                {selectedArtwork.image_url && (
                  <Image
                    src={selectedArtwork.image_url}
                    alt={selectedArtwork.title}
                    fill
                    style={{ objectFit: 'contain' }}
                    priority={true}
                  />
                )}
              </div>
              <div className={styles.modalInfo}>
                <h2>{selectedArtwork.title}</h2>
                <div className={styles.modalDetails}>
                  <p><strong>Date:</strong> {new Date(selectedArtwork.date).toLocaleDateString()}</p>
                  <p><strong>Location:</strong> {selectedArtwork.place}</p>
                  <p><strong>Category:</strong> {selectedArtwork.category}</p>
                </div>
                <p className={styles.modalDescription}>{selectedArtwork.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

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
          <span className={styles.themeLabel}>
            {theme === 'dark' ? 'Dark' : 'Light'} Mode
          </span>
        </div>
      </footer> */}
    </div>
  );
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default Gallery;
