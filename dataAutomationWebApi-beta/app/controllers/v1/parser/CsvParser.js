/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
// const errors = require('throw.js');
// const errorMessages = require('../../../config/error.config.json');
var fs = require('fs');
var Papa = require('papaparse');
var file = '../dummyData.csv';



function CsvParserController() {
    const CsvParserService = require('../../../services/parser/csvParser');
    this.csvParserService = new CsvParserService();

}
async function postCsv(settingsConfig, req, res, next) {

    let data = req.body.data

    const unParsedData = await this.csvParserService.createCompany(data);

    return res.status(200).send( unParsedData );
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