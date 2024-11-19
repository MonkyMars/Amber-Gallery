import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import styles from "../styles/Gallery.module.scss";
import { getArtworks, searchArtworks, type Artwork, incrementArtworkViews, Categories, Category } from '../utils/artwork-service';
import { getUser, IsLoggedIn, type User } from "../utils/user-service";
import { useRouter } from "next/router";
import Nav from "../components/Nav";
import AOS from "aos"
import "aos/dist/aos.css"

const Gallery: NextPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
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
      const categoryNames = selectedCategories.map(cat => cat.name);
      
      if (categoryNames?.length === 0) {
        const data = await searchArtworks(searchTerm, '');
        setArtworks(data);
      } else {
        const data = await searchArtworks(searchTerm, '');
        const filteredData = data.filter(artwork => {
          const artworkCategories = artwork?.category?.split(',').map(c => c.trim());
          return categoryNames?.some(category => 
            artworkCategories?.includes(category)
          );
        });
        setArtworks(filteredData);
      }
      setIsLoading(false);
    };

    const timeoutId = setTimeout(() => {
      fetchFilteredArtworks();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategories]);

  useEffect(() => {
    AOS.init({
      offset: 0, 
      duration: 400, 
      easing: 'ease-in-out',
      delay: 10,
      once: true,
    });
  }, []);
  
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

      <Nav page="gallery" />
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
