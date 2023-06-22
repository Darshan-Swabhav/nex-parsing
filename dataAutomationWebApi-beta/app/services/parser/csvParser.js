const settingsConfig = require('../../config/settings/settings-config');
const db = require('../../../models');
const url = require('url');
const { getDomain } = require('tldjs');
const subIndustryList = {
    "aerospace & defense": [
        "aircraft engine & parts manufacturing",
        "guided missile & space vehicle manufacturing",
        "space research & technology",
        "weapons & ammunition manufacturing"
    ],
    "agriculture, forestry & fishing": [
        "commercial fishing",
        "crop & animal production",
        "forestry & logging"
    ],
    "automotive & transportation": [
        "air transportation services",
        "airlines",
        "mass transit & ground passenger transportation",
        "miscellaneous transportation equipment manufacturing",
        "miscellaneous transportation services",
        "motor vehicle manufacturing",
        "motor vehicle parts manufacturing",
        "pipeline transportation",
        "postal, shipping & messengers",
        "importers or exporters",
        "railroad transportation services",
        "road transportation services",
        "ship & boat building",
        "shipping & water transportation services",
        "storage & warehousing",
        "train & railroad equipment manufacturing",
        "transportation equipment wholesale",
        "trucking"
    ],
    "banking & finance": [
        "banking",
        "commodities",
        "exchanges",
        "financial holding companies",
        "investment banking",
        "investment services",
        "mortgage & credit",
        "securities"
    ],
    "biotechnology, pharmaceuticals & medicine": [
        "pharmaceutical manufacturing"],
    "business & management services": [
        "administrative services",
        "advertising & marketing services",
        "associations, civic & non-profit organizations",
        "building & dwelling services",
        "business support services",
        "commercial real estate leasing",
        "consulting services",
        "facilities management",
        "holding companies",
        "market research & opinion polling",
        "photographic services",
        "research & development services"
    ],
    "computers": [
        "technology hardware",
        "computer & peripheral equipment manufacturing",
        "computer programming",
        "computer system design services",
        "internet & web services",
        "software & development"
    ],
    "construction & building materials": [
        "cement & concrete product manufacturing",
        "civil engineering",
        "construction & hardware materials wholesale",
        "construction machinery manufacturing",
        "residential & commercial building construction",
        "specialty construction trade contractors"
    ],
    "consumer services": [
        "consumer goods rental",
        "death care services",
        "hotels & accommodation",
        "laundry services",
        "miscellaneous personal services",
        "personal care services",
        "photofinishing",
        "residential real estate leasing",
        "travel & reservation services"
    ],
    "education": [
        "child day care services",
        "colleges & universities",
        "miscellaneous educational services",
        "primary & secondary education",
        "professional & management training"
    ],
    "electronics": [
        "appliance repair & maintenance",
        "audio & video equipment manufacturing",
        "electrical equipment & appliances manufacturing",
        "electromedical & control instruments manufacturing",
        "electronic equipment repair & maintenance",
        "electronics & appliances stores",
        "electronics wholesale",
        "magnetic & optical media manufacturing",
        "semiconductor & other electronic component manufacturing"
    ],
    "hospitality": [
        "fitness & recreation centers",
        "gambling & casinos",
        "golf courses & country clubs",
        "hotels & accommodation",
        "miscellaneous amusement & recreation",
        "museums & historical sites",
        "performing arts",
        "entertainment & leisure",
        "restaurants & bars",
        "spectator sports"
    ],
    "food & beverage": [
        "agricultural products & packaged foods & meats",
        "beverage manufacturing",
        "commercial fishing",
        "food manufacturing",
        "brewers"
    ],
    "healthcare": [
        "fitness & recreation centers",
        "ambulatory services",
        "dentists",
        "diagnostic laboratories",
        "health & personal care",
        "home health care services",
        "hospitals",
        "medical equipment & supplies",
        "nursing & residential care",
        "outpatient care",
        "physicians & health practitioners",
        "social & rehabilitation services"
    ],
    "high tech": [
        "communications equipment manufacturing",
        "computer & peripheral equipment manufacturing",
        "computer programming",
        "computer system design services",
        "diagnostic laboratories",
        "electrical equipment & appliances manufacturing",
        "electromedical & control instruments manufacturing",
        "guided missile & space vehicle manufacturing",
        "internet & web services",
        "research & development services",
        "it services / software",
        "wireless telecommunications carriers"
    ],
    "insurance": [
        "insurance agents",
        "insurance services",
        "life & health insurance",
        "pensions & funds",
        "property & casualty insurance"
    ],
    "manufacturing": [
        "agricultural chemical manufacturing",
        "basic chemical manufacturing",
        "miscellaneous chemical manufacturing",
        "synthetic chemical manufacturing",
        "aircraft engine & parts manufacturing",
        "aircraft manufacturing",
        "audio & video equipment manufacturing",
        "beverage manufacturing",
        "cement & concrete product manufacturing",
        "clothing & apparel manufacturing",
        "communications equipment manufacturing",
        "computer & peripheral equipment manufacturing",
        "construction machinery manufacturing",
        "electrical equipment & appliances manufacturing",
        "electromedical & control instruments manufacturing",
        "food manufacturing",
        "furniture manufacturing",
        "guided missile & space vehicle manufacturing",
        "machinery & equipment manufacturing",
        "magnetic & optical media manufacturing",
        "metal products manufacturing",
        "miscellaneous manufacturing",
        "miscellaneous transportation equipment manufacturing",
        "motor vehicle manufacturing",
        "motor vehicle parts manufacturing",
        "non-metallic mineral product manufacturing",
        "paint, coating, & adhesive manufacturing",
        "paper product manufacturing",
        "petroleum product manufacturing",
        "pharmaceutical manufacturing",
        "printing",
        "rubber & plastic product manufacturing",
        "semiconductor & other electronic component manufacturing",
        "ship & boat building",
        "textile manufacturing",
        "tobacco production",
        "train & railroad equipment manufacturing",
        "weapons & ammunition manufacturing",
        "wood product manufacturing"
    ],
    "mining, quarrying & drilling": [
        "coal mining",
        "metals mining",
        "non-metallic minerals mining",
        "petroleum & natural gas (oil & gas) extraction",
        "support activities for mining"
    ],
    "nonclassifiable establishments": [
        "nonclassifiable establishments"],
    "professional services": [
        "data processing",
        "miscellaneous professional services",
        "accounting & tax preparation",
        "architecture & engineering",
        "investigation & security services",
        "legal services",
        "specialized design services",
        "staffing & recruiting"
    ],
    "public sector & government": [
        "administration of public programs",
        "courts, justice & public safety",
        "executive & legislature",
        "national security & international affairs",
        "space research & technology"
    ],
    "real estate": [
        "commercial real estate leasing",
        "property managers",
        "real estate agents & brokers",
        "real estate services",
        "residential real estate leasing"
    ],
    "rental & leasing": [
        "commercial & industrial rental",
        "commercial real estate leasing",
        "consumer goods rental",
        "miscellaneous rental",
        "motor vehicle rental",
        "residential real estate leasing"
    ],
    "repair & maintenance": [
        "appliance repair & maintenance",
        "communication equipment repair & maintenance",
        "computer & office machine repair & maintenance",
        "consumer electronics repair & maintenance",
        "electronic equipment repair & maintenance",
        "industrial machinery repair & maintenance",
        "miscellaneous repair & maintenance",
        "motor vehicle repair & maintenance"
    ],
    "retail": [
        "beer, wine, & liquor stores",
        "clothing & apparel stores",
        "department stores",
        "electronics & appliances stores",
        "gasoline stations & fuel dealers",
        "grocery stores",
        "home & garden retail",
        "home furnishings retail",
        "miscellaneous store retailers",
        "motor vehicle & parts dealers",
        "non-store retail",
        "pharmacies & personal care stores",
        "sporting goods & recreation stores"
    ],
    "telecommunications & publishing": [
        "broadcasting & media",
        "cable & other program distribution",
        "communications equipment manufacturing",
        "internet & web services",
        "miscellaneous information services",
        "miscellaneous telecommunication services",
        "movies",
        "publishing",
        "telecommunications resellers",
        "wired telecommunications carriers",
        "wireless telecommunications carriers",
        "music"
    ],
    "utilities & energy": [
        "oil & gas equipment & services",
        "environmental services",
        "electricity generation & distribution",
        "integrated oil & gas",
        "natural gas distribution",
        "waste management",
        "water & sewage services"
    ],
    "wholesale": [
        "alcoholic beverage wholesale",
        "chemical wholesale",
        "clothing & apparel wholesale",
        "computer, office equipment & software merchant wholesalers",
        "construction & hardware materials wholesale",
        "electronics wholesale",
        "grocery wholesale",
        "health & personal care wholesale",
        "home furnishings wholesale",
        "machinery wholesale",
        "metals & minerals wholesale",
        "miscellaneous wholesale",
        "motor vehicle wholesale",
        "paper wholesale",
        "petroleum wholesale",
        "professional & commercial equipment wholesale",
        "transportation equipment wholesale"
    ]
}
const industryList = ["aerospace & defense",
    "agriculture, forestry & fishing",
    "automotive & transportation",
    "banking & finance",
    "biotechnology, pharmaceuticals & medicine",
    "business & management services",
    "computers",
    "construction & building materials",
    "consumer services",
    "education",
    "electronics",
    "hospitality",
    "food & beverage",
    "healthcare",
    "high tech",
    "insurance",
    "manufacturing",
    "mining, quarrying & drilling",
    "nonclassifiable establishments",
    "professional services",
    "public sector & government",
    "real estate",
    "rental & leasing",
    "repair & maintenance",
    "retail",
    "telecommunications & publishing",
    "utilities & energy",
    "wholesale"]

