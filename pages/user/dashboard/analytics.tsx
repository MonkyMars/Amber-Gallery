import Image from 'next/image';
import styles from '../../../styles/user/dashboard/Analytics.module.scss';
import { getManagedArtworks, type ManagedArtwork } from '../../../utils/artwork-service';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { NextPage } from 'next';
import { getUser, IsLoggedIn, Logout, User } from '../../../utils/user-service';
import Nav from '../../../components/Nav';
const AnalyticsArtworks: NextPage = () => {
  const router = useRouter();
  const [artworks, setArtworks] = useState<ManagedArtwork[]>([]);
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
      try {
        const data = await getManagedArtworks();
        setArtworks(data);
      } catch (error) {
        console.error('Error fetching artworks:', error);
        setArtworks([]);
      }
    };
    fetchArtworks();
  }, []);
  
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
            <span className={styles.active}>Analytics</span>
          </div>
          <div className={styles.menuItem} onClick={() => router.push('/user/dashboard/export')}>
            <span>Export Gallery</span>
          </div>
        </aside>

        <main className={styles.main}>
          <h1>Analytics</h1>
          <div className={styles.analyticsContainer}>
            <div className={styles.analyticsGrid}>
              <div className={styles.analyticsCard}>
                <h3>Overview</h3>
                <p>Total Artworks: {artworks.length}</p>
                <p>Total Views: {artworks.reduce((acc, curr) => acc + curr.views, 0)}</p>
                <p>Average Views: {(artworks.reduce((acc, curr) => acc + curr.views, 0) / artworks.length).toFixed(1)}</p>
              </div>
              
              <div className={styles.analyticsCard}>
                <h3>Most Popular</h3>
                {artworks.length > 0 ? (
                  <>
                    <p>Most Viewed: {artworks.sort((a, b) => b.views - a.views)[0]?.title || 'N/A'}</p>
                    <p>Views: {artworks.sort((a, b) => b.views - a.views)[0]?.views || 0}</p>
                  </>
                ) : (
                  <>
                    <p>Most Viewed: N/A</p>
                    <p>Views: 0</p>
                  </>
                )}
              </div>

              <div className={styles.analyticsCard}>
                <h3>Categories</h3>
                <p>Total Categories: {new Set(artworks.map(art => art.category)).size}</p>
                <p>Most Common: {
                  artworks.length > 0 
                    ? Object.entries(
                        artworks.reduce((acc, curr) => {
                          acc[curr.category] = (acc[curr.category] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).sort((a, b) => b[1] - a[1])[0][0]
                    : 'N/A'
                }</p>
              </div>

              <div className={styles.analyticsCard}>
                <h3>Recent Activity</h3>
                <p>Latest Addition: {
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
                <p>Last Updated: {
                  artworks.length > 0 
                    ? (() => {
                        const mostRecent = artworks.reduce((latest, art) => {
                          if (!art.updated_at) return latest;
                          const artDate = new Date(art.updated_at);
                          if (!latest) return artDate;
                          return artDate > latest ? artDate : latest;
                        }, null as Date | null);
                        return mostRecent 
                          ? `${mostRecent.toLocaleDateString()}, ${mostRecent.toLocaleTimeString().slice(0, 5)}`
                          : 'N/A';
                      })()
                    : 'N/A'
                }</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AnalyticsArtworks;
