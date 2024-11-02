import { sql } from '@vercel/postgres';
import { withAuth, AuthenticatedRequest } from '../../../lib/auth';
import { NextApiResponse } from 'next';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const result = await sql`
          SELECT * FROM artworks 
          ORDER BY created_at DESC
        `;
        return res.status(200).json(result.rows);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch artworks' });
      }

    case 'POST':
      try {
        const { title, date, place, description, imageUrl } = req.body;
        const result = await sql`
          INSERT INTO artworks (title, date, place, description, image_url, user_id)
          VALUES (${title}, ${date}, ${place}, ${description}, ${imageUrl}, ${req.user!.userId})
          RETURNING *
        `;
        return res.status(201).json(result.rows[0]);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to create artwork' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}

export default withAuth(handler); 