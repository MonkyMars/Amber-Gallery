import { sql } from '@vercel/postgres';

export type Artwork = {
  id: number;
  title: string;
  date: string;
  place: string;
  description: string;
  image_url: string;
  category?: string;
};

export interface EditingArtwork extends Artwork {
  imageFile?: File;
  imagePreview?: string;
}

export interface ManagedArtwork extends Artwork { 
  views: number;
  created_at: string;
  updated_at: string;
}

export type Analytics = {
  count: number;
  views: number;
}

export type Category = {
  id: number;
  name: string;
}

interface CategoryType extends Category {
  description: string;
}

export const Categories: CategoryType[] = [
  { id: 0, name: 'Digital', description: 'All artworks that are digital' },
  { id: 1, name: 'Drawings', description: 'All artworks that are drawings' },
  { id: 2, name: 'School', description: 'Artworks created for school' },
  { id: 3, name: 'Personal', description: 'Personal artworks' },
  { id: 4, name: 'Print', description: 'Print' },
  { id: 5, name: 'Mixed Media', description: 'Mixed Media' },
  { id: 6, name: '3D artworks', description: '3D artworks' },
  { id: 7, name: 'Photography', description: 'All artworks that are photography' },
  { id: 8, name: 'Other', description: 'Other' },
];

export async function getArtworks(): Promise<Artwork[]> {
  try {
    const { rows } = await sql`
      SELECT * FROM artworks
      ORDER BY date DESC
    `;
    return rows as Artwork[];
  } catch (error) {
    console.error('Error fetching artworks:', error);
    return [];
  }
}

export async function getManagedArtworks(): Promise<ManagedArtwork[]> {
  try {
    const { rows } = await sql`
      SELECT * FROM artworks
      ORDER BY date DESC
    `;
    return rows as ManagedArtwork[];
  } catch (error) {
    console.error('Error fetching artworks:', error);
    return [];
  }
}

export async function searchArtworks(
  searchTerm?: string,
  category?: string
): Promise<Artwork[]> {
  try {
    if (searchTerm && category && category !== 'all') {
      const { rows } = await sql`
        SELECT * FROM artworks
        WHERE (
          LOWER(title) LIKE ${`%${searchTerm.toLowerCase()}%`} OR
          LOWER(description) LIKE ${`%${searchTerm.toLowerCase()}%`} OR
          LOWER(place) LIKE ${`%${searchTerm.toLowerCase()}%`}
        )
        AND LOWER(category) = ${category.toLowerCase()}
      `;
      return rows as Artwork[];
    } else if (searchTerm) {
      const { rows } = await sql`
        SELECT * FROM artworks
        WHERE 
          LOWER(title) LIKE ${`%${searchTerm.toLowerCase()}%`} OR
          LOWER(description) LIKE ${`%${searchTerm.toLowerCase()}%`} OR
          LOWER(place) LIKE ${`%${searchTerm.toLowerCase()}%`}
      `;
      return rows as Artwork[];
    } else if (category && category !== 'all') {
      const { rows } = await sql`
        SELECT * FROM artworks
        WHERE LOWER(category) = ${category.toLowerCase()}
      `;
      return rows as Artwork[];
    }
    
    const { rows } = await sql`SELECT * FROM artworks`;
    return rows as Artwork[];
  } catch (error) {
    console.error('Error searching artworks:', error);
    return [];
  }
}

export const deleteArtwork = async (id: number): Promise<void> => {
  const response = await fetch(`/api/artworks/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete artwork');
  }
};

export const updateArtwork = async (artwork: Artwork): Promise<Artwork> => {
  const response = await fetch(`/api/artworks/${artwork.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(artwork),
  });

  if (!response.ok) {
    throw new Error('Failed to update artwork');
  }

  return response.json();
};

export const incrementArtworkViews = async (artworkId: number): Promise<void> => {
  try {
    await sql`
      UPDATE artworks 
      SET views = COALESCE(views, 0) + 1 
      WHERE id = ${artworkId}
    `;
  } catch (error) {
    console.error('Error incrementing views:', error);
  }
};