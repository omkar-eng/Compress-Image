import { NextFunction, Router, Request, Response } from 'express';
import { uploadCSVController } from '../controllers/uploadCSV.controller';
import multer from 'multer';
import { checkStatusController } from '../controllers/checkStatus.controller';

const router = Router();

router.get('/', (req: Request, res: Response, next: NextFunction) => res.send('Welcome to Assignment Process Image URLs'));

router
  .route('/processImages')
  .post([
    multer({
        storage: multer.memoryStorage()
    }).single('file'),
    uploadCSVController.processImages])

router
  .route('/checkStatus/:requestId')
  .get([checkStatusController.checkStatus])

export { router };