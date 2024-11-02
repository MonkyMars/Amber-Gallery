import { sql } from '@vercel/postgres';
import { withAuth, AuthenticatedRequest } from '../../../lib/auth';
import { NextApiResponse } from 'next';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const {
    query: { id },
    method,
  } = req;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid artwork ID' });
  }

  switch (method) {
    case 'PUT':
      try {
        const { title, date, place, description, imageUrl } = req.body;
        const result = await sql`
          UPDATE artworks 
          SET title = ${title},
              date = ${date},
              place = ${place},
              description = ${description},
              image_url = ${imageUrl}
          WHERE id = ${id} AND user_id = ${req.user!.userId}
          RETURNING *
        `;
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Artwork not found' });
        }
        
        return res.status(200).json(result.rows[0]);
      } catch (error) {
        return res.status(500).json({ error: 'Failed to update artwork' });
      }

    case 'DELETE':
      try {
        const result = await sql`
          DELETE FROM artworks 
          WHERE id = ${id} AND user_id = ${req.user!.userId}
          RETURNING id
        `;
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Artwork not found' });
        }
        
        return res.status(200).json({ message: 'Artwork deleted successfully' });
      } catch (error) {
        return res.status(500).json({ error: 'Failed to delete artwork' });
      }

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}

export default withAuth(handler); 