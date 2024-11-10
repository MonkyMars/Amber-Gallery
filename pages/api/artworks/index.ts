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
        const { title, date, place, description, image, categories } = req.body;

        if (!title || !date || !place || !description || !image || !categories) {
          return res.status(400).json({ 
            error: 'Missing required fields',
            message: 'All fields (title, date, place, description, image, category) are required',
            body: req.body
          });
        }
        const categoriesString = categories.map(cat => cat.name).join(', ');
        const result = await sql`
          INSERT INTO artworks (
            title, 
            date, 
            place, 
            description, 
            image_url, 
            category,
            user_id,
            created_at,
            updated_at,
            views
          )
          VALUES (
            ${title}, 
            ${date}, 
            ${place}, 
            ${description}, 
            ${image}, 
            ${categoriesString},
            ${req.user!.userId},
            NOW(),
            NOW(),
            0
          )
          RETURNING *
        `;
        return res.status(201).json(result.rows[0]);
      } catch (error) {
        console.error('Error creating artwork:', error);
        return res.status(500).json({ 
          message: 'Failed to create artwork', 
          error: error instanceof Error ? error.message : String(error)
        });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}

export default withAuth(handler);