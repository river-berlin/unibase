import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth';

interface DeleteFolderRequest extends Request {
  user?: {
    userId: string;
    email: string;
    name: string;
  };
  params: {
    folderId: string;
  };
}

const router = Router();

/**
 * Delete a folder
 * 
 * @route DELETE /folders/:folderId
 */
router.delete(
  '/:folderId',
  authenticateToken,
  async (req: DeleteFolderRequest, res: Response): Promise<void> => {
    /* #swagger.tags = ['Folders']
       #swagger.summary = 'Delete folder'
       #swagger.operationId = 'deleteFolderByOwnerOrAdmin'
       #swagger.description = 'Deletes a folder if the authenticated user has owner or admin role in the organization'
       #swagger.security = [{
         "bearerAuth": []
       }]
       #swagger.parameters['folderId'] = {
         in: 'path',
         description: 'ID of the folder to delete',
         required: true,
         type: 'string',
         format: 'uuid'
       }
       #swagger.responses[200] = {
         description: 'Folder deleted successfully',
         content: {
           'application/json': {
             schema: {
               type: 'object',
               properties: {
                 message: {
                   type: 'string',
                   example: 'Folder deleted successfully'
                 }
               }
             }
           }
         }
       }
       #swagger.responses[401] = {
         description: 'Unauthorized - Missing or invalid token'
       }
       #swagger.responses[403] = {
         description: 'Forbidden - No access or insufficient role',
         content: {
           'application/json': {
             schema: {
               oneOf: [
                 {
                   type: 'object',
                   properties: {
                     error: {
                       type: 'string',
                       example: 'No access to this folder'
                     }
                   }
                 },
                 {
                   type: 'object',
                   properties: {
                     error: {
                       type: 'string',
                       example: 'No permission to delete this folder'
                     }
                   }
                 }
               ]
             }
           }
         }
       }
       #swagger.responses[404] = {
         description: 'Folder not found',
         content: {
           'application/json': {
             schema: {
               type: 'object',
               properties: {
                 error: {
                   type: 'string',
                   example: 'Folder not found'
                 }
               }
             }
           }
         }
       }
       #swagger.responses[500] = {
         description: 'Server error',
         content: {
           'application/json': {
             schema: {
               type: 'object',
               properties: {
                 error: {
                   type: 'string',
                   example: 'Error deleting folder'
                 }
               }
             }
           }
         }
       }
    */
    try {
      if (!req.user?.userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const db = req.app.locals.db;

      // First get the folder to check permissions
      const folder = await db
        .selectFrom('folders')
        .select(['organization_id'])
        .where('id', '=', req.params.folderId)
        .executeTakeFirst();

      if (!folder) {
        res.status(404).json({ error: 'Folder not found' });
        return;
      }

      // Verify user has access and role in this organization
      const hasAccess = await db
        .selectFrom('organization_members')
        .select(['user_id', 'role'])
        .where('organization_id', '=', folder.organization_id)
        .where('user_id', '=', req.user.userId)
        .executeTakeFirst();

      if (!hasAccess) {
        res.status(403).json({ error: 'No access to this folder' });
        return;
      }

      // Only allow deletion if user is owner/admin
      if (hasAccess.role !== 'owner' && hasAccess.role !== 'admin') {
        res.status(403).json({ error: 'No permission to delete this folder' });
        return;
      }

      await db
        .deleteFrom('folders')
        .where('id', '=', req.params.folderId)
        .execute();

      res.json({ message: 'Folder deleted successfully' });
    } catch (error) {
      console.error('Error deleting folder:', error);
      res.status(500).json({ error: 'Error deleting folder' });
    }
  }
);

export default router; 