function CsvParserService() {
    const config = settingsConfig.settings || {};
    this.config = config;
    this.logger = settingsConfig.logger || console;
}

function sizeParser(inputRange) {
    const sizePattern = /^(\d+(?:,\d+)?)\s*-\s*(\d+(?:,\d+)?)$|^(\d+(?:,\d+)?)\s*\+$/;

    const match = inputRange.match(sizePattern);
    if (match) {
        if (match[1] && match[2]) {
            const lower = parseInt(match[1].replace(/,/g, ''));
            const upper = parseInt(match[2].replace(/,/g, ''));
            return (lower + upper) / 2;
        } else if (match[3]) {
            return parseInt(match[3].replace(/,/g, '')) + 1;
        }
    } else if (!isNaN(parseInt(inputRange)) || /^\d+\s*\-\s*\d+$/.test(inputRange)) {
        return null;
    }
    return null;
}

function parseRevenue(input) {
    const pattern = /^\$?(\d+\.?\d*)([M|B]?)(?:\s*-\s*\$?(\d+\.?\d*)([M|B]?))?$/;
    let result;

    const match = input.toString().match(pattern);
    if (match) {
        if (match[4]) {
            const startValue = parseValue(match[1], match[2]);
            const endValue = parseValue(match[3], match[4]);
            const value = (startValue + endValue) / 2;
            result = value
        } else {
            const value = parseValue(match[1], match[2]);
            result = value
        }
    }
    return result;
}

