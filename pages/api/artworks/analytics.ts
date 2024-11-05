import { sql } from '@vercel/postgres';
import { withAuth, AuthenticatedRequest } from '../../../lib/auth';
import { NextApiResponse } from 'next';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const result = await sql`SELECT * FROM artworks`;
        return res.status(200).json({ count: result.rows.length, views: result.rows.reduce((acc, row) => acc + row.views, 0)});
      } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch artworks' });
      }
    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
  }
}

export default withAuth(handler);
