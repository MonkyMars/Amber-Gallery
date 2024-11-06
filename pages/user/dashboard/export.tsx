import Image from 'next/image';
import styles from '../../../styles/user/dashboard/Export.module.scss';
import { getArtworks, type Artwork } from '../../../utils/artwork-service';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { NextPage } from 'next';
import html2canvas from 'html2canvas';
import { getUser, IsLoggedIn, Logout, User } from '../../../utils/user-service';
import Nav from '../../../components/Nav';
const ExportArtworks: NextPage = () => {
  const router = useRouter();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const exportRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    if (!IsLoggedIn()) {
      router.push('/user/login');
    } else {
      setUser(getUser());
    }
  }, [router]);

  useEffect(() => {
    const fetchArtworks = async () => {
      const data = await getArtworks();
      setArtworks(data);
    };
    fetchArtworks();
  }, []);

  const exportAsImage = async (artwork: Artwork) => {
    const element = exportRefs.current[artwork.id];
    if (!element) return;

    try {
      // Wait for background image to load
      await new Promise((resolve) => {
        const img = document.createElement('img');
        img.crossOrigin = "anonymous";  // Important for CORS
        img.onload = resolve;
        img.src = artwork.image_url;
      });

      const canvas = await html2canvas(element, {
        useCORS: true,  // Important for loading cross-origin images
        backgroundColor: null,
        scale: 2  // Increase quality of the output
      });

      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = image;
      link.download = `${artwork.title.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.click();
    } catch (error) {
      console.error('Error exporting image:', error);
    }
  };

  const exportAsJson = (artwork: Artwork) => {
    const jsonString = JSON.stringify(artwork, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${artwork.title.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
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
          <div className={styles.menuItem} onClick={() => router.push('/user/dashboard')}>
            <span>Add Artwork</span>
          </div>
          <div className={styles.menuItem} onClick={() => router.push('/user/dashboard/manage')}>
            <span>Manage Artworks</span>
          </div>
          <div className={styles.menuItem} onClick={() => router.push('/user/dashboard/analytics')}>
            <span>Analytics</span>
          </div>
          <div className={styles.menuItem} onClick={() => router.push('/user/dashboard/export')}>
            <span className={styles.active}>Export Gallery</span>
          </div>
        </aside>

        <main className={styles.main}>
          <h1>Export Gallery</h1>
          <div className={styles.exportContainer}>
            <select 
              className={styles.artworkSelect}
              onChange={(e) => {
                const artwork = artworks.find(a => a.id === parseInt(e.target.value));
                setSelectedArtwork(artwork || null);
              }}
              value={selectedArtwork?.id || ''}
            >
              <option value="" disabled>Select an artwork...</option>
              {artworks.map((artwork) => (
                <option key={artwork.id} value={artwork.id}>
                  {artwork.title}
                </option>
              ))}
            </select>

            {selectedArtwork && (
              <div className={styles.exportOptions}>
                <div 
                  ref={(el) => (exportRefs.current[selectedArtwork.id] = el)}
                  className={styles.exportCard}
                >
                  <div 
                    className={styles.exportBackground}
                    style={{ backgroundImage: `url(${selectedArtwork.image_url})` }}
                  />
                  <div className={styles.exportContent}>
                    <h2>{selectedArtwork.title}</h2>
                    <p>{new Date(selectedArtwork.date).toLocaleDateString()}</p>
                    <p>{selectedArtwork.place}</p>
                    <p>{selectedArtwork.description}</p>
                    <p>{selectedArtwork.category}</p>
                  </div>
                </div>
                <div className={styles.exportActions}>
                  <button 
                    className={styles.exportButton}
                    onClick={() => exportAsImage(selectedArtwork)}
                  >
                    Export As Image
                  </button>
                  <button 
                    className={styles.exportButton}
                    onClick={() => exportAsJson(selectedArtwork)}
                  >
                    Export As JSON
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ExportArtworks;
