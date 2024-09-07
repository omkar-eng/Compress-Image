                      PROCESS IMAGES LLD

Diagram

   A[User]        ---------------->       Upload CSV       ---------------->        B[Upload API]

   B        ---------------->       Validate CSV       ---------------->        C[Validator]

   C        ---------------->       Valid CSV       ---------------->        D[Database]

   C        ---------------->       Invalid CSV       ---------------->        E[Error Handler]

   D        ---------------->       Request ID       ---------------->        A

   D        ---------------->       Async Process       ---------------->        F[Image Processing Service]

   F        ---------------->       Processed Images       ---------------->        G[Database]

   G        ---------------->       Update Database       ---------------->        D

   A        ---------------->       Request ID       ---------------->        H[Status API]

   H        ---------------->       Get Status       ---------------->        D

   D        ---------------->       Status       ---------------->        A


Components -> 
Upload API: Accepts CSV files from users and returns a unique request ID.
Validator: Validates the CSV data to ensure it is correctly formatted.
Database: Stores product data and tracks the status of each processing request.
Image Processing Service: Asynchronously processes images, compressing them by 50% of their original quality.
Status API: Allows users to query the processing status using the request ID.
Error Handler: Handles invalid CSV files and returns an error response to the user.


Database Schema -> 
Here is a proposed database schema to store product data and track the status of each processing request:

CREATE TABLE ProcessImage (
 productName VARCHAR(128) NOT NULL,
 inputImageUrls VARCHAR(128) NOT NULL,
 outputImageUrls VARCHAR(128),
 requestId VARCHAR(128) NOT NULL,
 status VARCHAR(128) NOT NULL DEFAULT 'pending’
);

API Documentation -> 
Upload API
Endpoint: /processImages
Method: POST
Request Body: CSV file
Response: 201 Created with a unique request ID
Status API
Endpoint: /checkStatus/:requestId
Method: GET
Request Param: requestId
Response: CSV file with all details


Asynchronous Workers Documentation -> 
Image Processing Worker
Function: processQueue and compressedImages
Description: Asynchronously processes an image, compressing it by 50% of its original quality and the image processing service and updates the database.
Input: Image URLs
Output: Processed image URL

Postman collection link -> 
https://api.postman.com/collections/16341910-ed7b819f-e2eb-40bc-9209-d50e382afa83?access_key=PMAT-01J76HNCSDHKGHMNYQAD7RGHE1
