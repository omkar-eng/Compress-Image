import { values } from 'lodash';
// @ts-ignore
import xlsxtojson from 'xlsx-to-json-lc';
import xlsx from 'xlsx';
import { Chance } from 'chance';
import fs from 'fs-extra';

const chance = Chance();

class EntityHelper {

  generateRequestID() {
    return chance.string({ length: 10, alpha: true, casing: 'lower', numeric: true, symbols: false });
  }

  generateKey() {
    return chance.string({ length: 8, alpha: true, casing: 'lower', numeric: true, symbols: false });
  }

  convertXlsxToJson(filePath: string): Promise<Record<string, string>[]> {
    return new Promise((resolve, reject) => {
      xlsxtojson(
        {
          input: filePath,
          output: null,
          lowerCaseHeaders: false
        },
        async (err: any, excelData: Record<string, string>[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(
              excelData.filter((data: Record<string, string>) => values(data).some((val: string) => !!val))
            );
          }
        }
      );
    });
  }

  createExcelFromJson(data: any, path: any) {
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, 'sheet1');
    xlsx.writeFile(wb, path);
  }
}

export const entityHelper = new EntityHelper();