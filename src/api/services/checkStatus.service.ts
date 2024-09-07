import Queue from 'bull';
import { entityHelper } from "../helper/entity.helper";
import { userDtos } from "../utils/excelDtos";
import { dataValidation } from "../validations/requestValidations/data.validation";
import sharp from 'sharp';
import fs from 'fs';
import axios from 'axios';
import { postgresProxy } from '../database/proxy/postgres.proxy';
import { Sequelize } from 'sequelize';
import initModel from '../database/models/processImage.model';
import { redisUrl } from '../config/var';

const queue = new Queue('image-processing');

class CheckStatusService {
    private sequelize: Sequelize;
    private processImageModel: any;

    constructor() {
        this.sequelize = postgresProxy.getSequelize();
        this.processImageModel = initModel(this.sequelize);
    }

    async checkStatus(id: string) {
        try {

            console.log(Object.keys(this.processImageModel));
            let errors: any = [];
            if (errors && errors.length) {
                return { errors };
            }
            const data = await this.processImageModel.findAll({

                where: { requestId: id },
                raw: true,
                attributes: ['requestId', 'inputImageUrls', 'outputImageUrls', 'productName', 'status']

            });
            if (!data?.length) {
                errors.push(`Invalid request id, this request doesn't exist in DB - ${id}`);
                return { errors };
            }

            const excelFileName = `Output-${id}.xlsx`;
            entityHelper.createExcelFromJson(data, excelFileName);

            return { excelFileName };
        } catch (error: any) {
            console.error(`Error processing images: ${error.message}`);
            return { errors: [error.message] };
        }
    }
}

export const checkStatusService = new CheckStatusService();

