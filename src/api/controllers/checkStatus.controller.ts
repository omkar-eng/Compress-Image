import { NextFunction, Request, Response } from "express";
import Queue from 'bull';
import { entityHelper } from "../helper/entity.helper";
import { uploadCSVService } from "../services/uploadCSV.service";
import path from "path";
import { unlink, writeFile } from "fs-extra";
import { checkStatusService } from "../services/checkStatus.service";

const queue = new Queue('image-processing');

class CheckStatusController {
    async checkStatus(req: Request, res: Response, next: NextFunction) {
      try {
        console.log('checkStatus')
        const { requestId } = req.params;
        if (!requestId) {
            return res.status(400).send('Request id not provided.');
        }
        const { errors, excelFileName } =  await checkStatusService.checkStatus(requestId);
        if (errors) {
          return res.status(400).send(`Errors: ${errors}`);
        } else if (excelFileName){
            return res.download(excelFileName);
        } else {
            return res.status(400).send({Status: 'failed'});
        }
      } catch (error) {
        next(error);
      }
    }
  }
  
  export const checkStatusController = new CheckStatusController();

