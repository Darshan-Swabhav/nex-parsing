/**
*
* @openapi
*
*   definitions:
*  Company:
*    type: object
*    properties:
*      name:
*        type: string
*      website:
*        type: string
*      industry:
*        type: string
*      subIndustry:
*        type: string
*      revenue:
*        type: string
*      size:
*        type: string
*      error:
*        type: string
*
* /parser:
*   post:
*     security:
*        - auth0_jwk: []
*     operationId: postCsv
*     tags:
*       - PARSE
*     description: A route proxy to CsvParser's validation route
*     produces:
*       - application/json
*     responses:
*       '200':
*         description: returns rejected data
*/



function CsvParserController() {
    const CsvParserService = require('../../../services/parser/csvParser');
    this.csvParserService = new CsvParserService();
}

async function postCsv(settingsConfig, req, res, next) {
    let data = req.body.data
    const unParsedData = await this.csvParserService.createCompany(data);
    return res.status(200).send(unParsedData);
}

CsvParserController.prototype = {
    postCsv,
};

const csvParserController = new CsvParserController();
module.exports = csvParserController;

// Papa.parse(readstream, {
//     header: false,
//     step: async function (row) {
//         console.log("count", ++count);
//         const company = await db.Company.create({
//             name: row.data.CompanyName,
//             website: row.data.Website,
//             industry: row.data.Industry,
//             subIndustry: row.data.SubIndustry,
//             revenue: row.data.Revenue,
//             companySize: row.data.CompanySize
//         })
//     },
//     complete: function (result) {
//         console.log("process completed", result);

//     },
//     error: function (err) {
//         console.log("error : ", err);
//     }
// })