import isUrl from 'is-url';

class DataValidation {
    validateExcelHeader<T1>(excelHeader: Record<string, string>, validationHashMap: any) {
        return (
            Object.keys(validationHashMap)
                .filter((key: string) => validationHashMap[key].isHeaderRequired)
                .reduce<string[]>((errors, key) => {
                    if (!Object.keys(excelHeader).some((columnName) => columnName.toLowerCase() === key.toLowerCase())) {
                        errors.push(`"${key}" column not found`);
                    }

                    return errors;
                }, [])
        );
    }

    getDuplicateRowsInExcel(data: any) {
        const sortedArr = data.sort((t1: any, t2: any) => (t1['product name'] > t2['product name'] ? 1 : 0));
        const duplicateRows = [];
        for (let i = 0; i < sortedArr.length - 1; i += 1) {
            if (JSON.stringify(sortedArr[i + 1]) === JSON.stringify(sortedArr[i])) {
                duplicateRows.push(JSON.stringify(sortedArr[i]));
            }
        }
        return duplicateRows;
    }

    validateExcelData(
        excelRows: Record<string, string>[],
        excelRowOffSet: number) {
        const errors: any = [];
        const alphaNumericRegex = /^[a-zA-Z0-9\s]+$/;
        for (let index = 0; index < excelRows.length; index += 1) {
            const { 'product name': productName, 'input image urls': inputImageUrls } = excelRows[index];
            if (!productName) {
                errors.push(`Entry-${index + excelRowOffSet} Product name is required`);
            } else if (!alphaNumericRegex.test(productName)) {
                errors.push(`Entry-${index + excelRowOffSet} Product name should be in AplhaNumeric`);
            }

            if (!inputImageUrls) {
                errors.push(`Entry-${index + excelRowOffSet} Image URL is required`);
            } else {
                const imageURLs = inputImageUrls.split(',');
                imageURLs.forEach(url => {
                    if (!isUrl(url)) {
                        errors.push(`Entry-${index + excelRowOffSet} Invalid images URL - ${url}`);
                    }
                })
            }
        }
        return errors;
    }
}

export const dataValidation = new DataValidation();
