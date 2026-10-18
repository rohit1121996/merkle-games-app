import { Request, Response } from 'express';
import HATEOASBuilder, { Link } from '../utils/hateoas';

interface ApiRoot {
  message: string;
  version: string;
  _links: Link[];
}

const rootController = {
  // Get API root with links to all resources
  async getApiRoot(req: Request, res: Response<ApiRoot>): Promise<void> {
    try {
      const hateoas = new HATEOASBuilder(req);

      res.json({
        message: 'Welcome to the Game Database API',
        version: '1.0.0',
        _links: hateoas.rootLinks()
      });
    } catch (error) {
      console.error('Error fetching API root:', error);
      res.status(500).json({
        message: 'Internal server error',
        version: '1.0.0',
        _links: []
      });
    }
  }
};

export default rootController;