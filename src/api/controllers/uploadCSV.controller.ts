import { NextFunction, Request, Response } from "express";
import Queue from 'bull';
import { entityHelper } from "../helper/entity.helper";
import { uploadCSVService } from "../services/uploadCSV.service";
import path from "path";
import { unlink, writeFile } from "fs-extra";

const queue = new Queue('image-processing');

class UploadCSVController {
    async processImages(req: Request, res: Response, next: NextFunction) {
      try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        const filename = path.resolve(`ProcessImages-${entityHelper.generateKey()}.xlsx`);
        const { buffer } = req.file;
        await writeFile(filename, buffer, 'binary');

        const { errors, requestId } =  await uploadCSVService.processImages(filename);

        await unlink(filename);

        if (errors) {
          return res.status(400).send(`Errors: ${errors}`);
        }
        return res.status(201).json({ requestId });

      } catch (error) {
        next(error);
      }
    }
  }
  
  export const uploadCSVController = new UploadCSVController();