function parseValue(value, unit) {
    let parsedValue = parseFloat(value);
    if (unit === 'B') {
        parsedValue *= 1000;
    } else if (unit === 'M') {
        parsedValue;
    }
    return parsedValue;
}

async function checkUrlExist(url) {
    const website = await db.Company.findOne({ where: { website: url } });
    if (website === null) {
        return false
    } else {
        return true
    }
}

async function createCompany(chunk) {
    let unparsedChunk = [];

    for (let i = 0; i < chunk.length; i++) {

        try {
            if (
                chunk[i].name === "" ||
                chunk[i].website === "" ||
                chunk[i].industry === "" ||
                chunk[i].revenue === "" ||
                chunk[i].size === ""
            ) {
                unparsedChunk.push(chunk[i]);
            } else {

                let revenueRange;
                let sizeRange;

                const revenue = parseRevenue(chunk[i].revenue);
                if (revenue == null) {
                    throw new Error("Invalid revenue ");
                }

                let industry = ""
                let subIndustry = ""

                if (industryList.includes(chunk[i].industry)) {
                    industry = chunk[i].industry

                    const subIndustryArray = subIndustryList[chunk[i].industry];

                    if (subIndustryArray && subIndustryArray.includes(chunk[i].subIndustry)) {
                        subIndustry = chunk[i].subIndustry
                    } else if (chunk[i].subIndustry != "") {
                        throw new Error("Invalid subIndustry ");
                    }
                } else {
                    throw new Error("Invalid industry ");
                }

                if (revenue > 0 && revenue <= 1) {
                    revenueRange = '0 - $1M';
                } else if (revenue > 1 && revenue <= 10) {
                    revenueRange = '$1M - $10M';
                } else if (revenue > 10 && revenue <= 50) {
                    revenueRange = '$10M - $50M';
                } else if (revenue > 50 && revenue <= 100) {
                    revenueRange = '$50M - $100M';
                } else if (revenue > 100 && revenue <= 250) {
                    revenueRange = '$100M - $250M';
                } else if (revenue > 250 && revenue <= 500) {
                    revenueRange = '$250M - $500M';
                } else if (revenue > 500 && revenue <= 1000) {
                    revenueRange = '$500M - $1B';
                } else if (revenue > 1000 && revenue <= 10000) {
                    revenueRange = '$1B - $10B';
                } else if (revenue > 10000) {
                    revenueRange = '$10B+';
                } else {
                    throw new Error("Invalid revenue range");
                }

                const size = sizeParser(chunk[i].size);
                if (size == null) {
                    throw new Error("Invalid size range ");
                }
                if (size > 0 && size <= 10) {
                    sizeRange = '0 - 10';
                } else if (size > 10 && size <= 50) {
                    sizeRange = '11 - 50';
                } else if (size > 50 && size <= 200) {
                    sizeRange = '51 - 200';
                } else if (size > 200 && size <= 500) {
                    sizeRange = '201 - 500';
                } else if (size > 500 && size <= 1000) {
                    sizeRange = '501 - 1,000';
                } else if (size > 1000 && size <= 5000) {
                    sizeRange = '1,001 - 5,000';
                } else if (size > 5000 && size <= 10000) {
                    sizeRange = '5,001 - 10,000';
                } else if (size > 10000) {
                    sizeRange = '10,000+';
                } else {
                    throw new Error("Invalid size range");
                }

                const hostUrl = getDomain(dirtyUrl)
                if (hostUrl == "") {
                    throw new Error("Invalid host url");
                }

                const urlExist = await checkUrlExist(hostUrl)
                if (urlExist) {
                    throw new Error(" Url exists");
                }

                await db.Company.create({
                    name: chunk[i].name,
                    website: hostUrl,
                    industry: industry,
                    subIndustry: subIndustry,
                    revenue: revenueRange,
                    size: sizeRange,
                });
            }

        } catch (error) {
            chunk[i].error = error.message
            unparsedChunk.push(chunk[i]);
        }
    }
    return unparsedChunk;
}

CsvParserService.prototype = {
    createCompany,
};

module.exports = CsvParserService;

