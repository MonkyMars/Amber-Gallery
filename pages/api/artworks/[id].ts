import { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    if (req.method === 'DELETE') {
      await sql`DELETE FROM artworks WHERE id = ${Number(id)}`;
      res.status(200).json({ message: 'Artwork deleted successfully' });
    } else if (req.method === 'PUT') {
      const { title, description, date, place, image_url, category } = req.body;
      const result = await sql`
        UPDATE artworks 
        SET title = ${title}, 
            description = ${description}, 
            date = ${date}, 
            place = ${place}, 
            image_url = ${image_url},
            category = ${category}
        WHERE id = ${Number(id)}
        RETURNING *
      `;
      res.status(200).json(result.rows[0]);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error', error: error });
  }
} 