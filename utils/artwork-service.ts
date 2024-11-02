import { sql } from '@vercel/postgres';

export type Artwork = {
  id: number;
  title: string;
  date: string;
  place: string;
  description: string;
  image_url: string;
  medium?: string;
  category?: string;
};

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