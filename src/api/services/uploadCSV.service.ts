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

class UploadCSVService {

    processImageQueue: any;
    private sequelize: Sequelize;
    private processImageModel: any;

    constructor() {
        this.sequelize = postgresProxy.getSequelize();
        this.processImageModel = initModel(this.sequelize);

        this.processImageQueue = new Queue('PROCESS_IMAGE', redisUrl);
        this.processImageQueue.process((job: any) => {
            return this.processQueue(job.data).then(() => {
                return Promise.resolve();
            });
        });
    }

    async processQueue(data: any) {
        try {
            const promises: any = [];
            data.map(async (obj: any) => {
                const { inputImageUrls, productName, status, requestId } = obj;
                const {
                    outputImageUrlsCount, inputImageUrlsCount, outputImageUrls
                } = await this.compressedImages(inputImageUrls);
                if (outputImageUrlsCount !== inputImageUrlsCount) {
                    promises.push(this.processImageModel.update({ outputImageUrls, status: 'failed', updatedAt: new Date() }, {
                        where: {
                            productName,
                            inputImageUrls,
                            requestId
                        },
                    }));
                } else {
                    promises.push(this.processImageModel.update({ outputImageUrls, status: 'success', updatedAt: new Date() }, {
                        where: {
                            productName,
                            inputImageUrls,
                            requestId
                        },
                    }));
                }
            });

            await Promise.all(promises);
        } catch (error: any) {
            console.error(`Error processing queue: ${error.message}`);
            throw error;
        }
    }

    async compressedImages(inputImageUrls: any): Promise<any> {
        try {
            const outputImages: string[] = await Promise.all(
                inputImageUrls.split(',').map(async (imageUrl: string) => {
                    try {
                        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
                        const buffer = Buffer.from(response.data);
                        const sharpInstance = sharp(buffer);
                        sharpInstance.rotate().resize({ width: 50, height: 50 }).jpeg({ quality: 50 });
                        const compressedBuffer = await sharpInstance.toBuffer();
                        const filepath = `image-output-${entityHelper.generateKey()}.jpg`;
                        fs.writeFileSync(filepath, compressedBuffer);
                        return filepath;
                    } catch (error: any) {
                        console.error(`Error compressing image ${imageUrl}: ${error.message}`);
                        return null;
                    }
                })
            );
            // Filter out any null values (i.e., images that failed to compress)
            const filteredOutputImages = outputImages.filter((filepath) => filepath !== null);
            return {
                outputImageUrlsCount: filteredOutputImages.length,
                inputImageUrlsCount: inputImageUrls.split(',').length,
                outputImageUrls: filteredOutputImages.join(',')
            };
        } catch (error: any) {
            console.error(`Error compressing images: ${error.message}`);
            throw error;
        }
    }

    addItemToQueue(item: any) {
        this.processImageQueue.add(item);
    }

    async processImages(filePath: any) {
        try {
            const excelRows = await entityHelper.convertXlsxToJson(filePath);

            let errors = dataValidation.validateExcelHeader(excelRows[0], userDtos);
            if (errors && errors.length) {
                return { errors };
            }

            // Check the duplicates rows in excel file
            const duplicateRows = dataValidation.getDuplicateRowsInExcel(excelRows);

            if (duplicateRows && duplicateRows.length) {
                errors.push(`Found Duplicate rows in the excel file - ${duplicateRows}`);
                return { errors };
            }

            errors = dataValidation.validateExcelData(
                excelRows,
                2
            );
            if (errors && errors.length) {
                return { errors };
            }

            const requestId = entityHelper.generateRequestID();

            const promises = [];
            const excelData = [];
            for (let index = 0; index < excelRows.length; index += 1) {
                try {
                    const { 'input image urls': inputImageUrls, 'product name': productName } = excelRows[index];
                    const data = { inputImageUrls, productName, status: 'pending', requestId };
                    excelData.push(data);
                    promises.push(this.processImageModel.create(data));
                } catch (error: any) {
                    console.error(`Error processing row ${index}: ${error.message}`);
                    errors.push(`Error processing row ${index}: ${error.message}`);
                }
            }

            await Promise.all(promises);
            this.addItemToQueue(excelData);

            return { requestId };
        } catch (error: any) {
            console.error(`Error processing images: ${error.message}`);
            return { errors: [error.message] };
        }
    }
}

export const uploadCSVService = new UploadCSVService();

