import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import styles from "../styles/Gallery.module.css";
import { getArtworks, searchArtworks, type Artwork } from '../utils/artwork-service';

interface ArtworkProps {
  id: number;
  title: string;
  date: string;
  place: string;
  description: string;
  image_url: string;
  medium?: string;
  category?: string;
}


const Gallery: NextPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Replace the static artworks array with useEffect to fetch data
  useEffect(() => {
    const loadArtworks = async () => {
      setIsLoading(true);
      const data = await getArtworks();
      setArtworks(data);
      setIsLoading(false);
    };
    
    loadArtworks();
  }, []);

  // Modify the search/filter logic to use the API
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

  return (
    <div className={styles.container}>
      <Head>
        <title>Gallery - Amber Gallery</title>
        <meta name="description" content="Browse Amber's artwork collection" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className={styles.nav}>
        <div className={styles.logo}>Amber Gallery</div>
        <div className={styles.navLinks}>
          <Link href="/">Home</Link>
          <Link href="#about">About</Link>
          <Link href="/user/login">Login</Link>
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
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
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
                  <Image
                    src={artwork.image_url}
                    alt={artwork.title}
                    layout="fill"
                    objectFit="cover"
                    className={styles.artworkImage}
                  />
                </div>
                <div className={styles.artworkInfo}>
                  <h2>{artwork.title}</h2>
                  <div className={styles.artworkDetails}>
                    <span>{artwork.medium}</span>
                    <span>•</span>
                    <span>{artwork.date}</span>
                  </div>
                  <p className={styles.artworkDescription}>{artwork.description}</p>
                  <div className={styles.artworkMeta}>
                    <span className={styles.location}>{artwork.place}</span>
                    <button className={styles.viewButton}>View Details</button>
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
