const {
  expect
} = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const {
  loggerMock
} = require('../../../../../helper');
const settingsConfig = {
  logger: loggerMock
};

const autoCompleteServiceInstanceStub = {
  search: sinon.stub(),
};

const AutoCompleteServiceStub = sinon
  .stub()
  .returns(autoCompleteServiceInstanceStub);

const sicCodeControllerModule = proxyquire(
  '../../../../../../controllers/v1/master/search/sicCodeController', {
    '../../../../services/master/search/autoCompleteService': AutoCompleteServiceStub,
  }
);

describe('#sicCodeController - get', function () {
  describe('Get All SIC Code', function () {
    context('Check If User is Unauthorized', function () {
      it('Should return `401` with `Unauthorized` error', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            email: ''
          },
          query: {}
        };
        const res = {
          statusCode: null,
          data: null,
          status: (code) => {
            res.statusCode = code;
            return res;
          },
          json: () => res,
          send: (data) => {
            res.data = data;
            return res;
          },
        };

        //Act
        sicCodeControllerModule.get(settingsConfig, req, res, next)
          .then(function () {
            const error = new Error('This function could not throw expected error');
            done(error);
          })
          .catch(function (err) {
            // Assert
            const actualStatusCode = err.statusCode;
            const expectedStatusCode = 401;
            const actualErrorMessage = err.message;
            const expectedErrorMessage = 'Invalid token';

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualErrorMessage).to.equal(expectedErrorMessage);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });

    context('Check If the User role is invalid', function () {
      it('Should return `403` with `User Forbidden` error', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          user: {
            email: 'dev.pmgr1@nexsales.com',
            roles: ['agent']
          },
          query: {}
        };
        const res = {
          statusCode: null,
          data: null,
          status: (code) => {
            res.statusCode = code;
            return res;
          },
          json: () => res,
          send: (data) => {
            res.data = data;
            return res;
          },
        };

        // Act
        sicCodeControllerModule.get(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 403;
            const expectedData = {
              err: 'User Forbidden',
              desc: 'User not access this route',
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
    });

    context('Check if correct params are passed for getting list of sic code', function () {
      before(function () {
        autoCompleteServiceInstanceStub.search = sinon.stub().returns([
          {
              "id": "0111",
              "title": "Wheat",
              "fullTitle": "0111 - Wheat"
          },
          {
              "id": "0112",
              "title": "Rice",
              "fullTitle": "0112 - Rice"
          },
          {
              "id": "0115",
              "title": "Corn",
              "fullTitle": "0115 - Corn"
          },
          {
              "id": "0116",
              "title": "Soyabeans",
              "fullTitle": "0116 - Soyabeans"
          },
          {
              "id": "0119",
              "title": "Cash Grains, Not elsewhere classified",
              "fullTitle": "0119 - Cash Grains, Not elsewhere classified"
          },
          {
              "id": "0131",
              "title": "Cotton",
              "fullTitle": "0131 - Cotton"
          },
          {
              "id": "0132",
              "title": "Tobacco",
              "fullTitle": "0132 - Tobacco"
          },
          {
              "id": "0133",
              "title": "Sugarcane and Sugar Beets",
              "fullTitle": "0133 - Sugarcane and Sugar Beets"
          },
          {
              "id": "0134",
              "title": "Irish Potatoes",
              "fullTitle": "0134 - Irish Potatoes"
          },
          {
              "id": "0139",
              "title": "Field crops,Except Cash Grains, Not Elsewhere Classified",
              "fullTitle": "0139 - Field crops,Except Cash Grains, Not Elsewhere Classified"
          },
          {
              "id": "0161",
              "title": "Vegetables and Melons",
              "fullTitle": "0161 - Vegetables and Melons"
          },
          {
              "id": "0171",
              "title": "Berry Crops",
              "fullTitle": "0171 - Berry Crops"
          },
          {
              "id": "0172",
              "title": "Grapes",
              "fullTitle": "0172 - Grapes"
          },
          {
              "id": "0173",
              "title": "Tree Nuts",
              "fullTitle": "0173 - Tree Nuts"
          },
          {
              "id": "0174",
              "title": "Citrus Fruits",
              "fullTitle": "0174 - Citrus Fruits"
          },
          {
              "id": "0175",
              "title": "Deciduous Tree Fruits",
              "fullTitle": "0175 - Deciduous Tree Fruits"
          },
          {
              "id": "0179",
              "title": "Fruits and Tree Nuts, Not Elsewhere Classified",
              "fullTitle": "0179 - Fruits and Tree Nuts, Not Elsewhere Classified"
          },
          {
              "id": "0181",
              "title": "Ornamental Floriculture and Nursery Products",
              "fullTitle": "0181 - Ornamental Floriculture and Nursery Products"
          },
          {
              "id": "0182",
              "title": "Food Crops Grown Under Cover",
              "fullTitle": "0182 - Food Crops Grown Under Cover"
          },
          {
              "id": "0191",
              "title": "General Farms, Primarily Crop",
              "fullTitle": "0191 - General Farms, Primarily Crop"
          },
          {
              "id": "0211",
              "title": "Beef Cattle Feedlots",
              "fullTitle": "0211 - Beef Cattle Feedlots"
          },
          {
              "id": "0212",
              "title": "Beef Cattle, Except Feedlots",
              "fullTitle": "0212 - Beef Cattle, Except Feedlots"
          },
          {
              "id": "0213",
              "title": "Hogs",
              "fullTitle": "0213 - Hogs"
          },
          {
              "id": "0214",
              "title": "Sheep and Goats",
              "fullTitle": "0214 - Sheep and Goats"
          },
          {
              "id": "0219",
              "title": "General Livestock, Except Dairy and Poultry",
              "fullTitle": "0219 - General Livestock, Except Dairy and Poultry"
          },
          {
              "id": "0241",
              "title": "Dairy Farms",
              "fullTitle": "0241 - Dairy Farms"
          },
          {
              "id": "0251",
              "title": "Broiler, Fryer, and Roaster Chickens",
              "fullTitle": "0251 - Broiler, Fryer, and Roaster Chickens"
          },
          {
              "id": "0252",
              "title": "Chicken Eggs",
              "fullTitle": "0252 - Chicken Eggs"
          },
          {
              "id": "0253",
              "title": "Turkeys and Turkey Eggs",
              "fullTitle": "0253 - Turkeys and Turkey Eggs"
          },
          {
              "id": "0254",
              "title": "Poultry Hatcheries",
              "fullTitle": "0254 - Poultry Hatcheries"
          },
          {
              "id": "0259",
              "title": "Poultry and Eggs, Not Elsewhere Classified",
              "fullTitle": "0259 - Poultry and Eggs, Not Elsewhere Classified"
          },
          {
              "id": "0271",
              "title": "Fur",
              "fullTitle": "0271 - Fur"
          },
          {
              "id": "0272",
              "title": "Horses and Other Equines",
              "fullTitle": "0272 - Horses and Other Equines"
          },
          {
              "id": "0273",
              "title": "Animal Aquaculture",
              "fullTitle": "0273 - Animal Aquaculture"
          },
          {
              "id": "0279",
              "title": "Animal Specialties, Not Elsewhere Classified",
              "fullTitle": "0279 - Animal Specialties, Not Elsewhere Classified"
          },
          {
              "id": "0291",
              "title": "General Farms, Primarily Livestock and Animal Specialties",
              "fullTitle": "0291 - General Farms, Primarily Livestock and Animal Specialties"
          },
          {
              "id": "0711",
              "title": "Soil Preparation Services",
              "fullTitle": "0711 - Soil Preparation Services"
          },
          {
              "id": "0721",
              "title": "Crop Planting, Cultivating, and Protecting",
              "fullTitle": "0721 - Crop Planting, Cultivating, and Protecting"
          },
          {
              "id": "0722",
              "title": "Crop Harvesting, Primarily by Machine",
              "fullTitle": "0722 - Crop Harvesting, Primarily by Machine"
          },
          {
              "id": "0723",
              "title": "Crop Preparation Services for Market, Except Cotton Ginning",
              "fullTitle": "0723 - Crop Preparation Services for Market, Except Cotton Ginning"
          },
          {
              "id": "0724",
              "title": "Cotton Ginning",
              "fullTitle": "0724 - Cotton Ginning"
          },
          {
              "id": "0741",
              "title": "Veterinary Services for Livestock",
              "fullTitle": "0741 - Veterinary Services for Livestock"
          },
          {
              "id": "0742",
              "title": "Veterinary Services for Animal Specialties",
              "fullTitle": "0742 - Veterinary Services for Animal Specialties"
          },
          {
              "id": "0751",
              "title": "Livestock Services, Except Veterinary",
              "fullTitle": "0751 - Livestock Services, Except Veterinary"
          },
          {
              "id": "0752",
              "title": "Animal Specialty Services, Except Veterinary",
              "fullTitle": "0752 - Animal Specialty Services, Except Veterinary"
          },
          {
              "id": "0761",
              "title": "Farm Labor Contractors and Crew Leaders",
              "fullTitle": "0761 - Farm Labor Contractors and Crew Leaders"
          },
          {
              "id": "0762",
              "title": "Farm Management Services",
              "fullTitle": "0762 - Farm Management Services"
          },
          {
              "id": "0781",
              "title": "Landscape Counseling and Planning",
              "fullTitle": "0781 - Landscape Counseling and Planning"
          },
          {
              "id": "0782",
              "title": "Lawn and Garden Services",
              "fullTitle": "0782 - Lawn and Garden Services"
          },
          {
              "id": "0783",
              "title": "ornamental Shrub and Tree Services",
              "fullTitle": "0783 - ornamental Shrub and Tree Services"
          },
          {
              "id": "0811",
              "title": "Timber Tracts",
              "fullTitle": "0811 - Timber Tracts"
          },
          {
              "id": "0831",
              "title": "Forest Nurseries and Gathering of Forest Products",
              "fullTitle": "0831 - Forest Nurseries and Gathering of Forest Products"
          },
          {
              "id": "0851",
              "title": "Forestry Services",
              "fullTitle": "0851 - Forestry Services"
          },
          {
              "id": "0912",
              "title": "Finfish",
              "fullTitle": "0912 - Finfish"
          },
          {
              "id": "0913",
              "title": "Shellfish",
              "fullTitle": "0913 - Shellfish"
          },
          {
              "id": "0919",
              "title": "Miscellaneous Marine Products",
              "fullTitle": "0919 - Miscellaneous Marine Products"
          },
          {
              "id": "0921",
              "title": "Fish Hatcheries and Preserves",
              "fullTitle": "0921 - Fish Hatcheries and Preserves"
          },
          {
              "id": "0971",
              "title": "Hunting and Trapping, and Game Propagation",
              "fullTitle": "0971 - Hunting and Trapping, and Game Propagation"
          },
          {
              "id": "1011",
              "title": "Iron Ores",
              "fullTitle": "1011 - Iron Ores"
          },
          {
              "id": "1021",
              "title": "Copper Ores",
              "fullTitle": "1021 - Copper Ores"
          },
          {
              "id": "1031",
              "title": "Lead and Zinc Ores",
              "fullTitle": "1031 - Lead and Zinc Ores"
          },
          {
              "id": "1041",
              "title": "Gold Ores",
              "fullTitle": "1041 - Gold Ores"
          },
          {
              "id": "1044",
              "title": "Silver Ores",
              "fullTitle": "1044 - Silver Ores"
          },
          {
              "id": "1061",
              "title": "Ferroalloy Ores, Except Vanadium",
              "fullTitle": "1061 - Ferroalloy Ores, Except Vanadium"
          },
          {
              "id": "1081",
              "title": "Metal Mining Services",
              "fullTitle": "1081 - Metal Mining Services"
          },
          {
              "id": "1094",
              "title": "Uranium",
              "fullTitle": "1094 - Uranium"
          },
          {
              "id": "1099",
              "title": "Miscellaneous Metal Ores, Not Elsewhere Classified",
              "fullTitle": "1099 - Miscellaneous Metal Ores, Not Elsewhere Classified"
          },
          {
              "id": "1221",
              "title": "Bituminous Coal and Lignite Surface Mining",
              "fullTitle": "1221 - Bituminous Coal and Lignite Surface Mining"
          },
          {
              "id": "1222",
              "title": "Bituminous Coal Underground Mining",
              "fullTitle": "1222 - Bituminous Coal Underground Mining"
          },
          {
              "id": "1231",
              "title": "Anthracite Mining",
              "fullTitle": "1231 - Anthracite Mining"
          },
          {
              "id": "1241",
              "title": "Coal Mining Services",
              "fullTitle": "1241 - Coal Mining Services"
          },
          {
              "id": "1311",
              "title": "Crude Petroleum and Natural Gas",
              "fullTitle": "1311 - Crude Petroleum and Natural Gas"
          },
          {
              "id": "1321",
              "title": "Natural Gas Liquids",
              "fullTitle": "1321 - Natural Gas Liquids"
          },
          {
              "id": "1381",
              "title": "Drilling Oil and Gas Wells",
              "fullTitle": "1381 - Drilling Oil and Gas Wells"
          },
          {
              "id": "1382",
              "title": "Oil and Gas Field Exploration Services",
              "fullTitle": "1382 - Oil and Gas Field Exploration Services"
          },
          {
              "id": "1389",
              "title": "Oil and Gas Field Services, Not Elsewhere Classified",
              "fullTitle": "1389 - Oil and Gas Field Services, Not Elsewhere Classified"
          },
          {
              "id": "1411",
              "title": "Dimension Stone",
              "fullTitle": "1411 - Dimension Stone"
          },
          {
              "id": "1422",
              "title": "Crushed and Broken Limestone",
              "fullTitle": "1422 - Crushed and Broken Limestone"
          },
          {
              "id": "1423",
              "title": "Crushed and Broken Granite",
              "fullTitle": "1423 - Crushed and Broken Granite"
          },
          {
              "id": "1429",
              "title": "Crushed and Broken Stone, Not Elsewhere Classified",
              "fullTitle": "1429 - Crushed and Broken Stone, Not Elsewhere Classified"
          },
          {
              "id": "1442",
              "title": "Construction Sand and Gravel",
              "fullTitle": "1442 - Construction Sand and Gravel"
          },
          {
              "id": "1446",
              "title": "Industrial Sand",
              "fullTitle": "1446 - Industrial Sand"
          },
          {
              "id": "1455",
              "title": "Kaolin and Ball Clay",
              "fullTitle": "1455 - Kaolin and Ball Clay"
          },
          {
              "id": "1459",
              "title": "Clay, Ceramic, and Refractory Minerals, Not Elsewhere Classified",
              "fullTitle": "1459 - Clay, Ceramic, and Refractory Minerals, Not Elsewhere Classified"
          },
          {
              "id": "1474",
              "title": "Potash, Soda, and Borate Minerals",
              "fullTitle": "1474 - Potash, Soda, and Borate Minerals"
          },
          {
              "id": "1475",
              "title": "Phosphate Rock",
              "fullTitle": "1475 - Phosphate Rock"
          },
          {
              "id": "1479",
              "title": "Chemical and Fertilizer Mineral Mining, Not Elsewhere Classified",
              "fullTitle": "1479 - Chemical and Fertilizer Mineral Mining, Not Elsewhere Classified"
          },
          {
              "id": "1481",
              "title": "Nonmetallic Minerals Services, Except Fuels",
              "fullTitle": "1481 - Nonmetallic Minerals Services, Except Fuels"
          },
          {
              "id": "1499",
              "title": "Miscellaneous Nonmetallic Minerals, Except Fuels",
              "fullTitle": "1499 - Miscellaneous Nonmetallic Minerals, Except Fuels"
          },
          {
              "id": "1521",
              "title": "General Contractors",
              "fullTitle": "1521 - General Contractors"
          },
          {
              "id": "1522",
              "title": "General Contractors",
              "fullTitle": "1522 - General Contractors"
          },
          {
              "id": "1531",
              "title": "Operative Builders",
              "fullTitle": "1531 - Operative Builders"
          },
          {
              "id": "1541",
              "title": "General Contractors",
              "fullTitle": "1541 - General Contractors"
          },
          {
              "id": "1542",
              "title": "General Contractors",
              "fullTitle": "1542 - General Contractors"
          },
          {
              "id": "1611",
              "title": "Highway and Street Construction, Except Elevated Highways",
              "fullTitle": "1611 - Highway and Street Construction, Except Elevated Highways"
          },
          {
              "id": "1622",
              "title": "Bridge, Tunnel, and Elevated Highway Construction",
              "fullTitle": "1622 - Bridge, Tunnel, and Elevated Highway Construction"
          },
          {
              "id": "1623",
              "title": "Water, Sewer, Pipeline, and Communications and Power Line Construction",
              "fullTitle": "1623 - Water, Sewer, Pipeline, and Communications and Power Line Construction"
          },
          {
              "id": "1629",
              "title": "Heavy Construction, Not Elsewhere Classified",
              "fullTitle": "1629 - Heavy Construction, Not Elsewhere Classified"
          },
          {
              "id": "1711",
              "title": "Plumbing, Heating and Air",
              "fullTitle": "1711 - Plumbing, Heating and Air"
          },
          {
              "id": "1721",
              "title": "Painting and Paper Hanging",
              "fullTitle": "1721 - Painting and Paper Hanging"
          },
          {
              "id": "1731",
              "title": "Electrical Work",
              "fullTitle": "1731 - Electrical Work"
          },
          {
              "id": "1741",
              "title": "Masonry, Stone Setting, and Other Stone Work",
              "fullTitle": "1741 - Masonry, Stone Setting, and Other Stone Work"
          },
          {
              "id": "1742",
              "title": "Plastering, Drywall, Acoustical, and Insulation Work",
              "fullTitle": "1742 - Plastering, Drywall, Acoustical, and Insulation Work"
          },
          {
              "id": "1743",
              "title": "Terrazzo, Tile, Marble, and Mosaic Work",
              "fullTitle": "1743 - Terrazzo, Tile, Marble, and Mosaic Work"
          },
          {
              "id": "1751",
              "title": "Carpentry Work",
              "fullTitle": "1751 - Carpentry Work"
          },
          {
              "id": "1752",
              "title": "Floor Laying and Other Floor Work, Not Elsewhere Classified",
              "fullTitle": "1752 - Floor Laying and Other Floor Work, Not Elsewhere Classified"
          },
          {
              "id": "1761",
              "title": "Roofing, Siding, and Sheet Metal Work",
              "fullTitle": "1761 - Roofing, Siding, and Sheet Metal Work"
          },
          {
              "id": "1771",
              "title": "Concrete Work",
              "fullTitle": "1771 - Concrete Work"
          },
          {
              "id": "1781",
              "title": "Water Well Drilling",
              "fullTitle": "1781 - Water Well Drilling"
          },
          {
              "id": "1791",
              "title": "Structural Steel Erection",
              "fullTitle": "1791 - Structural Steel Erection"
          },
          {
              "id": "1793",
              "title": "Glass and Glazing Work",
              "fullTitle": "1793 - Glass and Glazing Work"
          },
          {
              "id": "1794",
              "title": "Excavation Work",
              "fullTitle": "1794 - Excavation Work"
          },
          {
              "id": "1795",
              "title": "Wrecking and Demolition Work",
              "fullTitle": "1795 - Wrecking and Demolition Work"
          },
          {
              "id": "1796",
              "title": "Installation or Erection of Building Equipment, Not Elsewhere Classified",
              "fullTitle": "1796 - Installation or Erection of Building Equipment, Not Elsewhere Classified"
          },
          {
              "id": "1799",
              "title": "Special Trade Contractors, Not Elsewhere Classified",
              "fullTitle": "1799 - Special Trade Contractors, Not Elsewhere Classified"
          },
          {
              "id": "2011",
              "title": "Meat Packing Plants",
              "fullTitle": "2011 - Meat Packing Plants"
          },
          {
              "id": "2013",
              "title": "Sausages and Other Prepared Meat Products",
              "fullTitle": "2013 - Sausages and Other Prepared Meat Products"
          },
          {
              "id": "2015",
              "title": "Poultry Slaughtering and Processing",
              "fullTitle": "2015 - Poultry Slaughtering and Processing"
          },
          {
              "id": "2021",
              "title": "Creamery Butter",
              "fullTitle": "2021 - Creamery Butter"
          },
          {
              "id": "2022",
              "title": "Natural, Processed, and Imitation Cheese",
              "fullTitle": "2022 - Natural, Processed, and Imitation Cheese"
          },
          {
              "id": "2023",
              "title": "Dry, Condensed, and Evaporated Dairy Products",
              "fullTitle": "2023 - Dry, Condensed, and Evaporated Dairy Products"
          },
          {
              "id": "2024",
              "title": "Ice Cream and Frozen Desserts",
              "fullTitle": "2024 - Ice Cream and Frozen Desserts"
          },
          {
              "id": "2026",
              "title": "Fluid Milk",
              "fullTitle": "2026 - Fluid Milk"
          },
          {
              "id": "2032",
              "title": "Canned Specialties",
              "fullTitle": "2032 - Canned Specialties"
          },
          {
              "id": "2033",
              "title": "Canned Fruits, Vegetables, Preserves, Jams, and Jellies",
              "fullTitle": "2033 - Canned Fruits, Vegetables, Preserves, Jams, and Jellies"
          },
          {
              "id": "2034",
              "title": "Dried and Dehydrated Fruits, Vegetables, and Soup Mixes",
              "fullTitle": "2034 - Dried and Dehydrated Fruits, Vegetables, and Soup Mixes"
          },
          {
              "id": "2035",
              "title": "Pickled Fruits and Vegetables, Vegetable Sauces and Seasonings, and Salad Dressings",
              "fullTitle": "2035 - Pickled Fruits and Vegetables, Vegetable Sauces and Seasonings, and Salad Dressings"
          },
          {
              "id": "2037",
              "title": "Frozen Fruits, Fruit Juices, and Vegetables",
              "fullTitle": "2037 - Frozen Fruits, Fruit Juices, and Vegetables"
          },
          {
              "id": "2038",
              "title": "Frozen Specialties, Not Elsewhere Classified",
              "fullTitle": "2038 - Frozen Specialties, Not Elsewhere Classified"
          },
          {
              "id": "2041",
              "title": "Flour and Other Grain Mill Products",
              "fullTitle": "2041 - Flour and Other Grain Mill Products"
          },
          {
              "id": "2043",
              "title": "Cereal Breakfast Foods",
              "fullTitle": "2043 - Cereal Breakfast Foods"
          },
          {
              "id": "2044",
              "title": "Rice Milling",
              "fullTitle": "2044 - Rice Milling"
          },
          {
              "id": "2045",
              "title": "Prepared Flour Mixes and Doughs",
              "fullTitle": "2045 - Prepared Flour Mixes and Doughs"
          },
          {
              "id": "2046",
              "title": "Wet Corn Milling",
              "fullTitle": "2046 - Wet Corn Milling"
          },
          {
              "id": "2047",
              "title": "Dog and Cat Food",
              "fullTitle": "2047 - Dog and Cat Food"
          },
          {
              "id": "2048",
              "title": "Prepared Feed and Feed Ingredients for Animals and Fowls, Except Dogs and Cats",
              "fullTitle": "2048 - Prepared Feed and Feed Ingredients for Animals and Fowls, Except Dogs and Cats"
          },
          {
              "id": "2051",
              "title": "Bread and Other Bakery Products, Except Cookies and Crackers",
              "fullTitle": "2051 - Bread and Other Bakery Products, Except Cookies and Crackers"
          },
          {
              "id": "2052",
              "title": "Cookies and Crackers",
              "fullTitle": "2052 - Cookies and Crackers"
          },
          {
              "id": "2053",
              "title": "Frozen Bakery Products, Except Bread",
              "fullTitle": "2053 - Frozen Bakery Products, Except Bread"
          },
          {
              "id": "2061",
              "title": "Cane Sugar, Except Refining",
              "fullTitle": "2061 - Cane Sugar, Except Refining"
          },
          {
              "id": "2062",
              "title": "Cane Sugar Refining",
              "fullTitle": "2062 - Cane Sugar Refining"
          },
          {
              "id": "2063",
              "title": "Beet Sugar",
              "fullTitle": "2063 - Beet Sugar"
          },
          {
              "id": "2064",
              "title": "Candy and Other Confectionery Products",
              "fullTitle": "2064 - Candy and Other Confectionery Products"
          },
          {
              "id": "2066",
              "title": "Chocolate and Cocoa Products",
              "fullTitle": "2066 - Chocolate and Cocoa Products"
          },
          {
              "id": "2067",
              "title": "Chewing Gum",
              "fullTitle": "2067 - Chewing Gum"
          },
          {
              "id": "2068",
              "title": "Salted and Roasted Nuts and Seeds",
              "fullTitle": "2068 - Salted and Roasted Nuts and Seeds"
          },
          {
              "id": "2074",
              "title": "Cottonseed Oil Mills",
              "fullTitle": "2074 - Cottonseed Oil Mills"
          },
          {
              "id": "2075",
              "title": "Soybean Oil Mills",
              "fullTitle": "2075 - Soybean Oil Mills"
          },
          {
              "id": "2076",
              "title": "Vegetable Oil Mills, Except Corn, Cottonseed, and Soybean",
              "fullTitle": "2076 - Vegetable Oil Mills, Except Corn, Cottonseed, and Soybean"
          },
          {
              "id": "2077",
              "title": "Animal and Marine Fats and Oils",
              "fullTitle": "2077 - Animal and Marine Fats and Oils"
          },
          {
              "id": "2079",
              "title": "Shortening, Table Oils, Margarine, and Other Edible Fats and Oils, Not Elsewhere Classified",
              "fullTitle": "2079 - Shortening, Table Oils, Margarine, and Other Edible Fats and Oils, Not Elsewhere Classified"
          },
          {
              "id": "2082",
              "title": "Malt Beverages",
              "fullTitle": "2082 - Malt Beverages"
          },
          {
              "id": "2083",
              "title": "Malt",
              "fullTitle": "2083 - Malt"
          },
          {
              "id": "2084",
              "title": "Wines, Brandy, and Brandy Spirits",
              "fullTitle": "2084 - Wines, Brandy, and Brandy Spirits"
          },
          {
              "id": "2085",
              "title": "Distilled and Blended Liquors",
              "fullTitle": "2085 - Distilled and Blended Liquors"
          },
          {
              "id": "2086",
              "title": "Bottled and Canned Soft Drinks and Carbonated Waters",
              "fullTitle": "2086 - Bottled and Canned Soft Drinks and Carbonated Waters"
          },
          {
              "id": "2087",
              "title": "Flavoring Extracts and Flavoring Syrups, Not Elsewhere Classified",
              "fullTitle": "2087 - Flavoring Extracts and Flavoring Syrups, Not Elsewhere Classified"
          },
          {
              "id": "2091",
              "title": "Canned and Cured Fish and Seafoods",
              "fullTitle": "2091 - Canned and Cured Fish and Seafoods"
          },
          {
              "id": "2092",
              "title": "Prepared Fresh or Frozen Fish and Seafoods",
              "fullTitle": "2092 - Prepared Fresh or Frozen Fish and Seafoods"
          },
          {
              "id": "2095",
              "title": "Roasted Coffee",
              "fullTitle": "2095 - Roasted Coffee"
          },
          {
              "id": "2096",
              "title": "Potato Chips, Corn Chips, and Similar Snacks",
              "fullTitle": "2096 - Potato Chips, Corn Chips, and Similar Snacks"
          },
          {
              "id": "2097",
              "title": "Manufactured Ice",
              "fullTitle": "2097 - Manufactured Ice"
          },
          {
              "id": "2098",
              "title": "Macaroni, Spaghetti, Vermicelli, and Noodles",
              "fullTitle": "2098 - Macaroni, Spaghetti, Vermicelli, and Noodles"
          },
          {
              "id": "2099",
              "title": "Food Preparations, Not Elsewhere Classified",
              "fullTitle": "2099 - Food Preparations, Not Elsewhere Classified"
          },
          {
              "id": "2111",
              "title": "Cigarettes",
              "fullTitle": "2111 - Cigarettes"
          },
          {
              "id": "2121",
              "title": "Cigars",
              "fullTitle": "2121 - Cigars"
          },
          {
              "id": "2131",
              "title": "Chewing and Smoking Tobacco and Snuff",
              "fullTitle": "2131 - Chewing and Smoking Tobacco and Snuff"
          },
          {
              "id": "2141",
              "title": "Tobacco Stemming and Redrying",
              "fullTitle": "2141 - Tobacco Stemming and Redrying"
          },
          {
              "id": "2211",
              "title": "Broadwoven Fabric Mills, Cotton",
              "fullTitle": "2211 - Broadwoven Fabric Mills, Cotton"
          },
          {
              "id": "2221",
              "title": "Broadwoven Fabric Mills, Manmade Fiber and Silk",
              "fullTitle": "2221 - Broadwoven Fabric Mills, Manmade Fiber and Silk"
          },
          {
              "id": "2231",
              "title": "Broadwoven Fabric Mills, Wool (Including Dyeing and Finishing)",
              "fullTitle": "2231 - Broadwoven Fabric Mills, Wool (Including Dyeing and Finishing)"
          },
          {
              "id": "2241",
              "title": "Narrow Fabric and Other Smallware Mills Cotton, Wool, Silk, and Manmade Fiber",
              "fullTitle": "2241 - Narrow Fabric and Other Smallware Mills Cotton, Wool, Silk, and Manmade Fiber"
          },
          {
              "id": "2251",
              "title": "Women's Full",
              "fullTitle": "2251 - Women's Full"
          },
          {
              "id": "2252",
              "title": "Hosiery, Not Elsewhere Classified",
              "fullTitle": "2252 - Hosiery, Not Elsewhere Classified"
          },
          {
              "id": "2253",
              "title": "Knit Outerwear Mills",
              "fullTitle": "2253 - Knit Outerwear Mills"
          },
          {
              "id": "2254",
              "title": "Knit Underwear and Nightwear Mills",
              "fullTitle": "2254 - Knit Underwear and Nightwear Mills"
          },
          {
              "id": "2257",
              "title": "Weft Knit Fabric Mills",
              "fullTitle": "2257 - Weft Knit Fabric Mills"
          },
          {
              "id": "2258",
              "title": "Lace and Warp Knit Fabric Mills",
              "fullTitle": "2258 - Lace and Warp Knit Fabric Mills"
          },
          {
              "id": "2259",
              "title": "Knitting Mills, Not Elsewhere Classified",
              "fullTitle": "2259 - Knitting Mills, Not Elsewhere Classified"
          },
          {
              "id": "2261",
              "title": "Finishers of Broadwoven Fabrics of Cotton",
              "fullTitle": "2261 - Finishers of Broadwoven Fabrics of Cotton"
          },
          {
              "id": "2262",
              "title": "Finishers of Broadwoven Fabrics of Manmade Fiber and Silk",
              "fullTitle": "2262 - Finishers of Broadwoven Fabrics of Manmade Fiber and Silk"
          },
          {
              "id": "2269",
              "title": "Finishers of Textiles, Not Elsewhere Classified",
              "fullTitle": "2269 - Finishers of Textiles, Not Elsewhere Classified"
          },
          {
              "id": "2273",
              "title": "Carpets and Rugs",
              "fullTitle": "2273 - Carpets and Rugs"
          },
          {
              "id": "2281",
              "title": "Yarn Spinning Mills",
              "fullTitle": "2281 - Yarn Spinning Mills"
          },
          {
              "id": "2282",
              "title": "Yarn Texturizing, Throwing, Twisting, and Winding Mills",
              "fullTitle": "2282 - Yarn Texturizing, Throwing, Twisting, and Winding Mills"
          },
          {
              "id": "2284",
              "title": "Thread Mills",
              "fullTitle": "2284 - Thread Mills"
          },
          {
              "id": "2295",
              "title": "Coated Fabrics, Not Rubberized",
              "fullTitle": "2295 - Coated Fabrics, Not Rubberized"
          },
          {
              "id": "2296",
              "title": "Tire Cord and Fabrics",
              "fullTitle": "2296 - Tire Cord and Fabrics"
          },
          {
              "id": "2297",
              "title": "Non-Woven Fabrics",
              "fullTitle": "2297 - Non-Woven Fabrics"
          },
          {
              "id": "2298",
              "title": "Cordage and Twine",
              "fullTitle": "2298 - Cordage and Twine"
          },
          {
              "id": "2299",
              "title": "Textile goods, Not Elsewhere Classified",
              "fullTitle": "2299 - Textile goods, Not Elsewhere Classified"
          },
          {
              "id": "2311",
              "title": "Men's and Boys' Suits, Coats, and Overcoats",
              "fullTitle": "2311 - Men's and Boys' Suits, Coats, and Overcoats"
          },
          {
              "id": "2321",
              "title": "Men's and Boys' Shirts, Except Work Shirts",
              "fullTitle": "2321 - Men's and Boys' Shirts, Except Work Shirts"
          },
          {
              "id": "2322",
              "title": "Men's and Boys' Underwear and Nightwear",
              "fullTitle": "2322 - Men's and Boys' Underwear and Nightwear"
          },
          {
              "id": "2323",
              "title": "Men's and Boys' Neckwear",
              "fullTitle": "2323 - Men's and Boys' Neckwear"
          },
          {
              "id": "2325",
              "title": "Men's and Boys' Separate Trousers and Slacks",
              "fullTitle": "2325 - Men's and Boys' Separate Trousers and Slacks"
          },
          {
              "id": "2326",
              "title": "Men's and Boys' Work Clothing",
              "fullTitle": "2326 - Men's and Boys' Work Clothing"
          },
          {
              "id": "2329",
              "title": "Men's and Boys' Clothing, Not Elsewhere Classified",
              "fullTitle": "2329 - Men's and Boys' Clothing, Not Elsewhere Classified"
          },
          {
              "id": "2331",
              "title": "Women's, Misses', and Juniors' Blouses and Shirts",
              "fullTitle": "2331 - Women's, Misses', and Juniors' Blouses and Shirts"
          },
          {
              "id": "2335",
              "title": "Women's, Misses', and Juniors' Dresses",
              "fullTitle": "2335 - Women's, Misses', and Juniors' Dresses"
          },
          {
              "id": "2337",
              "title": "Women's, Misses', and Juniors' Suits, Skirts, and Coats",
              "fullTitle": "2337 - Women's, Misses', and Juniors' Suits, Skirts, and Coats"
          },
          {
              "id": "2339",
              "title": "Women's, Misses', and Juniors' Outerwear, Not Elsewhere Classified",
              "fullTitle": "2339 - Women's, Misses', and Juniors' Outerwear, Not Elsewhere Classified"
          },
          {
              "id": "2341",
              "title": "Women's, Misses', Children's, and Infants' Underwear and Nightwear",
              "fullTitle": "2341 - Women's, Misses', Children's, and Infants' Underwear and Nightwear"
          },
          {
              "id": "2342",
              "title": "Brassieres, Girdles, and Allied Garments",
              "fullTitle": "2342 - Brassieres, Girdles, and Allied Garments"
          },
          {
              "id": "2353",
              "title": "Hats, Caps, and Millinery",
              "fullTitle": "2353 - Hats, Caps, and Millinery"
          },
          {
              "id": "2361",
              "title": "Girls', Children's, and Infants' Dresses, Blouses, and Shirts",
              "fullTitle": "2361 - Girls', Children's, and Infants' Dresses, Blouses, and Shirts"
          },
          {
              "id": "2369",
              "title": "Girls', Children's, and Infants' Outerwear, Not Elsewhere Classified",
              "fullTitle": "2369 - Girls', Children's, and Infants' Outerwear, Not Elsewhere Classified"
          },
          {
              "id": "2371",
              "title": "Fur Goods",
              "fullTitle": "2371 - Fur Goods"
          },
          {
              "id": "2381",
              "title": "Dress and Work Gloves, Except Knit and All",
              "fullTitle": "2381 - Dress and Work Gloves, Except Knit and All"
          },
          {
              "id": "2384",
              "title": "Robes and Dressing Gowns",
              "fullTitle": "2384 - Robes and Dressing Gowns"
          },
          {
              "id": "2385",
              "title": "Waterproof Outerwear",
              "fullTitle": "2385 - Waterproof Outerwear"
          },
          {
              "id": "2386",
              "title": "Leather and Sheep",
              "fullTitle": "2386 - Leather and Sheep"
          },
          {
              "id": "2387",
              "title": "Apparel belts",
              "fullTitle": "2387 - Apparel belts"
          },
          {
              "id": "2389",
              "title": "Apparel and Accessories, Not Elsewhere Classified",
              "fullTitle": "2389 - Apparel and Accessories, Not Elsewhere Classified"
          },
          {
              "id": "2391",
              "title": "Curtains and Draperies",
              "fullTitle": "2391 - Curtains and Draperies"
          },
          {
              "id": "2392",
              "title": "House furnishing, Except Curtains and Draperies",
              "fullTitle": "2392 - House furnishing, Except Curtains and Draperies"
          },
          {
              "id": "2393",
              "title": "Textile Bags",
              "fullTitle": "2393 - Textile Bags"
          },
          {
              "id": "2394",
              "title": "Canvas and Related Products",
              "fullTitle": "2394 - Canvas and Related Products"
          },
          {
              "id": "2395",
              "title": "Pleating, Decorative and Novelty Stitching, and Tucking for the Trade",
              "fullTitle": "2395 - Pleating, Decorative and Novelty Stitching, and Tucking for the Trade"
          },
          {
              "id": "2396",
              "title": "Automotive Trimmings, Apparel Findings, and Related Products",
              "fullTitle": "2396 - Automotive Trimmings, Apparel Findings, and Related Products"
          },
          {
              "id": "2397",
              "title": "Schiffli Machine Embroideries",
              "fullTitle": "2397 - Schiffli Machine Embroideries"
          },
          {
              "id": "2399",
              "title": "Fabricated Textile Products, Not Elsewhere Classified",
              "fullTitle": "2399 - Fabricated Textile Products, Not Elsewhere Classified"
          },
          {
              "id": "2411",
              "title": "Logging",
              "fullTitle": "2411 - Logging"
          },
          {
              "id": "2421",
              "title": "Sawmills and Planing Mills, General",
              "fullTitle": "2421 - Sawmills and Planing Mills, General"
          },
          {
              "id": "2426",
              "title": "Hardwood Dimension and Flooring Mills",
              "fullTitle": "2426 - Hardwood Dimension and Flooring Mills"
          },
          {
              "id": "2429",
              "title": "Special Product Sawmills, Not Elsewhere Classified",
              "fullTitle": "2429 - Special Product Sawmills, Not Elsewhere Classified"
          },
          {
              "id": "2431",
              "title": "Millwork",
              "fullTitle": "2431 - Millwork"
          },
          {
              "id": "2434",
              "title": "Wood Kitchen Cabinets",
              "fullTitle": "2434 - Wood Kitchen Cabinets"
          },
          {
              "id": "2435",
              "title": "Hardwood Veneer and Plywood",
              "fullTitle": "2435 - Hardwood Veneer and Plywood"
          },
          {
              "id": "2436",
              "title": "Softwood Veneer and Plywood",
              "fullTitle": "2436 - Softwood Veneer and Plywood"
          },
          {
              "id": "2439",
              "title": "Structural Wood Members, Not Elsewhere Classified",
              "fullTitle": "2439 - Structural Wood Members, Not Elsewhere Classified"
          },
          {
              "id": "2441",
              "title": "Nailed and Lock Corner Wood Boxes and Shook",
              "fullTitle": "2441 - Nailed and Lock Corner Wood Boxes and Shook"
          },
          {
              "id": "2448",
              "title": "Wood Pallets and Skids",
              "fullTitle": "2448 - Wood Pallets and Skids"
          },
          {
              "id": "2449",
              "title": "Wood Containers, Not Elsewhere Classified",
              "fullTitle": "2449 - Wood Containers, Not Elsewhere Classified"
          },
          {
              "id": "2451",
              "title": "Mobile Homes",
              "fullTitle": "2451 - Mobile Homes"
          },
          {
              "id": "2452",
              "title": "Prefabricated Wood Buildings and Components",
              "fullTitle": "2452 - Prefabricated Wood Buildings and Components"
          },
          {
              "id": "2491",
              "title": "Wood Preserving",
              "fullTitle": "2491 - Wood Preserving"
          },
          {
              "id": "2493",
              "title": "Reconstituted Wood Products",
              "fullTitle": "2493 - Reconstituted Wood Products"
          },
          {
              "id": "2499",
              "title": "Wood Products, Not Elsewhere Classified",
              "fullTitle": "2499 - Wood Products, Not Elsewhere Classified"
          },
          {
              "id": "2511",
              "title": "Wood Household Furniture, Except Upholstered",
              "fullTitle": "2511 - Wood Household Furniture, Except Upholstered"
          },
          {
              "id": "2512",
              "title": "Wood Household Furniture, Upholstered",
              "fullTitle": "2512 - Wood Household Furniture, Upholstered"
          },
          {
              "id": "2514",
              "title": "Metal Household Furniture",
              "fullTitle": "2514 - Metal Household Furniture"
          },
          {
              "id": "2515",
              "title": "Mattresses, Foundations, and Convertible Beds",
              "fullTitle": "2515 - Mattresses, Foundations, and Convertible Beds"
          },
          {
              "id": "2517",
              "title": "Wood Television, Radio, Phonograph, and Sewing Machine Cabinets",
              "fullTitle": "2517 - Wood Television, Radio, Phonograph, and Sewing Machine Cabinets"
          },
          {
              "id": "2519",
              "title": "Household Furniture, Not Elsewhere Classified",
              "fullTitle": "2519 - Household Furniture, Not Elsewhere Classified"
          },
          {
              "id": "2521",
              "title": "Wood Office Furniture",
              "fullTitle": "2521 - Wood Office Furniture"
          },
          {
              "id": "2522",
              "title": "Office Furniture, Except Wood",
              "fullTitle": "2522 - Office Furniture, Except Wood"
          },
          {
              "id": "2531",
              "title": "Public Building and Related Furniture",
              "fullTitle": "2531 - Public Building and Related Furniture"
          },
          {
              "id": "2541",
              "title": "Wood Office and Store Fixtures, Partitions, Shelving, and Lockers",
              "fullTitle": "2541 - Wood Office and Store Fixtures, Partitions, Shelving, and Lockers"
          },
          {
              "id": "2542",
              "title": "Office and Store Fixtures, Partitions, Shelving, and Lockers, Except Wood",
              "fullTitle": "2542 - Office and Store Fixtures, Partitions, Shelving, and Lockers, Except Wood"
          },
          {
              "id": "2591",
              "title": "Drapery Hardware and Window Blinds and Shades",
              "fullTitle": "2591 - Drapery Hardware and Window Blinds and Shades"
          },
          {
              "id": "2599",
              "title": "Furniture and Fixtures, Not Elsewhere Classified",
              "fullTitle": "2599 - Furniture and Fixtures, Not Elsewhere Classified"
          },
          {
              "id": "2611",
              "title": "Pulp Mills",
              "fullTitle": "2611 - Pulp Mills"
          },
          {
              "id": "2621",
              "title": "Paper Mills",
              "fullTitle": "2621 - Paper Mills"
          },
          {
              "id": "2631",
              "title": "Paperboard Mills",
              "fullTitle": "2631 - Paperboard Mills"
          },
          {
              "id": "2652",
              "title": "Setup Paperboard Boxes",
              "fullTitle": "2652 - Setup Paperboard Boxes"
          },
          {
              "id": "2653",
              "title": "Corrugated and Solid Fiber Boxes",
              "fullTitle": "2653 - Corrugated and Solid Fiber Boxes"
          },
          {
              "id": "2655",
              "title": "Fiber Cans, Tubes, Drums, and Similar Products",
              "fullTitle": "2655 - Fiber Cans, Tubes, Drums, and Similar Products"
          },
          {
              "id": "2656",
              "title": "Sanitary Food Containers, Except Folding",
              "fullTitle": "2656 - Sanitary Food Containers, Except Folding"
          },
          {
              "id": "2657",
              "title": "Folding Paperboard Boxes, Including Sanitary",
              "fullTitle": "2657 - Folding Paperboard Boxes, Including Sanitary"
          },
          {
              "id": "2671",
              "title": "Packaging Paper and Plastics Film, Coated and Laminated",
              "fullTitle": "2671 - Packaging Paper and Plastics Film, Coated and Laminated"
          },
          {
              "id": "2672",
              "title": "Coated and Laminated Paper, Not Elsewhere Classified",
              "fullTitle": "2672 - Coated and Laminated Paper, Not Elsewhere Classified"
          },
          {
              "id": "2673",
              "title": "Plastics, Foil, and Coated Paper Bags",
              "fullTitle": "2673 - Plastics, Foil, and Coated Paper Bags"
          },
          {
              "id": "2674",
              "title": "Uncoated Paper and Multiwall Bags",
              "fullTitle": "2674 - Uncoated Paper and Multiwall Bags"
          },
          {
              "id": "2675",
              "title": "Die-Cut Paper and Paperboard and Cardboard",
              "fullTitle": "2675 - Die-Cut Paper and Paperboard and Cardboard"
          },
          {
              "id": "2676",
              "title": "Sanitary Paper Products",
              "fullTitle": "2676 - Sanitary Paper Products"
          },
          {
              "id": "2677",
              "title": "Envelopes",
              "fullTitle": "2677 - Envelopes"
          },
          {
              "id": "2678",
              "title": "Stationery, Tablets, and Related Products",
              "fullTitle": "2678 - Stationery, Tablets, and Related Products"
          },
          {
              "id": "2679",
              "title": "Converted Paper and Paperboard Products, Not Elsewhere Classified",
              "fullTitle": "2679 - Converted Paper and Paperboard Products, Not Elsewhere Classified"
          },
          {
              "id": "2711",
              "title": "Newspapers Publishing, or Publishing and Printing",
              "fullTitle": "2711 - Newspapers Publishing, or Publishing and Printing"
          },
          {
              "id": "2721",
              "title": "Periodicals Publishing, or Publishing and Printing",
              "fullTitle": "2721 - Periodicals Publishing, or Publishing and Printing"
          },
          {
              "id": "2731",
              "title": "Books Publishing, or Publishing and Printing",
              "fullTitle": "2731 - Books Publishing, or Publishing and Printing"
          },
          {
              "id": "2732",
              "title": "Book Printing",
              "fullTitle": "2732 - Book Printing"
          },
          {
              "id": "2741",
              "title": "Miscellaneous Publishing",
              "fullTitle": "2741 - Miscellaneous Publishing"
          },
          {
              "id": "2752",
              "title": "Commercial Printing, Lithographic",
              "fullTitle": "2752 - Commercial Printing, Lithographic"
          },
          {
              "id": "2754",
              "title": "Commercial Printing, Gravure",
              "fullTitle": "2754 - Commercial Printing, Gravure"
          },
          {
              "id": "2759",
              "title": "Commercial Printing, Not Elsewhere Classified",
              "fullTitle": "2759 - Commercial Printing, Not Elsewhere Classified"
          },
          {
              "id": "2761",
              "title": "Manifold Business Forms",
              "fullTitle": "2761 - Manifold Business Forms"
          },
          {
              "id": "2771",
              "title": "Greeting Cards",
              "fullTitle": "2771 - Greeting Cards"
          },
          {
              "id": "2782",
              "title": "Blankbooks, Looseleaf Binders and Devices",
              "fullTitle": "2782 - Blankbooks, Looseleaf Binders and Devices"
          },
          {
              "id": "2789",
              "title": "Bookbinding and Related Work",
              "fullTitle": "2789 - Bookbinding and Related Work"
          },
          {
              "id": "2791",
              "title": "Typesetting",
              "fullTitle": "2791 - Typesetting"
          },
          {
              "id": "2796",
              "title": "Platemaking and Related Services",
              "fullTitle": "2796 - Platemaking and Related Services"
          },
          {
              "id": "2812",
              "title": "Alkalies and Chlorine",
              "fullTitle": "2812 - Alkalies and Chlorine"
          },
          {
              "id": "2813",
              "title": "Industrial Gases",
              "fullTitle": "2813 - Industrial Gases"
          },
          {
              "id": "2816",
              "title": "Inorganic Pigments",
              "fullTitle": "2816 - Inorganic Pigments"
          },
          {
              "id": "2819",
              "title": "Industrial Inorganic Chemicals, Not Elsewhere Classified",
              "fullTitle": "2819 - Industrial Inorganic Chemicals, Not Elsewhere Classified"
          },
          {
              "id": "2821",
              "title": "Plastics Materials, Synthetic Resins, and Nonvulcanizable Elastomers",
              "fullTitle": "2821 - Plastics Materials, Synthetic Resins, and Nonvulcanizable Elastomers"
          },
          {
              "id": "2822",
              "title": "Synthetic Rubber (Vulcanizable Elastomers)",
              "fullTitle": "2822 - Synthetic Rubber (Vulcanizable Elastomers)"
          },
          {
              "id": "2823",
              "title": "Cellulosic Manmade Fibers",
              "fullTitle": "2823 - Cellulosic Manmade Fibers"
          },
          {
              "id": "2824",
              "title": "Manmade Organic Fibers, Except Cellulosic",
              "fullTitle": "2824 - Manmade Organic Fibers, Except Cellulosic"
          },
          {
              "id": "2833",
              "title": "Medicinal Chemicals and Botanical Products",
              "fullTitle": "2833 - Medicinal Chemicals and Botanical Products"
          },
          {
              "id": "2834",
              "title": "Pharmaceutical Preparations",
              "fullTitle": "2834 - Pharmaceutical Preparations"
          },
          {
              "id": "2835",
              "title": "In Vitro and In Vivo Diagnostic Substances",
              "fullTitle": "2835 - In Vitro and In Vivo Diagnostic Substances"
          },
          {
              "id": "2836",
              "title": "Biological Products, Except Diagnostic Substances",
              "fullTitle": "2836 - Biological Products, Except Diagnostic Substances"
          },
          {
              "id": "2841",
              "title": "Soap and Other Detergents, Except Specialty Cleaners",
              "fullTitle": "2841 - Soap and Other Detergents, Except Specialty Cleaners"
          },
          {
              "id": "2842",
              "title": "Specialty Cleaning, Polishing, and Sanitation Preparations",
              "fullTitle": "2842 - Specialty Cleaning, Polishing, and Sanitation Preparations"
          },
          {
              "id": "2843",
              "title": "Surface Active Agents, Finishing Agents, Sulfonated Oils, and Assistants",
              "fullTitle": "2843 - Surface Active Agents, Finishing Agents, Sulfonated Oils, and Assistants"
          },
          {
              "id": "2844",
              "title": "Perfumes, Cosmetics, and Other Toilet Preparations",
              "fullTitle": "2844 - Perfumes, Cosmetics, and Other Toilet Preparations"
          },
          {
              "id": "2851",
              "title": "Paints, Varnishes, Lacquers, Enamels, and Allied Products",
              "fullTitle": "2851 - Paints, Varnishes, Lacquers, Enamels, and Allied Products"
          },
          {
              "id": "2861",
              "title": "Gum and Wood Chemicals",
              "fullTitle": "2861 - Gum and Wood Chemicals"
          },
          {
              "id": "2865",
              "title": "Cyclic Organic Crudes and Intermediates, and organic Dyes and Pigments",
              "fullTitle": "2865 - Cyclic Organic Crudes and Intermediates, and organic Dyes and Pigments"
          },
          {
              "id": "2869",
              "title": "Industrial Organic Chemicals, Not Elsewhere Classified",
              "fullTitle": "2869 - Industrial Organic Chemicals, Not Elsewhere Classified"
          },
          {
              "id": "2873",
              "title": "Nitrogenous Fertilizers",
              "fullTitle": "2873 - Nitrogenous Fertilizers"
          },
          {
              "id": "2874",
              "title": "Phosphatic Fertilizers",
              "fullTitle": "2874 - Phosphatic Fertilizers"
          },
          {
              "id": "2875",
              "title": "Fertilizers, Mixing only",
              "fullTitle": "2875 - Fertilizers, Mixing only"
          },
          {
              "id": "2879",
              "title": "Pesticides and Agricultural Chemicals, Not Elsewhere Classified",
              "fullTitle": "2879 - Pesticides and Agricultural Chemicals, Not Elsewhere Classified"
          },
          {
              "id": "2891",
              "title": "Adhesives and Sealants",
              "fullTitle": "2891 - Adhesives and Sealants"
          },
          {
              "id": "2892",
              "title": "Explosives",
              "fullTitle": "2892 - Explosives"
          },
          {
              "id": "2893",
              "title": "Printing Ink",
              "fullTitle": "2893 - Printing Ink"
          },
          {
              "id": "2895",
              "title": "Carbon Black",
              "fullTitle": "2895 - Carbon Black"
          },
          {
              "id": "2899",
              "title": "Chemicals and Chemical Preparations, Not Elsewhere Classified",
              "fullTitle": "2899 - Chemicals and Chemical Preparations, Not Elsewhere Classified"
          },
          {
              "id": "2911",
              "title": "Petroleum Refining",
              "fullTitle": "2911 - Petroleum Refining"
          },
          {
              "id": "2951",
              "title": "Asphalt Paving Mixtures and Blocks",
              "fullTitle": "2951 - Asphalt Paving Mixtures and Blocks"
          },
          {
              "id": "2952",
              "title": "Asphalt Felts and Coatings",
              "fullTitle": "2952 - Asphalt Felts and Coatings"
          },
          {
              "id": "2992",
              "title": "Lubricating Oils and Greases",
              "fullTitle": "2992 - Lubricating Oils and Greases"
          },
          {
              "id": "2999",
              "title": "Products of Petroleum and Coal, Not Elsewhere Classified",
              "fullTitle": "2999 - Products of Petroleum and Coal, Not Elsewhere Classified"
          },
          {
              "id": "3011",
              "title": "Tires and Inner Tubes",
              "fullTitle": "3011 - Tires and Inner Tubes"
          },
          {
              "id": "3021",
              "title": "Rubber and Plastics Footwear",
              "fullTitle": "3021 - Rubber and Plastics Footwear"
          },
          {
              "id": "3052",
              "title": "Rubber and Plastics Hose and Belting",
              "fullTitle": "3052 - Rubber and Plastics Hose and Belting"
          },
          {
              "id": "3053",
              "title": "Gaskets, Packing, and Sealing Devices",
              "fullTitle": "3053 - Gaskets, Packing, and Sealing Devices"
          },
          {
              "id": "3061",
              "title": "Molded, Extruded, and Lathe",
              "fullTitle": "3061 - Molded, Extruded, and Lathe"
          },
          {
              "id": "3069",
              "title": "Fabricated Rubber Products, Not Elsewhere Classified",
              "fullTitle": "3069 - Fabricated Rubber Products, Not Elsewhere Classified"
          },
          {
              "id": "3081",
              "title": "Unsupported Plastics Film and Sheet",
              "fullTitle": "3081 - Unsupported Plastics Film and Sheet"
          },
          {
              "id": "3082",
              "title": "Unsupported Plastics Profile Shapes",
              "fullTitle": "3082 - Unsupported Plastics Profile Shapes"
          },
          {
              "id": "3083",
              "title": "Laminated Plastics Plate, Sheet, and Profile Shapes",
              "fullTitle": "3083 - Laminated Plastics Plate, Sheet, and Profile Shapes"
          },
          {
              "id": "3084",
              "title": "Plastics Pipe",
              "fullTitle": "3084 - Plastics Pipe"
          },
          {
              "id": "3085",
              "title": "Plastics Bottles",
              "fullTitle": "3085 - Plastics Bottles"
          },
          {
              "id": "3086",
              "title": "Plastics Foam Products",
              "fullTitle": "3086 - Plastics Foam Products"
          },
          {
              "id": "3087",
              "title": "Custom Compounding of Purchased Plastics Resins",
              "fullTitle": "3087 - Custom Compounding of Purchased Plastics Resins"
          },
          {
              "id": "3088",
              "title": "Plastics Plumbing Fixtures",
              "fullTitle": "3088 - Plastics Plumbing Fixtures"
          },
          {
              "id": "3089",
              "title": "Plastics Products, Not Elsewhere Classified",
              "fullTitle": "3089 - Plastics Products, Not Elsewhere Classified"
          },
          {
              "id": "3111",
              "title": "Leather Tanning and Finishing",
              "fullTitle": "3111 - Leather Tanning and Finishing"
          },
          {
              "id": "3131",
              "title": "Boot and Shoe Cut Stock and Findings",
              "fullTitle": "3131 - Boot and Shoe Cut Stock and Findings"
          },
          {
              "id": "3142",
              "title": "House Slippers",
              "fullTitle": "3142 - House Slippers"
          },
          {
              "id": "3143",
              "title": "Men's Footwear, Except Athletic",
              "fullTitle": "3143 - Men's Footwear, Except Athletic"
          },
          {
              "id": "3144",
              "title": "Women's Footwear, Except Athletic",
              "fullTitle": "3144 - Women's Footwear, Except Athletic"
          },
          {
              "id": "3149",
              "title": "Footwear, Except Rubber, Not Elsewhere Classified",
              "fullTitle": "3149 - Footwear, Except Rubber, Not Elsewhere Classified"
          },
          {
              "id": "3151",
              "title": "Leather Gloves and Mittens",
              "fullTitle": "3151 - Leather Gloves and Mittens"
          },
          {
              "id": "3161",
              "title": "Luggage",
              "fullTitle": "3161 - Luggage"
          },
          {
              "id": "3171",
              "title": "Women's Handbags and Purses",
              "fullTitle": "3171 - Women's Handbags and Purses"
          },
          {
              "id": "3172",
              "title": "Personal Leather Goods, Except Women's Handbags and Purses",
              "fullTitle": "3172 - Personal Leather Goods, Except Women's Handbags and Purses"
          },
          {
              "id": "3199",
              "title": "Leather Goods, Not Elsewhere Classified",
              "fullTitle": "3199 - Leather Goods, Not Elsewhere Classified"
          },
          {
              "id": "3211",
              "title": "Flat Glass",
              "fullTitle": "3211 - Flat Glass"
          },
          {
              "id": "3221",
              "title": "Glass Containers",
              "fullTitle": "3221 - Glass Containers"
          },
          {
              "id": "3229",
              "title": "Pressed and Blown Glass and Glassware, Not Elsewhere Classified",
              "fullTitle": "3229 - Pressed and Blown Glass and Glassware, Not Elsewhere Classified"
          },
          {
              "id": "3231",
              "title": "Glass Products, Made of Purchased Glass",
              "fullTitle": "3231 - Glass Products, Made of Purchased Glass"
          },
          {
              "id": "3241",
              "title": "Cement, Hydraulic",
              "fullTitle": "3241 - Cement, Hydraulic"
          },
          {
              "id": "3251",
              "title": "Brick and Structural Clay Tile",
              "fullTitle": "3251 - Brick and Structural Clay Tile"
          },
          {
              "id": "3253",
              "title": "Ceramic Wall and Floor Tile",
              "fullTitle": "3253 - Ceramic Wall and Floor Tile"
          },
          {
              "id": "3255",
              "title": "Clay Refractories",
              "fullTitle": "3255 - Clay Refractories"
          },
          {
              "id": "3259",
              "title": "Structural Clay Products, Not Elsewhere Classified",
              "fullTitle": "3259 - Structural Clay Products, Not Elsewhere Classified"
          },
          {
              "id": "3261",
              "title": "Vitreous China Plumbing Fixtures and China and Earthenware Fittings and Bathroom Accessories",
              "fullTitle": "3261 - Vitreous China Plumbing Fixtures and China and Earthenware Fittings and Bathroom Accessories"
          },
          {
              "id": "3262",
              "title": "Vitreous China Table and Kitchen Articles",
              "fullTitle": "3262 - Vitreous China Table and Kitchen Articles"
          },
          {
              "id": "3263",
              "title": "Fine Earthenware (Whiteware) Table and Kitchen Articles",
              "fullTitle": "3263 - Fine Earthenware (Whiteware) Table and Kitchen Articles"
          },
          {
              "id": "3264",
              "title": "Porcelain Electrical Supplies",
              "fullTitle": "3264 - Porcelain Electrical Supplies"
          },
          {
              "id": "3269",
              "title": "Pottery Products, Not Elsewhere Classified",
              "fullTitle": "3269 - Pottery Products, Not Elsewhere Classified"
          },
          {
              "id": "3271",
              "title": "Concrete Block and Brick",
              "fullTitle": "3271 - Concrete Block and Brick"
          },
          {
              "id": "3272",
              "title": "Concrete Products, Except Block and Brick",
              "fullTitle": "3272 - Concrete Products, Except Block and Brick"
          },
          {
              "id": "3273",
              "title": "Ready-Mixed Concrete",
              "fullTitle": "3273 - Ready-Mixed Concrete"
          },
          {
              "id": "3274",
              "title": "Lime",
              "fullTitle": "3274 - Lime"
          },
          {
              "id": "3275",
              "title": "Gypsum Products",
              "fullTitle": "3275 - Gypsum Products"
          },
          {
              "id": "3281",
              "title": "Cut Stone and Stone Products",
              "fullTitle": "3281 - Cut Stone and Stone Products"
          },
          {
              "id": "3291",
              "title": "Abrasive Products",
              "fullTitle": "3291 - Abrasive Products"
          },
          {
              "id": "3292",
              "title": "Asbestos Products",
              "fullTitle": "3292 - Asbestos Products"
          },
          {
              "id": "3295",
              "title": "Minerals and Earths, Ground or Otherwise Treated",
              "fullTitle": "3295 - Minerals and Earths, Ground or Otherwise Treated"
          },
          {
              "id": "3296",
              "title": "Mineral Wool",
              "fullTitle": "3296 - Mineral Wool"
          },
          {
              "id": "3297",
              "title": "Nonclay Refractories",
              "fullTitle": "3297 - Nonclay Refractories"
          },
          {
              "id": "3299",
              "title": "Nonmetallic Mineral Products, Not Elsewhere Classified",
              "fullTitle": "3299 - Nonmetallic Mineral Products, Not Elsewhere Classified"
          },
          {
              "id": "3312",
              "title": "Steel Works, Blast Furnaces (Including Coke Ovens), and Rolling Mills",
              "fullTitle": "3312 - Steel Works, Blast Furnaces (Including Coke Ovens), and Rolling Mills"
          },
          {
              "id": "3313",
              "title": "Electrometallurgical Products, Except Steel",
              "fullTitle": "3313 - Electrometallurgical Products, Except Steel"
          },
          {
              "id": "3315",
              "title": "Steel Wiredrawing and Steel Nails and Spikes",
              "fullTitle": "3315 - Steel Wiredrawing and Steel Nails and Spikes"
          },
          {
              "id": "3316",
              "title": "Cold-rolled Steel Sheet, Strip, and Bars",
              "fullTitle": "3316 - Cold-rolled Steel Sheet, Strip, and Bars"
          },
          {
              "id": "3317",
              "title": "Steel Pipe and Tubes",
              "fullTitle": "3317 - Steel Pipe and Tubes"
          },
          {
              "id": "3321",
              "title": "Gray and Ductile Iron Foundries",
              "fullTitle": "3321 - Gray and Ductile Iron Foundries"
          },
          {
              "id": "3322",
              "title": "Malleable Iron Foundries",
              "fullTitle": "3322 - Malleable Iron Foundries"
          },
          {
              "id": "3324",
              "title": "Steel Investment Foundries",
              "fullTitle": "3324 - Steel Investment Foundries"
          },
          {
              "id": "3325",
              "title": "Steel Foundries, Not Elsewhere Classified",
              "fullTitle": "3325 - Steel Foundries, Not Elsewhere Classified"
          },
          {
              "id": "3331",
              "title": "Primary Smelting and Refining of Copper",
              "fullTitle": "3331 - Primary Smelting and Refining of Copper"
          },
          {
              "id": "3334",
              "title": "Primary Production of Aluminum",
              "fullTitle": "3334 - Primary Production of Aluminum"
          },
          {
              "id": "3339",
              "title": "Primary Smelting and Refining of Nonferrous Metals, Except Copper and Aluminum",
              "fullTitle": "3339 - Primary Smelting and Refining of Nonferrous Metals, Except Copper and Aluminum"
          },
          {
              "id": "3341",
              "title": "Secondary Smelting and Refining of Nonferrous Metals",
              "fullTitle": "3341 - Secondary Smelting and Refining of Nonferrous Metals"
          },
          {
              "id": "3351",
              "title": "Rolling, Drawing, and Extruding of Copper",
              "fullTitle": "3351 - Rolling, Drawing, and Extruding of Copper"
          },
          {
              "id": "3353",
              "title": "Aluminum Sheet, Plate, and Foil",
              "fullTitle": "3353 - Aluminum Sheet, Plate, and Foil"
          },
          {
              "id": "3354",
              "title": "Aluminum Extruded Products",
              "fullTitle": "3354 - Aluminum Extruded Products"
          },
          {
              "id": "3355",
              "title": "Aluminum Rolling and Drawing, Not Elsewhere Classified",
              "fullTitle": "3355 - Aluminum Rolling and Drawing, Not Elsewhere Classified"
          },
          {
              "id": "3356",
              "title": "Rolling, Drawing, and Extruding of Nonferrous Metals, Except Copper and Aluminum",
              "fullTitle": "3356 - Rolling, Drawing, and Extruding of Nonferrous Metals, Except Copper and Aluminum"
          },
          {
              "id": "3357",
              "title": "Drawing and Insulating of Nonferrous Wire",
              "fullTitle": "3357 - Drawing and Insulating of Nonferrous Wire"
          },
          {
              "id": "3363",
              "title": "Aluminum Die-Castings",
              "fullTitle": "3363 - Aluminum Die-Castings"
          },
          {
              "id": "3364",
              "title": "Nonferrous Die-Castings, except Aluminum",
              "fullTitle": "3364 - Nonferrous Die-Castings, except Aluminum"
          },
          {
              "id": "3365",
              "title": "Aluminum Foundries",
              "fullTitle": "3365 - Aluminum Foundries"
          },
          {
              "id": "3366",
              "title": "Copper Foundries",
              "fullTitle": "3366 - Copper Foundries"
          },
          {
              "id": "3369",
              "title": "Nonferrous Foundries, Except Aluminum and Copper",
              "fullTitle": "3369 - Nonferrous Foundries, Except Aluminum and Copper"
          },
          {
              "id": "3398",
              "title": "Metal Heat Treating",
              "fullTitle": "3398 - Metal Heat Treating"
          },
          {
              "id": "3399",
              "title": "Primary Metal Products, Not Elsewhere Classified",
              "fullTitle": "3399 - Primary Metal Products, Not Elsewhere Classified"
          },
          {
              "id": "3411",
              "title": "Metal Cans",
              "fullTitle": "3411 - Metal Cans"
          },
          {
              "id": "3412",
              "title": "Metal Shipping Barrels, Drums, Kegs, and Pails",
              "fullTitle": "3412 - Metal Shipping Barrels, Drums, Kegs, and Pails"
          },
          {
              "id": "3421",
              "title": "Cutlery",
              "fullTitle": "3421 - Cutlery"
          },
          {
              "id": "3423",
              "title": "Hand and Edge Tools, Except Machine Tools and Handsaws",
              "fullTitle": "3423 - Hand and Edge Tools, Except Machine Tools and Handsaws"
          },
          {
              "id": "3425",
              "title": "Saw Blades and Handsaws",
              "fullTitle": "3425 - Saw Blades and Handsaws"
          },
          {
              "id": "3429",
              "title": "Hardware, Not Elsewhere Classified",
              "fullTitle": "3429 - Hardware, Not Elsewhere Classified"
          },
          {
              "id": "3431",
              "title": "Enameled Iron and Metal Sanitary Ware",
              "fullTitle": "3431 - Enameled Iron and Metal Sanitary Ware"
          },
          {
              "id": "3432",
              "title": "Plumbing Fixture Fittings and Trim",
              "fullTitle": "3432 - Plumbing Fixture Fittings and Trim"
          },
          {
              "id": "3433",
              "title": "Heating Equipment, Except Electric and Warm Air Furnaces",
              "fullTitle": "3433 - Heating Equipment, Except Electric and Warm Air Furnaces"
          },
          {
              "id": "3441",
              "title": "Fabricated Structural Metal",
              "fullTitle": "3441 - Fabricated Structural Metal"
          },
          {
              "id": "3442",
              "title": "Metal Doors, Sash, Frames, Molding, and Trim Manufacturing",
              "fullTitle": "3442 - Metal Doors, Sash, Frames, Molding, and Trim Manufacturing"
          },
          {
              "id": "3443",
              "title": "Fabricated Plate Work (Boiler Shops)",
              "fullTitle": "3443 - Fabricated Plate Work (Boiler Shops)"
          },
          {
              "id": "3444",
              "title": "Sheet Metal Work",
              "fullTitle": "3444 - Sheet Metal Work"
          },
          {
              "id": "3446",
              "title": "Architectural and Ornamental Metal Work",
              "fullTitle": "3446 - Architectural and Ornamental Metal Work"
          },
          {
              "id": "3448",
              "title": "Prefabricated Metal Buildings and Components",
              "fullTitle": "3448 - Prefabricated Metal Buildings and Components"
          },
          {
              "id": "3449",
              "title": "Miscellaneous Structural Metal Work",
              "fullTitle": "3449 - Miscellaneous Structural Metal Work"
          },
          {
              "id": "3451",
              "title": "Screw Machine Products",
              "fullTitle": "3451 - Screw Machine Products"
          },
          {
              "id": "3452",
              "title": "Bolts, Nuts, Screws, Rivets, and Washers",
              "fullTitle": "3452 - Bolts, Nuts, Screws, Rivets, and Washers"
          },
          {
              "id": "3462",
              "title": "Iron and Steel Forgings",
              "fullTitle": "3462 - Iron and Steel Forgings"
          },
          {
              "id": "3463",
              "title": "Nonferrous Forgings",
              "fullTitle": "3463 - Nonferrous Forgings"
          },
          {
              "id": "3465",
              "title": "Automotive Stampings",
              "fullTitle": "3465 - Automotive Stampings"
          },
          {
              "id": "3466",
              "title": "Crowns and Closures",
              "fullTitle": "3466 - Crowns and Closures"
          },
          {
              "id": "3469",
              "title": "Metal Stampings, Not Elsewhere Classified",
              "fullTitle": "3469 - Metal Stampings, Not Elsewhere Classified"
          },
          {
              "id": "3471",
              "title": "Electroplating, Plating, Polishing, Anodizing, and Coloring",
              "fullTitle": "3471 - Electroplating, Plating, Polishing, Anodizing, and Coloring"
          },
          {
              "id": "3479",
              "title": "Coating, Engraving, and Allied Services, Not Elsewhere Classified",
              "fullTitle": "3479 - Coating, Engraving, and Allied Services, Not Elsewhere Classified"
          },
          {
              "id": "3482",
              "title": "Small Arms Ammunition",
              "fullTitle": "3482 - Small Arms Ammunition"
          },
          {
              "id": "3483",
              "title": "Ammunition, Except for Small Arms",
              "fullTitle": "3483 - Ammunition, Except for Small Arms"
          },
          {
              "id": "3484",
              "title": "Small Arms",
              "fullTitle": "3484 - Small Arms"
          },
          {
              "id": "3489",
              "title": "Ordnance and Accessories, Not Elsewhere Classified",
              "fullTitle": "3489 - Ordnance and Accessories, Not Elsewhere Classified"
          },
          {
              "id": "3491",
              "title": "Industrial Valves",
              "fullTitle": "3491 - Industrial Valves"
          },
          {
              "id": "3492",
              "title": "Fluid Power Valves and Hose Fittings",
              "fullTitle": "3492 - Fluid Power Valves and Hose Fittings"
          },
          {
              "id": "3493",
              "title": "Steel Springs, Except Wire",
              "fullTitle": "3493 - Steel Springs, Except Wire"
          },
          {
              "id": "3494",
              "title": "Valves and Pipe Fittings, Not Elsewhere Classified",
              "fullTitle": "3494 - Valves and Pipe Fittings, Not Elsewhere Classified"
          },
          {
              "id": "3495",
              "title": "Wire Springs",
              "fullTitle": "3495 - Wire Springs"
          },
          {
              "id": "3496",
              "title": "Miscellaneous Fabricated Wire Products",
              "fullTitle": "3496 - Miscellaneous Fabricated Wire Products"
          },
          {
              "id": "3497",
              "title": "Metal Foil and Leaf",
              "fullTitle": "3497 - Metal Foil and Leaf"
          },
          {
              "id": "3498",
              "title": "Fabricated Pipe and Pipe Fittings",
              "fullTitle": "3498 - Fabricated Pipe and Pipe Fittings"
          },
          {
              "id": "3499",
              "title": "Fabricated Metal Products, Not Elsewhere Classified",
              "fullTitle": "3499 - Fabricated Metal Products, Not Elsewhere Classified"
          },
          {
              "id": "3511",
              "title": "Steam, Gas, and Hydraulic Turbines, and Turbine Generator Set Units",
              "fullTitle": "3511 - Steam, Gas, and Hydraulic Turbines, and Turbine Generator Set Units"
          },
          {
              "id": "3519",
              "title": "Internal Combustion Engines, Not Elsewhere Classified",
              "fullTitle": "3519 - Internal Combustion Engines, Not Elsewhere Classified"
          },
          {
              "id": "3523",
              "title": "Farm Machinery and Equipment",
              "fullTitle": "3523 - Farm Machinery and Equipment"
          },
          {
              "id": "3524",
              "title": "Lawn and Garden Tractors and Home Lawn and Garden Equipment",
              "fullTitle": "3524 - Lawn and Garden Tractors and Home Lawn and Garden Equipment"
          },
          {
              "id": "3531",
              "title": "Construction Machinery and Equipment",
              "fullTitle": "3531 - Construction Machinery and Equipment"
          },
          {
              "id": "3532",
              "title": "Mining Machinery and Equipment, Except Oil and Gas Field Machinery and Equipment",
              "fullTitle": "3532 - Mining Machinery and Equipment, Except Oil and Gas Field Machinery and Equipment"
          },
          {
              "id": "3533",
              "title": "Oil and Gas Field Machinery and Equipment",
              "fullTitle": "3533 - Oil and Gas Field Machinery and Equipment"
          },
          {
              "id": "3534",
              "title": "Elevators and Moving Stairways",
              "fullTitle": "3534 - Elevators and Moving Stairways"
          },
          {
              "id": "3535",
              "title": "Conveyors and Conveying Equipment",
              "fullTitle": "3535 - Conveyors and Conveying Equipment"
          },
          {
              "id": "3536",
              "title": "Overhead Traveling Cranes, Hoists, and Monorail Systems",
              "fullTitle": "3536 - Overhead Traveling Cranes, Hoists, and Monorail Systems"
          },
          {
              "id": "3537",
              "title": "Industrial Trucks, Tractors, Trailers, and Stackers",
              "fullTitle": "3537 - Industrial Trucks, Tractors, Trailers, and Stackers"
          },
          {
              "id": "3541",
              "title": "Machine Tools, Metal Cutting Types",
              "fullTitle": "3541 - Machine Tools, Metal Cutting Types"
          },
          {
              "id": "3542",
              "title": "Machine Tools, Metal Forming Types",
              "fullTitle": "3542 - Machine Tools, Metal Forming Types"
          },
          {
              "id": "3543",
              "title": "Industrial Patterns",
              "fullTitle": "3543 - Industrial Patterns"
          },
          {
              "id": "3544",
              "title": "Special Dies and Tools, Die Sets, Jigs and Fixtures, and Industrial Molds",
              "fullTitle": "3544 - Special Dies and Tools, Die Sets, Jigs and Fixtures, and Industrial Molds"
          },
          {
              "id": "3545",
              "title": "Cutting Tools, Machine Tool Accessories, and Machinists' Precision Measuring Devices",
              "fullTitle": "3545 - Cutting Tools, Machine Tool Accessories, and Machinists' Precision Measuring Devices"
          },
          {
              "id": "3546",
              "title": "Power-Driven Hand Tools",
              "fullTitle": "3546 - Power-Driven Hand Tools"
          },
          {
              "id": "3547",
              "title": "Rolling Mill Machinery and Equipment",
              "fullTitle": "3547 - Rolling Mill Machinery and Equipment"
          },
          {
              "id": "3548",
              "title": "Electric and Gas Welding and Soldering Equipment",
              "fullTitle": "3548 - Electric and Gas Welding and Soldering Equipment"
          },
          {
              "id": "3549",
              "title": "Metalworking Machinery, Not Elsewhere Classified",
              "fullTitle": "3549 - Metalworking Machinery, Not Elsewhere Classified"
          },
          {
              "id": "3552",
              "title": "Textile Machinery",
              "fullTitle": "3552 - Textile Machinery"
          },
          {
              "id": "3553",
              "title": "Woodworking Machinery",
              "fullTitle": "3553 - Woodworking Machinery"
          },
          {
              "id": "3554",
              "title": "Paper Industries Machinery",
              "fullTitle": "3554 - Paper Industries Machinery"
          },
          {
              "id": "3555",
              "title": "Printing Trades Machinery and Equipment",
              "fullTitle": "3555 - Printing Trades Machinery and Equipment"
          },
          {
              "id": "3556",
              "title": "Food Products Machinery",
              "fullTitle": "3556 - Food Products Machinery"
          },
          {
              "id": "3559",
              "title": "Special Industry Machinery, Not Elsewhere Classified",
              "fullTitle": "3559 - Special Industry Machinery, Not Elsewhere Classified"
          },
          {
              "id": "3561",
              "title": "Pumps and Pumping Equipment",
              "fullTitle": "3561 - Pumps and Pumping Equipment"
          },
          {
              "id": "3562",
              "title": "Ball and Roller Bearings",
              "fullTitle": "3562 - Ball and Roller Bearings"
          },
          {
              "id": "3563",
              "title": "Air and Gas Compressors",
              "fullTitle": "3563 - Air and Gas Compressors"
          },
          {
              "id": "3564",
              "title": "Industrial and Commercial Fans and Blowers and Air Purification Equipment",
              "fullTitle": "3564 - Industrial and Commercial Fans and Blowers and Air Purification Equipment"
          },
          {
              "id": "3565",
              "title": "Packaging Machinery",
              "fullTitle": "3565 - Packaging Machinery"
          },
          {
              "id": "3566",
              "title": "Speed Changers, Industrial High",
              "fullTitle": "3566 - Speed Changers, Industrial High"
          },
          {
              "id": "3567",
              "title": "Industrial Process Furnaces and Ovens",
              "fullTitle": "3567 - Industrial Process Furnaces and Ovens"
          },
          {
              "id": "3568",
              "title": "Mechanical Power Transmission Equipment, Not Elsewhere Classified",
              "fullTitle": "3568 - Mechanical Power Transmission Equipment, Not Elsewhere Classified"
          },
          {
              "id": "3569",
              "title": "General Industrial Machinery and Equipment, Not Elsewhere Classified",
              "fullTitle": "3569 - General Industrial Machinery and Equipment, Not Elsewhere Classified"
          },
          {
              "id": "3571",
              "title": "Electronic Computers",
              "fullTitle": "3571 - Electronic Computers"
          },
          {
              "id": "3572",
              "title": "Computer Storage Devices",
              "fullTitle": "3572 - Computer Storage Devices"
          },
          {
              "id": "3575",
              "title": "Computer Terminals",
              "fullTitle": "3575 - Computer Terminals"
          },
          {
              "id": "3577",
              "title": "Computer Peripheral Equipment, Not Elsewhere Classified",
              "fullTitle": "3577 - Computer Peripheral Equipment, Not Elsewhere Classified"
          },
          {
              "id": "3578",
              "title": "Calculating and Accounting Machines, Except Electronic Computers",
              "fullTitle": "3578 - Calculating and Accounting Machines, Except Electronic Computers"
          },
          {
              "id": "3579",
              "title": "Office Machines, Not Elsewhere Classified",
              "fullTitle": "3579 - Office Machines, Not Elsewhere Classified"
          },
          {
              "id": "3581",
              "title": "Automatic Vending Machines",
              "fullTitle": "3581 - Automatic Vending Machines"
          },
          {
              "id": "3582",
              "title": "Commercial Laundry, Drycleaning, and Pressing Machines",
              "fullTitle": "3582 - Commercial Laundry, Drycleaning, and Pressing Machines"
          },
          {
              "id": "3585",
              "title": "Air-Conditioning and Warm Air Heating Equipment and Commercial and Industrial Refrigeration Equipment",
              "fullTitle": "3585 - Air-Conditioning and Warm Air Heating Equipment and Commercial and Industrial Refrigeration Equipment"
          },
          {
              "id": "3586",
              "title": "Measuring and Dispensing Pumps",
              "fullTitle": "3586 - Measuring and Dispensing Pumps"
          },
          {
              "id": "3589",
              "title": "Service Industry Machinery, Not Elsewhere Classified",
              "fullTitle": "3589 - Service Industry Machinery, Not Elsewhere Classified"
          },
          {
              "id": "3592",
              "title": "Carburetors, Pistons, Piston Rings, and Valves",
              "fullTitle": "3592 - Carburetors, Pistons, Piston Rings, and Valves"
          },
          {
              "id": "3593",
              "title": "Fluid Power Cylinders and Actuators",
              "fullTitle": "3593 - Fluid Power Cylinders and Actuators"
          },
          {
              "id": "3594",
              "title": "Fluid Power Pumps and Motors",
              "fullTitle": "3594 - Fluid Power Pumps and Motors"
          },
          {
              "id": "3596",
              "title": "Scales and Balances, Except Laboratory",
              "fullTitle": "3596 - Scales and Balances, Except Laboratory"
          },
          {
              "id": "3599",
              "title": "Industrial and Commercial Machinery and Equipment, Not Elsewhere Classified",
              "fullTitle": "3599 - Industrial and Commercial Machinery and Equipment, Not Elsewhere Classified"
          },
          {
              "id": "3612",
              "title": "Power, Distribution, and Specialty Transformers",
              "fullTitle": "3612 - Power, Distribution, and Specialty Transformers"
          },
          {
              "id": "3613",
              "title": "Switchgear and Switchboard Apparatus",
              "fullTitle": "3613 - Switchgear and Switchboard Apparatus"
          },
          {
              "id": "3621",
              "title": "Motors and Generators",
              "fullTitle": "3621 - Motors and Generators"
          },
          {
              "id": "3624",
              "title": "Carbon and Graphite Products",
              "fullTitle": "3624 - Carbon and Graphite Products"
          },
          {
              "id": "3625",
              "title": "Relays and Industrial Controls",
              "fullTitle": "3625 - Relays and Industrial Controls"
          },
          {
              "id": "3629",
              "title": "Electrical Industrial Apparatus, Not Elsewhere Classified",
              "fullTitle": "3629 - Electrical Industrial Apparatus, Not Elsewhere Classified"
          },
          {
              "id": "3631",
              "title": "Household Cooking Equipment",
              "fullTitle": "3631 - Household Cooking Equipment"
          },
          {
              "id": "3632",
              "title": "Household Refrigerators and HOme and Farm Freezers",
              "fullTitle": "3632 - Household Refrigerators and HOme and Farm Freezers"
          },
          {
              "id": "3633",
              "title": "Household Laundry Equipment",
              "fullTitle": "3633 - Household Laundry Equipment"
          },
          {
              "id": "3634",
              "title": "Electric Housewares and Fans",
              "fullTitle": "3634 - Electric Housewares and Fans"
          },
          {
              "id": "3635",
              "title": "Household Vacuum Cleaners",
              "fullTitle": "3635 - Household Vacuum Cleaners"
          },
          {
              "id": "3639",
              "title": "Household Appliances, Not Elsewhere Classified",
              "fullTitle": "3639 - Household Appliances, Not Elsewhere Classified"
          },
          {
              "id": "3641",
              "title": "Electric Lamp Bulbs and Tubes",
              "fullTitle": "3641 - Electric Lamp Bulbs and Tubes"
          },
          {
              "id": "3643",
              "title": "Current-Carrying Wiring Devices",
              "fullTitle": "3643 - Current-Carrying Wiring Devices"
          },
          {
              "id": "3644",
              "title": "Noncurrent-Carrying Wiring Devices",
              "fullTitle": "3644 - Noncurrent-Carrying Wiring Devices"
          },
          {
              "id": "3645",
              "title": "Residential Electric Lighting Fixtures",
              "fullTitle": "3645 - Residential Electric Lighting Fixtures"
          },
          {
              "id": "3646",
              "title": "Commercial, Industrial, and Institutional Electric Lighting Fixtures",
              "fullTitle": "3646 - Commercial, Industrial, and Institutional Electric Lighting Fixtures"
          },
          {
              "id": "3647",
              "title": "Vehicular Lighting Equipment",
              "fullTitle": "3647 - Vehicular Lighting Equipment"
          },
          {
              "id": "3648",
              "title": "Lighting Equipment, Not Elsewhere Classified",
              "fullTitle": "3648 - Lighting Equipment, Not Elsewhere Classified"
          },
          {
              "id": "3651",
              "title": "Household Audio and Video Equipment",
              "fullTitle": "3651 - Household Audio and Video Equipment"
          },
          {
              "id": "3652",
              "title": "Phonograph Records and Prerecorded Audio Tapes and Disks",
              "fullTitle": "3652 - Phonograph Records and Prerecorded Audio Tapes and Disks"
          },
          {
              "id": "3661",
              "title": "Telephone and Telegraph Apparatus",
              "fullTitle": "3661 - Telephone and Telegraph Apparatus"
          },
          {
              "id": "3663",
              "title": "Radio and Television Broadcasting and Communications Equipment",
              "fullTitle": "3663 - Radio and Television Broadcasting and Communications Equipment"
          },
          {
              "id": "3669",
              "title": "Communications Equipment, Not Elsewhere Classified",
              "fullTitle": "3669 - Communications Equipment, Not Elsewhere Classified"
          },
          {
              "id": "3671",
              "title": "Electron Tubes",
              "fullTitle": "3671 - Electron Tubes"
          },
          {
              "id": "3672",
              "title": "Printed Circuit Boards",
              "fullTitle": "3672 - Printed Circuit Boards"
          },
          {
              "id": "3674",
              "title": "Semiconductors and Related Devices",
              "fullTitle": "3674 - Semiconductors and Related Devices"
          },
          {
              "id": "3675",
              "title": "Electronic Capacitors",
              "fullTitle": "3675 - Electronic Capacitors"
          },
          {
              "id": "3676",
              "title": "Electronic Resistors",
              "fullTitle": "3676 - Electronic Resistors"
          },
          {
              "id": "3677",
              "title": "Electronic Coils, Transformers, and Other Inductors",
              "fullTitle": "3677 - Electronic Coils, Transformers, and Other Inductors"
          },
          {
              "id": "3678",
              "title": "Electronic Connectors",
              "fullTitle": "3678 - Electronic Connectors"
          },
          {
              "id": "3679",
              "title": "Electronic Components, Not Elsewhere Classified",
              "fullTitle": "3679 - Electronic Components, Not Elsewhere Classified"
          },
          {
              "id": "3691",
              "title": "Storage Batteries",
              "fullTitle": "3691 - Storage Batteries"
          },
          {
              "id": "3692",
              "title": "Primary Batteries, Dry and Wet",
              "fullTitle": "3692 - Primary Batteries, Dry and Wet"
          },
          {
              "id": "3694",
              "title": "Electrical Equipment for Internal Combustion Engines",
              "fullTitle": "3694 - Electrical Equipment for Internal Combustion Engines"
          },
          {
              "id": "3695",
              "title": "Magnetic and Optical Recording Media",
              "fullTitle": "3695 - Magnetic and Optical Recording Media"
          },
          {
              "id": "3699",
              "title": "Electrical Machinery, Equipment, and Supplies, Not Elsewhere Classified",
              "fullTitle": "3699 - Electrical Machinery, Equipment, and Supplies, Not Elsewhere Classified"
          },
          {
              "id": "3711",
              "title": "Motor Vehicles and Passenger Car Bodies",
              "fullTitle": "3711 - Motor Vehicles and Passenger Car Bodies"
          },
          {
              "id": "3713",
              "title": "Truck and Bus Bodies",
              "fullTitle": "3713 - Truck and Bus Bodies"
          },
          {
              "id": "3714",
              "title": "Motor Vehicle Parts and Accessories",
              "fullTitle": "3714 - Motor Vehicle Parts and Accessories"
          },
          {
              "id": "3715",
              "title": "Truck Trailers",
              "fullTitle": "3715 - Truck Trailers"
          },
          {
              "id": "3716",
              "title": "Motor Homes",
              "fullTitle": "3716 - Motor Homes"
          },
          {
              "id": "3721",
              "title": "Aircraft",
              "fullTitle": "3721 - Aircraft"
          },
          {
              "id": "3724",
              "title": "Aircraft Engines and Engine Parts",
              "fullTitle": "3724 - Aircraft Engines and Engine Parts"
          },
          {
              "id": "3728",
              "title": "Aircraft Parts and Auxiliary Equipment, Not Elsewhere Classified",
              "fullTitle": "3728 - Aircraft Parts and Auxiliary Equipment, Not Elsewhere Classified"
          },
          {
              "id": "3731",
              "title": "Ship Building and Repairing",
              "fullTitle": "3731 - Ship Building and Repairing"
          },
          {
              "id": "3732",
              "title": "Boat Building and Repairing",
              "fullTitle": "3732 - Boat Building and Repairing"
          },
          {
              "id": "3743",
              "title": "Railroad Equipment",
              "fullTitle": "3743 - Railroad Equipment"
          },
          {
              "id": "3751",
              "title": "Motorcycles, Bicycles, and Parts",
              "fullTitle": "3751 - Motorcycles, Bicycles, and Parts"
          },
          {
              "id": "3761",
              "title": "Guided Missiles and Space Vehicles",
              "fullTitle": "3761 - Guided Missiles and Space Vehicles"
          },
          {
              "id": "3764",
              "title": "Guided Missile and Space Vehicle Propulsion Units and Propulsion Unit Parts",
              "fullTitle": "3764 - Guided Missile and Space Vehicle Propulsion Units and Propulsion Unit Parts"
          },
          {
              "id": "3769",
              "title": "Guided Missile Space Vehicle Parts and Auxiliary Equipment, Not Elsewhere Classified",
              "fullTitle": "3769 - Guided Missile Space Vehicle Parts and Auxiliary Equipment, Not Elsewhere Classified"
          },
          {
              "id": "3792",
              "title": "Travel Trailers and Campers",
              "fullTitle": "3792 - Travel Trailers and Campers"
          },
          {
              "id": "3795",
              "title": "Tanks and Tank Components",
              "fullTitle": "3795 - Tanks and Tank Components"
          },
          {
              "id": "3799",
              "title": "Transportation Equipment, Not Elsewhere Classified",
              "fullTitle": "3799 - Transportation Equipment, Not Elsewhere Classified"
          },
          {
              "id": "3812",
              "title": "Search, Detection, Navigation, Guidance, Aeronautical, and Nautical Systems and Instruments",
              "fullTitle": "3812 - Search, Detection, Navigation, Guidance, Aeronautical, and Nautical Systems and Instruments"
          },
          {
              "id": "3821",
              "title": "Laboratory Apparatus and Furniture",
              "fullTitle": "3821 - Laboratory Apparatus and Furniture"
          },
          {
              "id": "3822",
              "title": "Automatic Controls for Regulating Residential and Commercial Environments and Appliances",
              "fullTitle": "3822 - Automatic Controls for Regulating Residential and Commercial Environments and Appliances"
          },
          {
              "id": "3823",
              "title": "Industrial Instruments for Measurement, Display, and Control of Process Variables; and Related Products",
              "fullTitle": "3823 - Industrial Instruments for Measurement, Display, and Control of Process Variables; and Related Products"
          },
          {
              "id": "3824",
              "title": "Totalizing Fluid Meters and Counting Devices",
              "fullTitle": "3824 - Totalizing Fluid Meters and Counting Devices"
          },
          {
              "id": "3825",
              "title": "Instruments for Measuring and Testing of Electricity and Electrical Signals",
              "fullTitle": "3825 - Instruments for Measuring and Testing of Electricity and Electrical Signals"
          },
          {
              "id": "3826",
              "title": "Laboratory Analytical Instruments",
              "fullTitle": "3826 - Laboratory Analytical Instruments"
          },
          {
              "id": "3827",
              "title": "Optical Instruments and Lenses",
              "fullTitle": "3827 - Optical Instruments and Lenses"
          },
          {
              "id": "3829",
              "title": "Measuring and Controlling Devices, Not Elsewhere Classified",
              "fullTitle": "3829 - Measuring and Controlling Devices, Not Elsewhere Classified"
          },
          {
              "id": "3841",
              "title": "Surgical and Medical Instruments and Apparatus",
              "fullTitle": "3841 - Surgical and Medical Instruments and Apparatus"
          },
          {
              "id": "3842",
              "title": "Orthopedic, Prosthetic, and Surgical Appliances and Supplies",
              "fullTitle": "3842 - Orthopedic, Prosthetic, and Surgical Appliances and Supplies"
          },
          {
              "id": "3843",
              "title": "Dental Equipment and Supplies",
              "fullTitle": "3843 - Dental Equipment and Supplies"
          },
          {
              "id": "3844",
              "title": "X-ray Apparatus and Tubes",
              "fullTitle": "3844 - X-ray Apparatus and Tubes"
          },
          {
              "id": "3845",
              "title": "Electromedical and Electrotherapeutic Apparatus",
              "fullTitle": "3845 - Electromedical and Electrotherapeutic Apparatus"
          },
          {
              "id": "3851",
              "title": "Ophthalmic Goods",
              "fullTitle": "3851 - Ophthalmic Goods"
          },
          {
              "id": "3861",
              "title": "Photographic Equipment and Supplies",
              "fullTitle": "3861 - Photographic Equipment and Supplies"
          },
          {
              "id": "3873",
              "title": "Watches, Clocks, Clockwork Operated Devices, and Parts",
              "fullTitle": "3873 - Watches, Clocks, Clockwork Operated Devices, and Parts"
          },
          {
              "id": "3911",
              "title": "Jewelry, Precious Metal",
              "fullTitle": "3911 - Jewelry, Precious Metal"
          },
          {
              "id": "3914",
              "title": "Silverware, Plated Ware, and Stainless Steel Ware",
              "fullTitle": "3914 - Silverware, Plated Ware, and Stainless Steel Ware"
          },
          {
              "id": "3915",
              "title": "Jewelers' Findings and Materials, and Lapidary Work",
              "fullTitle": "3915 - Jewelers' Findings and Materials, and Lapidary Work"
          },
          {
              "id": "3931",
              "title": "Musical Instruments",
              "fullTitle": "3931 - Musical Instruments"
          },
          {
              "id": "3942",
              "title": "Dolls and Stuffed Toys",
              "fullTitle": "3942 - Dolls and Stuffed Toys"
          },
          {
              "id": "3944",
              "title": "Games, Toys, and Children's Vehicles, Except Dolls and Bicycles",
              "fullTitle": "3944 - Games, Toys, and Children's Vehicles, Except Dolls and Bicycles"
          },
          {
              "id": "3949",
              "title": "Sporting and Athletic Goods, Not Elsewhere Classified",
              "fullTitle": "3949 - Sporting and Athletic Goods, Not Elsewhere Classified"
          },
          {
              "id": "3951",
              "title": "Pens, Mechanical Pencils, and Parts",
              "fullTitle": "3951 - Pens, Mechanical Pencils, and Parts"
          },
          {
              "id": "3952",
              "title": "Lead Pencils, Crayons, and Artists' Materials",
              "fullTitle": "3952 - Lead Pencils, Crayons, and Artists' Materials"
          },
          {
              "id": "3953",
              "title": "Marking Devices",
              "fullTitle": "3953 - Marking Devices"
          },
          {
              "id": "3955",
              "title": "Carbon Paper and Inked Ribbons",
              "fullTitle": "3955 - Carbon Paper and Inked Ribbons"
          },
          {
              "id": "3961",
              "title": "Costume Jewelry and Costume Novelties, Except Precious Metal",
              "fullTitle": "3961 - Costume Jewelry and Costume Novelties, Except Precious Metal"
          },
          {
              "id": "3965",
              "title": "Fasteners, Buttons, Needles, and Pins",
              "fullTitle": "3965 - Fasteners, Buttons, Needles, and Pins"
          },
          {
              "id": "3991",
              "title": "Brooms and Brushes",
              "fullTitle": "3991 - Brooms and Brushes"
          },
          {
              "id": "3993",
              "title": "Signs and Advertising Specialties",
              "fullTitle": "3993 - Signs and Advertising Specialties"
          },
          {
              "id": "3995",
              "title": "Burial Caskets",
              "fullTitle": "3995 - Burial Caskets"
          },
          {
              "id": "3996",
              "title": "Linoleum, Asphalted",
              "fullTitle": "3996 - Linoleum, Asphalted"
          },
          {
              "id": "3999",
              "title": "Manufacturing Industries, Not Elsewhere Classified",
              "fullTitle": "3999 - Manufacturing Industries, Not Elsewhere Classified"
          },
          {
              "id": "4011",
              "title": "Railroads, Line",
              "fullTitle": "4011 - Railroads, Line"
          },
          {
              "id": "4013",
              "title": "Railroad Switching and Terminal Establishments",
              "fullTitle": "4013 - Railroad Switching and Terminal Establishments"
          },
          {
              "id": "4111",
              "title": "Local and Suburban Transit",
              "fullTitle": "4111 - Local and Suburban Transit"
          },
          {
              "id": "4119",
              "title": "Local Passenger Transportation, Not Elsewhere Classified",
              "fullTitle": "4119 - Local Passenger Transportation, Not Elsewhere Classified"
          },
          {
              "id": "4121",
              "title": "Taxicabs",
              "fullTitle": "4121 - Taxicabs"
          },
          {
              "id": "4131",
              "title": "Intercity and Rural Bus Transportation",
              "fullTitle": "4131 - Intercity and Rural Bus Transportation"
          },
          {
              "id": "4141",
              "title": "Local Bus Charter Service",
              "fullTitle": "4141 - Local Bus Charter Service"
          },
          {
              "id": "4142",
              "title": "Bus Charter Service, Except Local",
              "fullTitle": "4142 - Bus Charter Service, Except Local"
          },
          {
              "id": "4151",
              "title": "School Buses",
              "fullTitle": "4151 - School Buses"
          },
          {
              "id": "4173",
              "title": "Terminal and Service Facilities for Motor Vehicle Passenger Transportation",
              "fullTitle": "4173 - Terminal and Service Facilities for Motor Vehicle Passenger Transportation"
          },
          {
              "id": "4212",
              "title": "Local Trucking Without Storage",
              "fullTitle": "4212 - Local Trucking Without Storage"
          },
          {
              "id": "4213",
              "title": "Trucking, Except Local",
              "fullTitle": "4213 - Trucking, Except Local"
          },
          {
              "id": "4214",
              "title": "Local Trucking With Storage",
              "fullTitle": "4214 - Local Trucking With Storage"
          },
          {
              "id": "4215",
              "title": "Courier Services, Except by Air",
              "fullTitle": "4215 - Courier Services, Except by Air"
          },
          {
              "id": "4221",
              "title": "Farm Product Warehousing and Storage",
              "fullTitle": "4221 - Farm Product Warehousing and Storage"
          },
          {
              "id": "4222",
              "title": "Refrigerated Warehousing and Storage",
              "fullTitle": "4222 - Refrigerated Warehousing and Storage"
          },
          {
              "id": "4225",
              "title": "General Warehousing and Storage",
              "fullTitle": "4225 - General Warehousing and Storage"
          },
          {
              "id": "4226",
              "title": "Special Warehousing and Storage, Not Elsewhere Classified",
              "fullTitle": "4226 - Special Warehousing and Storage, Not Elsewhere Classified"
          },
          {
              "id": "4231",
              "title": "Terminal and Joint Terminal Maintenance Facilities for Motor Freight Transportation",
              "fullTitle": "4231 - Terminal and Joint Terminal Maintenance Facilities for Motor Freight Transportation"
          },
          {
              "id": "4311",
              "title": "United States Postal Service",
              "fullTitle": "4311 - United States Postal Service"
          },
          {
              "id": "4412",
              "title": "Deep Sea Foreign Transportation of Freight",
              "fullTitle": "4412 - Deep Sea Foreign Transportation of Freight"
          },
          {
              "id": "4424",
              "title": "Deep Sea Domestic Transportation of Freight",
              "fullTitle": "4424 - Deep Sea Domestic Transportation of Freight"
          },
          {
              "id": "4432",
              "title": "Freight Transportation on the Great Lakes",
              "fullTitle": "4432 - Freight Transportation on the Great Lakes"
          },
          {
              "id": "4449",
              "title": "Water Transportation of Freight, Not Elsewhere Classified",
              "fullTitle": "4449 - Water Transportation of Freight, Not Elsewhere Classified"
          },
          {
              "id": "4481",
              "title": "Deep Sea Transportation of Passengers, Except by Ferry",
              "fullTitle": "4481 - Deep Sea Transportation of Passengers, Except by Ferry"
          },
          {
              "id": "4482",
              "title": "Ferries",
              "fullTitle": "4482 - Ferries"
          },
          {
              "id": "4489",
              "title": "Water Transportation of Passengers, Not Elsewhere Classified",
              "fullTitle": "4489 - Water Transportation of Passengers, Not Elsewhere Classified"
          },
          {
              "id": "4491",
              "title": "Marine Cargo Handling",
              "fullTitle": "4491 - Marine Cargo Handling"
          },
          {
              "id": "4492",
              "title": "Towing and Tugboat Services",
              "fullTitle": "4492 - Towing and Tugboat Services"
          },
          {
              "id": "4493",
              "title": "Marinas",
              "fullTitle": "4493 - Marinas"
          },
          {
              "id": "4499",
              "title": "Water Transportation Services, Not Elsewhere Classified",
              "fullTitle": "4499 - Water Transportation Services, Not Elsewhere Classified"
          },
          {
              "id": "4512",
              "title": "Air Transportation, Scheduled",
              "fullTitle": "4512 - Air Transportation, Scheduled"
          },
          {
              "id": "4513",
              "title": "Air Courier Services",
              "fullTitle": "4513 - Air Courier Services"
          },
          {
              "id": "4522",
              "title": "Air Transportation, Nonscheduled",
              "fullTitle": "4522 - Air Transportation, Nonscheduled"
          },
          {
              "id": "4581",
              "title": "Airports, Flying Fields, and Airport Terminal Services",
              "fullTitle": "4581 - Airports, Flying Fields, and Airport Terminal Services"
          },
          {
              "id": "4612",
              "title": "Crude Petroleum Pipelines",
              "fullTitle": "4612 - Crude Petroleum Pipelines"
          },
          {
              "id": "4613",
              "title": "Refined Petroleum Pipelines",
              "fullTitle": "4613 - Refined Petroleum Pipelines"
          },
          {
              "id": "4619",
              "title": "Pipelines, Not Elsewhere Classified",
              "fullTitle": "4619 - Pipelines, Not Elsewhere Classified"
          },
          {
              "id": "4724",
              "title": "Travel Agencies",
              "fullTitle": "4724 - Travel Agencies"
          },
          {
              "id": "4725",
              "title": "Tour Operators",
              "fullTitle": "4725 - Tour Operators"
          },
          {
              "id": "4729",
              "title": "Arrangement of Passenger Transportation, Not Elsewhere Classified",
              "fullTitle": "4729 - Arrangement of Passenger Transportation, Not Elsewhere Classified"
          },
          {
              "id": "4731",
              "title": "Arrangement of Transportation of Freight and Cargo",
              "fullTitle": "4731 - Arrangement of Transportation of Freight and Cargo"
          },
          {
              "id": "4741",
              "title": "Rental of Railroad Cars",
              "fullTitle": "4741 - Rental of Railroad Cars"
          },
          {
              "id": "4783",
              "title": "Packing and Crating",
              "fullTitle": "4783 - Packing and Crating"
          },
          {
              "id": "4785",
              "title": "Fixed Facilities and Inspection and Weighing Services for Motor Vehicle Transportation",
              "fullTitle": "4785 - Fixed Facilities and Inspection and Weighing Services for Motor Vehicle Transportation"
          },
          {
              "id": "4789",
              "title": "Transportation Services, Not Elsewhere Classified",
              "fullTitle": "4789 - Transportation Services, Not Elsewhere Classified"
          },
          {
              "id": "4812",
              "title": "Radiotelephone Communications",
              "fullTitle": "4812 - Radiotelephone Communications"
          },
          {
              "id": "4813",
              "title": "Telephone Communications, Except Radiotelephone",
              "fullTitle": "4813 - Telephone Communications, Except Radiotelephone"
          },
          {
              "id": "4822",
              "title": "Telegraph and Other Message Communications",
              "fullTitle": "4822 - Telegraph and Other Message Communications"
          },
          {
              "id": "4832",
              "title": "Radio Broadcasting Stations",
              "fullTitle": "4832 - Radio Broadcasting Stations"
          },
          {
              "id": "4833",
              "title": "Television Broadcasting Stations",
              "fullTitle": "4833 - Television Broadcasting Stations"
          },
          {
              "id": "4841",
              "title": "Cable and Other Pay Television Services",
              "fullTitle": "4841 - Cable and Other Pay Television Services"
          },
          {
              "id": "4899",
              "title": "Communications Services, Not Elsewhere Classified",
              "fullTitle": "4899 - Communications Services, Not Elsewhere Classified"
          },
          {
              "id": "4911",
              "title": "Electric Services",
              "fullTitle": "4911 - Electric Services"
          },
          {
              "id": "4922",
              "title": "Natural Gas Transmission",
              "fullTitle": "4922 - Natural Gas Transmission"
          },
          {
              "id": "4923",
              "title": "Natural Gas Transmission and Distribution",
              "fullTitle": "4923 - Natural Gas Transmission and Distribution"
          },
          {
              "id": "4924",
              "title": "Natural Gas Distribution",
              "fullTitle": "4924 - Natural Gas Distribution"
          },
          {
              "id": "4925",
              "title": "Mixed, Manufactured, or Liquefied Petroleum Gas Production",
              "fullTitle": "4925 - Mixed, Manufactured, or Liquefied Petroleum Gas Production"
          },
          {
              "id": "4931",
              "title": "Electric and Other Services Combined",
              "fullTitle": "4931 - Electric and Other Services Combined"
          },
          {
              "id": "4932",
              "title": "Gas and Other Services Combined",
              "fullTitle": "4932 - Gas and Other Services Combined"
          },
          {
              "id": "4939",
              "title": "Combination Utilities, Not Elsewhere Classified",
              "fullTitle": "4939 - Combination Utilities, Not Elsewhere Classified"
          },
          {
              "id": "4941",
              "title": "Water Supply",
              "fullTitle": "4941 - Water Supply"
          },
          {
              "id": "4952",
              "title": "Sewerage Systems",
              "fullTitle": "4952 - Sewerage Systems"
          },
          {
              "id": "4953",
              "title": "Refuse Systems",
              "fullTitle": "4953 - Refuse Systems"
          },
          {
              "id": "4959",
              "title": "Sanitary Services, Not Elsewhere Classified",
              "fullTitle": "4959 - Sanitary Services, Not Elsewhere Classified"
          },
          {
              "id": "4961",
              "title": "Steam and Air",
              "fullTitle": "4961 - Steam and Air"
          },
          {
              "id": "4971",
              "title": "Irrigation Systems",
              "fullTitle": "4971 - Irrigation Systems"
          },
          {
              "id": "5012",
              "title": "Automobiles and Other Motor Vehicles",
              "fullTitle": "5012 - Automobiles and Other Motor Vehicles"
          },
          {
              "id": "5013",
              "title": "Motor Vehicle Supplies and New Parts",
              "fullTitle": "5013 - Motor Vehicle Supplies and New Parts"
          },
          {
              "id": "5014",
              "title": "Tires and Tubes",
              "fullTitle": "5014 - Tires and Tubes"
          },
          {
              "id": "5015",
              "title": "Motor Vehicle Parts, Used",
              "fullTitle": "5015 - Motor Vehicle Parts, Used"
          },
          {
              "id": "5021",
              "title": "Furniture",
              "fullTitle": "5021 - Furniture"
          },
          {
              "id": "5023",
              "title": "Home furnishings",
              "fullTitle": "5023 - Home furnishings"
          },
          {
              "id": "5031",
              "title": "Lumber, Plywood, Millwork, and Wood Panels",
              "fullTitle": "5031 - Lumber, Plywood, Millwork, and Wood Panels"
          },
          {
              "id": "5032",
              "title": "Brick, Stone, and Related Construction Materials",
              "fullTitle": "5032 - Brick, Stone, and Related Construction Materials"
          },
          {
              "id": "5033",
              "title": "Roofing, Siding, and Insulation Materials",
              "fullTitle": "5033 - Roofing, Siding, and Insulation Materials"
          },
          {
              "id": "5039",
              "title": "Construction Materials, Not Elsewhere Classified",
              "fullTitle": "5039 - Construction Materials, Not Elsewhere Classified"
          },
          {
              "id": "5043",
              "title": "Photographic Equipment and Supplies",
              "fullTitle": "5043 - Photographic Equipment and Supplies"
          },
          {
              "id": "5044",
              "title": "Office Equipment",
              "fullTitle": "5044 - Office Equipment"
          },
          {
              "id": "5045",
              "title": "Computers and Computer Peripheral Equipment and Software",
              "fullTitle": "5045 - Computers and Computer Peripheral Equipment and Software"
          },
          {
              "id": "5046",
              "title": "Commercial Equipment, Not Elsewhere Classified",
              "fullTitle": "5046 - Commercial Equipment, Not Elsewhere Classified"
          },
          {
              "id": "5047",
              "title": "Medical, Dental, and Hospital Equipment and Supplies",
              "fullTitle": "5047 - Medical, Dental, and Hospital Equipment and Supplies"
          },
          {
              "id": "5048",
              "title": "Ophthalmic Goods",
              "fullTitle": "5048 - Ophthalmic Goods"
          },
          {
              "id": "5049",
              "title": "Professional Equipment and Supplies, Not Elsewhere Classified",
              "fullTitle": "5049 - Professional Equipment and Supplies, Not Elsewhere Classified"
          },
          {
              "id": "5051",
              "title": "Metals Service Centers and Offices",
              "fullTitle": "5051 - Metals Service Centers and Offices"
          },
          {
              "id": "5052",
              "title": "Coal and Other Minerals and Ores",
              "fullTitle": "5052 - Coal and Other Minerals and Ores"
          },
          {
              "id": "5063",
              "title": "Electrical Apparatus and Equipment Wiring Supplies, and Construction Materials",
              "fullTitle": "5063 - Electrical Apparatus and Equipment Wiring Supplies, and Construction Materials"
          },
          {
              "id": "5064",
              "title": "Electrical Appliances, Television and Radio Sets",
              "fullTitle": "5064 - Electrical Appliances, Television and Radio Sets"
          },
          {
              "id": "5065",
              "title": "Electronic Parts and Equipment, Not Elsewhere Classified",
              "fullTitle": "5065 - Electronic Parts and Equipment, Not Elsewhere Classified"
          },
          {
              "id": "5072",
              "title": "Hardware",
              "fullTitle": "5072 - Hardware"
          },
          {
              "id": "5074",
              "title": "Plumbing and Heating Equipment and Supplies (Hydronics)",
              "fullTitle": "5074 - Plumbing and Heating Equipment and Supplies (Hydronics)"
          },
          {
              "id": "5075",
              "title": "Warm Air Heating and Air",
              "fullTitle": "5075 - Warm Air Heating and Air"
          },
          {
              "id": "5078",
              "title": "Refrigeration Equipment and Supplies",
              "fullTitle": "5078 - Refrigeration Equipment and Supplies"
          },
          {
              "id": "5082",
              "title": "Construction and Mining (Except Petroleum) Machinery and Equipment",
              "fullTitle": "5082 - Construction and Mining (Except Petroleum) Machinery and Equipment"
          },
          {
              "id": "5083",
              "title": "Farm and Garden Machinery and Equipment",
              "fullTitle": "5083 - Farm and Garden Machinery and Equipment"
          },
          {
              "id": "5084",
              "title": "Industrial Machinery and Equipment",
              "fullTitle": "5084 - Industrial Machinery and Equipment"
          },
          {
              "id": "5085",
              "title": "Industrial Supplies",
              "fullTitle": "5085 - Industrial Supplies"
          },
          {
              "id": "5087",
              "title": "Service Establishment Equipment and Supplies",
              "fullTitle": "5087 - Service Establishment Equipment and Supplies"
          },
          {
              "id": "5088",
              "title": "Transportation Equipment and Supplies, Except Motor Vehicles",
              "fullTitle": "5088 - Transportation Equipment and Supplies, Except Motor Vehicles"
          },
          {
              "id": "5091",
              "title": "Sporting and Recreational Goods and Supplies",
              "fullTitle": "5091 - Sporting and Recreational Goods and Supplies"
          },
          {
              "id": "5092",
              "title": "Toys and Hobby Goods and Supplies",
              "fullTitle": "5092 - Toys and Hobby Goods and Supplies"
          },
          {
              "id": "5093",
              "title": "Scrap and Waste Materials",
              "fullTitle": "5093 - Scrap and Waste Materials"
          },
          {
              "id": "5094",
              "title": "Jewelry, Watches, Precious Stones, and Precious Metals",
              "fullTitle": "5094 - Jewelry, Watches, Precious Stones, and Precious Metals"
          },
          {
              "id": "5099",
              "title": "Durable Goods, Not Elsewhere Classified",
              "fullTitle": "5099 - Durable Goods, Not Elsewhere Classified"
          },
          {
              "id": "5111",
              "title": "Printing and Writing Paper",
              "fullTitle": "5111 - Printing and Writing Paper"
          },
          {
              "id": "5112",
              "title": "Stationery and Office Supplies",
              "fullTitle": "5112 - Stationery and Office Supplies"
          },
          {
              "id": "5113",
              "title": "Industrial and Personal Service Paper",
              "fullTitle": "5113 - Industrial and Personal Service Paper"
          },
          {
              "id": "5122",
              "title": "Drugs, Drug Proprietaries, and Druggists' Sundries",
              "fullTitle": "5122 - Drugs, Drug Proprietaries, and Druggists' Sundries"
          },
          {
              "id": "5131",
              "title": "Piece Goods, Notions, and Other Dry Good",
              "fullTitle": "5131 - Piece Goods, Notions, and Other Dry Good"
          },
          {
              "id": "5136",
              "title": "Men's and Boy's Clothing and Furnishings",
              "fullTitle": "5136 - Men's and Boy's Clothing and Furnishings"
          },
          {
              "id": "5137",
              "title": "Women's, Children's, and Infants' Clothing and Accessories",
              "fullTitle": "5137 - Women's, Children's, and Infants' Clothing and Accessories"
          },
          {
              "id": "5139",
              "title": "Footwear",
              "fullTitle": "5139 - Footwear"
          },
          {
              "id": "5141",
              "title": "Groceries, General Line",
              "fullTitle": "5141 - Groceries, General Line"
          },
          {
              "id": "5142",
              "title": "Packaged Frozen Foods",
              "fullTitle": "5142 - Packaged Frozen Foods"
          },
          {
              "id": "5143",
              "title": "Dairy Products, Except Dried or Canned",
              "fullTitle": "5143 - Dairy Products, Except Dried or Canned"
          },
          {
              "id": "5144",
              "title": "Poultry and Poultry Products",
              "fullTitle": "5144 - Poultry and Poultry Products"
          },
          {
              "id": "5145",
              "title": "Confectionery",
              "fullTitle": "5145 - Confectionery"
          },
          {
              "id": "5146",
              "title": "Fish and Seafoods",
              "fullTitle": "5146 - Fish and Seafoods"
          },
          {
              "id": "5147",
              "title": "Meats and Meat Products",
              "fullTitle": "5147 - Meats and Meat Products"
          },
          {
              "id": "5148",
              "title": "Fresh Fruits and Vegetables",
              "fullTitle": "5148 - Fresh Fruits and Vegetables"
          },
          {
              "id": "5149",
              "title": "Groceries and Related Products, Not Elsewhere Classified",
              "fullTitle": "5149 - Groceries and Related Products, Not Elsewhere Classified"
          },
          {
              "id": "5153",
              "title": "Grain and Field Beans",
              "fullTitle": "5153 - Grain and Field Beans"
          },
          {
              "id": "5154",
              "title": "Livestock",
              "fullTitle": "5154 - Livestock"
          },
          {
              "id": "5159",
              "title": "Farm-Product Raw Materials, not elsewhere classified",
              "fullTitle": "5159 - Farm-Product Raw Materials, not elsewhere classified"
          },
          {
              "id": "5162",
              "title": "Plastics Materials and Basic Forms and Shapes",
              "fullTitle": "5162 - Plastics Materials and Basic Forms and Shapes"
          },
          {
              "id": "5169",
              "title": "Chemicals and Allied Products, Not Elsewhere Classified",
              "fullTitle": "5169 - Chemicals and Allied Products, Not Elsewhere Classified"
          },
          {
              "id": "5171",
              "title": "Petroleum Bulk stations and Terminals",
              "fullTitle": "5171 - Petroleum Bulk stations and Terminals"
          },
          {
              "id": "5172",
              "title": "Petroleum and Petroleum Products Wholesalers, Except Bulk Stations and Terminals",
              "fullTitle": "5172 - Petroleum and Petroleum Products Wholesalers, Except Bulk Stations and Terminals"
          },
          {
              "id": "5181",
              "title": "Beer and Ale",
              "fullTitle": "5181 - Beer and Ale"
          },
          {
              "id": "5182",
              "title": "Wine and Distilled Alcoholic Beverages",
              "fullTitle": "5182 - Wine and Distilled Alcoholic Beverages"
          },
          {
              "id": "5191",
              "title": "Farm Supplies",
              "fullTitle": "5191 - Farm Supplies"
          },
          {
              "id": "5192",
              "title": "Books, Periodicals, and Newspapers",
              "fullTitle": "5192 - Books, Periodicals, and Newspapers"
          },
          {
              "id": "5193",
              "title": "Flowers, Nursery Stock, and Florists' Supplies",
              "fullTitle": "5193 - Flowers, Nursery Stock, and Florists' Supplies"
          },
          {
              "id": "5194",
              "title": "Tobacco and Tobacco Products",
              "fullTitle": "5194 - Tobacco and Tobacco Products"
          },
          {
              "id": "5198",
              "title": "Paints, Varnishes, and Supplies",
              "fullTitle": "5198 - Paints, Varnishes, and Supplies"
          },
          {
              "id": "5199",
              "title": "Nondurable Goods, Not Elsewhere Classified",
              "fullTitle": "5199 - Nondurable Goods, Not Elsewhere Classified"
          },
          {
              "id": "5211",
              "title": "Lumber and Other Building Materials Dealers",
              "fullTitle": "5211 - Lumber and Other Building Materials Dealers"
          },
          {
              "id": "5231",
              "title": "Paint, Glass, and Wallpaper Stores",
              "fullTitle": "5231 - Paint, Glass, and Wallpaper Stores"
          },
          {
              "id": "5251",
              "title": "Hardware Stores",
              "fullTitle": "5251 - Hardware Stores"
          },
          {
              "id": "5261",
              "title": "Retail Nurseries, Lawn and Garden Supply Stores",
              "fullTitle": "5261 - Retail Nurseries, Lawn and Garden Supply Stores"
          },
          {
              "id": "5271",
              "title": "Mobile Home Dealers",
              "fullTitle": "5271 - Mobile Home Dealers"
          },
          {
              "id": "5311",
              "title": "Department Stores",
              "fullTitle": "5311 - Department Stores"
          },
          {
              "id": "5331",
              "title": "Variety Stores",
              "fullTitle": "5331 - Variety Stores"
          },
          {
              "id": "5399",
              "title": "Miscellaneous General Merchandise Stores",
              "fullTitle": "5399 - Miscellaneous General Merchandise Stores"
          },
          {
              "id": "5411",
              "title": "Grocery Stores",
              "fullTitle": "5411 - Grocery Stores"
          },
          {
              "id": "5421",
              "title": "Meat and Fish (Seafood) Markets, Including Freezer Provisioners",
              "fullTitle": "5421 - Meat and Fish (Seafood) Markets, Including Freezer Provisioners"
          },
          {
              "id": "5431",
              "title": "Fruit and Vegetable Markets",
              "fullTitle": "5431 - Fruit and Vegetable Markets"
          },
          {
              "id": "5441",
              "title": "Candy, Nut, and Confectionery Stores",
              "fullTitle": "5441 - Candy, Nut, and Confectionery Stores"
          },
          {
              "id": "5451",
              "title": "Dairy Products Stores",
              "fullTitle": "5451 - Dairy Products Stores"
          },
          {
              "id": "5461",
              "title": "Retail Bakeries",
              "fullTitle": "5461 - Retail Bakeries"
          },
          {
              "id": "5499",
              "title": "Miscellaneous Food Stores",
              "fullTitle": "5499 - Miscellaneous Food Stores"
          },
          {
              "id": "5511",
              "title": "Motor Vehicle Dealers (New and Used)",
              "fullTitle": "5511 - Motor Vehicle Dealers (New and Used)"
          },
          {
              "id": "5521",
              "title": "Motor Vehicle Dealers (Used only)",
              "fullTitle": "5521 - Motor Vehicle Dealers (Used only)"
          },
          {
              "id": "5531",
              "title": "Auto and Home Supply Stores",
              "fullTitle": "5531 - Auto and Home Supply Stores"
          },
          {
              "id": "5541",
              "title": "Gasoline Service Stations",
              "fullTitle": "5541 - Gasoline Service Stations"
          },
          {
              "id": "5551",
              "title": "Boat Dealers",
              "fullTitle": "5551 - Boat Dealers"
          },
          {
              "id": "5561",
              "title": "Recreational Vehicle Dealers",
              "fullTitle": "5561 - Recreational Vehicle Dealers"
          },
          {
              "id": "5571",
              "title": "Motorcycle Dealers",
              "fullTitle": "5571 - Motorcycle Dealers"
          },
          {
              "id": "5599",
              "title": "Automotive Dealers, Not Elsewhere Classified",
              "fullTitle": "5599 - Automotive Dealers, Not Elsewhere Classified"
          },
          {
              "id": "5611",
              "title": "Men's and Boys' Clothing and Accessory Stores",
              "fullTitle": "5611 - Men's and Boys' Clothing and Accessory Stores"
          },
          {
              "id": "5621",
              "title": "Women's Clothing Stores",
              "fullTitle": "5621 - Women's Clothing Stores"
          },
          {
              "id": "5632",
              "title": "Women's Accessory and Specialty Stores",
              "fullTitle": "5632 - Women's Accessory and Specialty Stores"
          },
          {
              "id": "5641",
              "title": "Children's and Infants' Wear Stores",
              "fullTitle": "5641 - Children's and Infants' Wear Stores"
          },
          {
              "id": "5651",
              "title": "Family Clothing Stores",
              "fullTitle": "5651 - Family Clothing Stores"
          },
          {
              "id": "5661",
              "title": "Shoe Stores",
              "fullTitle": "5661 - Shoe Stores"
          },
          {
              "id": "5699",
              "title": "Miscellaneous Apparel and Accessory Stores",
              "fullTitle": "5699 - Miscellaneous Apparel and Accessory Stores"
          },
          {
              "id": "5712",
              "title": "Furniture Stores",
              "fullTitle": "5712 - Furniture Stores"
          },
          {
              "id": "5713",
              "title": "Floor Covering Stores",
              "fullTitle": "5713 - Floor Covering Stores"
          },
          {
              "id": "5714",
              "title": "Drapery, Curtain, and Upholstery Stores",
              "fullTitle": "5714 - Drapery, Curtain, and Upholstery Stores"
          },
          {
              "id": "5719",
              "title": "Miscellaneous home furnishings Stores",
              "fullTitle": "5719 - Miscellaneous home furnishings Stores"
          },
          {
              "id": "5722",
              "title": "Household Appliance Stores",
              "fullTitle": "5722 - Household Appliance Stores"
          },
          {
              "id": "5731",
              "title": "Radio, Television, and Consumer Electronics Stores",
              "fullTitle": "5731 - Radio, Television, and Consumer Electronics Stores"
          },
          {
              "id": "5734",
              "title": "Computer and Computer Software Stores",
              "fullTitle": "5734 - Computer and Computer Software Stores"
          },
          {
              "id": "5735",
              "title": "Record and Prerecorded Tape Stores",
              "fullTitle": "5735 - Record and Prerecorded Tape Stores"
          },
          {
              "id": "5736",
              "title": "Musical Instrument Stores",
              "fullTitle": "5736 - Musical Instrument Stores"
          },
          {
              "id": "5812",
              "title": "Eating Places",
              "fullTitle": "5812 - Eating Places"
          },
          {
              "id": "5813",
              "title": "Drinking Places (Alcoholic Beverages)",
              "fullTitle": "5813 - Drinking Places (Alcoholic Beverages)"
          },
          {
              "id": "5912",
              "title": "Drug Stores and Proprietary Stores",
              "fullTitle": "5912 - Drug Stores and Proprietary Stores"
          },
          {
              "id": "5921",
              "title": "Liquor Stores",
              "fullTitle": "5921 - Liquor Stores"
          },
          {
              "id": "5932",
              "title": "Used Merchandise Stores",
              "fullTitle": "5932 - Used Merchandise Stores"
          },
          {
              "id": "5941",
              "title": "Sporting Goods Stores and Bicycle Shops",
              "fullTitle": "5941 - Sporting Goods Stores and Bicycle Shops"
          },
          {
              "id": "5942",
              "title": "Book Stores",
              "fullTitle": "5942 - Book Stores"
          },
          {
              "id": "5943",
              "title": "Stationery Stores",
              "fullTitle": "5943 - Stationery Stores"
          },
          {
              "id": "5944",
              "title": "Jewelry Stores",
              "fullTitle": "5944 - Jewelry Stores"
          },
          {
              "id": "5945",
              "title": "Hobby, Toy, and Game Shops",
              "fullTitle": "5945 - Hobby, Toy, and Game Shops"
          },
          {
              "id": "5946",
              "title": "Camera and Photographic Supply Stores",
              "fullTitle": "5946 - Camera and Photographic Supply Stores"
          },
          {
              "id": "5947",
              "title": "Gift, Novelty, and Souvenir Shops",
              "fullTitle": "5947 - Gift, Novelty, and Souvenir Shops"
          },
          {
              "id": "5948",
              "title": "Luggage and Leather Goods Stores",
              "fullTitle": "5948 - Luggage and Leather Goods Stores"
          },
          {
              "id": "5949",
              "title": "Sewing, Needlework, and Piece Goods Stores",
              "fullTitle": "5949 - Sewing, Needlework, and Piece Goods Stores"
          },
          {
              "id": "5961",
              "title": "Catalog and Mail",
              "fullTitle": "5961 - Catalog and Mail"
          },
          {
              "id": "5962",
              "title": "Automatic Merchandising Machine Operators",
              "fullTitle": "5962 - Automatic Merchandising Machine Operators"
          },
          {
              "id": "5963",
              "title": "Direct Selling Establishments",
              "fullTitle": "5963 - Direct Selling Establishments"
          },
          {
              "id": "5983",
              "title": "Fuel Oil Dealers",
              "fullTitle": "5983 - Fuel Oil Dealers"
          },
          {
              "id": "5984",
              "title": "Liquefied Petroleum Gas (Bottled Gas) Dealers",
              "fullTitle": "5984 - Liquefied Petroleum Gas (Bottled Gas) Dealers"
          },
          {
              "id": "5989",
              "title": "Fuel Dealers, Not Elsewhere Classified",
              "fullTitle": "5989 - Fuel Dealers, Not Elsewhere Classified"
          },
          {
              "id": "5992",
              "title": "Florists",
              "fullTitle": "5992 - Florists"
          },
          {
              "id": "5993",
              "title": "Tobacco Stores and Stands",
              "fullTitle": "5993 - Tobacco Stores and Stands"
          },
          {
              "id": "5994",
              "title": "News Dealers and Newsstands",
              "fullTitle": "5994 - News Dealers and Newsstands"
          },
          {
              "id": "5995",
              "title": "Optical Goods Stores",
              "fullTitle": "5995 - Optical Goods Stores"
          },
          {
              "id": "5999",
              "title": "Miscellaneous Retail Stores, Not Elsewhere Classified",
              "fullTitle": "5999 - Miscellaneous Retail Stores, Not Elsewhere Classified"
          },
          {
              "id": "6011",
              "title": "Federal Reserve Banks",
              "fullTitle": "6011 - Federal Reserve Banks"
          },
          {
              "id": "6019",
              "title": "Central Reserve Depository Institutions, Not Elsewhere Classified",
              "fullTitle": "6019 - Central Reserve Depository Institutions, Not Elsewhere Classified"
          },
          {
              "id": "6021",
              "title": "National Commercial Banks",
              "fullTitle": "6021 - National Commercial Banks"
          },
          {
              "id": "6022",
              "title": "State Commercial Banks",
              "fullTitle": "6022 - State Commercial Banks"
          },
          {
              "id": "6029",
              "title": "Commercial Banks, Not Elsewhere Classified",
              "fullTitle": "6029 - Commercial Banks, Not Elsewhere Classified"
          },
          {
              "id": "6035",
              "title": "Savings Institutions, Federally Chartered",
              "fullTitle": "6035 - Savings Institutions, Federally Chartered"
          },
          {
              "id": "6036",
              "title": "Savings Institutions, Not Federally Chartered",
              "fullTitle": "6036 - Savings Institutions, Not Federally Chartered"
          },
          {
              "id": "6061",
              "title": "Credit Unions, Federally Chartered",
              "fullTitle": "6061 - Credit Unions, Federally Chartered"
          },
          {
              "id": "6062",
              "title": "Credit Unions, Not Federally Chartered",
              "fullTitle": "6062 - Credit Unions, Not Federally Chartered"
          },
          {
              "id": "6081",
              "title": "Branches and Agencies of Foreign Banks",
              "fullTitle": "6081 - Branches and Agencies of Foreign Banks"
          },
          {
              "id": "6082",
              "title": "Foreign Trade and International Banking Institutions",
              "fullTitle": "6082 - Foreign Trade and International Banking Institutions"
          },
          {
              "id": "6091",
              "title": "Non-deposit Trust Facilities",
              "fullTitle": "6091 - Non-deposit Trust Facilities"
          },
          {
              "id": "6099",
              "title": "Functions Related to Depository Banking, Not Elsewhere Classified",
              "fullTitle": "6099 - Functions Related to Depository Banking, Not Elsewhere Classified"
          },
          {
              "id": "6111",
              "title": "Federal and Federally-Sponsored Credit Agencies",
              "fullTitle": "6111 - Federal and Federally-Sponsored Credit Agencies"
          },
          {
              "id": "6141",
              "title": "Personal Credit Institutions",
              "fullTitle": "6141 - Personal Credit Institutions"
          },
          {
              "id": "6153",
              "title": "Short-Term Business Credit Institutions, except Agricultural",
              "fullTitle": "6153 - Short-Term Business Credit Institutions, except Agricultural"
          },
          {
              "id": "6159",
              "title": "Miscellaneous Business Credit Institutions",
              "fullTitle": "6159 - Miscellaneous Business Credit Institutions"
          },
          {
              "id": "6162",
              "title": "Mortgage Bankers and Loan Correspondents",
              "fullTitle": "6162 - Mortgage Bankers and Loan Correspondents"
          },
          {
              "id": "6163",
              "title": "Loan Brokers",
              "fullTitle": "6163 - Loan Brokers"
          },
          {
              "id": "6211",
              "title": "Security Brokers, Dealers, and Flotation Companies",
              "fullTitle": "6211 - Security Brokers, Dealers, and Flotation Companies"
          },
          {
              "id": "6221",
              "title": "Commodity Contracts Brokers and Dealers",
              "fullTitle": "6221 - Commodity Contracts Brokers and Dealers"
          },
          {
              "id": "6231",
              "title": "Security and Commodity Exchanges",
              "fullTitle": "6231 - Security and Commodity Exchanges"
          },
          {
              "id": "6282",
              "title": "Investment Advice",
              "fullTitle": "6282 - Investment Advice"
          },
          {
              "id": "6289",
              "title": "Services Allied With the Exchange of Securities or Commodities, Not Elsewhere Classified",
              "fullTitle": "6289 - Services Allied With the Exchange of Securities or Commodities, Not Elsewhere Classified"
          },
          {
              "id": "6311",
              "title": "Life Insurance",
              "fullTitle": "6311 - Life Insurance"
          },
          {
              "id": "6321",
              "title": "Accident and Health Insurance",
              "fullTitle": "6321 - Accident and Health Insurance"
          },
          {
              "id": "6324",
              "title": "Hospital and Medical Service Plans",
              "fullTitle": "6324 - Hospital and Medical Service Plans"
          },
          {
              "id": "6331",
              "title": "Fire, Marine, and Casualty Insurance",
              "fullTitle": "6331 - Fire, Marine, and Casualty Insurance"
          },
          {
              "id": "6351",
              "title": "Surety Insurance",
              "fullTitle": "6351 - Surety Insurance"
          },
          {
              "id": "6361",
              "title": "Title Insurance",
              "fullTitle": "6361 - Title Insurance"
          },
          {
              "id": "6371",
              "title": "Pension, Health, and Welfare Funds",
              "fullTitle": "6371 - Pension, Health, and Welfare Funds"
          },
          {
              "id": "6399",
              "title": "Insurance Carriers, Not Elsewhere Classified",
              "fullTitle": "6399 - Insurance Carriers, Not Elsewhere Classified"
          },
          {
              "id": "6411",
              "title": "Insurance Agents, Brokers, and Service",
              "fullTitle": "6411 - Insurance Agents, Brokers, and Service"
          },
          {
              "id": "6512",
              "title": "Operators of Nonresidential Buildings",
              "fullTitle": "6512 - Operators of Nonresidential Buildings"
          },
          {
              "id": "6513",
              "title": "Operators or Apartment Buildings",
              "fullTitle": "6513 - Operators or Apartment Buildings"
          },
          {
              "id": "6514",
              "title": "Operators of Dwellings Other Than Apartment Buildings",
              "fullTitle": "6514 - Operators of Dwellings Other Than Apartment Buildings"
          },
          {
              "id": "6515",
              "title": "Operators of Residential Mobile Home Sites",
              "fullTitle": "6515 - Operators of Residential Mobile Home Sites"
          },
          {
              "id": "6517",
              "title": "Lessors of Railroad Property",
              "fullTitle": "6517 - Lessors of Railroad Property"
          },
          {
              "id": "6519",
              "title": "Lessors of Real Property, Not Elsewhere Classified",
              "fullTitle": "6519 - Lessors of Real Property, Not Elsewhere Classified"
          },
          {
              "id": "6531",
              "title": "Real Estate Agents and Managers",
              "fullTitle": "6531 - Real Estate Agents and Managers"
          },
          {
              "id": "6541",
              "title": "Title Abstract Offices",
              "fullTitle": "6541 - Title Abstract Offices"
          },
          {
              "id": "6552",
              "title": "Land Subdividers and Developers, Except Cemeteries",
              "fullTitle": "6552 - Land Subdividers and Developers, Except Cemeteries"
          },
          {
              "id": "6553",
              "title": "Cemetery Subdividers and Developers",
              "fullTitle": "6553 - Cemetery Subdividers and Developers"
          },
          {
              "id": "6712",
              "title": "Offices of Bank Holding Companies",
              "fullTitle": "6712 - Offices of Bank Holding Companies"
          },
          {
              "id": "6719",
              "title": "Offices of Holding Companies, Not Elsewhere Classified",
              "fullTitle": "6719 - Offices of Holding Companies, Not Elsewhere Classified"
          },
          {
              "id": "6722",
              "title": "Management Investment Offices, Open",
              "fullTitle": "6722 - Management Investment Offices, Open"
          },
          {
              "id": "6726",
              "title": "Unit Investment Trusts, Face-Amount Certificate Offices, and Closed-End Management Investment Offices",
              "fullTitle": "6726 - Unit Investment Trusts, Face-Amount Certificate Offices, and Closed-End Management Investment Offices"
          },
          {
              "id": "6732",
              "title": "Educational, Religious, and Charitable Trusts",
              "fullTitle": "6732 - Educational, Religious, and Charitable Trusts"
          },
          {
              "id": "6733",
              "title": "Trusts, Except Educational, Religious, and Charitable",
              "fullTitle": "6733 - Trusts, Except Educational, Religious, and Charitable"
          },
          {
              "id": "6792",
              "title": "Oil Royalty Traders",
              "fullTitle": "6792 - Oil Royalty Traders"
          },
          {
              "id": "6794",
              "title": "Patent Owners and Lessors",
              "fullTitle": "6794 - Patent Owners and Lessors"
          },
          {
              "id": "6798",
              "title": "Real Estate Investment Trusts",
              "fullTitle": "6798 - Real Estate Investment Trusts"
          },
          {
              "id": "6799",
              "title": "Investors, Not Elsewhere Classified",
              "fullTitle": "6799 - Investors, Not Elsewhere Classified"
          },
          {
              "id": "7011",
              "title": "Hotels and Motels",
              "fullTitle": "7011 - Hotels and Motels"
          },
          {
              "id": "7021",
              "title": "Rooming and Boarding Houses",
              "fullTitle": "7021 - Rooming and Boarding Houses"
          },
          {
              "id": "7032",
              "title": "Sporting and Recreational Camps",
              "fullTitle": "7032 - Sporting and Recreational Camps"
          },
          {
              "id": "7033",
              "title": "Recreational Vehicle Parks and Campsites",
              "fullTitle": "7033 - Recreational Vehicle Parks and Campsites"
          },
          {
              "id": "7041",
              "title": "Organization Hotels and Lodging Houses, on Membership Basis",
              "fullTitle": "7041 - Organization Hotels and Lodging Houses, on Membership Basis"
          },
          {
              "id": "7211",
              "title": "Power Laundries, Family and Commercial",
              "fullTitle": "7211 - Power Laundries, Family and Commercial"
          },
          {
              "id": "7212",
              "title": "Garment Pressing, and Agents for Laundries and Drycleaners",
              "fullTitle": "7212 - Garment Pressing, and Agents for Laundries and Drycleaners"
          },
          {
              "id": "7213",
              "title": "Linen Supply",
              "fullTitle": "7213 - Linen Supply"
          },
          {
              "id": "7215",
              "title": "Coin-Operated Laundries and Drycleaning",
              "fullTitle": "7215 - Coin-Operated Laundries and Drycleaning"
          },
          {
              "id": "7216",
              "title": "Drycleaning Plants, Except Rug Cleaning",
              "fullTitle": "7216 - Drycleaning Plants, Except Rug Cleaning"
          },
          {
              "id": "7217",
              "title": "Carpet and Upholstery Cleaning",
              "fullTitle": "7217 - Carpet and Upholstery Cleaning"
          },
          {
              "id": "7218",
              "title": "Industrial Launderers",
              "fullTitle": "7218 - Industrial Launderers"
          },
          {
              "id": "7219",
              "title": "Laundry and Garment Services, Not Elsewhere Classified",
              "fullTitle": "7219 - Laundry and Garment Services, Not Elsewhere Classified"
          },
          {
              "id": "7221",
              "title": "Photographic Studios, Portrait",
              "fullTitle": "7221 - Photographic Studios, Portrait"
          },
          {
              "id": "7231",
              "title": "Beauty Shops",
              "fullTitle": "7231 - Beauty Shops"
          },
          {
              "id": "7241",
              "title": "Barber Shops",
              "fullTitle": "7241 - Barber Shops"
          },
          {
              "id": "7251",
              "title": "Shoe Repair Shops and Shoeshine Parlors",
              "fullTitle": "7251 - Shoe Repair Shops and Shoeshine Parlors"
          },
          {
              "id": "7261",
              "title": "Funeral Service and Crematories",
              "fullTitle": "7261 - Funeral Service and Crematories"
          },
          {
              "id": "7291",
              "title": "Tax Return Preparation Services",
              "fullTitle": "7291 - Tax Return Preparation Services"
          },
          {
              "id": "7299",
              "title": "Miscellaneous Personal Services, Not Elsewhere Classified",
              "fullTitle": "7299 - Miscellaneous Personal Services, Not Elsewhere Classified"
          },
          {
              "id": "7311",
              "title": "Advertising Agencies",
              "fullTitle": "7311 - Advertising Agencies"
          },
          {
              "id": "7312",
              "title": "Outdoor Advertising Services",
              "fullTitle": "7312 - Outdoor Advertising Services"
          },
          {
              "id": "7313",
              "title": "Radio, Television, and Publishers' Advertising Representatives",
              "fullTitle": "7313 - Radio, Television, and Publishers' Advertising Representatives"
          },
          {
              "id": "7319",
              "title": "Advertising, Not Elsewhere Classified",
              "fullTitle": "7319 - Advertising, Not Elsewhere Classified"
          },
          {
              "id": "7322",
              "title": "Adjustment and Collection Services",
              "fullTitle": "7322 - Adjustment and Collection Services"
          },
          {
              "id": "7323",
              "title": "Credit Reporting Services",
              "fullTitle": "7323 - Credit Reporting Services"
          },
          {
              "id": "7331",
              "title": "Direct Mail Advertising Services",
              "fullTitle": "7331 - Direct Mail Advertising Services"
          },
          {
              "id": "7334",
              "title": "Photocopying and Duplicating Services",
              "fullTitle": "7334 - Photocopying and Duplicating Services"
          },
          {
              "id": "7335",
              "title": "Commercial Photography",
              "fullTitle": "7335 - Commercial Photography"
          },
          {
              "id": "7336",
              "title": "Commercial Art and Graphic Design",
              "fullTitle": "7336 - Commercial Art and Graphic Design"
          },
          {
              "id": "7338",
              "title": "Secretarial and Court Reporting Services",
              "fullTitle": "7338 - Secretarial and Court Reporting Services"
          },
          {
              "id": "7342",
              "title": "Disinfecting and Pest Control Services",
              "fullTitle": "7342 - Disinfecting and Pest Control Services"
          },
          {
              "id": "7349",
              "title": "Building Cleaning and Maintenance Services, Not Elsewhere Classified",
              "fullTitle": "7349 - Building Cleaning and Maintenance Services, Not Elsewhere Classified"
          },
          {
              "id": "7352",
              "title": "Medical Equipment Rental and Leasing",
              "fullTitle": "7352 - Medical Equipment Rental and Leasing"
          },
          {
              "id": "7353",
              "title": "Heavy Construction Equipment Rental and Leasing",
              "fullTitle": "7353 - Heavy Construction Equipment Rental and Leasing"
          },
          {
              "id": "7359",
              "title": "Equipment Rental and Leasing, Not Elsewhere Classified",
              "fullTitle": "7359 - Equipment Rental and Leasing, Not Elsewhere Classified"
          },
          {
              "id": "7361",
              "title": "Employment Agencies",
              "fullTitle": "7361 - Employment Agencies"
          },
          {
              "id": "7363",
              "title": "Help Supply Services",
              "fullTitle": "7363 - Help Supply Services"
          },
          {
              "id": "7371",
              "title": "Computer Programming Services",
              "fullTitle": "7371 - Computer Programming Services"
          },
          {
              "id": "7372",
              "title": "Prepackaged Software",
              "fullTitle": "7372 - Prepackaged Software"
          },
          {
              "id": "7373",
              "title": "Computer Integrated Systems Design",
              "fullTitle": "7373 - Computer Integrated Systems Design"
          },
          {
              "id": "7374",
              "title": "Computer Processing and Data Preparation and Processing Services",
              "fullTitle": "7374 - Computer Processing and Data Preparation and Processing Services"
          },
          {
              "id": "7375",
              "title": "Information Retrieval Services",
              "fullTitle": "7375 - Information Retrieval Services"
          },
          {
              "id": "7376",
              "title": "Computer Facilities Management Services",
              "fullTitle": "7376 - Computer Facilities Management Services"
          },
          {
              "id": "7377",
              "title": "Computer Rental and Leasing",
              "fullTitle": "7377 - Computer Rental and Leasing"
          },
          {
              "id": "7378",
              "title": "Computer Maintenance and Repair",
              "fullTitle": "7378 - Computer Maintenance and Repair"
          },
          {
              "id": "7379",
              "title": "Computer Related Services, Not Elsewhere Classified",
              "fullTitle": "7379 - Computer Related Services, Not Elsewhere Classified"
          },
          {
              "id": "7381",
              "title": "Detective, Guard, and Armored Car Services",
              "fullTitle": "7381 - Detective, Guard, and Armored Car Services"
          },
          {
              "id": "7382",
              "title": "Security Systems Services",
              "fullTitle": "7382 - Security Systems Services"
          },
          {
              "id": "7383",
              "title": "News Syndicates",
              "fullTitle": "7383 - News Syndicates"
          },
          {
              "id": "7384",
              "title": "Photofinishing Laboratories",
              "fullTitle": "7384 - Photofinishing Laboratories"
          },
          {
              "id": "7389",
              "title": "Business Services, Not Elsewhere Classified",
              "fullTitle": "7389 - Business Services, Not Elsewhere Classified"
          },
          {
              "id": "7513",
              "title": "Truck Rental and Leasing, Without Drivers",
              "fullTitle": "7513 - Truck Rental and Leasing, Without Drivers"
          },
          {
              "id": "7514",
              "title": "Passenger Car Rental",
              "fullTitle": "7514 - Passenger Car Rental"
          },
          {
              "id": "7515",
              "title": "Passenger Car Leasing",
              "fullTitle": "7515 - Passenger Car Leasing"
          },
          {
              "id": "7519",
              "title": "Utility Trailer and Recreational Vehicle Rental",
              "fullTitle": "7519 - Utility Trailer and Recreational Vehicle Rental"
          },
          {
              "id": "7521",
              "title": "Automobile Parking",
              "fullTitle": "7521 - Automobile Parking"
          },
          {
              "id": "7532",
              "title": "Top, Body, and Upholstery Repair Shops and Paint Shops",
              "fullTitle": "7532 - Top, Body, and Upholstery Repair Shops and Paint Shops"
          },
          {
              "id": "7533",
              "title": "Automotive Exhaust System Repair Shops",
              "fullTitle": "7533 - Automotive Exhaust System Repair Shops"
          },
          {
              "id": "7534",
              "title": "Tire Retreading and Repair Shops",
              "fullTitle": "7534 - Tire Retreading and Repair Shops"
          },
          {
              "id": "7536",
              "title": "Automotive Glass Replacement Shops",
              "fullTitle": "7536 - Automotive Glass Replacement Shops"
          },
          {
              "id": "7537",
              "title": "Automotive Transmission Repair Shops",
              "fullTitle": "7537 - Automotive Transmission Repair Shops"
          },
          {
              "id": "7538",
              "title": "General Automotive Repair Shops",
              "fullTitle": "7538 - General Automotive Repair Shops"
          },
          {
              "id": "7539",
              "title": "Automotive Repair Shops, Not Elsewhere Classified",
              "fullTitle": "7539 - Automotive Repair Shops, Not Elsewhere Classified"
          },
          {
              "id": "7542",
              "title": "Carwashes",
              "fullTitle": "7542 - Carwashes"
          },
          {
              "id": "7549",
              "title": "Automotive Services, Except Repair and Carwashes",
              "fullTitle": "7549 - Automotive Services, Except Repair and Carwashes"
          },
          {
              "id": "7622",
              "title": "Radio and Television Repair Shops",
              "fullTitle": "7622 - Radio and Television Repair Shops"
          },
          {
              "id": "7623",
              "title": "Refrigeration and Air-conditioning Service and Repair Shops",
              "fullTitle": "7623 - Refrigeration and Air-conditioning Service and Repair Shops"
          },
          {
              "id": "7629",
              "title": "Electrical and Electronic Repair Shops, Not Elsewhere Classified",
              "fullTitle": "7629 - Electrical and Electronic Repair Shops, Not Elsewhere Classified"
          },
          {
              "id": "7631",
              "title": "Watch, Clock, and Jewelry Repair",
              "fullTitle": "7631 - Watch, Clock, and Jewelry Repair"
          },
          {
              "id": "7641",
              "title": "Reupholstery and Furniture Repair",
              "fullTitle": "7641 - Reupholstery and Furniture Repair"
          },
          {
              "id": "7692",
              "title": "Welding Repair",
              "fullTitle": "7692 - Welding Repair"
          },
          {
              "id": "7694",
              "title": "Armature Rewinding Shops",
              "fullTitle": "7694 - Armature Rewinding Shops"
          },
          {
              "id": "7699",
              "title": "Repair Shops and Related Services, Not Elsewhere Classified",
              "fullTitle": "7699 - Repair Shops and Related Services, Not Elsewhere Classified"
          },
          {
              "id": "7812",
              "title": "Motion Picture and Video Tape Production",
              "fullTitle": "7812 - Motion Picture and Video Tape Production"
          },
          {
              "id": "7819",
              "title": "Services Allied to Motion Picture Production",
              "fullTitle": "7819 - Services Allied to Motion Picture Production"
          },
          {
              "id": "7822",
              "title": "Motion Picture and Video Tape Distribution",
              "fullTitle": "7822 - Motion Picture and Video Tape Distribution"
          },
          {
              "id": "7829",
              "title": "Services Allied to Motion Picture Distribution",
              "fullTitle": "7829 - Services Allied to Motion Picture Distribution"
          },
          {
              "id": "7832",
              "title": "Motion Picture Theaters, Except Drive",
              "fullTitle": "7832 - Motion Picture Theaters, Except Drive"
          },
          {
              "id": "7833",
              "title": "Drive-In Motion Picture Theaters",
              "fullTitle": "7833 - Drive-In Motion Picture Theaters"
          },
          {
              "id": "7841",
              "title": "Video Tape Rental",
              "fullTitle": "7841 - Video Tape Rental"
          },
          {
              "id": "7911",
              "title": "Dance Studios, Schools, and Halls",
              "fullTitle": "7911 - Dance Studios, Schools, and Halls"
          },
          {
              "id": "7922",
              "title": "Theatrical Producers (Except Motion Picture) and Miscellaneous Theatrical Services",
              "fullTitle": "7922 - Theatrical Producers (Except Motion Picture) and Miscellaneous Theatrical Services"
          },
          {
              "id": "7929",
              "title": "Bands, Orchestras, Actors, and Other Entertainers and Entertainment Groups",
              "fullTitle": "7929 - Bands, Orchestras, Actors, and Other Entertainers and Entertainment Groups"
          },
          {
              "id": "7933",
              "title": "Bowling Centers",
              "fullTitle": "7933 - Bowling Centers"
          },
          {
              "id": "7941",
              "title": "Professional Sports Clubs and Promoters",
              "fullTitle": "7941 - Professional Sports Clubs and Promoters"
          },
          {
              "id": "7948",
              "title": "Racing, Including Track Operation",
              "fullTitle": "7948 - Racing, Including Track Operation"
          },
          {
              "id": "7991",
              "title": "Physical Fitness Facilities",
              "fullTitle": "7991 - Physical Fitness Facilities"
          },
          {
              "id": "7992",
              "title": "Public Golf Courses",
              "fullTitle": "7992 - Public Golf Courses"
          },
          {
              "id": "7993",
              "title": "Coin-Operated Amusement Devices",
              "fullTitle": "7993 - Coin-Operated Amusement Devices"
          },
          {
              "id": "7996",
              "title": "Amusement Parks",
              "fullTitle": "7996 - Amusement Parks"
          },
          {
              "id": "7997",
              "title": "Membership Sports and Recreation Clubs",
              "fullTitle": "7997 - Membership Sports and Recreation Clubs"
          },
          {
              "id": "7999",
              "title": "Amusement and Recreation Services, Not Elsewhere Classified",
              "fullTitle": "7999 - Amusement and Recreation Services, Not Elsewhere Classified"
          },
          {
              "id": "8011",
              "title": "Offices and Clinics of Doctors of Medicine",
              "fullTitle": "8011 - Offices and Clinics of Doctors of Medicine"
          },
          {
              "id": "8021",
              "title": "Offices and Clinics of Dentists",
              "fullTitle": "8021 - Offices and Clinics of Dentists"
          },
          {
              "id": "8031",
              "title": "Offices and Clinics of Doctors of Osteopathy",
              "fullTitle": "8031 - Offices and Clinics of Doctors of Osteopathy"
          },
          {
              "id": "8041",
              "title": "Offices and Clinics of Chiropractors",
              "fullTitle": "8041 - Offices and Clinics of Chiropractors"
          },
          {
              "id": "8042",
              "title": "Offices and Clinics of Optometrists",
              "fullTitle": "8042 - Offices and Clinics of Optometrists"
          },
          {
              "id": "8043",
              "title": "Offices and Clinics of Podiatrists",
              "fullTitle": "8043 - Offices and Clinics of Podiatrists"
          },
          {
              "id": "8049",
              "title": "Offices and Clinics of Health Practitioners, Not Elsewhere Classified",
              "fullTitle": "8049 - Offices and Clinics of Health Practitioners, Not Elsewhere Classified"
          },
          {
              "id": "8051",
              "title": "Skilled Nursing Care Facilities",
              "fullTitle": "8051 - Skilled Nursing Care Facilities"
          },
          {
              "id": "8052",
              "title": "Intermediate Care Facilities",
              "fullTitle": "8052 - Intermediate Care Facilities"
          },
          {
              "id": "8059",
              "title": "Nursing and Personal Care Facilities, Not Elsewhere Classified",
              "fullTitle": "8059 - Nursing and Personal Care Facilities, Not Elsewhere Classified"
          },
          {
              "id": "8062",
              "title": "General Medical and Surgical Hospitals",
              "fullTitle": "8062 - General Medical and Surgical Hospitals"
          },
          {
              "id": "8063",
              "title": "Psychiatric Hospitals",
              "fullTitle": "8063 - Psychiatric Hospitals"
          },
          {
              "id": "8069",
              "title": "Specialty Hospitals, Except Psychiatric",
              "fullTitle": "8069 - Specialty Hospitals, Except Psychiatric"
          },
          {
              "id": "8071",
              "title": "Medical Laboratories",
              "fullTitle": "8071 - Medical Laboratories"
          },
          {
              "id": "8072",
              "title": "Dental Laboratories",
              "fullTitle": "8072 - Dental Laboratories"
          },
          {
              "id": "8082",
              "title": "Home Health Care Services",
              "fullTitle": "8082 - Home Health Care Services"
          },
          {
              "id": "8092",
              "title": "Kidney Dialysis Centers",
              "fullTitle": "8092 - Kidney Dialysis Centers"
          },
          {
              "id": "8093",
              "title": "Specialty Outpatient Facilities, Not Elsewhere Classified",
              "fullTitle": "8093 - Specialty Outpatient Facilities, Not Elsewhere Classified"
          },
          {
              "id": "8099",
              "title": "Health and Allied Services, Not Elsewhere Classified",
              "fullTitle": "8099 - Health and Allied Services, Not Elsewhere Classified"
          },
          {
              "id": "8111",
              "title": "Legal Services",
              "fullTitle": "8111 - Legal Services"
          },
          {
              "id": "8211",
              "title": "Elementary and Secondary Schools",
              "fullTitle": "8211 - Elementary and Secondary Schools"
          },
          {
              "id": "8221",
              "title": "Colleges, Universities, and Professional Schools",
              "fullTitle": "8221 - Colleges, Universities, and Professional Schools"
          },
          {
              "id": "8222",
              "title": "Junior Colleges and Technical Institutes",
              "fullTitle": "8222 - Junior Colleges and Technical Institutes"
          },
          {
              "id": "8231",
              "title": "Libraries",
              "fullTitle": "8231 - Libraries"
          },
          {
              "id": "8243",
              "title": "Data Processing Schools",
              "fullTitle": "8243 - Data Processing Schools"
          },
          {
              "id": "8244",
              "title": "Business and Secretarial Schools",
              "fullTitle": "8244 - Business and Secretarial Schools"
          },
          {
              "id": "8249",
              "title": "Vocational Schools, Not Elsewhere Classified",
              "fullTitle": "8249 - Vocational Schools, Not Elsewhere Classified"
          },
          {
              "id": "8299",
              "title": "Schools and Educational Services, Not Elsewhere Classified",
              "fullTitle": "8299 - Schools and Educational Services, Not Elsewhere Classified"
          },
          {
              "id": "8322",
              "title": "Individual and Family Social Services",
              "fullTitle": "8322 - Individual and Family Social Services"
          },
          {
              "id": "8331",
              "title": "Job Training and Vocational Rehabilitation Services",
              "fullTitle": "8331 - Job Training and Vocational Rehabilitation Services"
          },
          {
              "id": "8351",
              "title": "Child Day Care Services",
              "fullTitle": "8351 - Child Day Care Services"
          },
          {
              "id": "8361",
              "title": "Residential Care",
              "fullTitle": "8361 - Residential Care"
          },
          {
              "id": "8399",
              "title": "Social Services, Not Elsewhere Classified",
              "fullTitle": "8399 - Social Services, Not Elsewhere Classified"
          },
          {
              "id": "8412",
              "title": "Museums and Art Galleries",
              "fullTitle": "8412 - Museums and Art Galleries"
          },
          {
              "id": "8422",
              "title": "Arboreta and Botanical or Zoological Gardens",
              "fullTitle": "8422 - Arboreta and Botanical or Zoological Gardens"
          },
          {
              "id": "8611",
              "title": "Business Associations",
              "fullTitle": "8611 - Business Associations"
          },
          {
              "id": "8621",
              "title": "Professional Membership Organizations",
              "fullTitle": "8621 - Professional Membership Organizations"
          },
          {
              "id": "8631",
              "title": "Labor Unions and Similar Labor organizations",
              "fullTitle": "8631 - Labor Unions and Similar Labor organizations"
          },
          {
              "id": "8641",
              "title": "Civic, Social, and Fraternal Associations",
              "fullTitle": "8641 - Civic, Social, and Fraternal Associations"
          },
          {
              "id": "8651",
              "title": "Political Organizations",
              "fullTitle": "8651 - Political Organizations"
          },
          {
              "id": "8661",
              "title": "Religious Organizations",
              "fullTitle": "8661 - Religious Organizations"
          },
          {
              "id": "8699",
              "title": "Membership organizations, Not Elsewhere Classified",
              "fullTitle": "8699 - Membership organizations, Not Elsewhere Classified"
          },
          {
              "id": "8711",
              "title": "Engineering Services",
              "fullTitle": "8711 - Engineering Services"
          },
          {
              "id": "8712",
              "title": "Architectural Services",
              "fullTitle": "8712 - Architectural Services"
          },
          {
              "id": "8713",
              "title": "Surveying Services",
              "fullTitle": "8713 - Surveying Services"
          },
          {
              "id": "8721",
              "title": "Accounting, Auditing, and Bookkeeping Services",
              "fullTitle": "8721 - Accounting, Auditing, and Bookkeeping Services"
          },
          {
              "id": "8731",
              "title": "Commercial Physical and Biological Research",
              "fullTitle": "8731 - Commercial Physical and Biological Research"
          },
          {
              "id": "8732",
              "title": "Commercial Economic, Sociological, and Educational Research",
              "fullTitle": "8732 - Commercial Economic, Sociological, and Educational Research"
          },
          {
              "id": "8733",
              "title": "Noncommercial Research organizations",
              "fullTitle": "8733 - Noncommercial Research organizations"
          },
          {
              "id": "8734",
              "title": "Testing Laboratories",
              "fullTitle": "8734 - Testing Laboratories"
          },
          {
              "id": "8741",
              "title": "Management Services",
              "fullTitle": "8741 - Management Services"
          },
          {
              "id": "8742",
              "title": "Management Consulting Services",
              "fullTitle": "8742 - Management Consulting Services"
          },
          {
              "id": "8743",
              "title": "Public Relations Services",
              "fullTitle": "8743 - Public Relations Services"
          },
          {
              "id": "8744",
              "title": "Facilities Support Management Services",
              "fullTitle": "8744 - Facilities Support Management Services"
          },
          {
              "id": "8748",
              "title": "Business Consulting Services, Not Elsewhere Classified",
              "fullTitle": "8748 - Business Consulting Services, Not Elsewhere Classified"
          },
          {
              "id": "8811",
              "title": "Private Households",
              "fullTitle": "8811 - Private Households"
          },
          {
              "id": "8999",
              "title": "Services, Not Elsewhere Classified",
              "fullTitle": "8999 - Services, Not Elsewhere Classified"
          },
          {
              "id": "9111",
              "title": "Executive Offices",
              "fullTitle": "9111 - Executive Offices"
          },
          {
              "id": "9121",
              "title": "Legislative Bodies",
              "fullTitle": "9121 - Legislative Bodies"
          },
          {
              "id": "9131",
              "title": "Executive and Legislative Offices Combined",
              "fullTitle": "9131 - Executive and Legislative Offices Combined"
          },
          {
              "id": "9199",
              "title": "General Government, Not Elsewhere Classified",
              "fullTitle": "9199 - General Government, Not Elsewhere Classified"
          },
          {
              "id": "9211",
              "title": "Courts",
              "fullTitle": "9211 - Courts"
          },
          {
              "id": "9221",
              "title": "Police Protection",
              "fullTitle": "9221 - Police Protection"
          },
          {
              "id": "9222",
              "title": "Legal Counsel and Prosecution",
              "fullTitle": "9222 - Legal Counsel and Prosecution"
          },
          {
              "id": "9223",
              "title": "Correctional Institutions",
              "fullTitle": "9223 - Correctional Institutions"
          },
          {
              "id": "9224",
              "title": "Fire Protection",
              "fullTitle": "9224 - Fire Protection"
          },
          {
              "id": "9229",
              "title": "Public order and Safety, Not Elsewhere Classified",
              "fullTitle": "9229 - Public order and Safety, Not Elsewhere Classified"
          },
          {
              "id": "9311",
              "title": "Public Finance, Taxation, and Monetary Policy",
              "fullTitle": "9311 - Public Finance, Taxation, and Monetary Policy"
          },
          {
              "id": "9411",
              "title": "Administration of Educational Programs",
              "fullTitle": "9411 - Administration of Educational Programs"
          },
          {
              "id": "9431",
              "title": "Administration of Public Health Programs",
              "fullTitle": "9431 - Administration of Public Health Programs"
          },
          {
              "id": "9441",
              "title": "Administration of Social, Human Resource and Income Maintenance Programs",
              "fullTitle": "9441 - Administration of Social, Human Resource and Income Maintenance Programs"
          },
          {
              "id": "9451",
              "title": "Administration of Veterans' Affairs, Except Health and Insurance",
              "fullTitle": "9451 - Administration of Veterans' Affairs, Except Health and Insurance"
          },
          {
              "id": "9511",
              "title": "Air and Water Resource and Solid Waste Management",
              "fullTitle": "9511 - Air and Water Resource and Solid Waste Management"
          },
          {
              "id": "9512",
              "title": "Land, Mineral, Wildlife, and Forest Conservation",
              "fullTitle": "9512 - Land, Mineral, Wildlife, and Forest Conservation"
          },
          {
              "id": "9531",
              "title": "Administration of Housing Programs",
              "fullTitle": "9531 - Administration of Housing Programs"
          },
          {
              "id": "9532",
              "title": "Administration of Urban Planning and Community and Rural Development",
              "fullTitle": "9532 - Administration of Urban Planning and Community and Rural Development"
          },
          {
              "id": "9611",
              "title": "Administration of General Economic Programs",
              "fullTitle": "9611 - Administration of General Economic Programs"
          },
          {
              "id": "9621",
              "title": "Regulation and Administration of Transportation Programs",
              "fullTitle": "9621 - Regulation and Administration of Transportation Programs"
          },
          {
              "id": "9631",
              "title": "Regulation and Administration of Communications, Electric, Gas, and Other Utilities",
              "fullTitle": "9631 - Regulation and Administration of Communications, Electric, Gas, and Other Utilities"
          },
          {
              "id": "9641",
              "title": "Regulation of Agricultural Marketing and Commodities",
              "fullTitle": "9641 - Regulation of Agricultural Marketing and Commodities"
          },
          {
              "id": "9651",
              "title": "Regulation, Licensing, and Inspection of Miscellaneous Commercial Sectors",
              "fullTitle": "9651 - Regulation, Licensing, and Inspection of Miscellaneous Commercial Sectors"
          },
          {
              "id": "9661",
              "title": "Space and Research and Technology",
              "fullTitle": "9661 - Space and Research and Technology"
          },
          {
              "id": "9711",
              "title": "National Security",
              "fullTitle": "9711 - National Security"
          },
          {
              "id": "9721",
              "title": "International Affairs",
              "fullTitle": "9721 - International Affairs"
          },
          {
              "id": "9999",
              "title": "Nonclassifiable Establishments",
              "fullTitle": "9999 - Nonclassifiable Establishments"
          }
        ]);
      });
      it('Should return `200` with master sic code list', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {},
          user: {
            email: 'dev.pmgr1@nexsales.com',
            roles: ['manager'],
          },
        };
        const res = {
          statusCode: null,
          data: null,
          status: (code) => {
            res.statusCode = code;
            return res;
          },
          json: () => res,
          send: (data) => {
            res.data = data;
            return res;
          },
        };
        sicCodeControllerModule.get(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualData = result.data;
            const actualStatusCode = result.statusCode;
            const expectedData = [
              {
                  "id": "0111",
                  "title": "Wheat",
                  "fullTitle": "0111 - Wheat"
              },
              {
                  "id": "0112",
                  "title": "Rice",
                  "fullTitle": "0112 - Rice"
              },
              {
                  "id": "0115",
                  "title": "Corn",
                  "fullTitle": "0115 - Corn"
              },
              {
                  "id": "0116",
                  "title": "Soyabeans",
                  "fullTitle": "0116 - Soyabeans"
              },
              {
                  "id": "0119",
                  "title": "Cash Grains, Not elsewhere classified",
                  "fullTitle": "0119 - Cash Grains, Not elsewhere classified"
              },
              {
                  "id": "0131",
                  "title": "Cotton",
                  "fullTitle": "0131 - Cotton"
              },
              {
                  "id": "0132",
                  "title": "Tobacco",
                  "fullTitle": "0132 - Tobacco"
              },
              {
                  "id": "0133",
                  "title": "Sugarcane and Sugar Beets",
                  "fullTitle": "0133 - Sugarcane and Sugar Beets"
              },
              {
                  "id": "0134",
                  "title": "Irish Potatoes",
                  "fullTitle": "0134 - Irish Potatoes"
              },
              {
                  "id": "0139",
                  "title": "Field crops,Except Cash Grains, Not Elsewhere Classified",
                  "fullTitle": "0139 - Field crops,Except Cash Grains, Not Elsewhere Classified"
              },
              {
                  "id": "0161",
                  "title": "Vegetables and Melons",
                  "fullTitle": "0161 - Vegetables and Melons"
              },
              {
                  "id": "0171",
                  "title": "Berry Crops",
                  "fullTitle": "0171 - Berry Crops"
              },
              {
                  "id": "0172",
                  "title": "Grapes",
                  "fullTitle": "0172 - Grapes"
              },
              {
                  "id": "0173",
                  "title": "Tree Nuts",
                  "fullTitle": "0173 - Tree Nuts"
              },
              {
                  "id": "0174",
                  "title": "Citrus Fruits",
                  "fullTitle": "0174 - Citrus Fruits"
              },
              {
                  "id": "0175",
                  "title": "Deciduous Tree Fruits",
                  "fullTitle": "0175 - Deciduous Tree Fruits"
              },
              {
                  "id": "0179",
                  "title": "Fruits and Tree Nuts, Not Elsewhere Classified",
                  "fullTitle": "0179 - Fruits and Tree Nuts, Not Elsewhere Classified"
              },
              {
                  "id": "0181",
                  "title": "Ornamental Floriculture and Nursery Products",
                  "fullTitle": "0181 - Ornamental Floriculture and Nursery Products"
              },
              {
                  "id": "0182",
                  "title": "Food Crops Grown Under Cover",
                  "fullTitle": "0182 - Food Crops Grown Under Cover"
              },
              {
                  "id": "0191",
                  "title": "General Farms, Primarily Crop",
                  "fullTitle": "0191 - General Farms, Primarily Crop"
              },
              {
                  "id": "0211",
                  "title": "Beef Cattle Feedlots",
                  "fullTitle": "0211 - Beef Cattle Feedlots"
              },
              {
                  "id": "0212",
                  "title": "Beef Cattle, Except Feedlots",
                  "fullTitle": "0212 - Beef Cattle, Except Feedlots"
              },
              {
                  "id": "0213",
                  "title": "Hogs",
                  "fullTitle": "0213 - Hogs"
              },
              {
                  "id": "0214",
                  "title": "Sheep and Goats",
                  "fullTitle": "0214 - Sheep and Goats"
              },
              {
                  "id": "0219",
                  "title": "General Livestock, Except Dairy and Poultry",
                  "fullTitle": "0219 - General Livestock, Except Dairy and Poultry"
              },
              {
                  "id": "0241",
                  "title": "Dairy Farms",
                  "fullTitle": "0241 - Dairy Farms"
              },
              {
                  "id": "0251",
                  "title": "Broiler, Fryer, and Roaster Chickens",
                  "fullTitle": "0251 - Broiler, Fryer, and Roaster Chickens"
              },
              {
                  "id": "0252",
                  "title": "Chicken Eggs",
                  "fullTitle": "0252 - Chicken Eggs"
              },
              {
                  "id": "0253",
                  "title": "Turkeys and Turkey Eggs",
                  "fullTitle": "0253 - Turkeys and Turkey Eggs"
              },
              {
                  "id": "0254",
                  "title": "Poultry Hatcheries",
                  "fullTitle": "0254 - Poultry Hatcheries"
              },
              {
                  "id": "0259",
                  "title": "Poultry and Eggs, Not Elsewhere Classified",
                  "fullTitle": "0259 - Poultry and Eggs, Not Elsewhere Classified"
              },
              {
                  "id": "0271",
                  "title": "Fur",
                  "fullTitle": "0271 - Fur"
              },
              {
                  "id": "0272",
                  "title": "Horses and Other Equines",
                  "fullTitle": "0272 - Horses and Other Equines"
              },
              {
                  "id": "0273",
                  "title": "Animal Aquaculture",
                  "fullTitle": "0273 - Animal Aquaculture"
              },
              {
                  "id": "0279",
                  "title": "Animal Specialties, Not Elsewhere Classified",
                  "fullTitle": "0279 - Animal Specialties, Not Elsewhere Classified"
              },
              {
                  "id": "0291",
                  "title": "General Farms, Primarily Livestock and Animal Specialties",
                  "fullTitle": "0291 - General Farms, Primarily Livestock and Animal Specialties"
              },
              {
                  "id": "0711",
                  "title": "Soil Preparation Services",
                  "fullTitle": "0711 - Soil Preparation Services"
              },
              {
                  "id": "0721",
                  "title": "Crop Planting, Cultivating, and Protecting",
                  "fullTitle": "0721 - Crop Planting, Cultivating, and Protecting"
              },
              {
                  "id": "0722",
                  "title": "Crop Harvesting, Primarily by Machine",
                  "fullTitle": "0722 - Crop Harvesting, Primarily by Machine"
              },
              {
                  "id": "0723",
                  "title": "Crop Preparation Services for Market, Except Cotton Ginning",
                  "fullTitle": "0723 - Crop Preparation Services for Market, Except Cotton Ginning"
              },
              {
                  "id": "0724",
                  "title": "Cotton Ginning",
                  "fullTitle": "0724 - Cotton Ginning"
              },
              {
                  "id": "0741",
                  "title": "Veterinary Services for Livestock",
                  "fullTitle": "0741 - Veterinary Services for Livestock"
              },
              {
                  "id": "0742",
                  "title": "Veterinary Services for Animal Specialties",
                  "fullTitle": "0742 - Veterinary Services for Animal Specialties"
              },
              {
                  "id": "0751",
                  "title": "Livestock Services, Except Veterinary",
                  "fullTitle": "0751 - Livestock Services, Except Veterinary"
              },
              {
                  "id": "0752",
                  "title": "Animal Specialty Services, Except Veterinary",
                  "fullTitle": "0752 - Animal Specialty Services, Except Veterinary"
              },
              {
                  "id": "0761",
                  "title": "Farm Labor Contractors and Crew Leaders",
                  "fullTitle": "0761 - Farm Labor Contractors and Crew Leaders"
              },
              {
                  "id": "0762",
                  "title": "Farm Management Services",
                  "fullTitle": "0762 - Farm Management Services"
              },
              {
                  "id": "0781",
                  "title": "Landscape Counseling and Planning",
                  "fullTitle": "0781 - Landscape Counseling and Planning"
              },
              {
                  "id": "0782",
                  "title": "Lawn and Garden Services",
                  "fullTitle": "0782 - Lawn and Garden Services"
              },
              {
                  "id": "0783",
                  "title": "ornamental Shrub and Tree Services",
                  "fullTitle": "0783 - ornamental Shrub and Tree Services"
              },
              {
                  "id": "0811",
                  "title": "Timber Tracts",
                  "fullTitle": "0811 - Timber Tracts"
              },
              {
                  "id": "0831",
                  "title": "Forest Nurseries and Gathering of Forest Products",
                  "fullTitle": "0831 - Forest Nurseries and Gathering of Forest Products"
              },
              {
                  "id": "0851",
                  "title": "Forestry Services",
                  "fullTitle": "0851 - Forestry Services"
              },
              {
                  "id": "0912",
                  "title": "Finfish",
                  "fullTitle": "0912 - Finfish"
              },
              {
                  "id": "0913",
                  "title": "Shellfish",
                  "fullTitle": "0913 - Shellfish"
              },
              {
                  "id": "0919",
                  "title": "Miscellaneous Marine Products",
                  "fullTitle": "0919 - Miscellaneous Marine Products"
              },
              {
                  "id": "0921",
                  "title": "Fish Hatcheries and Preserves",
                  "fullTitle": "0921 - Fish Hatcheries and Preserves"
              },
              {
                  "id": "0971",
                  "title": "Hunting and Trapping, and Game Propagation",
                  "fullTitle": "0971 - Hunting and Trapping, and Game Propagation"
              },
              {
                  "id": "1011",
                  "title": "Iron Ores",
                  "fullTitle": "1011 - Iron Ores"
              },
              {
                  "id": "1021",
                  "title": "Copper Ores",
                  "fullTitle": "1021 - Copper Ores"
              },
              {
                  "id": "1031",
                  "title": "Lead and Zinc Ores",
                  "fullTitle": "1031 - Lead and Zinc Ores"
              },
              {
                  "id": "1041",
                  "title": "Gold Ores",
                  "fullTitle": "1041 - Gold Ores"
              },
              {
                  "id": "1044",
                  "title": "Silver Ores",
                  "fullTitle": "1044 - Silver Ores"
              },
              {
                  "id": "1061",
                  "title": "Ferroalloy Ores, Except Vanadium",
                  "fullTitle": "1061 - Ferroalloy Ores, Except Vanadium"
              },
              {
                  "id": "1081",
                  "title": "Metal Mining Services",
                  "fullTitle": "1081 - Metal Mining Services"
              },
              {
                  "id": "1094",
                  "title": "Uranium",
                  "fullTitle": "1094 - Uranium"
              },
              {
                  "id": "1099",
                  "title": "Miscellaneous Metal Ores, Not Elsewhere Classified",
                  "fullTitle": "1099 - Miscellaneous Metal Ores, Not Elsewhere Classified"
              },
              {
                  "id": "1221",
                  "title": "Bituminous Coal and Lignite Surface Mining",
                  "fullTitle": "1221 - Bituminous Coal and Lignite Surface Mining"
              },
              {
                  "id": "1222",
                  "title": "Bituminous Coal Underground Mining",
                  "fullTitle": "1222 - Bituminous Coal Underground Mining"
              },
              {
                  "id": "1231",
                  "title": "Anthracite Mining",
                  "fullTitle": "1231 - Anthracite Mining"
              },
              {
                  "id": "1241",
                  "title": "Coal Mining Services",
                  "fullTitle": "1241 - Coal Mining Services"
              },
              {
                  "id": "1311",
                  "title": "Crude Petroleum and Natural Gas",
                  "fullTitle": "1311 - Crude Petroleum and Natural Gas"
              },
              {
                  "id": "1321",
                  "title": "Natural Gas Liquids",
                  "fullTitle": "1321 - Natural Gas Liquids"
              },
              {
                  "id": "1381",
                  "title": "Drilling Oil and Gas Wells",
                  "fullTitle": "1381 - Drilling Oil and Gas Wells"
              },
              {
                  "id": "1382",
                  "title": "Oil and Gas Field Exploration Services",
                  "fullTitle": "1382 - Oil and Gas Field Exploration Services"
              },
              {
                  "id": "1389",
                  "title": "Oil and Gas Field Services, Not Elsewhere Classified",
                  "fullTitle": "1389 - Oil and Gas Field Services, Not Elsewhere Classified"
              },
              {
                  "id": "1411",
                  "title": "Dimension Stone",
                  "fullTitle": "1411 - Dimension Stone"
              },
              {
                  "id": "1422",
                  "title": "Crushed and Broken Limestone",
                  "fullTitle": "1422 - Crushed and Broken Limestone"
              },
              {
                  "id": "1423",
                  "title": "Crushed and Broken Granite",
                  "fullTitle": "1423 - Crushed and Broken Granite"
              },
              {
                  "id": "1429",
                  "title": "Crushed and Broken Stone, Not Elsewhere Classified",
                  "fullTitle": "1429 - Crushed and Broken Stone, Not Elsewhere Classified"
              },
              {
                  "id": "1442",
                  "title": "Construction Sand and Gravel",
                  "fullTitle": "1442 - Construction Sand and Gravel"
              },
              {
                  "id": "1446",
                  "title": "Industrial Sand",
                  "fullTitle": "1446 - Industrial Sand"
              },
              {
                  "id": "1455",
                  "title": "Kaolin and Ball Clay",
                  "fullTitle": "1455 - Kaolin and Ball Clay"
              },
              {
                  "id": "1459",
                  "title": "Clay, Ceramic, and Refractory Minerals, Not Elsewhere Classified",
                  "fullTitle": "1459 - Clay, Ceramic, and Refractory Minerals, Not Elsewhere Classified"
              },
              {
                  "id": "1474",
                  "title": "Potash, Soda, and Borate Minerals",
                  "fullTitle": "1474 - Potash, Soda, and Borate Minerals"
              },
              {
                  "id": "1475",
                  "title": "Phosphate Rock",
                  "fullTitle": "1475 - Phosphate Rock"
              },
              {
                  "id": "1479",
                  "title": "Chemical and Fertilizer Mineral Mining, Not Elsewhere Classified",
                  "fullTitle": "1479 - Chemical and Fertilizer Mineral Mining, Not Elsewhere Classified"
              },
              {
                  "id": "1481",
                  "title": "Nonmetallic Minerals Services, Except Fuels",
                  "fullTitle": "1481 - Nonmetallic Minerals Services, Except Fuels"
              },
              {
                  "id": "1499",
                  "title": "Miscellaneous Nonmetallic Minerals, Except Fuels",
                  "fullTitle": "1499 - Miscellaneous Nonmetallic Minerals, Except Fuels"
              },
              {
                  "id": "1521",
                  "title": "General Contractors",
                  "fullTitle": "1521 - General Contractors"
              },
              {
                  "id": "1522",
                  "title": "General Contractors",
                  "fullTitle": "1522 - General Contractors"
              },
              {
                  "id": "1531",
                  "title": "Operative Builders",
                  "fullTitle": "1531 - Operative Builders"
              },
              {
                  "id": "1541",
                  "title": "General Contractors",
                  "fullTitle": "1541 - General Contractors"
              },
              {
                  "id": "1542",
                  "title": "General Contractors",
                  "fullTitle": "1542 - General Contractors"
              },
              {
                  "id": "1611",
                  "title": "Highway and Street Construction, Except Elevated Highways",
                  "fullTitle": "1611 - Highway and Street Construction, Except Elevated Highways"
              },
              {
                  "id": "1622",
                  "title": "Bridge, Tunnel, and Elevated Highway Construction",
                  "fullTitle": "1622 - Bridge, Tunnel, and Elevated Highway Construction"
              },
              {
                  "id": "1623",
                  "title": "Water, Sewer, Pipeline, and Communications and Power Line Construction",
                  "fullTitle": "1623 - Water, Sewer, Pipeline, and Communications and Power Line Construction"
              },
              {
                  "id": "1629",
                  "title": "Heavy Construction, Not Elsewhere Classified",
                  "fullTitle": "1629 - Heavy Construction, Not Elsewhere Classified"
              },
              {
                  "id": "1711",
                  "title": "Plumbing, Heating and Air",
                  "fullTitle": "1711 - Plumbing, Heating and Air"
              },
              {
                  "id": "1721",
                  "title": "Painting and Paper Hanging",
                  "fullTitle": "1721 - Painting and Paper Hanging"
              },
              {
                  "id": "1731",
                  "title": "Electrical Work",
                  "fullTitle": "1731 - Electrical Work"
              },
              {
                  "id": "1741",
                  "title": "Masonry, Stone Setting, and Other Stone Work",
                  "fullTitle": "1741 - Masonry, Stone Setting, and Other Stone Work"
              },
              {
                  "id": "1742",
                  "title": "Plastering, Drywall, Acoustical, and Insulation Work",
                  "fullTitle": "1742 - Plastering, Drywall, Acoustical, and Insulation Work"
              },
              {
                  "id": "1743",
                  "title": "Terrazzo, Tile, Marble, and Mosaic Work",
                  "fullTitle": "1743 - Terrazzo, Tile, Marble, and Mosaic Work"
              },
              {
                  "id": "1751",
                  "title": "Carpentry Work",
                  "fullTitle": "1751 - Carpentry Work"
              },
              {
                  "id": "1752",
                  "title": "Floor Laying and Other Floor Work, Not Elsewhere Classified",
                  "fullTitle": "1752 - Floor Laying and Other Floor Work, Not Elsewhere Classified"
              },
              {
                  "id": "1761",
                  "title": "Roofing, Siding, and Sheet Metal Work",
                  "fullTitle": "1761 - Roofing, Siding, and Sheet Metal Work"
              },
              {
                  "id": "1771",
                  "title": "Concrete Work",
                  "fullTitle": "1771 - Concrete Work"
              },
              {
                  "id": "1781",
                  "title": "Water Well Drilling",
                  "fullTitle": "1781 - Water Well Drilling"
              },
              {
                  "id": "1791",
                  "title": "Structural Steel Erection",
                  "fullTitle": "1791 - Structural Steel Erection"
              },
              {
                  "id": "1793",
                  "title": "Glass and Glazing Work",
                  "fullTitle": "1793 - Glass and Glazing Work"
              },
              {
                  "id": "1794",
                  "title": "Excavation Work",
                  "fullTitle": "1794 - Excavation Work"
              },
              {
                  "id": "1795",
                  "title": "Wrecking and Demolition Work",
                  "fullTitle": "1795 - Wrecking and Demolition Work"
              },
              {
                  "id": "1796",
                  "title": "Installation or Erection of Building Equipment, Not Elsewhere Classified",
                  "fullTitle": "1796 - Installation or Erection of Building Equipment, Not Elsewhere Classified"
              },
              {
                  "id": "1799",
                  "title": "Special Trade Contractors, Not Elsewhere Classified",
                  "fullTitle": "1799 - Special Trade Contractors, Not Elsewhere Classified"
              },
              {
                  "id": "2011",
                  "title": "Meat Packing Plants",
                  "fullTitle": "2011 - Meat Packing Plants"
              },
              {
                  "id": "2013",
                  "title": "Sausages and Other Prepared Meat Products",
                  "fullTitle": "2013 - Sausages and Other Prepared Meat Products"
              },
              {
                  "id": "2015",
                  "title": "Poultry Slaughtering and Processing",
                  "fullTitle": "2015 - Poultry Slaughtering and Processing"
              },
              {
                  "id": "2021",
                  "title": "Creamery Butter",
                  "fullTitle": "2021 - Creamery Butter"
              },
              {
                  "id": "2022",
                  "title": "Natural, Processed, and Imitation Cheese",
                  "fullTitle": "2022 - Natural, Processed, and Imitation Cheese"
              },
              {
                  "id": "2023",
                  "title": "Dry, Condensed, and Evaporated Dairy Products",
                  "fullTitle": "2023 - Dry, Condensed, and Evaporated Dairy Products"
              },
              {
                  "id": "2024",
                  "title": "Ice Cream and Frozen Desserts",
                  "fullTitle": "2024 - Ice Cream and Frozen Desserts"
              },
              {
                  "id": "2026",
                  "title": "Fluid Milk",
                  "fullTitle": "2026 - Fluid Milk"
              },
              {
                  "id": "2032",
                  "title": "Canned Specialties",
                  "fullTitle": "2032 - Canned Specialties"
              },
              {
                  "id": "2033",
                  "title": "Canned Fruits, Vegetables, Preserves, Jams, and Jellies",
                  "fullTitle": "2033 - Canned Fruits, Vegetables, Preserves, Jams, and Jellies"
              },
              {
                  "id": "2034",
                  "title": "Dried and Dehydrated Fruits, Vegetables, and Soup Mixes",
                  "fullTitle": "2034 - Dried and Dehydrated Fruits, Vegetables, and Soup Mixes"
              },
              {
                  "id": "2035",
                  "title": "Pickled Fruits and Vegetables, Vegetable Sauces and Seasonings, and Salad Dressings",
                  "fullTitle": "2035 - Pickled Fruits and Vegetables, Vegetable Sauces and Seasonings, and Salad Dressings"
              },
              {
                  "id": "2037",
                  "title": "Frozen Fruits, Fruit Juices, and Vegetables",
                  "fullTitle": "2037 - Frozen Fruits, Fruit Juices, and Vegetables"
              },
              {
                  "id": "2038",
                  "title": "Frozen Specialties, Not Elsewhere Classified",
                  "fullTitle": "2038 - Frozen Specialties, Not Elsewhere Classified"
              },
              {
                  "id": "2041",
                  "title": "Flour and Other Grain Mill Products",
                  "fullTitle": "2041 - Flour and Other Grain Mill Products"
              },
              {
                  "id": "2043",
                  "title": "Cereal Breakfast Foods",
                  "fullTitle": "2043 - Cereal Breakfast Foods"
              },
              {
                  "id": "2044",
                  "title": "Rice Milling",
                  "fullTitle": "2044 - Rice Milling"
              },
              {
                  "id": "2045",
                  "title": "Prepared Flour Mixes and Doughs",
                  "fullTitle": "2045 - Prepared Flour Mixes and Doughs"
              },
              {
                  "id": "2046",
                  "title": "Wet Corn Milling",
                  "fullTitle": "2046 - Wet Corn Milling"
              },
              {
                  "id": "2047",
                  "title": "Dog and Cat Food",
                  "fullTitle": "2047 - Dog and Cat Food"
              },
              {
                  "id": "2048",
                  "title": "Prepared Feed and Feed Ingredients for Animals and Fowls, Except Dogs and Cats",
                  "fullTitle": "2048 - Prepared Feed and Feed Ingredients for Animals and Fowls, Except Dogs and Cats"
              },
              {
                  "id": "2051",
                  "title": "Bread and Other Bakery Products, Except Cookies and Crackers",
                  "fullTitle": "2051 - Bread and Other Bakery Products, Except Cookies and Crackers"
              },
              {
                  "id": "2052",
                  "title": "Cookies and Crackers",
                  "fullTitle": "2052 - Cookies and Crackers"
              },
              {
                  "id": "2053",
                  "title": "Frozen Bakery Products, Except Bread",
                  "fullTitle": "2053 - Frozen Bakery Products, Except Bread"
              },
              {
                  "id": "2061",
                  "title": "Cane Sugar, Except Refining",
                  "fullTitle": "2061 - Cane Sugar, Except Refining"
              },
              {
                  "id": "2062",
                  "title": "Cane Sugar Refining",
                  "fullTitle": "2062 - Cane Sugar Refining"
              },
              {
                  "id": "2063",
                  "title": "Beet Sugar",
                  "fullTitle": "2063 - Beet Sugar"
              },
              {
                  "id": "2064",
                  "title": "Candy and Other Confectionery Products",
                  "fullTitle": "2064 - Candy and Other Confectionery Products"
              },
              {
                  "id": "2066",
                  "title": "Chocolate and Cocoa Products",
                  "fullTitle": "2066 - Chocolate and Cocoa Products"
              },
              {
                  "id": "2067",
                  "title": "Chewing Gum",
                  "fullTitle": "2067 - Chewing Gum"
              },
              {
                  "id": "2068",
                  "title": "Salted and Roasted Nuts and Seeds",
                  "fullTitle": "2068 - Salted and Roasted Nuts and Seeds"
              },
              {
                  "id": "2074",
                  "title": "Cottonseed Oil Mills",
                  "fullTitle": "2074 - Cottonseed Oil Mills"
              },
              {
                  "id": "2075",
                  "title": "Soybean Oil Mills",
                  "fullTitle": "2075 - Soybean Oil Mills"
              },
              {
                  "id": "2076",
                  "title": "Vegetable Oil Mills, Except Corn, Cottonseed, and Soybean",
                  "fullTitle": "2076 - Vegetable Oil Mills, Except Corn, Cottonseed, and Soybean"
              },
              {
                  "id": "2077",
                  "title": "Animal and Marine Fats and Oils",
                  "fullTitle": "2077 - Animal and Marine Fats and Oils"
              },
              {
                  "id": "2079",
                  "title": "Shortening, Table Oils, Margarine, and Other Edible Fats and Oils, Not Elsewhere Classified",
                  "fullTitle": "2079 - Shortening, Table Oils, Margarine, and Other Edible Fats and Oils, Not Elsewhere Classified"
              },
              {
                  "id": "2082",
                  "title": "Malt Beverages",
                  "fullTitle": "2082 - Malt Beverages"
              },
              {
                  "id": "2083",
                  "title": "Malt",
                  "fullTitle": "2083 - Malt"
              },
              {
                  "id": "2084",
                  "title": "Wines, Brandy, and Brandy Spirits",
                  "fullTitle": "2084 - Wines, Brandy, and Brandy Spirits"
              },
              {
                  "id": "2085",
                  "title": "Distilled and Blended Liquors",
                  "fullTitle": "2085 - Distilled and Blended Liquors"
              },
              {
                  "id": "2086",
                  "title": "Bottled and Canned Soft Drinks and Carbonated Waters",
                  "fullTitle": "2086 - Bottled and Canned Soft Drinks and Carbonated Waters"
              },
              {
                  "id": "2087",
                  "title": "Flavoring Extracts and Flavoring Syrups, Not Elsewhere Classified",
                  "fullTitle": "2087 - Flavoring Extracts and Flavoring Syrups, Not Elsewhere Classified"
              },
              {
                  "id": "2091",
                  "title": "Canned and Cured Fish and Seafoods",
                  "fullTitle": "2091 - Canned and Cured Fish and Seafoods"
              },
              {
                  "id": "2092",
                  "title": "Prepared Fresh or Frozen Fish and Seafoods",
                  "fullTitle": "2092 - Prepared Fresh or Frozen Fish and Seafoods"
              },
              {
                  "id": "2095",
                  "title": "Roasted Coffee",
                  "fullTitle": "2095 - Roasted Coffee"
              },
              {
                  "id": "2096",
                  "title": "Potato Chips, Corn Chips, and Similar Snacks",
                  "fullTitle": "2096 - Potato Chips, Corn Chips, and Similar Snacks"
              },
              {
                  "id": "2097",
                  "title": "Manufactured Ice",
                  "fullTitle": "2097 - Manufactured Ice"
              },
              {
                  "id": "2098",
                  "title": "Macaroni, Spaghetti, Vermicelli, and Noodles",
                  "fullTitle": "2098 - Macaroni, Spaghetti, Vermicelli, and Noodles"
              },
              {
                  "id": "2099",
                  "title": "Food Preparations, Not Elsewhere Classified",
                  "fullTitle": "2099 - Food Preparations, Not Elsewhere Classified"
              },
              {
                  "id": "2111",
                  "title": "Cigarettes",
                  "fullTitle": "2111 - Cigarettes"
              },
              {
                  "id": "2121",
                  "title": "Cigars",
                  "fullTitle": "2121 - Cigars"
              },
              {
                  "id": "2131",
                  "title": "Chewing and Smoking Tobacco and Snuff",
                  "fullTitle": "2131 - Chewing and Smoking Tobacco and Snuff"
              },
              {
                  "id": "2141",
                  "title": "Tobacco Stemming and Redrying",
                  "fullTitle": "2141 - Tobacco Stemming and Redrying"
              },
              {
                  "id": "2211",
                  "title": "Broadwoven Fabric Mills, Cotton",
                  "fullTitle": "2211 - Broadwoven Fabric Mills, Cotton"
              },
              {
                  "id": "2221",
                  "title": "Broadwoven Fabric Mills, Manmade Fiber and Silk",
                  "fullTitle": "2221 - Broadwoven Fabric Mills, Manmade Fiber and Silk"
              },
              {
                  "id": "2231",
                  "title": "Broadwoven Fabric Mills, Wool (Including Dyeing and Finishing)",
                  "fullTitle": "2231 - Broadwoven Fabric Mills, Wool (Including Dyeing and Finishing)"
              },
              {
                  "id": "2241",
                  "title": "Narrow Fabric and Other Smallware Mills Cotton, Wool, Silk, and Manmade Fiber",
                  "fullTitle": "2241 - Narrow Fabric and Other Smallware Mills Cotton, Wool, Silk, and Manmade Fiber"
              },
              {
                  "id": "2251",
                  "title": "Women's Full",
                  "fullTitle": "2251 - Women's Full"
              },
              {
                  "id": "2252",
                  "title": "Hosiery, Not Elsewhere Classified",
                  "fullTitle": "2252 - Hosiery, Not Elsewhere Classified"
              },
              {
                  "id": "2253",
                  "title": "Knit Outerwear Mills",
                  "fullTitle": "2253 - Knit Outerwear Mills"
              },
              {
                  "id": "2254",
                  "title": "Knit Underwear and Nightwear Mills",
                  "fullTitle": "2254 - Knit Underwear and Nightwear Mills"
              },
              {
                  "id": "2257",
                  "title": "Weft Knit Fabric Mills",
                  "fullTitle": "2257 - Weft Knit Fabric Mills"
              },
              {
                  "id": "2258",
                  "title": "Lace and Warp Knit Fabric Mills",
                  "fullTitle": "2258 - Lace and Warp Knit Fabric Mills"
              },
              {
                  "id": "2259",
                  "title": "Knitting Mills, Not Elsewhere Classified",
                  "fullTitle": "2259 - Knitting Mills, Not Elsewhere Classified"
              },
              {
                  "id": "2261",
                  "title": "Finishers of Broadwoven Fabrics of Cotton",
                  "fullTitle": "2261 - Finishers of Broadwoven Fabrics of Cotton"
              },
              {
                  "id": "2262",
                  "title": "Finishers of Broadwoven Fabrics of Manmade Fiber and Silk",
                  "fullTitle": "2262 - Finishers of Broadwoven Fabrics of Manmade Fiber and Silk"
              },
              {
                  "id": "2269",
                  "title": "Finishers of Textiles, Not Elsewhere Classified",
                  "fullTitle": "2269 - Finishers of Textiles, Not Elsewhere Classified"
              },
              {
                  "id": "2273",
                  "title": "Carpets and Rugs",
                  "fullTitle": "2273 - Carpets and Rugs"
              },
              {
                  "id": "2281",
                  "title": "Yarn Spinning Mills",
                  "fullTitle": "2281 - Yarn Spinning Mills"
              },
              {
                  "id": "2282",
                  "title": "Yarn Texturizing, Throwing, Twisting, and Winding Mills",
                  "fullTitle": "2282 - Yarn Texturizing, Throwing, Twisting, and Winding Mills"
              },
              {
                  "id": "2284",
                  "title": "Thread Mills",
                  "fullTitle": "2284 - Thread Mills"
              },
              {
                  "id": "2295",
                  "title": "Coated Fabrics, Not Rubberized",
                  "fullTitle": "2295 - Coated Fabrics, Not Rubberized"
              },
              {
                  "id": "2296",
                  "title": "Tire Cord and Fabrics",
                  "fullTitle": "2296 - Tire Cord and Fabrics"
              },
              {
                  "id": "2297",
                  "title": "Non-Woven Fabrics",
                  "fullTitle": "2297 - Non-Woven Fabrics"
              },
              {
                  "id": "2298",
                  "title": "Cordage and Twine",
                  "fullTitle": "2298 - Cordage and Twine"
              },
              {
                  "id": "2299",
                  "title": "Textile goods, Not Elsewhere Classified",
                  "fullTitle": "2299 - Textile goods, Not Elsewhere Classified"
              },
              {
                  "id": "2311",
                  "title": "Men's and Boys' Suits, Coats, and Overcoats",
                  "fullTitle": "2311 - Men's and Boys' Suits, Coats, and Overcoats"
              },
              {
                  "id": "2321",
                  "title": "Men's and Boys' Shirts, Except Work Shirts",
                  "fullTitle": "2321 - Men's and Boys' Shirts, Except Work Shirts"
              },
              {
                  "id": "2322",
                  "title": "Men's and Boys' Underwear and Nightwear",
                  "fullTitle": "2322 - Men's and Boys' Underwear and Nightwear"
              },
              {
                  "id": "2323",
                  "title": "Men's and Boys' Neckwear",
                  "fullTitle": "2323 - Men's and Boys' Neckwear"
              },
              {
                  "id": "2325",
                  "title": "Men's and Boys' Separate Trousers and Slacks",
                  "fullTitle": "2325 - Men's and Boys' Separate Trousers and Slacks"
              },
              {
                  "id": "2326",
                  "title": "Men's and Boys' Work Clothing",
                  "fullTitle": "2326 - Men's and Boys' Work Clothing"
              },
              {
                  "id": "2329",
                  "title": "Men's and Boys' Clothing, Not Elsewhere Classified",
                  "fullTitle": "2329 - Men's and Boys' Clothing, Not Elsewhere Classified"
              },
              {
                  "id": "2331",
                  "title": "Women's, Misses', and Juniors' Blouses and Shirts",
                  "fullTitle": "2331 - Women's, Misses', and Juniors' Blouses and Shirts"
              },
              {
                  "id": "2335",
                  "title": "Women's, Misses', and Juniors' Dresses",
                  "fullTitle": "2335 - Women's, Misses', and Juniors' Dresses"
              },
              {
                  "id": "2337",
                  "title": "Women's, Misses', and Juniors' Suits, Skirts, and Coats",
                  "fullTitle": "2337 - Women's, Misses', and Juniors' Suits, Skirts, and Coats"
              },
              {
                  "id": "2339",
                  "title": "Women's, Misses', and Juniors' Outerwear, Not Elsewhere Classified",
                  "fullTitle": "2339 - Women's, Misses', and Juniors' Outerwear, Not Elsewhere Classified"
              },
              {
                  "id": "2341",
                  "title": "Women's, Misses', Children's, and Infants' Underwear and Nightwear",
                  "fullTitle": "2341 - Women's, Misses', Children's, and Infants' Underwear and Nightwear"
              },
              {
                  "id": "2342",
                  "title": "Brassieres, Girdles, and Allied Garments",
                  "fullTitle": "2342 - Brassieres, Girdles, and Allied Garments"
              },
              {
                  "id": "2353",
                  "title": "Hats, Caps, and Millinery",
                  "fullTitle": "2353 - Hats, Caps, and Millinery"
              },
              {
                  "id": "2361",
                  "title": "Girls', Children's, and Infants' Dresses, Blouses, and Shirts",
                  "fullTitle": "2361 - Girls', Children's, and Infants' Dresses, Blouses, and Shirts"
              },
              {
                  "id": "2369",
                  "title": "Girls', Children's, and Infants' Outerwear, Not Elsewhere Classified",
                  "fullTitle": "2369 - Girls', Children's, and Infants' Outerwear, Not Elsewhere Classified"
              },
              {
                  "id": "2371",
                  "title": "Fur Goods",
                  "fullTitle": "2371 - Fur Goods"
              },
              {
                  "id": "2381",
                  "title": "Dress and Work Gloves, Except Knit and All",
                  "fullTitle": "2381 - Dress and Work Gloves, Except Knit and All"
              },
              {
                  "id": "2384",
                  "title": "Robes and Dressing Gowns",
                  "fullTitle": "2384 - Robes and Dressing Gowns"
              },
              {
                  "id": "2385",
                  "title": "Waterproof Outerwear",
                  "fullTitle": "2385 - Waterproof Outerwear"
              },
              {
                  "id": "2386",
                  "title": "Leather and Sheep",
                  "fullTitle": "2386 - Leather and Sheep"
              },
              {
                  "id": "2387",
                  "title": "Apparel belts",
                  "fullTitle": "2387 - Apparel belts"
              },
              {
                  "id": "2389",
                  "title": "Apparel and Accessories, Not Elsewhere Classified",
                  "fullTitle": "2389 - Apparel and Accessories, Not Elsewhere Classified"
              },
              {
                  "id": "2391",
                  "title": "Curtains and Draperies",
                  "fullTitle": "2391 - Curtains and Draperies"
              },
              {
                  "id": "2392",
                  "title": "House furnishing, Except Curtains and Draperies",
                  "fullTitle": "2392 - House furnishing, Except Curtains and Draperies"
              },
              {
                  "id": "2393",
                  "title": "Textile Bags",
                  "fullTitle": "2393 - Textile Bags"
              },
              {
                  "id": "2394",
                  "title": "Canvas and Related Products",
                  "fullTitle": "2394 - Canvas and Related Products"
              },
              {
                  "id": "2395",
                  "title": "Pleating, Decorative and Novelty Stitching, and Tucking for the Trade",
                  "fullTitle": "2395 - Pleating, Decorative and Novelty Stitching, and Tucking for the Trade"
              },
              {
                  "id": "2396",
                  "title": "Automotive Trimmings, Apparel Findings, and Related Products",
                  "fullTitle": "2396 - Automotive Trimmings, Apparel Findings, and Related Products"
              },
              {
                  "id": "2397",
                  "title": "Schiffli Machine Embroideries",
                  "fullTitle": "2397 - Schiffli Machine Embroideries"
              },
              {
                  "id": "2399",
                  "title": "Fabricated Textile Products, Not Elsewhere Classified",
                  "fullTitle": "2399 - Fabricated Textile Products, Not Elsewhere Classified"
              },
              {
                  "id": "2411",
                  "title": "Logging",
                  "fullTitle": "2411 - Logging"
              },
              {
                  "id": "2421",
                  "title": "Sawmills and Planing Mills, General",
                  "fullTitle": "2421 - Sawmills and Planing Mills, General"
              },
              {
                  "id": "2426",
                  "title": "Hardwood Dimension and Flooring Mills",
                  "fullTitle": "2426 - Hardwood Dimension and Flooring Mills"
              },
              {
                  "id": "2429",
                  "title": "Special Product Sawmills, Not Elsewhere Classified",
                  "fullTitle": "2429 - Special Product Sawmills, Not Elsewhere Classified"
              },
              {
                  "id": "2431",
                  "title": "Millwork",
                  "fullTitle": "2431 - Millwork"
              },
              {
                  "id": "2434",
                  "title": "Wood Kitchen Cabinets",
                  "fullTitle": "2434 - Wood Kitchen Cabinets"
              },
              {
                  "id": "2435",
                  "title": "Hardwood Veneer and Plywood",
                  "fullTitle": "2435 - Hardwood Veneer and Plywood"
              },
              {
                  "id": "2436",
                  "title": "Softwood Veneer and Plywood",
                  "fullTitle": "2436 - Softwood Veneer and Plywood"
              },
              {
                  "id": "2439",
                  "title": "Structural Wood Members, Not Elsewhere Classified",
                  "fullTitle": "2439 - Structural Wood Members, Not Elsewhere Classified"
              },
              {
                  "id": "2441",
                  "title": "Nailed and Lock Corner Wood Boxes and Shook",
                  "fullTitle": "2441 - Nailed and Lock Corner Wood Boxes and Shook"
              },
              {
                  "id": "2448",
                  "title": "Wood Pallets and Skids",
                  "fullTitle": "2448 - Wood Pallets and Skids"
              },
              {
                  "id": "2449",
                  "title": "Wood Containers, Not Elsewhere Classified",
                  "fullTitle": "2449 - Wood Containers, Not Elsewhere Classified"
              },
              {
                  "id": "2451",
                  "title": "Mobile Homes",
                  "fullTitle": "2451 - Mobile Homes"
              },
              {
                  "id": "2452",
                  "title": "Prefabricated Wood Buildings and Components",
                  "fullTitle": "2452 - Prefabricated Wood Buildings and Components"
              },
              {
                  "id": "2491",
                  "title": "Wood Preserving",
                  "fullTitle": "2491 - Wood Preserving"
              },
              {
                  "id": "2493",
                  "title": "Reconstituted Wood Products",
                  "fullTitle": "2493 - Reconstituted Wood Products"
              },
              {
                  "id": "2499",
                  "title": "Wood Products, Not Elsewhere Classified",
                  "fullTitle": "2499 - Wood Products, Not Elsewhere Classified"
              },
              {
                  "id": "2511",
                  "title": "Wood Household Furniture, Except Upholstered",
                  "fullTitle": "2511 - Wood Household Furniture, Except Upholstered"
              },
              {
                  "id": "2512",
                  "title": "Wood Household Furniture, Upholstered",
                  "fullTitle": "2512 - Wood Household Furniture, Upholstered"
              },
              {
                  "id": "2514",
                  "title": "Metal Household Furniture",
                  "fullTitle": "2514 - Metal Household Furniture"
              },
              {
                  "id": "2515",
                  "title": "Mattresses, Foundations, and Convertible Beds",
                  "fullTitle": "2515 - Mattresses, Foundations, and Convertible Beds"
              },
              {
                  "id": "2517",
                  "title": "Wood Television, Radio, Phonograph, and Sewing Machine Cabinets",
                  "fullTitle": "2517 - Wood Television, Radio, Phonograph, and Sewing Machine Cabinets"
              },
              {
                  "id": "2519",
                  "title": "Household Furniture, Not Elsewhere Classified",
                  "fullTitle": "2519 - Household Furniture, Not Elsewhere Classified"
              },
              {
                  "id": "2521",
                  "title": "Wood Office Furniture",
                  "fullTitle": "2521 - Wood Office Furniture"
              },
              {
                  "id": "2522",
                  "title": "Office Furniture, Except Wood",
                  "fullTitle": "2522 - Office Furniture, Except Wood"
              },
              {
                  "id": "2531",
                  "title": "Public Building and Related Furniture",
                  "fullTitle": "2531 - Public Building and Related Furniture"
              },
              {
                  "id": "2541",
                  "title": "Wood Office and Store Fixtures, Partitions, Shelving, and Lockers",
                  "fullTitle": "2541 - Wood Office and Store Fixtures, Partitions, Shelving, and Lockers"
              },
              {
                  "id": "2542",
                  "title": "Office and Store Fixtures, Partitions, Shelving, and Lockers, Except Wood",
                  "fullTitle": "2542 - Office and Store Fixtures, Partitions, Shelving, and Lockers, Except Wood"
              },
              {
                  "id": "2591",
                  "title": "Drapery Hardware and Window Blinds and Shades",
                  "fullTitle": "2591 - Drapery Hardware and Window Blinds and Shades"
              },
              {
                  "id": "2599",
                  "title": "Furniture and Fixtures, Not Elsewhere Classified",
                  "fullTitle": "2599 - Furniture and Fixtures, Not Elsewhere Classified"
              },
              {
                  "id": "2611",
                  "title": "Pulp Mills",
                  "fullTitle": "2611 - Pulp Mills"
              },
              {
                  "id": "2621",
                  "title": "Paper Mills",
                  "fullTitle": "2621 - Paper Mills"
              },
              {
                  "id": "2631",
                  "title": "Paperboard Mills",
                  "fullTitle": "2631 - Paperboard Mills"
              },
              {
                  "id": "2652",
                  "title": "Setup Paperboard Boxes",
                  "fullTitle": "2652 - Setup Paperboard Boxes"
              },
              {
                  "id": "2653",
                  "title": "Corrugated and Solid Fiber Boxes",
                  "fullTitle": "2653 - Corrugated and Solid Fiber Boxes"
              },
              {
                  "id": "2655",
                  "title": "Fiber Cans, Tubes, Drums, and Similar Products",
                  "fullTitle": "2655 - Fiber Cans, Tubes, Drums, and Similar Products"
              },
              {
                  "id": "2656",
                  "title": "Sanitary Food Containers, Except Folding",
                  "fullTitle": "2656 - Sanitary Food Containers, Except Folding"
              },
              {
                  "id": "2657",
                  "title": "Folding Paperboard Boxes, Including Sanitary",
                  "fullTitle": "2657 - Folding Paperboard Boxes, Including Sanitary"
              },
              {
                  "id": "2671",
                  "title": "Packaging Paper and Plastics Film, Coated and Laminated",
                  "fullTitle": "2671 - Packaging Paper and Plastics Film, Coated and Laminated"
              },
              {
                  "id": "2672",
                  "title": "Coated and Laminated Paper, Not Elsewhere Classified",
                  "fullTitle": "2672 - Coated and Laminated Paper, Not Elsewhere Classified"
              },
              {
                  "id": "2673",
                  "title": "Plastics, Foil, and Coated Paper Bags",
                  "fullTitle": "2673 - Plastics, Foil, and Coated Paper Bags"
              },
              {
                  "id": "2674",
                  "title": "Uncoated Paper and Multiwall Bags",
                  "fullTitle": "2674 - Uncoated Paper and Multiwall Bags"
              },
              {
                  "id": "2675",
                  "title": "Die-Cut Paper and Paperboard and Cardboard",
                  "fullTitle": "2675 - Die-Cut Paper and Paperboard and Cardboard"
              },
              {
                  "id": "2676",
                  "title": "Sanitary Paper Products",
                  "fullTitle": "2676 - Sanitary Paper Products"
              },
              {
                  "id": "2677",
                  "title": "Envelopes",
                  "fullTitle": "2677 - Envelopes"
              },
              {
                  "id": "2678",
                  "title": "Stationery, Tablets, and Related Products",
                  "fullTitle": "2678 - Stationery, Tablets, and Related Products"
              },
              {
                  "id": "2679",
                  "title": "Converted Paper and Paperboard Products, Not Elsewhere Classified",
                  "fullTitle": "2679 - Converted Paper and Paperboard Products, Not Elsewhere Classified"
              },
              {
                  "id": "2711",
                  "title": "Newspapers Publishing, or Publishing and Printing",
                  "fullTitle": "2711 - Newspapers Publishing, or Publishing and Printing"
              },
              {
                  "id": "2721",
                  "title": "Periodicals Publishing, or Publishing and Printing",
                  "fullTitle": "2721 - Periodicals Publishing, or Publishing and Printing"
              },
              {
                  "id": "2731",
                  "title": "Books Publishing, or Publishing and Printing",
                  "fullTitle": "2731 - Books Publishing, or Publishing and Printing"
              },
              {
                  "id": "2732",
                  "title": "Book Printing",
                  "fullTitle": "2732 - Book Printing"
              },
              {
                  "id": "2741",
                  "title": "Miscellaneous Publishing",
                  "fullTitle": "2741 - Miscellaneous Publishing"
              },
              {
                  "id": "2752",
                  "title": "Commercial Printing, Lithographic",
                  "fullTitle": "2752 - Commercial Printing, Lithographic"
              },
              {
                  "id": "2754",
                  "title": "Commercial Printing, Gravure",
                  "fullTitle": "2754 - Commercial Printing, Gravure"
              },
              {
                  "id": "2759",
                  "title": "Commercial Printing, Not Elsewhere Classified",
                  "fullTitle": "2759 - Commercial Printing, Not Elsewhere Classified"
              },
              {
                  "id": "2761",
                  "title": "Manifold Business Forms",
                  "fullTitle": "2761 - Manifold Business Forms"
              },
              {
                  "id": "2771",
                  "title": "Greeting Cards",
                  "fullTitle": "2771 - Greeting Cards"
              },
              {
                  "id": "2782",
                  "title": "Blankbooks, Looseleaf Binders and Devices",
                  "fullTitle": "2782 - Blankbooks, Looseleaf Binders and Devices"
              },
              {
                  "id": "2789",
                  "title": "Bookbinding and Related Work",
                  "fullTitle": "2789 - Bookbinding and Related Work"
              },
              {
                  "id": "2791",
                  "title": "Typesetting",
                  "fullTitle": "2791 - Typesetting"
              },
              {
                  "id": "2796",
                  "title": "Platemaking and Related Services",
                  "fullTitle": "2796 - Platemaking and Related Services"
              },
              {
                  "id": "2812",
                  "title": "Alkalies and Chlorine",
                  "fullTitle": "2812 - Alkalies and Chlorine"
              },
              {
                  "id": "2813",
                  "title": "Industrial Gases",
                  "fullTitle": "2813 - Industrial Gases"
              },
              {
                  "id": "2816",
                  "title": "Inorganic Pigments",
                  "fullTitle": "2816 - Inorganic Pigments"
              },
              {
                  "id": "2819",
                  "title": "Industrial Inorganic Chemicals, Not Elsewhere Classified",
                  "fullTitle": "2819 - Industrial Inorganic Chemicals, Not Elsewhere Classified"
              },
              {
                  "id": "2821",
                  "title": "Plastics Materials, Synthetic Resins, and Nonvulcanizable Elastomers",
                  "fullTitle": "2821 - Plastics Materials, Synthetic Resins, and Nonvulcanizable Elastomers"
              },
              {
                  "id": "2822",
                  "title": "Synthetic Rubber (Vulcanizable Elastomers)",
                  "fullTitle": "2822 - Synthetic Rubber (Vulcanizable Elastomers)"
              },
              {
                  "id": "2823",
                  "title": "Cellulosic Manmade Fibers",
                  "fullTitle": "2823 - Cellulosic Manmade Fibers"
              },
              {
                  "id": "2824",
                  "title": "Manmade Organic Fibers, Except Cellulosic",
                  "fullTitle": "2824 - Manmade Organic Fibers, Except Cellulosic"
              },
              {
                  "id": "2833",
                  "title": "Medicinal Chemicals and Botanical Products",
                  "fullTitle": "2833 - Medicinal Chemicals and Botanical Products"
              },
              {
                  "id": "2834",
                  "title": "Pharmaceutical Preparations",
                  "fullTitle": "2834 - Pharmaceutical Preparations"
              },
              {
                  "id": "2835",
                  "title": "In Vitro and In Vivo Diagnostic Substances",
                  "fullTitle": "2835 - In Vitro and In Vivo Diagnostic Substances"
              },
              {
                  "id": "2836",
                  "title": "Biological Products, Except Diagnostic Substances",
                  "fullTitle": "2836 - Biological Products, Except Diagnostic Substances"
              },
              {
                  "id": "2841",
                  "title": "Soap and Other Detergents, Except Specialty Cleaners",
                  "fullTitle": "2841 - Soap and Other Detergents, Except Specialty Cleaners"
              },
              {
                  "id": "2842",
                  "title": "Specialty Cleaning, Polishing, and Sanitation Preparations",
                  "fullTitle": "2842 - Specialty Cleaning, Polishing, and Sanitation Preparations"
              },
              {
                  "id": "2843",
                  "title": "Surface Active Agents, Finishing Agents, Sulfonated Oils, and Assistants",
                  "fullTitle": "2843 - Surface Active Agents, Finishing Agents, Sulfonated Oils, and Assistants"
              },
              {
                  "id": "2844",
                  "title": "Perfumes, Cosmetics, and Other Toilet Preparations",
                  "fullTitle": "2844 - Perfumes, Cosmetics, and Other Toilet Preparations"
              },
              {
                  "id": "2851",
                  "title": "Paints, Varnishes, Lacquers, Enamels, and Allied Products",
                  "fullTitle": "2851 - Paints, Varnishes, Lacquers, Enamels, and Allied Products"
              },
              {
                  "id": "2861",
                  "title": "Gum and Wood Chemicals",
                  "fullTitle": "2861 - Gum and Wood Chemicals"
              },
              {
                  "id": "2865",
                  "title": "Cyclic Organic Crudes and Intermediates, and organic Dyes and Pigments",
                  "fullTitle": "2865 - Cyclic Organic Crudes and Intermediates, and organic Dyes and Pigments"
              },
              {
                  "id": "2869",
                  "title": "Industrial Organic Chemicals, Not Elsewhere Classified",
                  "fullTitle": "2869 - Industrial Organic Chemicals, Not Elsewhere Classified"
              },
              {
                  "id": "2873",
                  "title": "Nitrogenous Fertilizers",
                  "fullTitle": "2873 - Nitrogenous Fertilizers"
              },
              {
                  "id": "2874",
                  "title": "Phosphatic Fertilizers",
                  "fullTitle": "2874 - Phosphatic Fertilizers"
              },
              {
                  "id": "2875",
                  "title": "Fertilizers, Mixing only",
                  "fullTitle": "2875 - Fertilizers, Mixing only"
              },
              {
                  "id": "2879",
                  "title": "Pesticides and Agricultural Chemicals, Not Elsewhere Classified",
                  "fullTitle": "2879 - Pesticides and Agricultural Chemicals, Not Elsewhere Classified"
              },
              {
                  "id": "2891",
                  "title": "Adhesives and Sealants",
                  "fullTitle": "2891 - Adhesives and Sealants"
              },
              {
                  "id": "2892",
                  "title": "Explosives",
                  "fullTitle": "2892 - Explosives"
              },
              {
                  "id": "2893",
                  "title": "Printing Ink",
                  "fullTitle": "2893 - Printing Ink"
              },
              {
                  "id": "2895",
                  "title": "Carbon Black",
                  "fullTitle": "2895 - Carbon Black"
              },
              {
                  "id": "2899",
                  "title": "Chemicals and Chemical Preparations, Not Elsewhere Classified",
                  "fullTitle": "2899 - Chemicals and Chemical Preparations, Not Elsewhere Classified"
              },
              {
                  "id": "2911",
                  "title": "Petroleum Refining",
                  "fullTitle": "2911 - Petroleum Refining"
              },
              {
                  "id": "2951",
                  "title": "Asphalt Paving Mixtures and Blocks",
                  "fullTitle": "2951 - Asphalt Paving Mixtures and Blocks"
              },
              {
                  "id": "2952",
                  "title": "Asphalt Felts and Coatings",
                  "fullTitle": "2952 - Asphalt Felts and Coatings"
              },
              {
                  "id": "2992",
                  "title": "Lubricating Oils and Greases",
                  "fullTitle": "2992 - Lubricating Oils and Greases"
              },
              {
                  "id": "2999",
                  "title": "Products of Petroleum and Coal, Not Elsewhere Classified",
                  "fullTitle": "2999 - Products of Petroleum and Coal, Not Elsewhere Classified"
              },
              {
                  "id": "3011",
                  "title": "Tires and Inner Tubes",
                  "fullTitle": "3011 - Tires and Inner Tubes"
              },
              {
                  "id": "3021",
                  "title": "Rubber and Plastics Footwear",
                  "fullTitle": "3021 - Rubber and Plastics Footwear"
              },
              {
                  "id": "3052",
                  "title": "Rubber and Plastics Hose and Belting",
                  "fullTitle": "3052 - Rubber and Plastics Hose and Belting"
              },
              {
                  "id": "3053",
                  "title": "Gaskets, Packing, and Sealing Devices",
                  "fullTitle": "3053 - Gaskets, Packing, and Sealing Devices"
              },
              {
                  "id": "3061",
                  "title": "Molded, Extruded, and Lathe",
                  "fullTitle": "3061 - Molded, Extruded, and Lathe"
              },
              {
                  "id": "3069",
                  "title": "Fabricated Rubber Products, Not Elsewhere Classified",
                  "fullTitle": "3069 - Fabricated Rubber Products, Not Elsewhere Classified"
              },
              {
                  "id": "3081",
                  "title": "Unsupported Plastics Film and Sheet",
                  "fullTitle": "3081 - Unsupported Plastics Film and Sheet"
              },
              {
                  "id": "3082",
                  "title": "Unsupported Plastics Profile Shapes",
                  "fullTitle": "3082 - Unsupported Plastics Profile Shapes"
              },
              {
                  "id": "3083",
                  "title": "Laminated Plastics Plate, Sheet, and Profile Shapes",
                  "fullTitle": "3083 - Laminated Plastics Plate, Sheet, and Profile Shapes"
              },
              {
                  "id": "3084",
                  "title": "Plastics Pipe",
                  "fullTitle": "3084 - Plastics Pipe"
              },
              {
                  "id": "3085",
                  "title": "Plastics Bottles",
                  "fullTitle": "3085 - Plastics Bottles"
              },
              {
                  "id": "3086",
                  "title": "Plastics Foam Products",
                  "fullTitle": "3086 - Plastics Foam Products"
              },
              {
                  "id": "3087",
                  "title": "Custom Compounding of Purchased Plastics Resins",
                  "fullTitle": "3087 - Custom Compounding of Purchased Plastics Resins"
              },
              {
                  "id": "3088",
                  "title": "Plastics Plumbing Fixtures",
                  "fullTitle": "3088 - Plastics Plumbing Fixtures"
              },
              {
                  "id": "3089",
                  "title": "Plastics Products, Not Elsewhere Classified",
                  "fullTitle": "3089 - Plastics Products, Not Elsewhere Classified"
              },
              {
                  "id": "3111",
                  "title": "Leather Tanning and Finishing",
                  "fullTitle": "3111 - Leather Tanning and Finishing"
              },
              {
                  "id": "3131",
                  "title": "Boot and Shoe Cut Stock and Findings",
                  "fullTitle": "3131 - Boot and Shoe Cut Stock and Findings"
              },
              {
                  "id": "3142",
                  "title": "House Slippers",
                  "fullTitle": "3142 - House Slippers"
              },
              {
                  "id": "3143",
                  "title": "Men's Footwear, Except Athletic",
                  "fullTitle": "3143 - Men's Footwear, Except Athletic"
              },
              {
                  "id": "3144",
                  "title": "Women's Footwear, Except Athletic",
                  "fullTitle": "3144 - Women's Footwear, Except Athletic"
              },
              {
                  "id": "3149",
                  "title": "Footwear, Except Rubber, Not Elsewhere Classified",
                  "fullTitle": "3149 - Footwear, Except Rubber, Not Elsewhere Classified"
              },
              {
                  "id": "3151",
                  "title": "Leather Gloves and Mittens",
                  "fullTitle": "3151 - Leather Gloves and Mittens"
              },
              {
                  "id": "3161",
                  "title": "Luggage",
                  "fullTitle": "3161 - Luggage"
              },
              {
                  "id": "3171",
                  "title": "Women's Handbags and Purses",
                  "fullTitle": "3171 - Women's Handbags and Purses"
              },
              {
                  "id": "3172",
                  "title": "Personal Leather Goods, Except Women's Handbags and Purses",
                  "fullTitle": "3172 - Personal Leather Goods, Except Women's Handbags and Purses"
              },
              {
                  "id": "3199",
                  "title": "Leather Goods, Not Elsewhere Classified",
                  "fullTitle": "3199 - Leather Goods, Not Elsewhere Classified"
              },
              {
                  "id": "3211",
                  "title": "Flat Glass",
                  "fullTitle": "3211 - Flat Glass"
              },
              {
                  "id": "3221",
                  "title": "Glass Containers",
                  "fullTitle": "3221 - Glass Containers"
              },
              {
                  "id": "3229",
                  "title": "Pressed and Blown Glass and Glassware, Not Elsewhere Classified",
                  "fullTitle": "3229 - Pressed and Blown Glass and Glassware, Not Elsewhere Classified"
              },
              {
                  "id": "3231",
                  "title": "Glass Products, Made of Purchased Glass",
                  "fullTitle": "3231 - Glass Products, Made of Purchased Glass"
              },
              {
                  "id": "3241",
                  "title": "Cement, Hydraulic",
                  "fullTitle": "3241 - Cement, Hydraulic"
              },
              {
                  "id": "3251",
                  "title": "Brick and Structural Clay Tile",
                  "fullTitle": "3251 - Brick and Structural Clay Tile"
              },
              {
                  "id": "3253",
                  "title": "Ceramic Wall and Floor Tile",
                  "fullTitle": "3253 - Ceramic Wall and Floor Tile"
              },
              {
                  "id": "3255",
                  "title": "Clay Refractories",
                  "fullTitle": "3255 - Clay Refractories"
              },
              {
                  "id": "3259",
                  "title": "Structural Clay Products, Not Elsewhere Classified",
                  "fullTitle": "3259 - Structural Clay Products, Not Elsewhere Classified"
              },
              {
                  "id": "3261",
                  "title": "Vitreous China Plumbing Fixtures and China and Earthenware Fittings and Bathroom Accessories",
                  "fullTitle": "3261 - Vitreous China Plumbing Fixtures and China and Earthenware Fittings and Bathroom Accessories"
              },
              {
                  "id": "3262",
                  "title": "Vitreous China Table and Kitchen Articles",
                  "fullTitle": "3262 - Vitreous China Table and Kitchen Articles"
              },
              {
                  "id": "3263",
                  "title": "Fine Earthenware (Whiteware) Table and Kitchen Articles",
                  "fullTitle": "3263 - Fine Earthenware (Whiteware) Table and Kitchen Articles"
              },
              {
                  "id": "3264",
                  "title": "Porcelain Electrical Supplies",
                  "fullTitle": "3264 - Porcelain Electrical Supplies"
              },
              {
                  "id": "3269",
                  "title": "Pottery Products, Not Elsewhere Classified",
                  "fullTitle": "3269 - Pottery Products, Not Elsewhere Classified"
              },
              {
                  "id": "3271",
                  "title": "Concrete Block and Brick",
                  "fullTitle": "3271 - Concrete Block and Brick"
              },
              {
                  "id": "3272",
                  "title": "Concrete Products, Except Block and Brick",
                  "fullTitle": "3272 - Concrete Products, Except Block and Brick"
              },
              {
                  "id": "3273",
                  "title": "Ready-Mixed Concrete",
                  "fullTitle": "3273 - Ready-Mixed Concrete"
              },
              {
                  "id": "3274",
                  "title": "Lime",
                  "fullTitle": "3274 - Lime"
              },
              {
                  "id": "3275",
                  "title": "Gypsum Products",
                  "fullTitle": "3275 - Gypsum Products"
              },
              {
                  "id": "3281",
                  "title": "Cut Stone and Stone Products",
                  "fullTitle": "3281 - Cut Stone and Stone Products"
              },
              {
                  "id": "3291",
                  "title": "Abrasive Products",
                  "fullTitle": "3291 - Abrasive Products"
              },
              {
                  "id": "3292",
                  "title": "Asbestos Products",
                  "fullTitle": "3292 - Asbestos Products"
              },
              {
                  "id": "3295",
                  "title": "Minerals and Earths, Ground or Otherwise Treated",
                  "fullTitle": "3295 - Minerals and Earths, Ground or Otherwise Treated"
              },
              {
                  "id": "3296",
                  "title": "Mineral Wool",
                  "fullTitle": "3296 - Mineral Wool"
              },
              {
                  "id": "3297",
                  "title": "Nonclay Refractories",
                  "fullTitle": "3297 - Nonclay Refractories"
              },
              {
                  "id": "3299",
                  "title": "Nonmetallic Mineral Products, Not Elsewhere Classified",
                  "fullTitle": "3299 - Nonmetallic Mineral Products, Not Elsewhere Classified"
              },
              {
                  "id": "3312",
                  "title": "Steel Works, Blast Furnaces (Including Coke Ovens), and Rolling Mills",
                  "fullTitle": "3312 - Steel Works, Blast Furnaces (Including Coke Ovens), and Rolling Mills"
              },
              {
                  "id": "3313",
                  "title": "Electrometallurgical Products, Except Steel",
                  "fullTitle": "3313 - Electrometallurgical Products, Except Steel"
              },
              {
                  "id": "3315",
                  "title": "Steel Wiredrawing and Steel Nails and Spikes",
                  "fullTitle": "3315 - Steel Wiredrawing and Steel Nails and Spikes"
              },
              {
                  "id": "3316",
                  "title": "Cold-rolled Steel Sheet, Strip, and Bars",
                  "fullTitle": "3316 - Cold-rolled Steel Sheet, Strip, and Bars"
              },
              {
                  "id": "3317",
                  "title": "Steel Pipe and Tubes",
                  "fullTitle": "3317 - Steel Pipe and Tubes"
              },
              {
                  "id": "3321",
                  "title": "Gray and Ductile Iron Foundries",
                  "fullTitle": "3321 - Gray and Ductile Iron Foundries"
              },
              {
                  "id": "3322",
                  "title": "Malleable Iron Foundries",
                  "fullTitle": "3322 - Malleable Iron Foundries"
              },
              {
                  "id": "3324",
                  "title": "Steel Investment Foundries",
                  "fullTitle": "3324 - Steel Investment Foundries"
              },
              {
                  "id": "3325",
                  "title": "Steel Foundries, Not Elsewhere Classified",
                  "fullTitle": "3325 - Steel Foundries, Not Elsewhere Classified"
              },
              {
                  "id": "3331",
                  "title": "Primary Smelting and Refining of Copper",
                  "fullTitle": "3331 - Primary Smelting and Refining of Copper"
              },
              {
                  "id": "3334",
                  "title": "Primary Production of Aluminum",
                  "fullTitle": "3334 - Primary Production of Aluminum"
              },
              {
                  "id": "3339",
                  "title": "Primary Smelting and Refining of Nonferrous Metals, Except Copper and Aluminum",
                  "fullTitle": "3339 - Primary Smelting and Refining of Nonferrous Metals, Except Copper and Aluminum"
              },
              {
                  "id": "3341",
                  "title": "Secondary Smelting and Refining of Nonferrous Metals",
                  "fullTitle": "3341 - Secondary Smelting and Refining of Nonferrous Metals"
              },
              {
                  "id": "3351",
                  "title": "Rolling, Drawing, and Extruding of Copper",
                  "fullTitle": "3351 - Rolling, Drawing, and Extruding of Copper"
              },
              {
                  "id": "3353",
                  "title": "Aluminum Sheet, Plate, and Foil",
                  "fullTitle": "3353 - Aluminum Sheet, Plate, and Foil"
              },
              {
                  "id": "3354",
                  "title": "Aluminum Extruded Products",
                  "fullTitle": "3354 - Aluminum Extruded Products"
              },
              {
                  "id": "3355",
                  "title": "Aluminum Rolling and Drawing, Not Elsewhere Classified",
                  "fullTitle": "3355 - Aluminum Rolling and Drawing, Not Elsewhere Classified"
              },
              {
                  "id": "3356",
                  "title": "Rolling, Drawing, and Extruding of Nonferrous Metals, Except Copper and Aluminum",
                  "fullTitle": "3356 - Rolling, Drawing, and Extruding of Nonferrous Metals, Except Copper and Aluminum"
              },
              {
                  "id": "3357",
                  "title": "Drawing and Insulating of Nonferrous Wire",
                  "fullTitle": "3357 - Drawing and Insulating of Nonferrous Wire"
              },
              {
                  "id": "3363",
                  "title": "Aluminum Die-Castings",
                  "fullTitle": "3363 - Aluminum Die-Castings"
              },
              {
                  "id": "3364",
                  "title": "Nonferrous Die-Castings, except Aluminum",
                  "fullTitle": "3364 - Nonferrous Die-Castings, except Aluminum"
              },
              {
                  "id": "3365",
                  "title": "Aluminum Foundries",
                  "fullTitle": "3365 - Aluminum Foundries"
              },
              {
                  "id": "3366",
                  "title": "Copper Foundries",
                  "fullTitle": "3366 - Copper Foundries"
              },
              {
                  "id": "3369",
                  "title": "Nonferrous Foundries, Except Aluminum and Copper",
                  "fullTitle": "3369 - Nonferrous Foundries, Except Aluminum and Copper"
              },
              {
                  "id": "3398",
                  "title": "Metal Heat Treating",
                  "fullTitle": "3398 - Metal Heat Treating"
              },
              {
                  "id": "3399",
                  "title": "Primary Metal Products, Not Elsewhere Classified",
                  "fullTitle": "3399 - Primary Metal Products, Not Elsewhere Classified"
              },
              {
                  "id": "3411",
                  "title": "Metal Cans",
                  "fullTitle": "3411 - Metal Cans"
              },
              {
                  "id": "3412",
                  "title": "Metal Shipping Barrels, Drums, Kegs, and Pails",
                  "fullTitle": "3412 - Metal Shipping Barrels, Drums, Kegs, and Pails"
              },
              {
                  "id": "3421",
                  "title": "Cutlery",
                  "fullTitle": "3421 - Cutlery"
              },
              {
                  "id": "3423",
                  "title": "Hand and Edge Tools, Except Machine Tools and Handsaws",
                  "fullTitle": "3423 - Hand and Edge Tools, Except Machine Tools and Handsaws"
              },
              {
                  "id": "3425",
                  "title": "Saw Blades and Handsaws",
                  "fullTitle": "3425 - Saw Blades and Handsaws"
              },
              {
                  "id": "3429",
                  "title": "Hardware, Not Elsewhere Classified",
                  "fullTitle": "3429 - Hardware, Not Elsewhere Classified"
              },
              {
                  "id": "3431",
                  "title": "Enameled Iron and Metal Sanitary Ware",
                  "fullTitle": "3431 - Enameled Iron and Metal Sanitary Ware"
              },
              {
                  "id": "3432",
                  "title": "Plumbing Fixture Fittings and Trim",
                  "fullTitle": "3432 - Plumbing Fixture Fittings and Trim"
              },
              {
                  "id": "3433",
                  "title": "Heating Equipment, Except Electric and Warm Air Furnaces",
                  "fullTitle": "3433 - Heating Equipment, Except Electric and Warm Air Furnaces"
              },
              {
                  "id": "3441",
                  "title": "Fabricated Structural Metal",
                  "fullTitle": "3441 - Fabricated Structural Metal"
              },
              {
                  "id": "3442",
                  "title": "Metal Doors, Sash, Frames, Molding, and Trim Manufacturing",
                  "fullTitle": "3442 - Metal Doors, Sash, Frames, Molding, and Trim Manufacturing"
              },
              {
                  "id": "3443",
                  "title": "Fabricated Plate Work (Boiler Shops)",
                  "fullTitle": "3443 - Fabricated Plate Work (Boiler Shops)"
              },
              {
                  "id": "3444",
                  "title": "Sheet Metal Work",
                  "fullTitle": "3444 - Sheet Metal Work"
              },
              {
                  "id": "3446",
                  "title": "Architectural and Ornamental Metal Work",
                  "fullTitle": "3446 - Architectural and Ornamental Metal Work"
              },
              {
                  "id": "3448",
                  "title": "Prefabricated Metal Buildings and Components",
                  "fullTitle": "3448 - Prefabricated Metal Buildings and Components"
              },
              {
                  "id": "3449",
                  "title": "Miscellaneous Structural Metal Work",
                  "fullTitle": "3449 - Miscellaneous Structural Metal Work"
              },
              {
                  "id": "3451",
                  "title": "Screw Machine Products",
                  "fullTitle": "3451 - Screw Machine Products"
              },
              {
                  "id": "3452",
                  "title": "Bolts, Nuts, Screws, Rivets, and Washers",
                  "fullTitle": "3452 - Bolts, Nuts, Screws, Rivets, and Washers"
              },
              {
                  "id": "3462",
                  "title": "Iron and Steel Forgings",
                  "fullTitle": "3462 - Iron and Steel Forgings"
              },
              {
                  "id": "3463",
                  "title": "Nonferrous Forgings",
                  "fullTitle": "3463 - Nonferrous Forgings"
              },
              {
                  "id": "3465",
                  "title": "Automotive Stampings",
                  "fullTitle": "3465 - Automotive Stampings"
              },
              {
                  "id": "3466",
                  "title": "Crowns and Closures",
                  "fullTitle": "3466 - Crowns and Closures"
              },
              {
                  "id": "3469",
                  "title": "Metal Stampings, Not Elsewhere Classified",
                  "fullTitle": "3469 - Metal Stampings, Not Elsewhere Classified"
              },
              {
                  "id": "3471",
                  "title": "Electroplating, Plating, Polishing, Anodizing, and Coloring",
                  "fullTitle": "3471 - Electroplating, Plating, Polishing, Anodizing, and Coloring"
              },
              {
                  "id": "3479",
                  "title": "Coating, Engraving, and Allied Services, Not Elsewhere Classified",
                  "fullTitle": "3479 - Coating, Engraving, and Allied Services, Not Elsewhere Classified"
              },
              {
                  "id": "3482",
                  "title": "Small Arms Ammunition",
                  "fullTitle": "3482 - Small Arms Ammunition"
              },
              {
                  "id": "3483",
                  "title": "Ammunition, Except for Small Arms",
                  "fullTitle": "3483 - Ammunition, Except for Small Arms"
              },
              {
                  "id": "3484",
                  "title": "Small Arms",
                  "fullTitle": "3484 - Small Arms"
              },
              {
                  "id": "3489",
                  "title": "Ordnance and Accessories, Not Elsewhere Classified",
                  "fullTitle": "3489 - Ordnance and Accessories, Not Elsewhere Classified"
              },
              {
                  "id": "3491",
                  "title": "Industrial Valves",
                  "fullTitle": "3491 - Industrial Valves"
              },
              {
                  "id": "3492",
                  "title": "Fluid Power Valves and Hose Fittings",
                  "fullTitle": "3492 - Fluid Power Valves and Hose Fittings"
              },
              {
                  "id": "3493",
                  "title": "Steel Springs, Except Wire",
                  "fullTitle": "3493 - Steel Springs, Except Wire"
              },
              {
                  "id": "3494",
                  "title": "Valves and Pipe Fittings, Not Elsewhere Classified",
                  "fullTitle": "3494 - Valves and Pipe Fittings, Not Elsewhere Classified"
              },
              {
                  "id": "3495",
                  "title": "Wire Springs",
                  "fullTitle": "3495 - Wire Springs"
              },
              {
                  "id": "3496",
                  "title": "Miscellaneous Fabricated Wire Products",
                  "fullTitle": "3496 - Miscellaneous Fabricated Wire Products"
              },
              {
                  "id": "3497",
                  "title": "Metal Foil and Leaf",
                  "fullTitle": "3497 - Metal Foil and Leaf"
              },
              {
                  "id": "3498",
                  "title": "Fabricated Pipe and Pipe Fittings",
                  "fullTitle": "3498 - Fabricated Pipe and Pipe Fittings"
              },
              {
                  "id": "3499",
                  "title": "Fabricated Metal Products, Not Elsewhere Classified",
                  "fullTitle": "3499 - Fabricated Metal Products, Not Elsewhere Classified"
              },
              {
                  "id": "3511",
                  "title": "Steam, Gas, and Hydraulic Turbines, and Turbine Generator Set Units",
                  "fullTitle": "3511 - Steam, Gas, and Hydraulic Turbines, and Turbine Generator Set Units"
              },
              {
                  "id": "3519",
                  "title": "Internal Combustion Engines, Not Elsewhere Classified",
                  "fullTitle": "3519 - Internal Combustion Engines, Not Elsewhere Classified"
              },
              {
                  "id": "3523",
                  "title": "Farm Machinery and Equipment",
                  "fullTitle": "3523 - Farm Machinery and Equipment"
              },
              {
                  "id": "3524",
                  "title": "Lawn and Garden Tractors and Home Lawn and Garden Equipment",
                  "fullTitle": "3524 - Lawn and Garden Tractors and Home Lawn and Garden Equipment"
              },
              {
                  "id": "3531",
                  "title": "Construction Machinery and Equipment",
                  "fullTitle": "3531 - Construction Machinery and Equipment"
              },
              {
                  "id": "3532",
                  "title": "Mining Machinery and Equipment, Except Oil and Gas Field Machinery and Equipment",
                  "fullTitle": "3532 - Mining Machinery and Equipment, Except Oil and Gas Field Machinery and Equipment"
              },
              {
                  "id": "3533",
                  "title": "Oil and Gas Field Machinery and Equipment",
                  "fullTitle": "3533 - Oil and Gas Field Machinery and Equipment"
              },
              {
                  "id": "3534",
                  "title": "Elevators and Moving Stairways",
                  "fullTitle": "3534 - Elevators and Moving Stairways"
              },
              {
                  "id": "3535",
                  "title": "Conveyors and Conveying Equipment",
                  "fullTitle": "3535 - Conveyors and Conveying Equipment"
              },
              {
                  "id": "3536",
                  "title": "Overhead Traveling Cranes, Hoists, and Monorail Systems",
                  "fullTitle": "3536 - Overhead Traveling Cranes, Hoists, and Monorail Systems"
              },
              {
                  "id": "3537",
                  "title": "Industrial Trucks, Tractors, Trailers, and Stackers",
                  "fullTitle": "3537 - Industrial Trucks, Tractors, Trailers, and Stackers"
              },
              {
                  "id": "3541",
                  "title": "Machine Tools, Metal Cutting Types",
                  "fullTitle": "3541 - Machine Tools, Metal Cutting Types"
              },
              {
                  "id": "3542",
                  "title": "Machine Tools, Metal Forming Types",
                  "fullTitle": "3542 - Machine Tools, Metal Forming Types"
              },
              {
                  "id": "3543",
                  "title": "Industrial Patterns",
                  "fullTitle": "3543 - Industrial Patterns"
              },
              {
                  "id": "3544",
                  "title": "Special Dies and Tools, Die Sets, Jigs and Fixtures, and Industrial Molds",
                  "fullTitle": "3544 - Special Dies and Tools, Die Sets, Jigs and Fixtures, and Industrial Molds"
              },
              {
                  "id": "3545",
                  "title": "Cutting Tools, Machine Tool Accessories, and Machinists' Precision Measuring Devices",
                  "fullTitle": "3545 - Cutting Tools, Machine Tool Accessories, and Machinists' Precision Measuring Devices"
              },
              {
                  "id": "3546",
                  "title": "Power-Driven Hand Tools",
                  "fullTitle": "3546 - Power-Driven Hand Tools"
              },
              {
                  "id": "3547",
                  "title": "Rolling Mill Machinery and Equipment",
                  "fullTitle": "3547 - Rolling Mill Machinery and Equipment"
              },
              {
                  "id": "3548",
                  "title": "Electric and Gas Welding and Soldering Equipment",
                  "fullTitle": "3548 - Electric and Gas Welding and Soldering Equipment"
              },
              {
                  "id": "3549",
                  "title": "Metalworking Machinery, Not Elsewhere Classified",
                  "fullTitle": "3549 - Metalworking Machinery, Not Elsewhere Classified"
              },
              {
                  "id": "3552",
                  "title": "Textile Machinery",
                  "fullTitle": "3552 - Textile Machinery"
              },
              {
                  "id": "3553",
                  "title": "Woodworking Machinery",
                  "fullTitle": "3553 - Woodworking Machinery"
              },
              {
                  "id": "3554",
                  "title": "Paper Industries Machinery",
                  "fullTitle": "3554 - Paper Industries Machinery"
              },
              {
                  "id": "3555",
                  "title": "Printing Trades Machinery and Equipment",
                  "fullTitle": "3555 - Printing Trades Machinery and Equipment"
              },
              {
                  "id": "3556",
                  "title": "Food Products Machinery",
                  "fullTitle": "3556 - Food Products Machinery"
              },
              {
                  "id": "3559",
                  "title": "Special Industry Machinery, Not Elsewhere Classified",
                  "fullTitle": "3559 - Special Industry Machinery, Not Elsewhere Classified"
              },
              {
                  "id": "3561",
                  "title": "Pumps and Pumping Equipment",
                  "fullTitle": "3561 - Pumps and Pumping Equipment"
              },
              {
                  "id": "3562",
                  "title": "Ball and Roller Bearings",
                  "fullTitle": "3562 - Ball and Roller Bearings"
              },
              {
                  "id": "3563",
                  "title": "Air and Gas Compressors",
                  "fullTitle": "3563 - Air and Gas Compressors"
              },
              {
                  "id": "3564",
                  "title": "Industrial and Commercial Fans and Blowers and Air Purification Equipment",
                  "fullTitle": "3564 - Industrial and Commercial Fans and Blowers and Air Purification Equipment"
              },
              {
                  "id": "3565",
                  "title": "Packaging Machinery",
                  "fullTitle": "3565 - Packaging Machinery"
              },
              {
                  "id": "3566",
                  "title": "Speed Changers, Industrial High",
                  "fullTitle": "3566 - Speed Changers, Industrial High"
              },
              {
                  "id": "3567",
                  "title": "Industrial Process Furnaces and Ovens",
                  "fullTitle": "3567 - Industrial Process Furnaces and Ovens"
              },
              {
                  "id": "3568",
                  "title": "Mechanical Power Transmission Equipment, Not Elsewhere Classified",
                  "fullTitle": "3568 - Mechanical Power Transmission Equipment, Not Elsewhere Classified"
              },
              {
                  "id": "3569",
                  "title": "General Industrial Machinery and Equipment, Not Elsewhere Classified",
                  "fullTitle": "3569 - General Industrial Machinery and Equipment, Not Elsewhere Classified"
              },
              {
                  "id": "3571",
                  "title": "Electronic Computers",
                  "fullTitle": "3571 - Electronic Computers"
              },
              {
                  "id": "3572",
                  "title": "Computer Storage Devices",
                  "fullTitle": "3572 - Computer Storage Devices"
              },
              {
                  "id": "3575",
                  "title": "Computer Terminals",
                  "fullTitle": "3575 - Computer Terminals"
              },
              {
                  "id": "3577",
                  "title": "Computer Peripheral Equipment, Not Elsewhere Classified",
                  "fullTitle": "3577 - Computer Peripheral Equipment, Not Elsewhere Classified"
              },
              {
                  "id": "3578",
                  "title": "Calculating and Accounting Machines, Except Electronic Computers",
                  "fullTitle": "3578 - Calculating and Accounting Machines, Except Electronic Computers"
              },
              {
                  "id": "3579",
                  "title": "Office Machines, Not Elsewhere Classified",
                  "fullTitle": "3579 - Office Machines, Not Elsewhere Classified"
              },
              {
                  "id": "3581",
                  "title": "Automatic Vending Machines",
                  "fullTitle": "3581 - Automatic Vending Machines"
              },
              {
                  "id": "3582",
                  "title": "Commercial Laundry, Drycleaning, and Pressing Machines",
                  "fullTitle": "3582 - Commercial Laundry, Drycleaning, and Pressing Machines"
              },
              {
                  "id": "3585",
                  "title": "Air-Conditioning and Warm Air Heating Equipment and Commercial and Industrial Refrigeration Equipment",
                  "fullTitle": "3585 - Air-Conditioning and Warm Air Heating Equipment and Commercial and Industrial Refrigeration Equipment"
              },
              {
                  "id": "3586",
                  "title": "Measuring and Dispensing Pumps",
                  "fullTitle": "3586 - Measuring and Dispensing Pumps"
              },
              {
                  "id": "3589",
                  "title": "Service Industry Machinery, Not Elsewhere Classified",
                  "fullTitle": "3589 - Service Industry Machinery, Not Elsewhere Classified"
              },
              {
                  "id": "3592",
                  "title": "Carburetors, Pistons, Piston Rings, and Valves",
                  "fullTitle": "3592 - Carburetors, Pistons, Piston Rings, and Valves"
              },
              {
                  "id": "3593",
                  "title": "Fluid Power Cylinders and Actuators",
                  "fullTitle": "3593 - Fluid Power Cylinders and Actuators"
              },
              {
                  "id": "3594",
                  "title": "Fluid Power Pumps and Motors",
                  "fullTitle": "3594 - Fluid Power Pumps and Motors"
              },
              {
                  "id": "3596",
                  "title": "Scales and Balances, Except Laboratory",
                  "fullTitle": "3596 - Scales and Balances, Except Laboratory"
              },
              {
                  "id": "3599",
                  "title": "Industrial and Commercial Machinery and Equipment, Not Elsewhere Classified",
                  "fullTitle": "3599 - Industrial and Commercial Machinery and Equipment, Not Elsewhere Classified"
              },
              {
                  "id": "3612",
                  "title": "Power, Distribution, and Specialty Transformers",
                  "fullTitle": "3612 - Power, Distribution, and Specialty Transformers"
              },
              {
                  "id": "3613",
                  "title": "Switchgear and Switchboard Apparatus",
                  "fullTitle": "3613 - Switchgear and Switchboard Apparatus"
              },
              {
                  "id": "3621",
                  "title": "Motors and Generators",
                  "fullTitle": "3621 - Motors and Generators"
              },
              {
                  "id": "3624",
                  "title": "Carbon and Graphite Products",
                  "fullTitle": "3624 - Carbon and Graphite Products"
              },
              {
                  "id": "3625",
                  "title": "Relays and Industrial Controls",
                  "fullTitle": "3625 - Relays and Industrial Controls"
              },
              {
                  "id": "3629",
                  "title": "Electrical Industrial Apparatus, Not Elsewhere Classified",
                  "fullTitle": "3629 - Electrical Industrial Apparatus, Not Elsewhere Classified"
              },
              {
                  "id": "3631",
                  "title": "Household Cooking Equipment",
                  "fullTitle": "3631 - Household Cooking Equipment"
              },
              {
                  "id": "3632",
                  "title": "Household Refrigerators and HOme and Farm Freezers",
                  "fullTitle": "3632 - Household Refrigerators and HOme and Farm Freezers"
              },
              {
                  "id": "3633",
                  "title": "Household Laundry Equipment",
                  "fullTitle": "3633 - Household Laundry Equipment"
              },
              {
                  "id": "3634",
                  "title": "Electric Housewares and Fans",
                  "fullTitle": "3634 - Electric Housewares and Fans"
              },
              {
                  "id": "3635",
                  "title": "Household Vacuum Cleaners",
                  "fullTitle": "3635 - Household Vacuum Cleaners"
              },
              {
                  "id": "3639",
                  "title": "Household Appliances, Not Elsewhere Classified",
                  "fullTitle": "3639 - Household Appliances, Not Elsewhere Classified"
              },
              {
                  "id": "3641",
                  "title": "Electric Lamp Bulbs and Tubes",
                  "fullTitle": "3641 - Electric Lamp Bulbs and Tubes"
              },
              {
                  "id": "3643",
                  "title": "Current-Carrying Wiring Devices",
                  "fullTitle": "3643 - Current-Carrying Wiring Devices"
              },
              {
                  "id": "3644",
                  "title": "Noncurrent-Carrying Wiring Devices",
                  "fullTitle": "3644 - Noncurrent-Carrying Wiring Devices"
              },
              {
                  "id": "3645",
                  "title": "Residential Electric Lighting Fixtures",
                  "fullTitle": "3645 - Residential Electric Lighting Fixtures"
              },
              {
                  "id": "3646",
                  "title": "Commercial, Industrial, and Institutional Electric Lighting Fixtures",
                  "fullTitle": "3646 - Commercial, Industrial, and Institutional Electric Lighting Fixtures"
              },
              {
                  "id": "3647",
                  "title": "Vehicular Lighting Equipment",
                  "fullTitle": "3647 - Vehicular Lighting Equipment"
              },
              {
                  "id": "3648",
                  "title": "Lighting Equipment, Not Elsewhere Classified",
                  "fullTitle": "3648 - Lighting Equipment, Not Elsewhere Classified"
              },
              {
                  "id": "3651",
                  "title": "Household Audio and Video Equipment",
                  "fullTitle": "3651 - Household Audio and Video Equipment"
              },
              {
                  "id": "3652",
                  "title": "Phonograph Records and Prerecorded Audio Tapes and Disks",
                  "fullTitle": "3652 - Phonograph Records and Prerecorded Audio Tapes and Disks"
              },
              {
                  "id": "3661",
                  "title": "Telephone and Telegraph Apparatus",
                  "fullTitle": "3661 - Telephone and Telegraph Apparatus"
              },
              {
                  "id": "3663",
                  "title": "Radio and Television Broadcasting and Communications Equipment",
                  "fullTitle": "3663 - Radio and Television Broadcasting and Communications Equipment"
              },
              {
                  "id": "3669",
                  "title": "Communications Equipment, Not Elsewhere Classified",
                  "fullTitle": "3669 - Communications Equipment, Not Elsewhere Classified"
              },
              {
                  "id": "3671",
                  "title": "Electron Tubes",
                  "fullTitle": "3671 - Electron Tubes"
              },
              {
                  "id": "3672",
                  "title": "Printed Circuit Boards",
                  "fullTitle": "3672 - Printed Circuit Boards"
              },
              {
                  "id": "3674",
                  "title": "Semiconductors and Related Devices",
                  "fullTitle": "3674 - Semiconductors and Related Devices"
              },
              {
                  "id": "3675",
                  "title": "Electronic Capacitors",
                  "fullTitle": "3675 - Electronic Capacitors"
              },
              {
                  "id": "3676",
                  "title": "Electronic Resistors",
                  "fullTitle": "3676 - Electronic Resistors"
              },
              {
                  "id": "3677",
                  "title": "Electronic Coils, Transformers, and Other Inductors",
                  "fullTitle": "3677 - Electronic Coils, Transformers, and Other Inductors"
              },
              {
                  "id": "3678",
                  "title": "Electronic Connectors",
                  "fullTitle": "3678 - Electronic Connectors"
              },
              {
                  "id": "3679",
                  "title": "Electronic Components, Not Elsewhere Classified",
                  "fullTitle": "3679 - Electronic Components, Not Elsewhere Classified"
              },
              {
                  "id": "3691",
                  "title": "Storage Batteries",
                  "fullTitle": "3691 - Storage Batteries"
              },
              {
                  "id": "3692",
                  "title": "Primary Batteries, Dry and Wet",
                  "fullTitle": "3692 - Primary Batteries, Dry and Wet"
              },
              {
                  "id": "3694",
                  "title": "Electrical Equipment for Internal Combustion Engines",
                  "fullTitle": "3694 - Electrical Equipment for Internal Combustion Engines"
              },
              {
                  "id": "3695",
                  "title": "Magnetic and Optical Recording Media",
                  "fullTitle": "3695 - Magnetic and Optical Recording Media"
              },
              {
                  "id": "3699",
                  "title": "Electrical Machinery, Equipment, and Supplies, Not Elsewhere Classified",
                  "fullTitle": "3699 - Electrical Machinery, Equipment, and Supplies, Not Elsewhere Classified"
              },
              {
                  "id": "3711",
                  "title": "Motor Vehicles and Passenger Car Bodies",
                  "fullTitle": "3711 - Motor Vehicles and Passenger Car Bodies"
              },
              {
                  "id": "3713",
                  "title": "Truck and Bus Bodies",
                  "fullTitle": "3713 - Truck and Bus Bodies"
              },
              {
                  "id": "3714",
                  "title": "Motor Vehicle Parts and Accessories",
                  "fullTitle": "3714 - Motor Vehicle Parts and Accessories"
              },
              {
                  "id": "3715",
                  "title": "Truck Trailers",
                  "fullTitle": "3715 - Truck Trailers"
              },
              {
                  "id": "3716",
                  "title": "Motor Homes",
                  "fullTitle": "3716 - Motor Homes"
              },
              {
                  "id": "3721",
                  "title": "Aircraft",
                  "fullTitle": "3721 - Aircraft"
              },
              {
                  "id": "3724",
                  "title": "Aircraft Engines and Engine Parts",
                  "fullTitle": "3724 - Aircraft Engines and Engine Parts"
              },
              {
                  "id": "3728",
                  "title": "Aircraft Parts and Auxiliary Equipment, Not Elsewhere Classified",
                  "fullTitle": "3728 - Aircraft Parts and Auxiliary Equipment, Not Elsewhere Classified"
              },
              {
                  "id": "3731",
                  "title": "Ship Building and Repairing",
                  "fullTitle": "3731 - Ship Building and Repairing"
              },
              {
                  "id": "3732",
                  "title": "Boat Building and Repairing",
                  "fullTitle": "3732 - Boat Building and Repairing"
              },
              {
                  "id": "3743",
                  "title": "Railroad Equipment",
                  "fullTitle": "3743 - Railroad Equipment"
              },
              {
                  "id": "3751",
                  "title": "Motorcycles, Bicycles, and Parts",
                  "fullTitle": "3751 - Motorcycles, Bicycles, and Parts"
              },
              {
                  "id": "3761",
                  "title": "Guided Missiles and Space Vehicles",
                  "fullTitle": "3761 - Guided Missiles and Space Vehicles"
              },
              {
                  "id": "3764",
                  "title": "Guided Missile and Space Vehicle Propulsion Units and Propulsion Unit Parts",
                  "fullTitle": "3764 - Guided Missile and Space Vehicle Propulsion Units and Propulsion Unit Parts"
              },
              {
                  "id": "3769",
                  "title": "Guided Missile Space Vehicle Parts and Auxiliary Equipment, Not Elsewhere Classified",
                  "fullTitle": "3769 - Guided Missile Space Vehicle Parts and Auxiliary Equipment, Not Elsewhere Classified"
              },
              {
                  "id": "3792",
                  "title": "Travel Trailers and Campers",
                  "fullTitle": "3792 - Travel Trailers and Campers"
              },
              {
                  "id": "3795",
                  "title": "Tanks and Tank Components",
                  "fullTitle": "3795 - Tanks and Tank Components"
              },
              {
                  "id": "3799",
                  "title": "Transportation Equipment, Not Elsewhere Classified",
                  "fullTitle": "3799 - Transportation Equipment, Not Elsewhere Classified"
              },
              {
                  "id": "3812",
                  "title": "Search, Detection, Navigation, Guidance, Aeronautical, and Nautical Systems and Instruments",
                  "fullTitle": "3812 - Search, Detection, Navigation, Guidance, Aeronautical, and Nautical Systems and Instruments"
              },
              {
                  "id": "3821",
                  "title": "Laboratory Apparatus and Furniture",
                  "fullTitle": "3821 - Laboratory Apparatus and Furniture"
              },
              {
                  "id": "3822",
                  "title": "Automatic Controls for Regulating Residential and Commercial Environments and Appliances",
                  "fullTitle": "3822 - Automatic Controls for Regulating Residential and Commercial Environments and Appliances"
              },
              {
                  "id": "3823",
                  "title": "Industrial Instruments for Measurement, Display, and Control of Process Variables; and Related Products",
                  "fullTitle": "3823 - Industrial Instruments for Measurement, Display, and Control of Process Variables; and Related Products"
              },
              {
                  "id": "3824",
                  "title": "Totalizing Fluid Meters and Counting Devices",
                  "fullTitle": "3824 - Totalizing Fluid Meters and Counting Devices"
              },
              {
                  "id": "3825",
                  "title": "Instruments for Measuring and Testing of Electricity and Electrical Signals",
                  "fullTitle": "3825 - Instruments for Measuring and Testing of Electricity and Electrical Signals"
              },
              {
                  "id": "3826",
                  "title": "Laboratory Analytical Instruments",
                  "fullTitle": "3826 - Laboratory Analytical Instruments"
              },
              {
                  "id": "3827",
                  "title": "Optical Instruments and Lenses",
                  "fullTitle": "3827 - Optical Instruments and Lenses"
              },
              {
                  "id": "3829",
                  "title": "Measuring and Controlling Devices, Not Elsewhere Classified",
                  "fullTitle": "3829 - Measuring and Controlling Devices, Not Elsewhere Classified"
              },
              {
                  "id": "3841",
                  "title": "Surgical and Medical Instruments and Apparatus",
                  "fullTitle": "3841 - Surgical and Medical Instruments and Apparatus"
              },
              {
                  "id": "3842",
                  "title": "Orthopedic, Prosthetic, and Surgical Appliances and Supplies",
                  "fullTitle": "3842 - Orthopedic, Prosthetic, and Surgical Appliances and Supplies"
              },
              {
                  "id": "3843",
                  "title": "Dental Equipment and Supplies",
                  "fullTitle": "3843 - Dental Equipment and Supplies"
              },
              {
                  "id": "3844",
                  "title": "X-ray Apparatus and Tubes",
                  "fullTitle": "3844 - X-ray Apparatus and Tubes"
              },
              {
                  "id": "3845",
                  "title": "Electromedical and Electrotherapeutic Apparatus",
                  "fullTitle": "3845 - Electromedical and Electrotherapeutic Apparatus"
              },
              {
                  "id": "3851",
                  "title": "Ophthalmic Goods",
                  "fullTitle": "3851 - Ophthalmic Goods"
              },
              {
                  "id": "3861",
                  "title": "Photographic Equipment and Supplies",
                  "fullTitle": "3861 - Photographic Equipment and Supplies"
              },
              {
                  "id": "3873",
                  "title": "Watches, Clocks, Clockwork Operated Devices, and Parts",
                  "fullTitle": "3873 - Watches, Clocks, Clockwork Operated Devices, and Parts"
              },
              {
                  "id": "3911",
                  "title": "Jewelry, Precious Metal",
                  "fullTitle": "3911 - Jewelry, Precious Metal"
              },
              {
                  "id": "3914",
                  "title": "Silverware, Plated Ware, and Stainless Steel Ware",
                  "fullTitle": "3914 - Silverware, Plated Ware, and Stainless Steel Ware"
              },
              {
                  "id": "3915",
                  "title": "Jewelers' Findings and Materials, and Lapidary Work",
                  "fullTitle": "3915 - Jewelers' Findings and Materials, and Lapidary Work"
              },
              {
                  "id": "3931",
                  "title": "Musical Instruments",
                  "fullTitle": "3931 - Musical Instruments"
              },
              {
                  "id": "3942",
                  "title": "Dolls and Stuffed Toys",
                  "fullTitle": "3942 - Dolls and Stuffed Toys"
              },
              {
                  "id": "3944",
                  "title": "Games, Toys, and Children's Vehicles, Except Dolls and Bicycles",
                  "fullTitle": "3944 - Games, Toys, and Children's Vehicles, Except Dolls and Bicycles"
              },
              {
                  "id": "3949",
                  "title": "Sporting and Athletic Goods, Not Elsewhere Classified",
                  "fullTitle": "3949 - Sporting and Athletic Goods, Not Elsewhere Classified"
              },
              {
                  "id": "3951",
                  "title": "Pens, Mechanical Pencils, and Parts",
                  "fullTitle": "3951 - Pens, Mechanical Pencils, and Parts"
              },
              {
                  "id": "3952",
                  "title": "Lead Pencils, Crayons, and Artists' Materials",
                  "fullTitle": "3952 - Lead Pencils, Crayons, and Artists' Materials"
              },
              {
                  "id": "3953",
                  "title": "Marking Devices",
                  "fullTitle": "3953 - Marking Devices"
              },
              {
                  "id": "3955",
                  "title": "Carbon Paper and Inked Ribbons",
                  "fullTitle": "3955 - Carbon Paper and Inked Ribbons"
              },
              {
                  "id": "3961",
                  "title": "Costume Jewelry and Costume Novelties, Except Precious Metal",
                  "fullTitle": "3961 - Costume Jewelry and Costume Novelties, Except Precious Metal"
              },
              {
                  "id": "3965",
                  "title": "Fasteners, Buttons, Needles, and Pins",
                  "fullTitle": "3965 - Fasteners, Buttons, Needles, and Pins"
              },
              {
                  "id": "3991",
                  "title": "Brooms and Brushes",
                  "fullTitle": "3991 - Brooms and Brushes"
              },
              {
                  "id": "3993",
                  "title": "Signs and Advertising Specialties",
                  "fullTitle": "3993 - Signs and Advertising Specialties"
              },
              {
                  "id": "3995",
                  "title": "Burial Caskets",
                  "fullTitle": "3995 - Burial Caskets"
              },
              {
                  "id": "3996",
                  "title": "Linoleum, Asphalted",
                  "fullTitle": "3996 - Linoleum, Asphalted"
              },
              {
                  "id": "3999",
                  "title": "Manufacturing Industries, Not Elsewhere Classified",
                  "fullTitle": "3999 - Manufacturing Industries, Not Elsewhere Classified"
              },
              {
                  "id": "4011",
                  "title": "Railroads, Line",
                  "fullTitle": "4011 - Railroads, Line"
              },
              {
                  "id": "4013",
                  "title": "Railroad Switching and Terminal Establishments",
                  "fullTitle": "4013 - Railroad Switching and Terminal Establishments"
              },
              {
                  "id": "4111",
                  "title": "Local and Suburban Transit",
                  "fullTitle": "4111 - Local and Suburban Transit"
              },
              {
                  "id": "4119",
                  "title": "Local Passenger Transportation, Not Elsewhere Classified",
                  "fullTitle": "4119 - Local Passenger Transportation, Not Elsewhere Classified"
              },
              {
                  "id": "4121",
                  "title": "Taxicabs",
                  "fullTitle": "4121 - Taxicabs"
              },
              {
                  "id": "4131",
                  "title": "Intercity and Rural Bus Transportation",
                  "fullTitle": "4131 - Intercity and Rural Bus Transportation"
              },
              {
                  "id": "4141",
                  "title": "Local Bus Charter Service",
                  "fullTitle": "4141 - Local Bus Charter Service"
              },
              {
                  "id": "4142",
                  "title": "Bus Charter Service, Except Local",
                  "fullTitle": "4142 - Bus Charter Service, Except Local"
              },
              {
                  "id": "4151",
                  "title": "School Buses",
                  "fullTitle": "4151 - School Buses"
              },
              {
                  "id": "4173",
                  "title": "Terminal and Service Facilities for Motor Vehicle Passenger Transportation",
                  "fullTitle": "4173 - Terminal and Service Facilities for Motor Vehicle Passenger Transportation"
              },
              {
                  "id": "4212",
                  "title": "Local Trucking Without Storage",
                  "fullTitle": "4212 - Local Trucking Without Storage"
              },
              {
                  "id": "4213",
                  "title": "Trucking, Except Local",
                  "fullTitle": "4213 - Trucking, Except Local"
              },
              {
                  "id": "4214",
                  "title": "Local Trucking With Storage",
                  "fullTitle": "4214 - Local Trucking With Storage"
              },
              {
                  "id": "4215",
                  "title": "Courier Services, Except by Air",
                  "fullTitle": "4215 - Courier Services, Except by Air"
              },
              {
                  "id": "4221",
                  "title": "Farm Product Warehousing and Storage",
                  "fullTitle": "4221 - Farm Product Warehousing and Storage"
              },
              {
                  "id": "4222",
                  "title": "Refrigerated Warehousing and Storage",
                  "fullTitle": "4222 - Refrigerated Warehousing and Storage"
              },
              {
                  "id": "4225",
                  "title": "General Warehousing and Storage",
                  "fullTitle": "4225 - General Warehousing and Storage"
              },
              {
                  "id": "4226",
                  "title": "Special Warehousing and Storage, Not Elsewhere Classified",
                  "fullTitle": "4226 - Special Warehousing and Storage, Not Elsewhere Classified"
              },
              {
                  "id": "4231",
                  "title": "Terminal and Joint Terminal Maintenance Facilities for Motor Freight Transportation",
                  "fullTitle": "4231 - Terminal and Joint Terminal Maintenance Facilities for Motor Freight Transportation"
              },
              {
                  "id": "4311",
                  "title": "United States Postal Service",
                  "fullTitle": "4311 - United States Postal Service"
              },
              {
                  "id": "4412",
                  "title": "Deep Sea Foreign Transportation of Freight",
                  "fullTitle": "4412 - Deep Sea Foreign Transportation of Freight"
              },
              {
                  "id": "4424",
                  "title": "Deep Sea Domestic Transportation of Freight",
                  "fullTitle": "4424 - Deep Sea Domestic Transportation of Freight"
              },
              {
                  "id": "4432",
                  "title": "Freight Transportation on the Great Lakes",
                  "fullTitle": "4432 - Freight Transportation on the Great Lakes"
              },
              {
                  "id": "4449",
                  "title": "Water Transportation of Freight, Not Elsewhere Classified",
                  "fullTitle": "4449 - Water Transportation of Freight, Not Elsewhere Classified"
              },
              {
                  "id": "4481",
                  "title": "Deep Sea Transportation of Passengers, Except by Ferry",
                  "fullTitle": "4481 - Deep Sea Transportation of Passengers, Except by Ferry"
              },
              {
                  "id": "4482",
                  "title": "Ferries",
                  "fullTitle": "4482 - Ferries"
              },
              {
                  "id": "4489",
                  "title": "Water Transportation of Passengers, Not Elsewhere Classified",
                  "fullTitle": "4489 - Water Transportation of Passengers, Not Elsewhere Classified"
              },
              {
                  "id": "4491",
                  "title": "Marine Cargo Handling",
                  "fullTitle": "4491 - Marine Cargo Handling"
              },
              {
                  "id": "4492",
                  "title": "Towing and Tugboat Services",
                  "fullTitle": "4492 - Towing and Tugboat Services"
              },
              {
                  "id": "4493",
                  "title": "Marinas",
                  "fullTitle": "4493 - Marinas"
              },
              {
                  "id": "4499",
                  "title": "Water Transportation Services, Not Elsewhere Classified",
                  "fullTitle": "4499 - Water Transportation Services, Not Elsewhere Classified"
              },
              {
                  "id": "4512",
                  "title": "Air Transportation, Scheduled",
                  "fullTitle": "4512 - Air Transportation, Scheduled"
              },
              {
                  "id": "4513",
                  "title": "Air Courier Services",
                  "fullTitle": "4513 - Air Courier Services"
              },
              {
                  "id": "4522",
                  "title": "Air Transportation, Nonscheduled",
                  "fullTitle": "4522 - Air Transportation, Nonscheduled"
              },
              {
                  "id": "4581",
                  "title": "Airports, Flying Fields, and Airport Terminal Services",
                  "fullTitle": "4581 - Airports, Flying Fields, and Airport Terminal Services"
              },
              {
                  "id": "4612",
                  "title": "Crude Petroleum Pipelines",
                  "fullTitle": "4612 - Crude Petroleum Pipelines"
              },
              {
                  "id": "4613",
                  "title": "Refined Petroleum Pipelines",
                  "fullTitle": "4613 - Refined Petroleum Pipelines"
              },
              {
                  "id": "4619",
                  "title": "Pipelines, Not Elsewhere Classified",
                  "fullTitle": "4619 - Pipelines, Not Elsewhere Classified"
              },
              {
                  "id": "4724",
                  "title": "Travel Agencies",
                  "fullTitle": "4724 - Travel Agencies"
              },
              {
                  "id": "4725",
                  "title": "Tour Operators",
                  "fullTitle": "4725 - Tour Operators"
              },
              {
                  "id": "4729",
                  "title": "Arrangement of Passenger Transportation, Not Elsewhere Classified",
                  "fullTitle": "4729 - Arrangement of Passenger Transportation, Not Elsewhere Classified"
              },
              {
                  "id": "4731",
                  "title": "Arrangement of Transportation of Freight and Cargo",
                  "fullTitle": "4731 - Arrangement of Transportation of Freight and Cargo"
              },
              {
                  "id": "4741",
                  "title": "Rental of Railroad Cars",
                  "fullTitle": "4741 - Rental of Railroad Cars"
              },
              {
                  "id": "4783",
                  "title": "Packing and Crating",
                  "fullTitle": "4783 - Packing and Crating"
              },
              {
                  "id": "4785",
                  "title": "Fixed Facilities and Inspection and Weighing Services for Motor Vehicle Transportation",
                  "fullTitle": "4785 - Fixed Facilities and Inspection and Weighing Services for Motor Vehicle Transportation"
              },
              {
                  "id": "4789",
                  "title": "Transportation Services, Not Elsewhere Classified",
                  "fullTitle": "4789 - Transportation Services, Not Elsewhere Classified"
              },
              {
                  "id": "4812",
                  "title": "Radiotelephone Communications",
                  "fullTitle": "4812 - Radiotelephone Communications"
              },
              {
                  "id": "4813",
                  "title": "Telephone Communications, Except Radiotelephone",
                  "fullTitle": "4813 - Telephone Communications, Except Radiotelephone"
              },
              {
                  "id": "4822",
                  "title": "Telegraph and Other Message Communications",
                  "fullTitle": "4822 - Telegraph and Other Message Communications"
              },
              {
                  "id": "4832",
                  "title": "Radio Broadcasting Stations",
                  "fullTitle": "4832 - Radio Broadcasting Stations"
              },
              {
                  "id": "4833",
                  "title": "Television Broadcasting Stations",
                  "fullTitle": "4833 - Television Broadcasting Stations"
              },
              {
                  "id": "4841",
                  "title": "Cable and Other Pay Television Services",
                  "fullTitle": "4841 - Cable and Other Pay Television Services"
              },
              {
                  "id": "4899",
                  "title": "Communications Services, Not Elsewhere Classified",
                  "fullTitle": "4899 - Communications Services, Not Elsewhere Classified"
              },
              {
                  "id": "4911",
                  "title": "Electric Services",
                  "fullTitle": "4911 - Electric Services"
              },
              {
                  "id": "4922",
                  "title": "Natural Gas Transmission",
                  "fullTitle": "4922 - Natural Gas Transmission"
              },
              {
                  "id": "4923",
                  "title": "Natural Gas Transmission and Distribution",
                  "fullTitle": "4923 - Natural Gas Transmission and Distribution"
              },
              {
                  "id": "4924",
                  "title": "Natural Gas Distribution",
                  "fullTitle": "4924 - Natural Gas Distribution"
              },
              {
                  "id": "4925",
                  "title": "Mixed, Manufactured, or Liquefied Petroleum Gas Production",
                  "fullTitle": "4925 - Mixed, Manufactured, or Liquefied Petroleum Gas Production"
              },
              {
                  "id": "4931",
                  "title": "Electric and Other Services Combined",
                  "fullTitle": "4931 - Electric and Other Services Combined"
              },
              {
                  "id": "4932",
                  "title": "Gas and Other Services Combined",
                  "fullTitle": "4932 - Gas and Other Services Combined"
              },
              {
                  "id": "4939",
                  "title": "Combination Utilities, Not Elsewhere Classified",
                  "fullTitle": "4939 - Combination Utilities, Not Elsewhere Classified"
              },
              {
                  "id": "4941",
                  "title": "Water Supply",
                  "fullTitle": "4941 - Water Supply"
              },
              {
                  "id": "4952",
                  "title": "Sewerage Systems",
                  "fullTitle": "4952 - Sewerage Systems"
              },
              {
                  "id": "4953",
                  "title": "Refuse Systems",
                  "fullTitle": "4953 - Refuse Systems"
              },
              {
                  "id": "4959",
                  "title": "Sanitary Services, Not Elsewhere Classified",
                  "fullTitle": "4959 - Sanitary Services, Not Elsewhere Classified"
              },
              {
                  "id": "4961",
                  "title": "Steam and Air",
                  "fullTitle": "4961 - Steam and Air"
              },
              {
                  "id": "4971",
                  "title": "Irrigation Systems",
                  "fullTitle": "4971 - Irrigation Systems"
              },
              {
                  "id": "5012",
                  "title": "Automobiles and Other Motor Vehicles",
                  "fullTitle": "5012 - Automobiles and Other Motor Vehicles"
              },
              {
                  "id": "5013",
                  "title": "Motor Vehicle Supplies and New Parts",
                  "fullTitle": "5013 - Motor Vehicle Supplies and New Parts"
              },
              {
                  "id": "5014",
                  "title": "Tires and Tubes",
                  "fullTitle": "5014 - Tires and Tubes"
              },
              {
                  "id": "5015",
                  "title": "Motor Vehicle Parts, Used",
                  "fullTitle": "5015 - Motor Vehicle Parts, Used"
              },
              {
                  "id": "5021",
                  "title": "Furniture",
                  "fullTitle": "5021 - Furniture"
              },
              {
                  "id": "5023",
                  "title": "Home furnishings",
                  "fullTitle": "5023 - Home furnishings"
              },
              {
                  "id": "5031",
                  "title": "Lumber, Plywood, Millwork, and Wood Panels",
                  "fullTitle": "5031 - Lumber, Plywood, Millwork, and Wood Panels"
              },
              {
                  "id": "5032",
                  "title": "Brick, Stone, and Related Construction Materials",
                  "fullTitle": "5032 - Brick, Stone, and Related Construction Materials"
              },
              {
                  "id": "5033",
                  "title": "Roofing, Siding, and Insulation Materials",
                  "fullTitle": "5033 - Roofing, Siding, and Insulation Materials"
              },
              {
                  "id": "5039",
                  "title": "Construction Materials, Not Elsewhere Classified",
                  "fullTitle": "5039 - Construction Materials, Not Elsewhere Classified"
              },
              {
                  "id": "5043",
                  "title": "Photographic Equipment and Supplies",
                  "fullTitle": "5043 - Photographic Equipment and Supplies"
              },
              {
                  "id": "5044",
                  "title": "Office Equipment",
                  "fullTitle": "5044 - Office Equipment"
              },
              {
                  "id": "5045",
                  "title": "Computers and Computer Peripheral Equipment and Software",
                  "fullTitle": "5045 - Computers and Computer Peripheral Equipment and Software"
              },
              {
                  "id": "5046",
                  "title": "Commercial Equipment, Not Elsewhere Classified",
                  "fullTitle": "5046 - Commercial Equipment, Not Elsewhere Classified"
              },
              {
                  "id": "5047",
                  "title": "Medical, Dental, and Hospital Equipment and Supplies",
                  "fullTitle": "5047 - Medical, Dental, and Hospital Equipment and Supplies"
              },
              {
                  "id": "5048",
                  "title": "Ophthalmic Goods",
                  "fullTitle": "5048 - Ophthalmic Goods"
              },
              {
                  "id": "5049",
                  "title": "Professional Equipment and Supplies, Not Elsewhere Classified",
                  "fullTitle": "5049 - Professional Equipment and Supplies, Not Elsewhere Classified"
              },
              {
                  "id": "5051",
                  "title": "Metals Service Centers and Offices",
                  "fullTitle": "5051 - Metals Service Centers and Offices"
              },
              {
                  "id": "5052",
                  "title": "Coal and Other Minerals and Ores",
                  "fullTitle": "5052 - Coal and Other Minerals and Ores"
              },
              {
                  "id": "5063",
                  "title": "Electrical Apparatus and Equipment Wiring Supplies, and Construction Materials",
                  "fullTitle": "5063 - Electrical Apparatus and Equipment Wiring Supplies, and Construction Materials"
              },
              {
                  "id": "5064",
                  "title": "Electrical Appliances, Television and Radio Sets",
                  "fullTitle": "5064 - Electrical Appliances, Television and Radio Sets"
              },
              {
                  "id": "5065",
                  "title": "Electronic Parts and Equipment, Not Elsewhere Classified",
                  "fullTitle": "5065 - Electronic Parts and Equipment, Not Elsewhere Classified"
              },
              {
                  "id": "5072",
                  "title": "Hardware",
                  "fullTitle": "5072 - Hardware"
              },
              {
                  "id": "5074",
                  "title": "Plumbing and Heating Equipment and Supplies (Hydronics)",
                  "fullTitle": "5074 - Plumbing and Heating Equipment and Supplies (Hydronics)"
              },
              {
                  "id": "5075",
                  "title": "Warm Air Heating and Air",
                  "fullTitle": "5075 - Warm Air Heating and Air"
              },
              {
                  "id": "5078",
                  "title": "Refrigeration Equipment and Supplies",
                  "fullTitle": "5078 - Refrigeration Equipment and Supplies"
              },
              {
                  "id": "5082",
                  "title": "Construction and Mining (Except Petroleum) Machinery and Equipment",
                  "fullTitle": "5082 - Construction and Mining (Except Petroleum) Machinery and Equipment"
              },
              {
                  "id": "5083",
                  "title": "Farm and Garden Machinery and Equipment",
                  "fullTitle": "5083 - Farm and Garden Machinery and Equipment"
              },
              {
                  "id": "5084",
                  "title": "Industrial Machinery and Equipment",
                  "fullTitle": "5084 - Industrial Machinery and Equipment"
              },
              {
                  "id": "5085",
                  "title": "Industrial Supplies",
                  "fullTitle": "5085 - Industrial Supplies"
              },
              {
                  "id": "5087",
                  "title": "Service Establishment Equipment and Supplies",
                  "fullTitle": "5087 - Service Establishment Equipment and Supplies"
              },
              {
                  "id": "5088",
                  "title": "Transportation Equipment and Supplies, Except Motor Vehicles",
                  "fullTitle": "5088 - Transportation Equipment and Supplies, Except Motor Vehicles"
              },
              {
                  "id": "5091",
                  "title": "Sporting and Recreational Goods and Supplies",
                  "fullTitle": "5091 - Sporting and Recreational Goods and Supplies"
              },
              {
                  "id": "5092",
                  "title": "Toys and Hobby Goods and Supplies",
                  "fullTitle": "5092 - Toys and Hobby Goods and Supplies"
              },
              {
                  "id": "5093",
                  "title": "Scrap and Waste Materials",
                  "fullTitle": "5093 - Scrap and Waste Materials"
              },
              {
                  "id": "5094",
                  "title": "Jewelry, Watches, Precious Stones, and Precious Metals",
                  "fullTitle": "5094 - Jewelry, Watches, Precious Stones, and Precious Metals"
              },
              {
                  "id": "5099",
                  "title": "Durable Goods, Not Elsewhere Classified",
                  "fullTitle": "5099 - Durable Goods, Not Elsewhere Classified"
              },
              {
                  "id": "5111",
                  "title": "Printing and Writing Paper",
                  "fullTitle": "5111 - Printing and Writing Paper"
              },
              {
                  "id": "5112",
                  "title": "Stationery and Office Supplies",
                  "fullTitle": "5112 - Stationery and Office Supplies"
              },
              {
                  "id": "5113",
                  "title": "Industrial and Personal Service Paper",
                  "fullTitle": "5113 - Industrial and Personal Service Paper"
              },
              {
                  "id": "5122",
                  "title": "Drugs, Drug Proprietaries, and Druggists' Sundries",
                  "fullTitle": "5122 - Drugs, Drug Proprietaries, and Druggists' Sundries"
              },
              {
                  "id": "5131",
                  "title": "Piece Goods, Notions, and Other Dry Good",
                  "fullTitle": "5131 - Piece Goods, Notions, and Other Dry Good"
              },
              {
                  "id": "5136",
                  "title": "Men's and Boy's Clothing and Furnishings",
                  "fullTitle": "5136 - Men's and Boy's Clothing and Furnishings"
              },
              {
                  "id": "5137",
                  "title": "Women's, Children's, and Infants' Clothing and Accessories",
                  "fullTitle": "5137 - Women's, Children's, and Infants' Clothing and Accessories"
              },
              {
                  "id": "5139",
                  "title": "Footwear",
                  "fullTitle": "5139 - Footwear"
              },
              {
                  "id": "5141",
                  "title": "Groceries, General Line",
                  "fullTitle": "5141 - Groceries, General Line"
              },
              {
                  "id": "5142",
                  "title": "Packaged Frozen Foods",
                  "fullTitle": "5142 - Packaged Frozen Foods"
              },
              {
                  "id": "5143",
                  "title": "Dairy Products, Except Dried or Canned",
                  "fullTitle": "5143 - Dairy Products, Except Dried or Canned"
              },
              {
                  "id": "5144",
                  "title": "Poultry and Poultry Products",
                  "fullTitle": "5144 - Poultry and Poultry Products"
              },
              {
                  "id": "5145",
                  "title": "Confectionery",
                  "fullTitle": "5145 - Confectionery"
              },
              {
                  "id": "5146",
                  "title": "Fish and Seafoods",
                  "fullTitle": "5146 - Fish and Seafoods"
              },
              {
                  "id": "5147",
                  "title": "Meats and Meat Products",
                  "fullTitle": "5147 - Meats and Meat Products"
              },
              {
                  "id": "5148",
                  "title": "Fresh Fruits and Vegetables",
                  "fullTitle": "5148 - Fresh Fruits and Vegetables"
              },
              {
                  "id": "5149",
                  "title": "Groceries and Related Products, Not Elsewhere Classified",
                  "fullTitle": "5149 - Groceries and Related Products, Not Elsewhere Classified"
              },
              {
                  "id": "5153",
                  "title": "Grain and Field Beans",
                  "fullTitle": "5153 - Grain and Field Beans"
              },
              {
                  "id": "5154",
                  "title": "Livestock",
                  "fullTitle": "5154 - Livestock"
              },
              {
                  "id": "5159",
                  "title": "Farm-Product Raw Materials, not elsewhere classified",
                  "fullTitle": "5159 - Farm-Product Raw Materials, not elsewhere classified"
              },
              {
                  "id": "5162",
                  "title": "Plastics Materials and Basic Forms and Shapes",
                  "fullTitle": "5162 - Plastics Materials and Basic Forms and Shapes"
              },
              {
                  "id": "5169",
                  "title": "Chemicals and Allied Products, Not Elsewhere Classified",
                  "fullTitle": "5169 - Chemicals and Allied Products, Not Elsewhere Classified"
              },
              {
                  "id": "5171",
                  "title": "Petroleum Bulk stations and Terminals",
                  "fullTitle": "5171 - Petroleum Bulk stations and Terminals"
              },
              {
                  "id": "5172",
                  "title": "Petroleum and Petroleum Products Wholesalers, Except Bulk Stations and Terminals",
                  "fullTitle": "5172 - Petroleum and Petroleum Products Wholesalers, Except Bulk Stations and Terminals"
              },
              {
                  "id": "5181",
                  "title": "Beer and Ale",
                  "fullTitle": "5181 - Beer and Ale"
              },
              {
                  "id": "5182",
                  "title": "Wine and Distilled Alcoholic Beverages",
                  "fullTitle": "5182 - Wine and Distilled Alcoholic Beverages"
              },
              {
                  "id": "5191",
                  "title": "Farm Supplies",
                  "fullTitle": "5191 - Farm Supplies"
              },
              {
                  "id": "5192",
                  "title": "Books, Periodicals, and Newspapers",
                  "fullTitle": "5192 - Books, Periodicals, and Newspapers"
              },
              {
                  "id": "5193",
                  "title": "Flowers, Nursery Stock, and Florists' Supplies",
                  "fullTitle": "5193 - Flowers, Nursery Stock, and Florists' Supplies"
              },
              {
                  "id": "5194",
                  "title": "Tobacco and Tobacco Products",
                  "fullTitle": "5194 - Tobacco and Tobacco Products"
              },
              {
                  "id": "5198",
                  "title": "Paints, Varnishes, and Supplies",
                  "fullTitle": "5198 - Paints, Varnishes, and Supplies"
              },
              {
                  "id": "5199",
                  "title": "Nondurable Goods, Not Elsewhere Classified",
                  "fullTitle": "5199 - Nondurable Goods, Not Elsewhere Classified"
              },
              {
                  "id": "5211",
                  "title": "Lumber and Other Building Materials Dealers",
                  "fullTitle": "5211 - Lumber and Other Building Materials Dealers"
              },
              {
                  "id": "5231",
                  "title": "Paint, Glass, and Wallpaper Stores",
                  "fullTitle": "5231 - Paint, Glass, and Wallpaper Stores"
              },
              {
                  "id": "5251",
                  "title": "Hardware Stores",
                  "fullTitle": "5251 - Hardware Stores"
              },
              {
                  "id": "5261",
                  "title": "Retail Nurseries, Lawn and Garden Supply Stores",
                  "fullTitle": "5261 - Retail Nurseries, Lawn and Garden Supply Stores"
              },
              {
                  "id": "5271",
                  "title": "Mobile Home Dealers",
                  "fullTitle": "5271 - Mobile Home Dealers"
              },
              {
                  "id": "5311",
                  "title": "Department Stores",
                  "fullTitle": "5311 - Department Stores"
              },
              {
                  "id": "5331",
                  "title": "Variety Stores",
                  "fullTitle": "5331 - Variety Stores"
              },
              {
                  "id": "5399",
                  "title": "Miscellaneous General Merchandise Stores",
                  "fullTitle": "5399 - Miscellaneous General Merchandise Stores"
              },
              {
                  "id": "5411",
                  "title": "Grocery Stores",
                  "fullTitle": "5411 - Grocery Stores"
              },
              {
                  "id": "5421",
                  "title": "Meat and Fish (Seafood) Markets, Including Freezer Provisioners",
                  "fullTitle": "5421 - Meat and Fish (Seafood) Markets, Including Freezer Provisioners"
              },
              {
                  "id": "5431",
                  "title": "Fruit and Vegetable Markets",
                  "fullTitle": "5431 - Fruit and Vegetable Markets"
              },
              {
                  "id": "5441",
                  "title": "Candy, Nut, and Confectionery Stores",
                  "fullTitle": "5441 - Candy, Nut, and Confectionery Stores"
              },
              {
                  "id": "5451",
                  "title": "Dairy Products Stores",
                  "fullTitle": "5451 - Dairy Products Stores"
              },
              {
                  "id": "5461",
                  "title": "Retail Bakeries",
                  "fullTitle": "5461 - Retail Bakeries"
              },
              {
                  "id": "5499",
                  "title": "Miscellaneous Food Stores",
                  "fullTitle": "5499 - Miscellaneous Food Stores"
              },
              {
                  "id": "5511",
                  "title": "Motor Vehicle Dealers (New and Used)",
                  "fullTitle": "5511 - Motor Vehicle Dealers (New and Used)"
              },
              {
                  "id": "5521",
                  "title": "Motor Vehicle Dealers (Used only)",
                  "fullTitle": "5521 - Motor Vehicle Dealers (Used only)"
              },
              {
                  "id": "5531",
                  "title": "Auto and Home Supply Stores",
                  "fullTitle": "5531 - Auto and Home Supply Stores"
              },
              {
                  "id": "5541",
                  "title": "Gasoline Service Stations",
                  "fullTitle": "5541 - Gasoline Service Stations"
              },
              {
                  "id": "5551",
                  "title": "Boat Dealers",
                  "fullTitle": "5551 - Boat Dealers"
              },
              {
                  "id": "5561",
                  "title": "Recreational Vehicle Dealers",
                  "fullTitle": "5561 - Recreational Vehicle Dealers"
              },
              {
                  "id": "5571",
                  "title": "Motorcycle Dealers",
                  "fullTitle": "5571 - Motorcycle Dealers"
              },
              {
                  "id": "5599",
                  "title": "Automotive Dealers, Not Elsewhere Classified",
                  "fullTitle": "5599 - Automotive Dealers, Not Elsewhere Classified"
              },
              {
                  "id": "5611",
                  "title": "Men's and Boys' Clothing and Accessory Stores",
                  "fullTitle": "5611 - Men's and Boys' Clothing and Accessory Stores"
              },
              {
                  "id": "5621",
                  "title": "Women's Clothing Stores",
                  "fullTitle": "5621 - Women's Clothing Stores"
              },
              {
                  "id": "5632",
                  "title": "Women's Accessory and Specialty Stores",
                  "fullTitle": "5632 - Women's Accessory and Specialty Stores"
              },
              {
                  "id": "5641",
                  "title": "Children's and Infants' Wear Stores",
                  "fullTitle": "5641 - Children's and Infants' Wear Stores"
              },
              {
                  "id": "5651",
                  "title": "Family Clothing Stores",
                  "fullTitle": "5651 - Family Clothing Stores"
              },
              {
                  "id": "5661",
                  "title": "Shoe Stores",
                  "fullTitle": "5661 - Shoe Stores"
              },
              {
                  "id": "5699",
                  "title": "Miscellaneous Apparel and Accessory Stores",
                  "fullTitle": "5699 - Miscellaneous Apparel and Accessory Stores"
              },
              {
                  "id": "5712",
                  "title": "Furniture Stores",
                  "fullTitle": "5712 - Furniture Stores"
              },
              {
                  "id": "5713",
                  "title": "Floor Covering Stores",
                  "fullTitle": "5713 - Floor Covering Stores"
              },
              {
                  "id": "5714",
                  "title": "Drapery, Curtain, and Upholstery Stores",
                  "fullTitle": "5714 - Drapery, Curtain, and Upholstery Stores"
              },
              {
                  "id": "5719",
                  "title": "Miscellaneous home furnishings Stores",
                  "fullTitle": "5719 - Miscellaneous home furnishings Stores"
              },
              {
                  "id": "5722",
                  "title": "Household Appliance Stores",
                  "fullTitle": "5722 - Household Appliance Stores"
              },
              {
                  "id": "5731",
                  "title": "Radio, Television, and Consumer Electronics Stores",
                  "fullTitle": "5731 - Radio, Television, and Consumer Electronics Stores"
              },
              {
                  "id": "5734",
                  "title": "Computer and Computer Software Stores",
                  "fullTitle": "5734 - Computer and Computer Software Stores"
              },
              {
                  "id": "5735",
                  "title": "Record and Prerecorded Tape Stores",
                  "fullTitle": "5735 - Record and Prerecorded Tape Stores"
              },
              {
                  "id": "5736",
                  "title": "Musical Instrument Stores",
                  "fullTitle": "5736 - Musical Instrument Stores"
              },
              {
                  "id": "5812",
                  "title": "Eating Places",
                  "fullTitle": "5812 - Eating Places"
              },
              {
                  "id": "5813",
                  "title": "Drinking Places (Alcoholic Beverages)",
                  "fullTitle": "5813 - Drinking Places (Alcoholic Beverages)"
              },
              {
                  "id": "5912",
                  "title": "Drug Stores and Proprietary Stores",
                  "fullTitle": "5912 - Drug Stores and Proprietary Stores"
              },
              {
                  "id": "5921",
                  "title": "Liquor Stores",
                  "fullTitle": "5921 - Liquor Stores"
              },
              {
                  "id": "5932",
                  "title": "Used Merchandise Stores",
                  "fullTitle": "5932 - Used Merchandise Stores"
              },
              {
                  "id": "5941",
                  "title": "Sporting Goods Stores and Bicycle Shops",
                  "fullTitle": "5941 - Sporting Goods Stores and Bicycle Shops"
              },
              {
                  "id": "5942",
                  "title": "Book Stores",
                  "fullTitle": "5942 - Book Stores"
              },
              {
                  "id": "5943",
                  "title": "Stationery Stores",
                  "fullTitle": "5943 - Stationery Stores"
              },
              {
                  "id": "5944",
                  "title": "Jewelry Stores",
                  "fullTitle": "5944 - Jewelry Stores"
              },
              {
                  "id": "5945",
                  "title": "Hobby, Toy, and Game Shops",
                  "fullTitle": "5945 - Hobby, Toy, and Game Shops"
              },
              {
                  "id": "5946",
                  "title": "Camera and Photographic Supply Stores",
                  "fullTitle": "5946 - Camera and Photographic Supply Stores"
              },
              {
                  "id": "5947",
                  "title": "Gift, Novelty, and Souvenir Shops",
                  "fullTitle": "5947 - Gift, Novelty, and Souvenir Shops"
              },
              {
                  "id": "5948",
                  "title": "Luggage and Leather Goods Stores",
                  "fullTitle": "5948 - Luggage and Leather Goods Stores"
              },
              {
                  "id": "5949",
                  "title": "Sewing, Needlework, and Piece Goods Stores",
                  "fullTitle": "5949 - Sewing, Needlework, and Piece Goods Stores"
              },
              {
                  "id": "5961",
                  "title": "Catalog and Mail",
                  "fullTitle": "5961 - Catalog and Mail"
              },
              {
                  "id": "5962",
                  "title": "Automatic Merchandising Machine Operators",
                  "fullTitle": "5962 - Automatic Merchandising Machine Operators"
              },
              {
                  "id": "5963",
                  "title": "Direct Selling Establishments",
                  "fullTitle": "5963 - Direct Selling Establishments"
              },
              {
                  "id": "5983",
                  "title": "Fuel Oil Dealers",
                  "fullTitle": "5983 - Fuel Oil Dealers"
              },
              {
                  "id": "5984",
                  "title": "Liquefied Petroleum Gas (Bottled Gas) Dealers",
                  "fullTitle": "5984 - Liquefied Petroleum Gas (Bottled Gas) Dealers"
              },
              {
                  "id": "5989",
                  "title": "Fuel Dealers, Not Elsewhere Classified",
                  "fullTitle": "5989 - Fuel Dealers, Not Elsewhere Classified"
              },
              {
                  "id": "5992",
                  "title": "Florists",
                  "fullTitle": "5992 - Florists"
              },
              {
                  "id": "5993",
                  "title": "Tobacco Stores and Stands",
                  "fullTitle": "5993 - Tobacco Stores and Stands"
              },
              {
                  "id": "5994",
                  "title": "News Dealers and Newsstands",
                  "fullTitle": "5994 - News Dealers and Newsstands"
              },
              {
                  "id": "5995",
                  "title": "Optical Goods Stores",
                  "fullTitle": "5995 - Optical Goods Stores"
              },
              {
                  "id": "5999",
                  "title": "Miscellaneous Retail Stores, Not Elsewhere Classified",
                  "fullTitle": "5999 - Miscellaneous Retail Stores, Not Elsewhere Classified"
              },
              {
                  "id": "6011",
                  "title": "Federal Reserve Banks",
                  "fullTitle": "6011 - Federal Reserve Banks"
              },
              {
                  "id": "6019",
                  "title": "Central Reserve Depository Institutions, Not Elsewhere Classified",
                  "fullTitle": "6019 - Central Reserve Depository Institutions, Not Elsewhere Classified"
              },
              {
                  "id": "6021",
                  "title": "National Commercial Banks",
                  "fullTitle": "6021 - National Commercial Banks"
              },
              {
                  "id": "6022",
                  "title": "State Commercial Banks",
                  "fullTitle": "6022 - State Commercial Banks"
              },
              {
                  "id": "6029",
                  "title": "Commercial Banks, Not Elsewhere Classified",
                  "fullTitle": "6029 - Commercial Banks, Not Elsewhere Classified"
              },
              {
                  "id": "6035",
                  "title": "Savings Institutions, Federally Chartered",
                  "fullTitle": "6035 - Savings Institutions, Federally Chartered"
              },
              {
                  "id": "6036",
                  "title": "Savings Institutions, Not Federally Chartered",
                  "fullTitle": "6036 - Savings Institutions, Not Federally Chartered"
              },
              {
                  "id": "6061",
                  "title": "Credit Unions, Federally Chartered",
                  "fullTitle": "6061 - Credit Unions, Federally Chartered"
              },
              {
                  "id": "6062",
                  "title": "Credit Unions, Not Federally Chartered",
                  "fullTitle": "6062 - Credit Unions, Not Federally Chartered"
              },
              {
                  "id": "6081",
                  "title": "Branches and Agencies of Foreign Banks",
                  "fullTitle": "6081 - Branches and Agencies of Foreign Banks"
              },
              {
                  "id": "6082",
                  "title": "Foreign Trade and International Banking Institutions",
                  "fullTitle": "6082 - Foreign Trade and International Banking Institutions"
              },
              {
                  "id": "6091",
                  "title": "Non-deposit Trust Facilities",
                  "fullTitle": "6091 - Non-deposit Trust Facilities"
              },
              {
                  "id": "6099",
                  "title": "Functions Related to Depository Banking, Not Elsewhere Classified",
                  "fullTitle": "6099 - Functions Related to Depository Banking, Not Elsewhere Classified"
              },
              {
                  "id": "6111",
                  "title": "Federal and Federally-Sponsored Credit Agencies",
                  "fullTitle": "6111 - Federal and Federally-Sponsored Credit Agencies"
              },
              {
                  "id": "6141",
                  "title": "Personal Credit Institutions",
                  "fullTitle": "6141 - Personal Credit Institutions"
              },
              {
                  "id": "6153",
                  "title": "Short-Term Business Credit Institutions, except Agricultural",
                  "fullTitle": "6153 - Short-Term Business Credit Institutions, except Agricultural"
              },
              {
                  "id": "6159",
                  "title": "Miscellaneous Business Credit Institutions",
                  "fullTitle": "6159 - Miscellaneous Business Credit Institutions"
              },
              {
                  "id": "6162",
                  "title": "Mortgage Bankers and Loan Correspondents",
                  "fullTitle": "6162 - Mortgage Bankers and Loan Correspondents"
              },
              {
                  "id": "6163",
                  "title": "Loan Brokers",
                  "fullTitle": "6163 - Loan Brokers"
              },
              {
                  "id": "6211",
                  "title": "Security Brokers, Dealers, and Flotation Companies",
                  "fullTitle": "6211 - Security Brokers, Dealers, and Flotation Companies"
              },
              {
                  "id": "6221",
                  "title": "Commodity Contracts Brokers and Dealers",
                  "fullTitle": "6221 - Commodity Contracts Brokers and Dealers"
              },
              {
                  "id": "6231",
                  "title": "Security and Commodity Exchanges",
                  "fullTitle": "6231 - Security and Commodity Exchanges"
              },
              {
                  "id": "6282",
                  "title": "Investment Advice",
                  "fullTitle": "6282 - Investment Advice"
              },
              {
                  "id": "6289",
                  "title": "Services Allied With the Exchange of Securities or Commodities, Not Elsewhere Classified",
                  "fullTitle": "6289 - Services Allied With the Exchange of Securities or Commodities, Not Elsewhere Classified"
              },
              {
                  "id": "6311",
                  "title": "Life Insurance",
                  "fullTitle": "6311 - Life Insurance"
              },
              {
                  "id": "6321",
                  "title": "Accident and Health Insurance",
                  "fullTitle": "6321 - Accident and Health Insurance"
              },
              {
                  "id": "6324",
                  "title": "Hospital and Medical Service Plans",
                  "fullTitle": "6324 - Hospital and Medical Service Plans"
              },
              {
                  "id": "6331",
                  "title": "Fire, Marine, and Casualty Insurance",
                  "fullTitle": "6331 - Fire, Marine, and Casualty Insurance"
              },
              {
                  "id": "6351",
                  "title": "Surety Insurance",
                  "fullTitle": "6351 - Surety Insurance"
              },
              {
                  "id": "6361",
                  "title": "Title Insurance",
                  "fullTitle": "6361 - Title Insurance"
              },
              {
                  "id": "6371",
                  "title": "Pension, Health, and Welfare Funds",
                  "fullTitle": "6371 - Pension, Health, and Welfare Funds"
              },
              {
                  "id": "6399",
                  "title": "Insurance Carriers, Not Elsewhere Classified",
                  "fullTitle": "6399 - Insurance Carriers, Not Elsewhere Classified"
              },
              {
                  "id": "6411",
                  "title": "Insurance Agents, Brokers, and Service",
                  "fullTitle": "6411 - Insurance Agents, Brokers, and Service"
              },
              {
                  "id": "6512",
                  "title": "Operators of Nonresidential Buildings",
                  "fullTitle": "6512 - Operators of Nonresidential Buildings"
              },
              {
                  "id": "6513",
                  "title": "Operators or Apartment Buildings",
                  "fullTitle": "6513 - Operators or Apartment Buildings"
              },
              {
                  "id": "6514",
                  "title": "Operators of Dwellings Other Than Apartment Buildings",
                  "fullTitle": "6514 - Operators of Dwellings Other Than Apartment Buildings"
              },
              {
                  "id": "6515",
                  "title": "Operators of Residential Mobile Home Sites",
                  "fullTitle": "6515 - Operators of Residential Mobile Home Sites"
              },
              {
                  "id": "6517",
                  "title": "Lessors of Railroad Property",
                  "fullTitle": "6517 - Lessors of Railroad Property"
              },
              {
                  "id": "6519",
                  "title": "Lessors of Real Property, Not Elsewhere Classified",
                  "fullTitle": "6519 - Lessors of Real Property, Not Elsewhere Classified"
              },
              {
                  "id": "6531",
                  "title": "Real Estate Agents and Managers",
                  "fullTitle": "6531 - Real Estate Agents and Managers"
              },
              {
                  "id": "6541",
                  "title": "Title Abstract Offices",
                  "fullTitle": "6541 - Title Abstract Offices"
              },
              {
                  "id": "6552",
                  "title": "Land Subdividers and Developers, Except Cemeteries",
                  "fullTitle": "6552 - Land Subdividers and Developers, Except Cemeteries"
              },
              {
                  "id": "6553",
                  "title": "Cemetery Subdividers and Developers",
                  "fullTitle": "6553 - Cemetery Subdividers and Developers"
              },
              {
                  "id": "6712",
                  "title": "Offices of Bank Holding Companies",
                  "fullTitle": "6712 - Offices of Bank Holding Companies"
              },
              {
                  "id": "6719",
                  "title": "Offices of Holding Companies, Not Elsewhere Classified",
                  "fullTitle": "6719 - Offices of Holding Companies, Not Elsewhere Classified"
              },
              {
                  "id": "6722",
                  "title": "Management Investment Offices, Open",
                  "fullTitle": "6722 - Management Investment Offices, Open"
              },
              {
                  "id": "6726",
                  "title": "Unit Investment Trusts, Face-Amount Certificate Offices, and Closed-End Management Investment Offices",
                  "fullTitle": "6726 - Unit Investment Trusts, Face-Amount Certificate Offices, and Closed-End Management Investment Offices"
              },
              {
                  "id": "6732",
                  "title": "Educational, Religious, and Charitable Trusts",
                  "fullTitle": "6732 - Educational, Religious, and Charitable Trusts"
              },
              {
                  "id": "6733",
                  "title": "Trusts, Except Educational, Religious, and Charitable",
                  "fullTitle": "6733 - Trusts, Except Educational, Religious, and Charitable"
              },
              {
                  "id": "6792",
                  "title": "Oil Royalty Traders",
                  "fullTitle": "6792 - Oil Royalty Traders"
              },
              {
                  "id": "6794",
                  "title": "Patent Owners and Lessors",
                  "fullTitle": "6794 - Patent Owners and Lessors"
              },
              {
                  "id": "6798",
                  "title": "Real Estate Investment Trusts",
                  "fullTitle": "6798 - Real Estate Investment Trusts"
              },
              {
                  "id": "6799",
                  "title": "Investors, Not Elsewhere Classified",
                  "fullTitle": "6799 - Investors, Not Elsewhere Classified"
              },
              {
                  "id": "7011",
                  "title": "Hotels and Motels",
                  "fullTitle": "7011 - Hotels and Motels"
              },
              {
                  "id": "7021",
                  "title": "Rooming and Boarding Houses",
                  "fullTitle": "7021 - Rooming and Boarding Houses"
              },
              {
                  "id": "7032",
                  "title": "Sporting and Recreational Camps",
                  "fullTitle": "7032 - Sporting and Recreational Camps"
              },
              {
                  "id": "7033",
                  "title": "Recreational Vehicle Parks and Campsites",
                  "fullTitle": "7033 - Recreational Vehicle Parks and Campsites"
              },
              {
                  "id": "7041",
                  "title": "Organization Hotels and Lodging Houses, on Membership Basis",
                  "fullTitle": "7041 - Organization Hotels and Lodging Houses, on Membership Basis"
              },
              {
                  "id": "7211",
                  "title": "Power Laundries, Family and Commercial",
                  "fullTitle": "7211 - Power Laundries, Family and Commercial"
              },
              {
                  "id": "7212",
                  "title": "Garment Pressing, and Agents for Laundries and Drycleaners",
                  "fullTitle": "7212 - Garment Pressing, and Agents for Laundries and Drycleaners"
              },
              {
                  "id": "7213",
                  "title": "Linen Supply",
                  "fullTitle": "7213 - Linen Supply"
              },
              {
                  "id": "7215",
                  "title": "Coin-Operated Laundries and Drycleaning",
                  "fullTitle": "7215 - Coin-Operated Laundries and Drycleaning"
              },
              {
                  "id": "7216",
                  "title": "Drycleaning Plants, Except Rug Cleaning",
                  "fullTitle": "7216 - Drycleaning Plants, Except Rug Cleaning"
              },
              {
                  "id": "7217",
                  "title": "Carpet and Upholstery Cleaning",
                  "fullTitle": "7217 - Carpet and Upholstery Cleaning"
              },
              {
                  "id": "7218",
                  "title": "Industrial Launderers",
                  "fullTitle": "7218 - Industrial Launderers"
              },
              {
                  "id": "7219",
                  "title": "Laundry and Garment Services, Not Elsewhere Classified",
                  "fullTitle": "7219 - Laundry and Garment Services, Not Elsewhere Classified"
              },
              {
                  "id": "7221",
                  "title": "Photographic Studios, Portrait",
                  "fullTitle": "7221 - Photographic Studios, Portrait"
              },
              {
                  "id": "7231",
                  "title": "Beauty Shops",
                  "fullTitle": "7231 - Beauty Shops"
              },
              {
                  "id": "7241",
                  "title": "Barber Shops",
                  "fullTitle": "7241 - Barber Shops"
              },
              {
                  "id": "7251",
                  "title": "Shoe Repair Shops and Shoeshine Parlors",
                  "fullTitle": "7251 - Shoe Repair Shops and Shoeshine Parlors"
              },
              {
                  "id": "7261",
                  "title": "Funeral Service and Crematories",
                  "fullTitle": "7261 - Funeral Service and Crematories"
              },
              {
                  "id": "7291",
                  "title": "Tax Return Preparation Services",
                  "fullTitle": "7291 - Tax Return Preparation Services"
              },
              {
                  "id": "7299",
                  "title": "Miscellaneous Personal Services, Not Elsewhere Classified",
                  "fullTitle": "7299 - Miscellaneous Personal Services, Not Elsewhere Classified"
              },
              {
                  "id": "7311",
                  "title": "Advertising Agencies",
                  "fullTitle": "7311 - Advertising Agencies"
              },
              {
                  "id": "7312",
                  "title": "Outdoor Advertising Services",
                  "fullTitle": "7312 - Outdoor Advertising Services"
              },
              {
                  "id": "7313",
                  "title": "Radio, Television, and Publishers' Advertising Representatives",
                  "fullTitle": "7313 - Radio, Television, and Publishers' Advertising Representatives"
              },
              {
                  "id": "7319",
                  "title": "Advertising, Not Elsewhere Classified",
                  "fullTitle": "7319 - Advertising, Not Elsewhere Classified"
              },
              {
                  "id": "7322",
                  "title": "Adjustment and Collection Services",
                  "fullTitle": "7322 - Adjustment and Collection Services"
              },
              {
                  "id": "7323",
                  "title": "Credit Reporting Services",
                  "fullTitle": "7323 - Credit Reporting Services"
              },
              {
                  "id": "7331",
                  "title": "Direct Mail Advertising Services",
                  "fullTitle": "7331 - Direct Mail Advertising Services"
              },
              {
                  "id": "7334",
                  "title": "Photocopying and Duplicating Services",
                  "fullTitle": "7334 - Photocopying and Duplicating Services"
              },
              {
                  "id": "7335",
                  "title": "Commercial Photography",
                  "fullTitle": "7335 - Commercial Photography"
              },
              {
                  "id": "7336",
                  "title": "Commercial Art and Graphic Design",
                  "fullTitle": "7336 - Commercial Art and Graphic Design"
              },
              {
                  "id": "7338",
                  "title": "Secretarial and Court Reporting Services",
                  "fullTitle": "7338 - Secretarial and Court Reporting Services"
              },
              {
                  "id": "7342",
                  "title": "Disinfecting and Pest Control Services",
                  "fullTitle": "7342 - Disinfecting and Pest Control Services"
              },
              {
                  "id": "7349",
                  "title": "Building Cleaning and Maintenance Services, Not Elsewhere Classified",
                  "fullTitle": "7349 - Building Cleaning and Maintenance Services, Not Elsewhere Classified"
              },
              {
                  "id": "7352",
                  "title": "Medical Equipment Rental and Leasing",
                  "fullTitle": "7352 - Medical Equipment Rental and Leasing"
              },
              {
                  "id": "7353",
                  "title": "Heavy Construction Equipment Rental and Leasing",
                  "fullTitle": "7353 - Heavy Construction Equipment Rental and Leasing"
              },
              {
                  "id": "7359",
                  "title": "Equipment Rental and Leasing, Not Elsewhere Classified",
                  "fullTitle": "7359 - Equipment Rental and Leasing, Not Elsewhere Classified"
              },
              {
                  "id": "7361",
                  "title": "Employment Agencies",
                  "fullTitle": "7361 - Employment Agencies"
              },
              {
                  "id": "7363",
                  "title": "Help Supply Services",
                  "fullTitle": "7363 - Help Supply Services"
              },
              {
                  "id": "7371",
                  "title": "Computer Programming Services",
                  "fullTitle": "7371 - Computer Programming Services"
              },
              {
                  "id": "7372",
                  "title": "Prepackaged Software",
                  "fullTitle": "7372 - Prepackaged Software"
              },
              {
                  "id": "7373",
                  "title": "Computer Integrated Systems Design",
                  "fullTitle": "7373 - Computer Integrated Systems Design"
              },
              {
                  "id": "7374",
                  "title": "Computer Processing and Data Preparation and Processing Services",
                  "fullTitle": "7374 - Computer Processing and Data Preparation and Processing Services"
              },
              {
                  "id": "7375",
                  "title": "Information Retrieval Services",
                  "fullTitle": "7375 - Information Retrieval Services"
              },
              {
                  "id": "7376",
                  "title": "Computer Facilities Management Services",
                  "fullTitle": "7376 - Computer Facilities Management Services"
              },
              {
                  "id": "7377",
                  "title": "Computer Rental and Leasing",
                  "fullTitle": "7377 - Computer Rental and Leasing"
              },
              {
                  "id": "7378",
                  "title": "Computer Maintenance and Repair",
                  "fullTitle": "7378 - Computer Maintenance and Repair"
              },
              {
                  "id": "7379",
                  "title": "Computer Related Services, Not Elsewhere Classified",
                  "fullTitle": "7379 - Computer Related Services, Not Elsewhere Classified"
              },
              {
                  "id": "7381",
                  "title": "Detective, Guard, and Armored Car Services",
                  "fullTitle": "7381 - Detective, Guard, and Armored Car Services"
              },
              {
                  "id": "7382",
                  "title": "Security Systems Services",
                  "fullTitle": "7382 - Security Systems Services"
              },
              {
                  "id": "7383",
                  "title": "News Syndicates",
                  "fullTitle": "7383 - News Syndicates"
              },
              {
                  "id": "7384",
                  "title": "Photofinishing Laboratories",
                  "fullTitle": "7384 - Photofinishing Laboratories"
              },
              {
                  "id": "7389",
                  "title": "Business Services, Not Elsewhere Classified",
                  "fullTitle": "7389 - Business Services, Not Elsewhere Classified"
              },
              {
                  "id": "7513",
                  "title": "Truck Rental and Leasing, Without Drivers",
                  "fullTitle": "7513 - Truck Rental and Leasing, Without Drivers"
              },
              {
                  "id": "7514",
                  "title": "Passenger Car Rental",
                  "fullTitle": "7514 - Passenger Car Rental"
              },
              {
                  "id": "7515",
                  "title": "Passenger Car Leasing",
                  "fullTitle": "7515 - Passenger Car Leasing"
              },
              {
                  "id": "7519",
                  "title": "Utility Trailer and Recreational Vehicle Rental",
                  "fullTitle": "7519 - Utility Trailer and Recreational Vehicle Rental"
              },
              {
                  "id": "7521",
                  "title": "Automobile Parking",
                  "fullTitle": "7521 - Automobile Parking"
              },
              {
                  "id": "7532",
                  "title": "Top, Body, and Upholstery Repair Shops and Paint Shops",
                  "fullTitle": "7532 - Top, Body, and Upholstery Repair Shops and Paint Shops"
              },
              {
                  "id": "7533",
                  "title": "Automotive Exhaust System Repair Shops",
                  "fullTitle": "7533 - Automotive Exhaust System Repair Shops"
              },
              {
                  "id": "7534",
                  "title": "Tire Retreading and Repair Shops",
                  "fullTitle": "7534 - Tire Retreading and Repair Shops"
              },
              {
                  "id": "7536",
                  "title": "Automotive Glass Replacement Shops",
                  "fullTitle": "7536 - Automotive Glass Replacement Shops"
              },
              {
                  "id": "7537",
                  "title": "Automotive Transmission Repair Shops",
                  "fullTitle": "7537 - Automotive Transmission Repair Shops"
              },
              {
                  "id": "7538",
                  "title": "General Automotive Repair Shops",
                  "fullTitle": "7538 - General Automotive Repair Shops"
              },
              {
                  "id": "7539",
                  "title": "Automotive Repair Shops, Not Elsewhere Classified",
                  "fullTitle": "7539 - Automotive Repair Shops, Not Elsewhere Classified"
              },
              {
                  "id": "7542",
                  "title": "Carwashes",
                  "fullTitle": "7542 - Carwashes"
              },
              {
                  "id": "7549",
                  "title": "Automotive Services, Except Repair and Carwashes",
                  "fullTitle": "7549 - Automotive Services, Except Repair and Carwashes"
              },
              {
                  "id": "7622",
                  "title": "Radio and Television Repair Shops",
                  "fullTitle": "7622 - Radio and Television Repair Shops"
              },
              {
                  "id": "7623",
                  "title": "Refrigeration and Air-conditioning Service and Repair Shops",
                  "fullTitle": "7623 - Refrigeration and Air-conditioning Service and Repair Shops"
              },
              {
                  "id": "7629",
                  "title": "Electrical and Electronic Repair Shops, Not Elsewhere Classified",
                  "fullTitle": "7629 - Electrical and Electronic Repair Shops, Not Elsewhere Classified"
              },
              {
                  "id": "7631",
                  "title": "Watch, Clock, and Jewelry Repair",
                  "fullTitle": "7631 - Watch, Clock, and Jewelry Repair"
              },
              {
                  "id": "7641",
                  "title": "Reupholstery and Furniture Repair",
                  "fullTitle": "7641 - Reupholstery and Furniture Repair"
              },
              {
                  "id": "7692",
                  "title": "Welding Repair",
                  "fullTitle": "7692 - Welding Repair"
              },
              {
                  "id": "7694",
                  "title": "Armature Rewinding Shops",
                  "fullTitle": "7694 - Armature Rewinding Shops"
              },
              {
                  "id": "7699",
                  "title": "Repair Shops and Related Services, Not Elsewhere Classified",
                  "fullTitle": "7699 - Repair Shops and Related Services, Not Elsewhere Classified"
              },
              {
                  "id": "7812",
                  "title": "Motion Picture and Video Tape Production",
                  "fullTitle": "7812 - Motion Picture and Video Tape Production"
              },
              {
                  "id": "7819",
                  "title": "Services Allied to Motion Picture Production",
                  "fullTitle": "7819 - Services Allied to Motion Picture Production"
              },
              {
                  "id": "7822",
                  "title": "Motion Picture and Video Tape Distribution",
                  "fullTitle": "7822 - Motion Picture and Video Tape Distribution"
              },
              {
                  "id": "7829",
                  "title": "Services Allied to Motion Picture Distribution",
                  "fullTitle": "7829 - Services Allied to Motion Picture Distribution"
              },
              {
                  "id": "7832",
                  "title": "Motion Picture Theaters, Except Drive",
                  "fullTitle": "7832 - Motion Picture Theaters, Except Drive"
              },
              {
                  "id": "7833",
                  "title": "Drive-In Motion Picture Theaters",
                  "fullTitle": "7833 - Drive-In Motion Picture Theaters"
              },
              {
                  "id": "7841",
                  "title": "Video Tape Rental",
                  "fullTitle": "7841 - Video Tape Rental"
              },
              {
                  "id": "7911",
                  "title": "Dance Studios, Schools, and Halls",
                  "fullTitle": "7911 - Dance Studios, Schools, and Halls"
              },
              {
                  "id": "7922",
                  "title": "Theatrical Producers (Except Motion Picture) and Miscellaneous Theatrical Services",
                  "fullTitle": "7922 - Theatrical Producers (Except Motion Picture) and Miscellaneous Theatrical Services"
              },
              {
                  "id": "7929",
                  "title": "Bands, Orchestras, Actors, and Other Entertainers and Entertainment Groups",
                  "fullTitle": "7929 - Bands, Orchestras, Actors, and Other Entertainers and Entertainment Groups"
              },
              {
                  "id": "7933",
                  "title": "Bowling Centers",
                  "fullTitle": "7933 - Bowling Centers"
              },
              {
                  "id": "7941",
                  "title": "Professional Sports Clubs and Promoters",
                  "fullTitle": "7941 - Professional Sports Clubs and Promoters"
              },
              {
                  "id": "7948",
                  "title": "Racing, Including Track Operation",
                  "fullTitle": "7948 - Racing, Including Track Operation"
              },
              {
                  "id": "7991",
                  "title": "Physical Fitness Facilities",
                  "fullTitle": "7991 - Physical Fitness Facilities"
              },
              {
                  "id": "7992",
                  "title": "Public Golf Courses",
                  "fullTitle": "7992 - Public Golf Courses"
              },
              {
                  "id": "7993",
                  "title": "Coin-Operated Amusement Devices",
                  "fullTitle": "7993 - Coin-Operated Amusement Devices"
              },
              {
                  "id": "7996",
                  "title": "Amusement Parks",
                  "fullTitle": "7996 - Amusement Parks"
              },
              {
                  "id": "7997",
                  "title": "Membership Sports and Recreation Clubs",
                  "fullTitle": "7997 - Membership Sports and Recreation Clubs"
              },
              {
                  "id": "7999",
                  "title": "Amusement and Recreation Services, Not Elsewhere Classified",
                  "fullTitle": "7999 - Amusement and Recreation Services, Not Elsewhere Classified"
              },
              {
                  "id": "8011",
                  "title": "Offices and Clinics of Doctors of Medicine",
                  "fullTitle": "8011 - Offices and Clinics of Doctors of Medicine"
              },
              {
                  "id": "8021",
                  "title": "Offices and Clinics of Dentists",
                  "fullTitle": "8021 - Offices and Clinics of Dentists"
              },
              {
                  "id": "8031",
                  "title": "Offices and Clinics of Doctors of Osteopathy",
                  "fullTitle": "8031 - Offices and Clinics of Doctors of Osteopathy"
              },
              {
                  "id": "8041",
                  "title": "Offices and Clinics of Chiropractors",
                  "fullTitle": "8041 - Offices and Clinics of Chiropractors"
              },
              {
                  "id": "8042",
                  "title": "Offices and Clinics of Optometrists",
                  "fullTitle": "8042 - Offices and Clinics of Optometrists"
              },
              {
                  "id": "8043",
                  "title": "Offices and Clinics of Podiatrists",
                  "fullTitle": "8043 - Offices and Clinics of Podiatrists"
              },
              {
                  "id": "8049",
                  "title": "Offices and Clinics of Health Practitioners, Not Elsewhere Classified",
                  "fullTitle": "8049 - Offices and Clinics of Health Practitioners, Not Elsewhere Classified"
              },
              {
                  "id": "8051",
                  "title": "Skilled Nursing Care Facilities",
                  "fullTitle": "8051 - Skilled Nursing Care Facilities"
              },
              {
                  "id": "8052",
                  "title": "Intermediate Care Facilities",
                  "fullTitle": "8052 - Intermediate Care Facilities"
              },
              {
                  "id": "8059",
                  "title": "Nursing and Personal Care Facilities, Not Elsewhere Classified",
                  "fullTitle": "8059 - Nursing and Personal Care Facilities, Not Elsewhere Classified"
              },
              {
                  "id": "8062",
                  "title": "General Medical and Surgical Hospitals",
                  "fullTitle": "8062 - General Medical and Surgical Hospitals"
              },
              {
                  "id": "8063",
                  "title": "Psychiatric Hospitals",
                  "fullTitle": "8063 - Psychiatric Hospitals"
              },
              {
                  "id": "8069",
                  "title": "Specialty Hospitals, Except Psychiatric",
                  "fullTitle": "8069 - Specialty Hospitals, Except Psychiatric"
              },
              {
                  "id": "8071",
                  "title": "Medical Laboratories",
                  "fullTitle": "8071 - Medical Laboratories"
              },
              {
                  "id": "8072",
                  "title": "Dental Laboratories",
                  "fullTitle": "8072 - Dental Laboratories"
              },
              {
                  "id": "8082",
                  "title": "Home Health Care Services",
                  "fullTitle": "8082 - Home Health Care Services"
              },
              {
                  "id": "8092",
                  "title": "Kidney Dialysis Centers",
                  "fullTitle": "8092 - Kidney Dialysis Centers"
              },
              {
                  "id": "8093",
                  "title": "Specialty Outpatient Facilities, Not Elsewhere Classified",
                  "fullTitle": "8093 - Specialty Outpatient Facilities, Not Elsewhere Classified"
              },
              {
                  "id": "8099",
                  "title": "Health and Allied Services, Not Elsewhere Classified",
                  "fullTitle": "8099 - Health and Allied Services, Not Elsewhere Classified"
              },
              {
                  "id": "8111",
                  "title": "Legal Services",
                  "fullTitle": "8111 - Legal Services"
              },
              {
                  "id": "8211",
                  "title": "Elementary and Secondary Schools",
                  "fullTitle": "8211 - Elementary and Secondary Schools"
              },
              {
                  "id": "8221",
                  "title": "Colleges, Universities, and Professional Schools",
                  "fullTitle": "8221 - Colleges, Universities, and Professional Schools"
              },
              {
                  "id": "8222",
                  "title": "Junior Colleges and Technical Institutes",
                  "fullTitle": "8222 - Junior Colleges and Technical Institutes"
              },
              {
                  "id": "8231",
                  "title": "Libraries",
                  "fullTitle": "8231 - Libraries"
              },
              {
                  "id": "8243",
                  "title": "Data Processing Schools",
                  "fullTitle": "8243 - Data Processing Schools"
              },
              {
                  "id": "8244",
                  "title": "Business and Secretarial Schools",
                  "fullTitle": "8244 - Business and Secretarial Schools"
              },
              {
                  "id": "8249",
                  "title": "Vocational Schools, Not Elsewhere Classified",
                  "fullTitle": "8249 - Vocational Schools, Not Elsewhere Classified"
              },
              {
                  "id": "8299",
                  "title": "Schools and Educational Services, Not Elsewhere Classified",
                  "fullTitle": "8299 - Schools and Educational Services, Not Elsewhere Classified"
              },
              {
                  "id": "8322",
                  "title": "Individual and Family Social Services",
                  "fullTitle": "8322 - Individual and Family Social Services"
              },
              {
                  "id": "8331",
                  "title": "Job Training and Vocational Rehabilitation Services",
                  "fullTitle": "8331 - Job Training and Vocational Rehabilitation Services"
              },
              {
                  "id": "8351",
                  "title": "Child Day Care Services",
                  "fullTitle": "8351 - Child Day Care Services"
              },
              {
                  "id": "8361",
                  "title": "Residential Care",
                  "fullTitle": "8361 - Residential Care"
              },
              {
                  "id": "8399",
                  "title": "Social Services, Not Elsewhere Classified",
                  "fullTitle": "8399 - Social Services, Not Elsewhere Classified"
              },
              {
                  "id": "8412",
                  "title": "Museums and Art Galleries",
                  "fullTitle": "8412 - Museums and Art Galleries"
              },
              {
                  "id": "8422",
                  "title": "Arboreta and Botanical or Zoological Gardens",
                  "fullTitle": "8422 - Arboreta and Botanical or Zoological Gardens"
              },
              {
                  "id": "8611",
                  "title": "Business Associations",
                  "fullTitle": "8611 - Business Associations"
              },
              {
                  "id": "8621",
                  "title": "Professional Membership Organizations",
                  "fullTitle": "8621 - Professional Membership Organizations"
              },
              {
                  "id": "8631",
                  "title": "Labor Unions and Similar Labor organizations",
                  "fullTitle": "8631 - Labor Unions and Similar Labor organizations"
              },
              {
                  "id": "8641",
                  "title": "Civic, Social, and Fraternal Associations",
                  "fullTitle": "8641 - Civic, Social, and Fraternal Associations"
              },
              {
                  "id": "8651",
                  "title": "Political Organizations",
                  "fullTitle": "8651 - Political Organizations"
              },
              {
                  "id": "8661",
                  "title": "Religious Organizations",
                  "fullTitle": "8661 - Religious Organizations"
              },
              {
                  "id": "8699",
                  "title": "Membership organizations, Not Elsewhere Classified",
                  "fullTitle": "8699 - Membership organizations, Not Elsewhere Classified"
              },
              {
                  "id": "8711",
                  "title": "Engineering Services",
                  "fullTitle": "8711 - Engineering Services"
              },
              {
                  "id": "8712",
                  "title": "Architectural Services",
                  "fullTitle": "8712 - Architectural Services"
              },
              {
                  "id": "8713",
                  "title": "Surveying Services",
                  "fullTitle": "8713 - Surveying Services"
              },
              {
                  "id": "8721",
                  "title": "Accounting, Auditing, and Bookkeeping Services",
                  "fullTitle": "8721 - Accounting, Auditing, and Bookkeeping Services"
              },
              {
                  "id": "8731",
                  "title": "Commercial Physical and Biological Research",
                  "fullTitle": "8731 - Commercial Physical and Biological Research"
              },
              {
                  "id": "8732",
                  "title": "Commercial Economic, Sociological, and Educational Research",
                  "fullTitle": "8732 - Commercial Economic, Sociological, and Educational Research"
              },
              {
                  "id": "8733",
                  "title": "Noncommercial Research organizations",
                  "fullTitle": "8733 - Noncommercial Research organizations"
              },
              {
                  "id": "8734",
                  "title": "Testing Laboratories",
                  "fullTitle": "8734 - Testing Laboratories"
              },
              {
                  "id": "8741",
                  "title": "Management Services",
                  "fullTitle": "8741 - Management Services"
              },
              {
                  "id": "8742",
                  "title": "Management Consulting Services",
                  "fullTitle": "8742 - Management Consulting Services"
              },
              {
                  "id": "8743",
                  "title": "Public Relations Services",
                  "fullTitle": "8743 - Public Relations Services"
              },
              {
                  "id": "8744",
                  "title": "Facilities Support Management Services",
                  "fullTitle": "8744 - Facilities Support Management Services"
              },
              {
                  "id": "8748",
                  "title": "Business Consulting Services, Not Elsewhere Classified",
                  "fullTitle": "8748 - Business Consulting Services, Not Elsewhere Classified"
              },
              {
                  "id": "8811",
                  "title": "Private Households",
                  "fullTitle": "8811 - Private Households"
              },
              {
                  "id": "8999",
                  "title": "Services, Not Elsewhere Classified",
                  "fullTitle": "8999 - Services, Not Elsewhere Classified"
              },
              {
                  "id": "9111",
                  "title": "Executive Offices",
                  "fullTitle": "9111 - Executive Offices"
              },
              {
                  "id": "9121",
                  "title": "Legislative Bodies",
                  "fullTitle": "9121 - Legislative Bodies"
              },
              {
                  "id": "9131",
                  "title": "Executive and Legislative Offices Combined",
                  "fullTitle": "9131 - Executive and Legislative Offices Combined"
              },
              {
                  "id": "9199",
                  "title": "General Government, Not Elsewhere Classified",
                  "fullTitle": "9199 - General Government, Not Elsewhere Classified"
              },
              {
                  "id": "9211",
                  "title": "Courts",
                  "fullTitle": "9211 - Courts"
              },
              {
                  "id": "9221",
                  "title": "Police Protection",
                  "fullTitle": "9221 - Police Protection"
              },
              {
                  "id": "9222",
                  "title": "Legal Counsel and Prosecution",
                  "fullTitle": "9222 - Legal Counsel and Prosecution"
              },
              {
                  "id": "9223",
                  "title": "Correctional Institutions",
                  "fullTitle": "9223 - Correctional Institutions"
              },
              {
                  "id": "9224",
                  "title": "Fire Protection",
                  "fullTitle": "9224 - Fire Protection"
              },
              {
                  "id": "9229",
                  "title": "Public order and Safety, Not Elsewhere Classified",
                  "fullTitle": "9229 - Public order and Safety, Not Elsewhere Classified"
              },
              {
                  "id": "9311",
                  "title": "Public Finance, Taxation, and Monetary Policy",
                  "fullTitle": "9311 - Public Finance, Taxation, and Monetary Policy"
              },
              {
                  "id": "9411",
                  "title": "Administration of Educational Programs",
                  "fullTitle": "9411 - Administration of Educational Programs"
              },
              {
                  "id": "9431",
                  "title": "Administration of Public Health Programs",
                  "fullTitle": "9431 - Administration of Public Health Programs"
              },
              {
                  "id": "9441",
                  "title": "Administration of Social, Human Resource and Income Maintenance Programs",
                  "fullTitle": "9441 - Administration of Social, Human Resource and Income Maintenance Programs"
              },
              {
                  "id": "9451",
                  "title": "Administration of Veterans' Affairs, Except Health and Insurance",
                  "fullTitle": "9451 - Administration of Veterans' Affairs, Except Health and Insurance"
              },
              {
                  "id": "9511",
                  "title": "Air and Water Resource and Solid Waste Management",
                  "fullTitle": "9511 - Air and Water Resource and Solid Waste Management"
              },
              {
                  "id": "9512",
                  "title": "Land, Mineral, Wildlife, and Forest Conservation",
                  "fullTitle": "9512 - Land, Mineral, Wildlife, and Forest Conservation"
              },
              {
                  "id": "9531",
                  "title": "Administration of Housing Programs",
                  "fullTitle": "9531 - Administration of Housing Programs"
              },
              {
                  "id": "9532",
                  "title": "Administration of Urban Planning and Community and Rural Development",
                  "fullTitle": "9532 - Administration of Urban Planning and Community and Rural Development"
              },
              {
                  "id": "9611",
                  "title": "Administration of General Economic Programs",
                  "fullTitle": "9611 - Administration of General Economic Programs"
              },
              {
                  "id": "9621",
                  "title": "Regulation and Administration of Transportation Programs",
                  "fullTitle": "9621 - Regulation and Administration of Transportation Programs"
              },
              {
                  "id": "9631",
                  "title": "Regulation and Administration of Communications, Electric, Gas, and Other Utilities",
                  "fullTitle": "9631 - Regulation and Administration of Communications, Electric, Gas, and Other Utilities"
              },
              {
                  "id": "9641",
                  "title": "Regulation of Agricultural Marketing and Commodities",
                  "fullTitle": "9641 - Regulation of Agricultural Marketing and Commodities"
              },
              {
                  "id": "9651",
                  "title": "Regulation, Licensing, and Inspection of Miscellaneous Commercial Sectors",
                  "fullTitle": "9651 - Regulation, Licensing, and Inspection of Miscellaneous Commercial Sectors"
              },
              {
                  "id": "9661",
                  "title": "Space and Research and Technology",
                  "fullTitle": "9661 - Space and Research and Technology"
              },
              {
                  "id": "9711",
                  "title": "National Security",
                  "fullTitle": "9711 - National Security"
              },
              {
                  "id": "9721",
                  "title": "International Affairs",
                  "fullTitle": "9721 - International Affairs"
              },
              {
                  "id": "9999",
                  "title": "Nonclassifiable Establishments",
                  "fullTitle": "9999 - Nonclassifiable Establishments"
              }
            ];
            const expectedStatusCode = 200;
            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);

            const actualSearchArgs = autoCompleteServiceInstanceStub.search.getCall(0).args;
            const expectedSearchArgs = [
              '',
              [
                {
                    "id": "0111",
                    "title": "Wheat",
                    "fullTitle": "0111 - Wheat"
                },
                {
                    "id": "0112",
                    "title": "Rice",
                    "fullTitle": "0112 - Rice"
                },
                {
                    "id": "0115",
                    "title": "Corn",
                    "fullTitle": "0115 - Corn"
                },
                {
                    "id": "0116",
                    "title": "Soyabeans",
                    "fullTitle": "0116 - Soyabeans"
                },
                {
                    "id": "0119",
                    "title": "Cash Grains, Not elsewhere classified",
                    "fullTitle": "0119 - Cash Grains, Not elsewhere classified"
                },
                {
                    "id": "0131",
                    "title": "Cotton",
                    "fullTitle": "0131 - Cotton"
                },
                {
                    "id": "0132",
                    "title": "Tobacco",
                    "fullTitle": "0132 - Tobacco"
                },
                {
                    "id": "0133",
                    "title": "Sugarcane and Sugar Beets",
                    "fullTitle": "0133 - Sugarcane and Sugar Beets"
                },
                {
                    "id": "0134",
                    "title": "Irish Potatoes",
                    "fullTitle": "0134 - Irish Potatoes"
                },
                {
                    "id": "0139",
                    "title": "Field crops,Except Cash Grains, Not Elsewhere Classified",
                    "fullTitle": "0139 - Field crops,Except Cash Grains, Not Elsewhere Classified"
                },
                {
                    "id": "0161",
                    "title": "Vegetables and Melons",
                    "fullTitle": "0161 - Vegetables and Melons"
                },
                {
                    "id": "0171",
                    "title": "Berry Crops",
                    "fullTitle": "0171 - Berry Crops"
                },
                {
                    "id": "0172",
                    "title": "Grapes",
                    "fullTitle": "0172 - Grapes"
                },
                {
                    "id": "0173",
                    "title": "Tree Nuts",
                    "fullTitle": "0173 - Tree Nuts"
                },
                {
                    "id": "0174",
                    "title": "Citrus Fruits",
                    "fullTitle": "0174 - Citrus Fruits"
                },
                {
                    "id": "0175",
                    "title": "Deciduous Tree Fruits",
                    "fullTitle": "0175 - Deciduous Tree Fruits"
                },
                {
                    "id": "0179",
                    "title": "Fruits and Tree Nuts, Not Elsewhere Classified",
                    "fullTitle": "0179 - Fruits and Tree Nuts, Not Elsewhere Classified"
                },
                {
                    "id": "0181",
                    "title": "Ornamental Floriculture and Nursery Products",
                    "fullTitle": "0181 - Ornamental Floriculture and Nursery Products"
                },
                {
                    "id": "0182",
                    "title": "Food Crops Grown Under Cover",
                    "fullTitle": "0182 - Food Crops Grown Under Cover"
                },
                {
                    "id": "0191",
                    "title": "General Farms, Primarily Crop",
                    "fullTitle": "0191 - General Farms, Primarily Crop"
                },
                {
                    "id": "0211",
                    "title": "Beef Cattle Feedlots",
                    "fullTitle": "0211 - Beef Cattle Feedlots"
                },
                {
                    "id": "0212",
                    "title": "Beef Cattle, Except Feedlots",
                    "fullTitle": "0212 - Beef Cattle, Except Feedlots"
                },
                {
                    "id": "0213",
                    "title": "Hogs",
                    "fullTitle": "0213 - Hogs"
                },
                {
                    "id": "0214",
                    "title": "Sheep and Goats",
                    "fullTitle": "0214 - Sheep and Goats"
                },
                {
                    "id": "0219",
                    "title": "General Livestock, Except Dairy and Poultry",
                    "fullTitle": "0219 - General Livestock, Except Dairy and Poultry"
                },
                {
                    "id": "0241",
                    "title": "Dairy Farms",
                    "fullTitle": "0241 - Dairy Farms"
                },
                {
                    "id": "0251",
                    "title": "Broiler, Fryer, and Roaster Chickens",
                    "fullTitle": "0251 - Broiler, Fryer, and Roaster Chickens"
                },
                {
                    "id": "0252",
                    "title": "Chicken Eggs",
                    "fullTitle": "0252 - Chicken Eggs"
                },
                {
                    "id": "0253",
                    "title": "Turkeys and Turkey Eggs",
                    "fullTitle": "0253 - Turkeys and Turkey Eggs"
                },
                {
                    "id": "0254",
                    "title": "Poultry Hatcheries",
                    "fullTitle": "0254 - Poultry Hatcheries"
                },
                {
                    "id": "0259",
                    "title": "Poultry and Eggs, Not Elsewhere Classified",
                    "fullTitle": "0259 - Poultry and Eggs, Not Elsewhere Classified"
                },
                {
                    "id": "0271",
                    "title": "Fur",
                    "fullTitle": "0271 - Fur"
                },
                {
                    "id": "0272",
                    "title": "Horses and Other Equines",
                    "fullTitle": "0272 - Horses and Other Equines"
                },
                {
                    "id": "0273",
                    "title": "Animal Aquaculture",
                    "fullTitle": "0273 - Animal Aquaculture"
                },
                {
                    "id": "0279",
                    "title": "Animal Specialties, Not Elsewhere Classified",
                    "fullTitle": "0279 - Animal Specialties, Not Elsewhere Classified"
                },
                {
                    "id": "0291",
                    "title": "General Farms, Primarily Livestock and Animal Specialties",
                    "fullTitle": "0291 - General Farms, Primarily Livestock and Animal Specialties"
                },
                {
                    "id": "0711",
                    "title": "Soil Preparation Services",
                    "fullTitle": "0711 - Soil Preparation Services"
                },
                {
                    "id": "0721",
                    "title": "Crop Planting, Cultivating, and Protecting",
                    "fullTitle": "0721 - Crop Planting, Cultivating, and Protecting"
                },
                {
                    "id": "0722",
                    "title": "Crop Harvesting, Primarily by Machine",
                    "fullTitle": "0722 - Crop Harvesting, Primarily by Machine"
                },
                {
                    "id": "0723",
                    "title": "Crop Preparation Services for Market, Except Cotton Ginning",
                    "fullTitle": "0723 - Crop Preparation Services for Market, Except Cotton Ginning"
                },
                {
                    "id": "0724",
                    "title": "Cotton Ginning",
                    "fullTitle": "0724 - Cotton Ginning"
                },
                {
                    "id": "0741",
                    "title": "Veterinary Services for Livestock",
                    "fullTitle": "0741 - Veterinary Services for Livestock"
                },
                {
                    "id": "0742",
                    "title": "Veterinary Services for Animal Specialties",
                    "fullTitle": "0742 - Veterinary Services for Animal Specialties"
                },
                {
                    "id": "0751",
                    "title": "Livestock Services, Except Veterinary",
                    "fullTitle": "0751 - Livestock Services, Except Veterinary"
                },
                {
                    "id": "0752",
                    "title": "Animal Specialty Services, Except Veterinary",
                    "fullTitle": "0752 - Animal Specialty Services, Except Veterinary"
                },
                {
                    "id": "0761",
                    "title": "Farm Labor Contractors and Crew Leaders",
                    "fullTitle": "0761 - Farm Labor Contractors and Crew Leaders"
                },
                {
                    "id": "0762",
                    "title": "Farm Management Services",
                    "fullTitle": "0762 - Farm Management Services"
                },
                {
                    "id": "0781",
                    "title": "Landscape Counseling and Planning",
                    "fullTitle": "0781 - Landscape Counseling and Planning"
                },
                {
                    "id": "0782",
                    "title": "Lawn and Garden Services",
                    "fullTitle": "0782 - Lawn and Garden Services"
                },
                {
                    "id": "0783",
                    "title": "ornamental Shrub and Tree Services",
                    "fullTitle": "0783 - ornamental Shrub and Tree Services"
                },
                {
                    "id": "0811",
                    "title": "Timber Tracts",
                    "fullTitle": "0811 - Timber Tracts"
                },
                {
                    "id": "0831",
                    "title": "Forest Nurseries and Gathering of Forest Products",
                    "fullTitle": "0831 - Forest Nurseries and Gathering of Forest Products"
                },
                {
                    "id": "0851",
                    "title": "Forestry Services",
                    "fullTitle": "0851 - Forestry Services"
                },
                {
                    "id": "0912",
                    "title": "Finfish",
                    "fullTitle": "0912 - Finfish"
                },
                {
                    "id": "0913",
                    "title": "Shellfish",
                    "fullTitle": "0913 - Shellfish"
                },
                {
                    "id": "0919",
                    "title": "Miscellaneous Marine Products",
                    "fullTitle": "0919 - Miscellaneous Marine Products"
                },
                {
                    "id": "0921",
                    "title": "Fish Hatcheries and Preserves",
                    "fullTitle": "0921 - Fish Hatcheries and Preserves"
                },
                {
                    "id": "0971",
                    "title": "Hunting and Trapping, and Game Propagation",
                    "fullTitle": "0971 - Hunting and Trapping, and Game Propagation"
                },
                {
                    "id": "1011",
                    "title": "Iron Ores",
                    "fullTitle": "1011 - Iron Ores"
                },
                {
                    "id": "1021",
                    "title": "Copper Ores",
                    "fullTitle": "1021 - Copper Ores"
                },
                {
                    "id": "1031",
                    "title": "Lead and Zinc Ores",
                    "fullTitle": "1031 - Lead and Zinc Ores"
                },
                {
                    "id": "1041",
                    "title": "Gold Ores",
                    "fullTitle": "1041 - Gold Ores"
                },
                {
                    "id": "1044",
                    "title": "Silver Ores",
                    "fullTitle": "1044 - Silver Ores"
                },
                {
                    "id": "1061",
                    "title": "Ferroalloy Ores, Except Vanadium",
                    "fullTitle": "1061 - Ferroalloy Ores, Except Vanadium"
                },
                {
                    "id": "1081",
                    "title": "Metal Mining Services",
                    "fullTitle": "1081 - Metal Mining Services"
                },
                {
                    "id": "1094",
                    "title": "Uranium",
                    "fullTitle": "1094 - Uranium"
                },
                {
                    "id": "1099",
                    "title": "Miscellaneous Metal Ores, Not Elsewhere Classified",
                    "fullTitle": "1099 - Miscellaneous Metal Ores, Not Elsewhere Classified"
                },
                {
                    "id": "1221",
                    "title": "Bituminous Coal and Lignite Surface Mining",
                    "fullTitle": "1221 - Bituminous Coal and Lignite Surface Mining"
                },
                {
                    "id": "1222",
                    "title": "Bituminous Coal Underground Mining",
                    "fullTitle": "1222 - Bituminous Coal Underground Mining"
                },
                {
                    "id": "1231",
                    "title": "Anthracite Mining",
                    "fullTitle": "1231 - Anthracite Mining"
                },
                {
                    "id": "1241",
                    "title": "Coal Mining Services",
                    "fullTitle": "1241 - Coal Mining Services"
                },
                {
                    "id": "1311",
                    "title": "Crude Petroleum and Natural Gas",
                    "fullTitle": "1311 - Crude Petroleum and Natural Gas"
                },
                {
                    "id": "1321",
                    "title": "Natural Gas Liquids",
                    "fullTitle": "1321 - Natural Gas Liquids"
                },
                {
                    "id": "1381",
                    "title": "Drilling Oil and Gas Wells",
                    "fullTitle": "1381 - Drilling Oil and Gas Wells"
                },
                {
                    "id": "1382",
                    "title": "Oil and Gas Field Exploration Services",
                    "fullTitle": "1382 - Oil and Gas Field Exploration Services"
                },
                {
                    "id": "1389",
                    "title": "Oil and Gas Field Services, Not Elsewhere Classified",
                    "fullTitle": "1389 - Oil and Gas Field Services, Not Elsewhere Classified"
                },
                {
                    "id": "1411",
                    "title": "Dimension Stone",
                    "fullTitle": "1411 - Dimension Stone"
                },
                {
                    "id": "1422",
                    "title": "Crushed and Broken Limestone",
                    "fullTitle": "1422 - Crushed and Broken Limestone"
                },
                {
                    "id": "1423",
                    "title": "Crushed and Broken Granite",
                    "fullTitle": "1423 - Crushed and Broken Granite"
                },
                {
                    "id": "1429",
                    "title": "Crushed and Broken Stone, Not Elsewhere Classified",
                    "fullTitle": "1429 - Crushed and Broken Stone, Not Elsewhere Classified"
                },
                {
                    "id": "1442",
                    "title": "Construction Sand and Gravel",
                    "fullTitle": "1442 - Construction Sand and Gravel"
                },
                {
                    "id": "1446",
                    "title": "Industrial Sand",
                    "fullTitle": "1446 - Industrial Sand"
                },
                {
                    "id": "1455",
                    "title": "Kaolin and Ball Clay",
                    "fullTitle": "1455 - Kaolin and Ball Clay"
                },
                {
                    "id": "1459",
                    "title": "Clay, Ceramic, and Refractory Minerals, Not Elsewhere Classified",
                    "fullTitle": "1459 - Clay, Ceramic, and Refractory Minerals, Not Elsewhere Classified"
                },
                {
                    "id": "1474",
                    "title": "Potash, Soda, and Borate Minerals",
                    "fullTitle": "1474 - Potash, Soda, and Borate Minerals"
                },
                {
                    "id": "1475",
                    "title": "Phosphate Rock",
                    "fullTitle": "1475 - Phosphate Rock"
                },
                {
                    "id": "1479",
                    "title": "Chemical and Fertilizer Mineral Mining, Not Elsewhere Classified",
                    "fullTitle": "1479 - Chemical and Fertilizer Mineral Mining, Not Elsewhere Classified"
                },
                {
                    "id": "1481",
                    "title": "Nonmetallic Minerals Services, Except Fuels",
                    "fullTitle": "1481 - Nonmetallic Minerals Services, Except Fuels"
                },
                {
                    "id": "1499",
                    "title": "Miscellaneous Nonmetallic Minerals, Except Fuels",
                    "fullTitle": "1499 - Miscellaneous Nonmetallic Minerals, Except Fuels"
                },
                {
                    "id": "1521",
                    "title": "General Contractors",
                    "fullTitle": "1521 - General Contractors"
                },
                {
                    "id": "1522",
                    "title": "General Contractors",
                    "fullTitle": "1522 - General Contractors"
                },
                {
                    "id": "1531",
                    "title": "Operative Builders",
                    "fullTitle": "1531 - Operative Builders"
                },
                {
                    "id": "1541",
                    "title": "General Contractors",
                    "fullTitle": "1541 - General Contractors"
                },
                {
                    "id": "1542",
                    "title": "General Contractors",
                    "fullTitle": "1542 - General Contractors"
                },
                {
                    "id": "1611",
                    "title": "Highway and Street Construction, Except Elevated Highways",
                    "fullTitle": "1611 - Highway and Street Construction, Except Elevated Highways"
                },
                {
                    "id": "1622",
                    "title": "Bridge, Tunnel, and Elevated Highway Construction",
                    "fullTitle": "1622 - Bridge, Tunnel, and Elevated Highway Construction"
                },
                {
                    "id": "1623",
                    "title": "Water, Sewer, Pipeline, and Communications and Power Line Construction",
                    "fullTitle": "1623 - Water, Sewer, Pipeline, and Communications and Power Line Construction"
                },
                {
                    "id": "1629",
                    "title": "Heavy Construction, Not Elsewhere Classified",
                    "fullTitle": "1629 - Heavy Construction, Not Elsewhere Classified"
                },
                {
                    "id": "1711",
                    "title": "Plumbing, Heating and Air",
                    "fullTitle": "1711 - Plumbing, Heating and Air"
                },
                {
                    "id": "1721",
                    "title": "Painting and Paper Hanging",
                    "fullTitle": "1721 - Painting and Paper Hanging"
                },
                {
                    "id": "1731",
                    "title": "Electrical Work",
                    "fullTitle": "1731 - Electrical Work"
                },
                {
                    "id": "1741",
                    "title": "Masonry, Stone Setting, and Other Stone Work",
                    "fullTitle": "1741 - Masonry, Stone Setting, and Other Stone Work"
                },
                {
                    "id": "1742",
                    "title": "Plastering, Drywall, Acoustical, and Insulation Work",
                    "fullTitle": "1742 - Plastering, Drywall, Acoustical, and Insulation Work"
                },
                {
                    "id": "1743",
                    "title": "Terrazzo, Tile, Marble, and Mosaic Work",
                    "fullTitle": "1743 - Terrazzo, Tile, Marble, and Mosaic Work"
                },
                {
                    "id": "1751",
                    "title": "Carpentry Work",
                    "fullTitle": "1751 - Carpentry Work"
                },
                {
                    "id": "1752",
                    "title": "Floor Laying and Other Floor Work, Not Elsewhere Classified",
                    "fullTitle": "1752 - Floor Laying and Other Floor Work, Not Elsewhere Classified"
                },
                {
                    "id": "1761",
                    "title": "Roofing, Siding, and Sheet Metal Work",
                    "fullTitle": "1761 - Roofing, Siding, and Sheet Metal Work"
                },
                {
                    "id": "1771",
                    "title": "Concrete Work",
                    "fullTitle": "1771 - Concrete Work"
                },
                {
                    "id": "1781",
                    "title": "Water Well Drilling",
                    "fullTitle": "1781 - Water Well Drilling"
                },
                {
                    "id": "1791",
                    "title": "Structural Steel Erection",
                    "fullTitle": "1791 - Structural Steel Erection"
                },
                {
                    "id": "1793",
                    "title": "Glass and Glazing Work",
                    "fullTitle": "1793 - Glass and Glazing Work"
                },
                {
                    "id": "1794",
                    "title": "Excavation Work",
                    "fullTitle": "1794 - Excavation Work"
                },
                {
                    "id": "1795",
                    "title": "Wrecking and Demolition Work",
                    "fullTitle": "1795 - Wrecking and Demolition Work"
                },
                {
                    "id": "1796",
                    "title": "Installation or Erection of Building Equipment, Not Elsewhere Classified",
                    "fullTitle": "1796 - Installation or Erection of Building Equipment, Not Elsewhere Classified"
                },
                {
                    "id": "1799",
                    "title": "Special Trade Contractors, Not Elsewhere Classified",
                    "fullTitle": "1799 - Special Trade Contractors, Not Elsewhere Classified"
                },
                {
                    "id": "2011",
                    "title": "Meat Packing Plants",
                    "fullTitle": "2011 - Meat Packing Plants"
                },
                {
                    "id": "2013",
                    "title": "Sausages and Other Prepared Meat Products",
                    "fullTitle": "2013 - Sausages and Other Prepared Meat Products"
                },
                {
                    "id": "2015",
                    "title": "Poultry Slaughtering and Processing",
                    "fullTitle": "2015 - Poultry Slaughtering and Processing"
                },
                {
                    "id": "2021",
                    "title": "Creamery Butter",
                    "fullTitle": "2021 - Creamery Butter"
                },
                {
                    "id": "2022",
                    "title": "Natural, Processed, and Imitation Cheese",
                    "fullTitle": "2022 - Natural, Processed, and Imitation Cheese"
                },
                {
                    "id": "2023",
                    "title": "Dry, Condensed, and Evaporated Dairy Products",
                    "fullTitle": "2023 - Dry, Condensed, and Evaporated Dairy Products"
                },
                {
                    "id": "2024",
                    "title": "Ice Cream and Frozen Desserts",
                    "fullTitle": "2024 - Ice Cream and Frozen Desserts"
                },
                {
                    "id": "2026",
                    "title": "Fluid Milk",
                    "fullTitle": "2026 - Fluid Milk"
                },
                {
                    "id": "2032",
                    "title": "Canned Specialties",
                    "fullTitle": "2032 - Canned Specialties"
                },
                {
                    "id": "2033",
                    "title": "Canned Fruits, Vegetables, Preserves, Jams, and Jellies",
                    "fullTitle": "2033 - Canned Fruits, Vegetables, Preserves, Jams, and Jellies"
                },
                {
                    "id": "2034",
                    "title": "Dried and Dehydrated Fruits, Vegetables, and Soup Mixes",
                    "fullTitle": "2034 - Dried and Dehydrated Fruits, Vegetables, and Soup Mixes"
                },
                {
                    "id": "2035",
                    "title": "Pickled Fruits and Vegetables, Vegetable Sauces and Seasonings, and Salad Dressings",
                    "fullTitle": "2035 - Pickled Fruits and Vegetables, Vegetable Sauces and Seasonings, and Salad Dressings"
                },
                {
                    "id": "2037",
                    "title": "Frozen Fruits, Fruit Juices, and Vegetables",
                    "fullTitle": "2037 - Frozen Fruits, Fruit Juices, and Vegetables"
                },
                {
                    "id": "2038",
                    "title": "Frozen Specialties, Not Elsewhere Classified",
                    "fullTitle": "2038 - Frozen Specialties, Not Elsewhere Classified"
                },
                {
                    "id": "2041",
                    "title": "Flour and Other Grain Mill Products",
                    "fullTitle": "2041 - Flour and Other Grain Mill Products"
                },
                {
                    "id": "2043",
                    "title": "Cereal Breakfast Foods",
                    "fullTitle": "2043 - Cereal Breakfast Foods"
                },
                {
                    "id": "2044",
                    "title": "Rice Milling",
                    "fullTitle": "2044 - Rice Milling"
                },
                {
                    "id": "2045",
                    "title": "Prepared Flour Mixes and Doughs",
                    "fullTitle": "2045 - Prepared Flour Mixes and Doughs"
                },
                {
                    "id": "2046",
                    "title": "Wet Corn Milling",
                    "fullTitle": "2046 - Wet Corn Milling"
                },
                {
                    "id": "2047",
                    "title": "Dog and Cat Food",
                    "fullTitle": "2047 - Dog and Cat Food"
                },
                {
                    "id": "2048",
                    "title": "Prepared Feed and Feed Ingredients for Animals and Fowls, Except Dogs and Cats",
                    "fullTitle": "2048 - Prepared Feed and Feed Ingredients for Animals and Fowls, Except Dogs and Cats"
                },
                {
                    "id": "2051",
                    "title": "Bread and Other Bakery Products, Except Cookies and Crackers",
                    "fullTitle": "2051 - Bread and Other Bakery Products, Except Cookies and Crackers"
                },
                {
                    "id": "2052",
                    "title": "Cookies and Crackers",
                    "fullTitle": "2052 - Cookies and Crackers"
                },
                {
                    "id": "2053",
                    "title": "Frozen Bakery Products, Except Bread",
                    "fullTitle": "2053 - Frozen Bakery Products, Except Bread"
                },
                {
                    "id": "2061",
                    "title": "Cane Sugar, Except Refining",
                    "fullTitle": "2061 - Cane Sugar, Except Refining"
                },
                {
                    "id": "2062",
                    "title": "Cane Sugar Refining",
                    "fullTitle": "2062 - Cane Sugar Refining"
                },
                {
                    "id": "2063",
                    "title": "Beet Sugar",
                    "fullTitle": "2063 - Beet Sugar"
                },
                {
                    "id": "2064",
                    "title": "Candy and Other Confectionery Products",
                    "fullTitle": "2064 - Candy and Other Confectionery Products"
                },
                {
                    "id": "2066",
                    "title": "Chocolate and Cocoa Products",
                    "fullTitle": "2066 - Chocolate and Cocoa Products"
                },
                {
                    "id": "2067",
                    "title": "Chewing Gum",
                    "fullTitle": "2067 - Chewing Gum"
                },
                {
                    "id": "2068",
                    "title": "Salted and Roasted Nuts and Seeds",
                    "fullTitle": "2068 - Salted and Roasted Nuts and Seeds"
                },
                {
                    "id": "2074",
                    "title": "Cottonseed Oil Mills",
                    "fullTitle": "2074 - Cottonseed Oil Mills"
                },
                {
                    "id": "2075",
                    "title": "Soybean Oil Mills",
                    "fullTitle": "2075 - Soybean Oil Mills"
                },
                {
                    "id": "2076",
                    "title": "Vegetable Oil Mills, Except Corn, Cottonseed, and Soybean",
                    "fullTitle": "2076 - Vegetable Oil Mills, Except Corn, Cottonseed, and Soybean"
                },
                {
                    "id": "2077",
                    "title": "Animal and Marine Fats and Oils",
                    "fullTitle": "2077 - Animal and Marine Fats and Oils"
                },
                {
                    "id": "2079",
                    "title": "Shortening, Table Oils, Margarine, and Other Edible Fats and Oils, Not Elsewhere Classified",
                    "fullTitle": "2079 - Shortening, Table Oils, Margarine, and Other Edible Fats and Oils, Not Elsewhere Classified"
                },
                {
                    "id": "2082",
                    "title": "Malt Beverages",
                    "fullTitle": "2082 - Malt Beverages"
                },
                {
                    "id": "2083",
                    "title": "Malt",
                    "fullTitle": "2083 - Malt"
                },
                {
                    "id": "2084",
                    "title": "Wines, Brandy, and Brandy Spirits",
                    "fullTitle": "2084 - Wines, Brandy, and Brandy Spirits"
                },
                {
                    "id": "2085",
                    "title": "Distilled and Blended Liquors",
                    "fullTitle": "2085 - Distilled and Blended Liquors"
                },
                {
                    "id": "2086",
                    "title": "Bottled and Canned Soft Drinks and Carbonated Waters",
                    "fullTitle": "2086 - Bottled and Canned Soft Drinks and Carbonated Waters"
                },
                {
                    "id": "2087",
                    "title": "Flavoring Extracts and Flavoring Syrups, Not Elsewhere Classified",
                    "fullTitle": "2087 - Flavoring Extracts and Flavoring Syrups, Not Elsewhere Classified"
                },
                {
                    "id": "2091",
                    "title": "Canned and Cured Fish and Seafoods",
                    "fullTitle": "2091 - Canned and Cured Fish and Seafoods"
                },
                {
                    "id": "2092",
                    "title": "Prepared Fresh or Frozen Fish and Seafoods",
                    "fullTitle": "2092 - Prepared Fresh or Frozen Fish and Seafoods"
                },
                {
                    "id": "2095",
                    "title": "Roasted Coffee",
                    "fullTitle": "2095 - Roasted Coffee"
                },
                {
                    "id": "2096",
                    "title": "Potato Chips, Corn Chips, and Similar Snacks",
                    "fullTitle": "2096 - Potato Chips, Corn Chips, and Similar Snacks"
                },
                {
                    "id": "2097",
                    "title": "Manufactured Ice",
                    "fullTitle": "2097 - Manufactured Ice"
                },
                {
                    "id": "2098",
                    "title": "Macaroni, Spaghetti, Vermicelli, and Noodles",
                    "fullTitle": "2098 - Macaroni, Spaghetti, Vermicelli, and Noodles"
                },
                {
                    "id": "2099",
                    "title": "Food Preparations, Not Elsewhere Classified",
                    "fullTitle": "2099 - Food Preparations, Not Elsewhere Classified"
                },
                {
                    "id": "2111",
                    "title": "Cigarettes",
                    "fullTitle": "2111 - Cigarettes"
                },
                {
                    "id": "2121",
                    "title": "Cigars",
                    "fullTitle": "2121 - Cigars"
                },
                {
                    "id": "2131",
                    "title": "Chewing and Smoking Tobacco and Snuff",
                    "fullTitle": "2131 - Chewing and Smoking Tobacco and Snuff"
                },
                {
                    "id": "2141",
                    "title": "Tobacco Stemming and Redrying",
                    "fullTitle": "2141 - Tobacco Stemming and Redrying"
                },
                {
                    "id": "2211",
                    "title": "Broadwoven Fabric Mills, Cotton",
                    "fullTitle": "2211 - Broadwoven Fabric Mills, Cotton"
                },
                {
                    "id": "2221",
                    "title": "Broadwoven Fabric Mills, Manmade Fiber and Silk",
                    "fullTitle": "2221 - Broadwoven Fabric Mills, Manmade Fiber and Silk"
                },
                {
                    "id": "2231",
                    "title": "Broadwoven Fabric Mills, Wool (Including Dyeing and Finishing)",
                    "fullTitle": "2231 - Broadwoven Fabric Mills, Wool (Including Dyeing and Finishing)"
                },
                {
                    "id": "2241",
                    "title": "Narrow Fabric and Other Smallware Mills Cotton, Wool, Silk, and Manmade Fiber",
                    "fullTitle": "2241 - Narrow Fabric and Other Smallware Mills Cotton, Wool, Silk, and Manmade Fiber"
                },
                {
                    "id": "2251",
                    "title": "Women's Full",
                    "fullTitle": "2251 - Women's Full"
                },
                {
                    "id": "2252",
                    "title": "Hosiery, Not Elsewhere Classified",
                    "fullTitle": "2252 - Hosiery, Not Elsewhere Classified"
                },
                {
                    "id": "2253",
                    "title": "Knit Outerwear Mills",
                    "fullTitle": "2253 - Knit Outerwear Mills"
                },
                {
                    "id": "2254",
                    "title": "Knit Underwear and Nightwear Mills",
                    "fullTitle": "2254 - Knit Underwear and Nightwear Mills"
                },
                {
                    "id": "2257",
                    "title": "Weft Knit Fabric Mills",
                    "fullTitle": "2257 - Weft Knit Fabric Mills"
                },
                {
                    "id": "2258",
                    "title": "Lace and Warp Knit Fabric Mills",
                    "fullTitle": "2258 - Lace and Warp Knit Fabric Mills"
                },
                {
                    "id": "2259",
                    "title": "Knitting Mills, Not Elsewhere Classified",
                    "fullTitle": "2259 - Knitting Mills, Not Elsewhere Classified"
                },
                {
                    "id": "2261",
                    "title": "Finishers of Broadwoven Fabrics of Cotton",
                    "fullTitle": "2261 - Finishers of Broadwoven Fabrics of Cotton"
                },
                {
                    "id": "2262",
                    "title": "Finishers of Broadwoven Fabrics of Manmade Fiber and Silk",
                    "fullTitle": "2262 - Finishers of Broadwoven Fabrics of Manmade Fiber and Silk"
                },
                {
                    "id": "2269",
                    "title": "Finishers of Textiles, Not Elsewhere Classified",
                    "fullTitle": "2269 - Finishers of Textiles, Not Elsewhere Classified"
                },
                {
                    "id": "2273",
                    "title": "Carpets and Rugs",
                    "fullTitle": "2273 - Carpets and Rugs"
                },
                {
                    "id": "2281",
                    "title": "Yarn Spinning Mills",
                    "fullTitle": "2281 - Yarn Spinning Mills"
                },
                {
                    "id": "2282",
                    "title": "Yarn Texturizing, Throwing, Twisting, and Winding Mills",
                    "fullTitle": "2282 - Yarn Texturizing, Throwing, Twisting, and Winding Mills"
                },
                {
                    "id": "2284",
                    "title": "Thread Mills",
                    "fullTitle": "2284 - Thread Mills"
                },
                {
                    "id": "2295",
                    "title": "Coated Fabrics, Not Rubberized",
                    "fullTitle": "2295 - Coated Fabrics, Not Rubberized"
                },
                {
                    "id": "2296",
                    "title": "Tire Cord and Fabrics",
                    "fullTitle": "2296 - Tire Cord and Fabrics"
                },
                {
                    "id": "2297",
                    "title": "Non-Woven Fabrics",
                    "fullTitle": "2297 - Non-Woven Fabrics"
                },
                {
                    "id": "2298",
                    "title": "Cordage and Twine",
                    "fullTitle": "2298 - Cordage and Twine"
                },
                {
                    "id": "2299",
                    "title": "Textile goods, Not Elsewhere Classified",
                    "fullTitle": "2299 - Textile goods, Not Elsewhere Classified"
                },
                {
                    "id": "2311",
                    "title": "Men's and Boys' Suits, Coats, and Overcoats",
                    "fullTitle": "2311 - Men's and Boys' Suits, Coats, and Overcoats"
                },
                {
                    "id": "2321",
                    "title": "Men's and Boys' Shirts, Except Work Shirts",
                    "fullTitle": "2321 - Men's and Boys' Shirts, Except Work Shirts"
                },
                {
                    "id": "2322",
                    "title": "Men's and Boys' Underwear and Nightwear",
                    "fullTitle": "2322 - Men's and Boys' Underwear and Nightwear"
                },
                {
                    "id": "2323",
                    "title": "Men's and Boys' Neckwear",
                    "fullTitle": "2323 - Men's and Boys' Neckwear"
                },
                {
                    "id": "2325",
                    "title": "Men's and Boys' Separate Trousers and Slacks",
                    "fullTitle": "2325 - Men's and Boys' Separate Trousers and Slacks"
                },
                {
                    "id": "2326",
                    "title": "Men's and Boys' Work Clothing",
                    "fullTitle": "2326 - Men's and Boys' Work Clothing"
                },
                {
                    "id": "2329",
                    "title": "Men's and Boys' Clothing, Not Elsewhere Classified",
                    "fullTitle": "2329 - Men's and Boys' Clothing, Not Elsewhere Classified"
                },
                {
                    "id": "2331",
                    "title": "Women's, Misses', and Juniors' Blouses and Shirts",
                    "fullTitle": "2331 - Women's, Misses', and Juniors' Blouses and Shirts"
                },
                {
                    "id": "2335",
                    "title": "Women's, Misses', and Juniors' Dresses",
                    "fullTitle": "2335 - Women's, Misses', and Juniors' Dresses"
                },
                {
                    "id": "2337",
                    "title": "Women's, Misses', and Juniors' Suits, Skirts, and Coats",
                    "fullTitle": "2337 - Women's, Misses', and Juniors' Suits, Skirts, and Coats"
                },
                {
                    "id": "2339",
                    "title": "Women's, Misses', and Juniors' Outerwear, Not Elsewhere Classified",
                    "fullTitle": "2339 - Women's, Misses', and Juniors' Outerwear, Not Elsewhere Classified"
                },
                {
                    "id": "2341",
                    "title": "Women's, Misses', Children's, and Infants' Underwear and Nightwear",
                    "fullTitle": "2341 - Women's, Misses', Children's, and Infants' Underwear and Nightwear"
                },
                {
                    "id": "2342",
                    "title": "Brassieres, Girdles, and Allied Garments",
                    "fullTitle": "2342 - Brassieres, Girdles, and Allied Garments"
                },
                {
                    "id": "2353",
                    "title": "Hats, Caps, and Millinery",
                    "fullTitle": "2353 - Hats, Caps, and Millinery"
                },
                {
                    "id": "2361",
                    "title": "Girls', Children's, and Infants' Dresses, Blouses, and Shirts",
                    "fullTitle": "2361 - Girls', Children's, and Infants' Dresses, Blouses, and Shirts"
                },
                {
                    "id": "2369",
                    "title": "Girls', Children's, and Infants' Outerwear, Not Elsewhere Classified",
                    "fullTitle": "2369 - Girls', Children's, and Infants' Outerwear, Not Elsewhere Classified"
                },
                {
                    "id": "2371",
                    "title": "Fur Goods",
                    "fullTitle": "2371 - Fur Goods"
                },
                {
                    "id": "2381",
                    "title": "Dress and Work Gloves, Except Knit and All",
                    "fullTitle": "2381 - Dress and Work Gloves, Except Knit and All"
                },
                {
                    "id": "2384",
                    "title": "Robes and Dressing Gowns",
                    "fullTitle": "2384 - Robes and Dressing Gowns"
                },
                {
                    "id": "2385",
                    "title": "Waterproof Outerwear",
                    "fullTitle": "2385 - Waterproof Outerwear"
                },
                {
                    "id": "2386",
                    "title": "Leather and Sheep",
                    "fullTitle": "2386 - Leather and Sheep"
                },
                {
                    "id": "2387",
                    "title": "Apparel belts",
                    "fullTitle": "2387 - Apparel belts"
                },
                {
                    "id": "2389",
                    "title": "Apparel and Accessories, Not Elsewhere Classified",
                    "fullTitle": "2389 - Apparel and Accessories, Not Elsewhere Classified"
                },
                {
                    "id": "2391",
                    "title": "Curtains and Draperies",
                    "fullTitle": "2391 - Curtains and Draperies"
                },
                {
                    "id": "2392",
                    "title": "House furnishing, Except Curtains and Draperies",
                    "fullTitle": "2392 - House furnishing, Except Curtains and Draperies"
                },
                {
                    "id": "2393",
                    "title": "Textile Bags",
                    "fullTitle": "2393 - Textile Bags"
                },
                {
                    "id": "2394",
                    "title": "Canvas and Related Products",
                    "fullTitle": "2394 - Canvas and Related Products"
                },
                {
                    "id": "2395",
                    "title": "Pleating, Decorative and Novelty Stitching, and Tucking for the Trade",
                    "fullTitle": "2395 - Pleating, Decorative and Novelty Stitching, and Tucking for the Trade"
                },
                {
                    "id": "2396",
                    "title": "Automotive Trimmings, Apparel Findings, and Related Products",
                    "fullTitle": "2396 - Automotive Trimmings, Apparel Findings, and Related Products"
                },
                {
                    "id": "2397",
                    "title": "Schiffli Machine Embroideries",
                    "fullTitle": "2397 - Schiffli Machine Embroideries"
                },
                {
                    "id": "2399",
                    "title": "Fabricated Textile Products, Not Elsewhere Classified",
                    "fullTitle": "2399 - Fabricated Textile Products, Not Elsewhere Classified"
                },
                {
                    "id": "2411",
                    "title": "Logging",
                    "fullTitle": "2411 - Logging"
                },
                {
                    "id": "2421",
                    "title": "Sawmills and Planing Mills, General",
                    "fullTitle": "2421 - Sawmills and Planing Mills, General"
                },
                {
                    "id": "2426",
                    "title": "Hardwood Dimension and Flooring Mills",
                    "fullTitle": "2426 - Hardwood Dimension and Flooring Mills"
                },
                {
                    "id": "2429",
                    "title": "Special Product Sawmills, Not Elsewhere Classified",
                    "fullTitle": "2429 - Special Product Sawmills, Not Elsewhere Classified"
                },
                {
                    "id": "2431",
                    "title": "Millwork",
                    "fullTitle": "2431 - Millwork"
                },
                {
                    "id": "2434",
                    "title": "Wood Kitchen Cabinets",
                    "fullTitle": "2434 - Wood Kitchen Cabinets"
                },
                {
                    "id": "2435",
                    "title": "Hardwood Veneer and Plywood",
                    "fullTitle": "2435 - Hardwood Veneer and Plywood"
                },
                {
                    "id": "2436",
                    "title": "Softwood Veneer and Plywood",
                    "fullTitle": "2436 - Softwood Veneer and Plywood"
                },
                {
                    "id": "2439",
                    "title": "Structural Wood Members, Not Elsewhere Classified",
                    "fullTitle": "2439 - Structural Wood Members, Not Elsewhere Classified"
                },
                {
                    "id": "2441",
                    "title": "Nailed and Lock Corner Wood Boxes and Shook",
                    "fullTitle": "2441 - Nailed and Lock Corner Wood Boxes and Shook"
                },
                {
                    "id": "2448",
                    "title": "Wood Pallets and Skids",
                    "fullTitle": "2448 - Wood Pallets and Skids"
                },
                {
                    "id": "2449",
                    "title": "Wood Containers, Not Elsewhere Classified",
                    "fullTitle": "2449 - Wood Containers, Not Elsewhere Classified"
                },
                {
                    "id": "2451",
                    "title": "Mobile Homes",
                    "fullTitle": "2451 - Mobile Homes"
                },
                {
                    "id": "2452",
                    "title": "Prefabricated Wood Buildings and Components",
                    "fullTitle": "2452 - Prefabricated Wood Buildings and Components"
                },
                {
                    "id": "2491",
                    "title": "Wood Preserving",
                    "fullTitle": "2491 - Wood Preserving"
                },
                {
                    "id": "2493",
                    "title": "Reconstituted Wood Products",
                    "fullTitle": "2493 - Reconstituted Wood Products"
                },
                {
                    "id": "2499",
                    "title": "Wood Products, Not Elsewhere Classified",
                    "fullTitle": "2499 - Wood Products, Not Elsewhere Classified"
                },
                {
                    "id": "2511",
                    "title": "Wood Household Furniture, Except Upholstered",
                    "fullTitle": "2511 - Wood Household Furniture, Except Upholstered"
                },
                {
                    "id": "2512",
                    "title": "Wood Household Furniture, Upholstered",
                    "fullTitle": "2512 - Wood Household Furniture, Upholstered"
                },
                {
                    "id": "2514",
                    "title": "Metal Household Furniture",
                    "fullTitle": "2514 - Metal Household Furniture"
                },
                {
                    "id": "2515",
                    "title": "Mattresses, Foundations, and Convertible Beds",
                    "fullTitle": "2515 - Mattresses, Foundations, and Convertible Beds"
                },
                {
                    "id": "2517",
                    "title": "Wood Television, Radio, Phonograph, and Sewing Machine Cabinets",
                    "fullTitle": "2517 - Wood Television, Radio, Phonograph, and Sewing Machine Cabinets"
                },
                {
                    "id": "2519",
                    "title": "Household Furniture, Not Elsewhere Classified",
                    "fullTitle": "2519 - Household Furniture, Not Elsewhere Classified"
                },
                {
                    "id": "2521",
                    "title": "Wood Office Furniture",
                    "fullTitle": "2521 - Wood Office Furniture"
                },
                {
                    "id": "2522",
                    "title": "Office Furniture, Except Wood",
                    "fullTitle": "2522 - Office Furniture, Except Wood"
                },
                {
                    "id": "2531",
                    "title": "Public Building and Related Furniture",
                    "fullTitle": "2531 - Public Building and Related Furniture"
                },
                {
                    "id": "2541",
                    "title": "Wood Office and Store Fixtures, Partitions, Shelving, and Lockers",
                    "fullTitle": "2541 - Wood Office and Store Fixtures, Partitions, Shelving, and Lockers"
                },
                {
                    "id": "2542",
                    "title": "Office and Store Fixtures, Partitions, Shelving, and Lockers, Except Wood",
                    "fullTitle": "2542 - Office and Store Fixtures, Partitions, Shelving, and Lockers, Except Wood"
                },
                {
                    "id": "2591",
                    "title": "Drapery Hardware and Window Blinds and Shades",
                    "fullTitle": "2591 - Drapery Hardware and Window Blinds and Shades"
                },
                {
                    "id": "2599",
                    "title": "Furniture and Fixtures, Not Elsewhere Classified",
                    "fullTitle": "2599 - Furniture and Fixtures, Not Elsewhere Classified"
                },
                {
                    "id": "2611",
                    "title": "Pulp Mills",
                    "fullTitle": "2611 - Pulp Mills"
                },
                {
                    "id": "2621",
                    "title": "Paper Mills",
                    "fullTitle": "2621 - Paper Mills"
                },
                {
                    "id": "2631",
                    "title": "Paperboard Mills",
                    "fullTitle": "2631 - Paperboard Mills"
                },
                {
                    "id": "2652",
                    "title": "Setup Paperboard Boxes",
                    "fullTitle": "2652 - Setup Paperboard Boxes"
                },
                {
                    "id": "2653",
                    "title": "Corrugated and Solid Fiber Boxes",
                    "fullTitle": "2653 - Corrugated and Solid Fiber Boxes"
                },
                {
                    "id": "2655",
                    "title": "Fiber Cans, Tubes, Drums, and Similar Products",
                    "fullTitle": "2655 - Fiber Cans, Tubes, Drums, and Similar Products"
                },
                {
                    "id": "2656",
                    "title": "Sanitary Food Containers, Except Folding",
                    "fullTitle": "2656 - Sanitary Food Containers, Except Folding"
                },
                {
                    "id": "2657",
                    "title": "Folding Paperboard Boxes, Including Sanitary",
                    "fullTitle": "2657 - Folding Paperboard Boxes, Including Sanitary"
                },
                {
                    "id": "2671",
                    "title": "Packaging Paper and Plastics Film, Coated and Laminated",
                    "fullTitle": "2671 - Packaging Paper and Plastics Film, Coated and Laminated"
                },
                {
                    "id": "2672",
                    "title": "Coated and Laminated Paper, Not Elsewhere Classified",
                    "fullTitle": "2672 - Coated and Laminated Paper, Not Elsewhere Classified"
                },
                {
                    "id": "2673",
                    "title": "Plastics, Foil, and Coated Paper Bags",
                    "fullTitle": "2673 - Plastics, Foil, and Coated Paper Bags"
                },
                {
                    "id": "2674",
                    "title": "Uncoated Paper and Multiwall Bags",
                    "fullTitle": "2674 - Uncoated Paper and Multiwall Bags"
                },
                {
                    "id": "2675",
                    "title": "Die-Cut Paper and Paperboard and Cardboard",
                    "fullTitle": "2675 - Die-Cut Paper and Paperboard and Cardboard"
                },
                {
                    "id": "2676",
                    "title": "Sanitary Paper Products",
                    "fullTitle": "2676 - Sanitary Paper Products"
                },
                {
                    "id": "2677",
                    "title": "Envelopes",
                    "fullTitle": "2677 - Envelopes"
                },
                {
                    "id": "2678",
                    "title": "Stationery, Tablets, and Related Products",
                    "fullTitle": "2678 - Stationery, Tablets, and Related Products"
                },
                {
                    "id": "2679",
                    "title": "Converted Paper and Paperboard Products, Not Elsewhere Classified",
                    "fullTitle": "2679 - Converted Paper and Paperboard Products, Not Elsewhere Classified"
                },
                {
                    "id": "2711",
                    "title": "Newspapers Publishing, or Publishing and Printing",
                    "fullTitle": "2711 - Newspapers Publishing, or Publishing and Printing"
                },
                {
                    "id": "2721",
                    "title": "Periodicals Publishing, or Publishing and Printing",
                    "fullTitle": "2721 - Periodicals Publishing, or Publishing and Printing"
                },
                {
                    "id": "2731",
                    "title": "Books Publishing, or Publishing and Printing",
                    "fullTitle": "2731 - Books Publishing, or Publishing and Printing"
                },
                {
                    "id": "2732",
                    "title": "Book Printing",
                    "fullTitle": "2732 - Book Printing"
                },
                {
                    "id": "2741",
                    "title": "Miscellaneous Publishing",
                    "fullTitle": "2741 - Miscellaneous Publishing"
                },
                {
                    "id": "2752",
                    "title": "Commercial Printing, Lithographic",
                    "fullTitle": "2752 - Commercial Printing, Lithographic"
                },
                {
                    "id": "2754",
                    "title": "Commercial Printing, Gravure",
                    "fullTitle": "2754 - Commercial Printing, Gravure"
                },
                {
                    "id": "2759",
                    "title": "Commercial Printing, Not Elsewhere Classified",
                    "fullTitle": "2759 - Commercial Printing, Not Elsewhere Classified"
                },
                {
                    "id": "2761",
                    "title": "Manifold Business Forms",
                    "fullTitle": "2761 - Manifold Business Forms"
                },
                {
                    "id": "2771",
                    "title": "Greeting Cards",
                    "fullTitle": "2771 - Greeting Cards"
                },
                {
                    "id": "2782",
                    "title": "Blankbooks, Looseleaf Binders and Devices",
                    "fullTitle": "2782 - Blankbooks, Looseleaf Binders and Devices"
                },
                {
                    "id": "2789",
                    "title": "Bookbinding and Related Work",
                    "fullTitle": "2789 - Bookbinding and Related Work"
                },
                {
                    "id": "2791",
                    "title": "Typesetting",
                    "fullTitle": "2791 - Typesetting"
                },
                {
                    "id": "2796",
                    "title": "Platemaking and Related Services",
                    "fullTitle": "2796 - Platemaking and Related Services"
                },
                {
                    "id": "2812",
                    "title": "Alkalies and Chlorine",
                    "fullTitle": "2812 - Alkalies and Chlorine"
                },
                {
                    "id": "2813",
                    "title": "Industrial Gases",
                    "fullTitle": "2813 - Industrial Gases"
                },
                {
                    "id": "2816",
                    "title": "Inorganic Pigments",
                    "fullTitle": "2816 - Inorganic Pigments"
                },
                {
                    "id": "2819",
                    "title": "Industrial Inorganic Chemicals, Not Elsewhere Classified",
                    "fullTitle": "2819 - Industrial Inorganic Chemicals, Not Elsewhere Classified"
                },
                {
                    "id": "2821",
                    "title": "Plastics Materials, Synthetic Resins, and Nonvulcanizable Elastomers",
                    "fullTitle": "2821 - Plastics Materials, Synthetic Resins, and Nonvulcanizable Elastomers"
                },
                {
                    "id": "2822",
                    "title": "Synthetic Rubber (Vulcanizable Elastomers)",
                    "fullTitle": "2822 - Synthetic Rubber (Vulcanizable Elastomers)"
                },
                {
                    "id": "2823",
                    "title": "Cellulosic Manmade Fibers",
                    "fullTitle": "2823 - Cellulosic Manmade Fibers"
                },
                {
                    "id": "2824",
                    "title": "Manmade Organic Fibers, Except Cellulosic",
                    "fullTitle": "2824 - Manmade Organic Fibers, Except Cellulosic"
                },
                {
                    "id": "2833",
                    "title": "Medicinal Chemicals and Botanical Products",
                    "fullTitle": "2833 - Medicinal Chemicals and Botanical Products"
                },
                {
                    "id": "2834",
                    "title": "Pharmaceutical Preparations",
                    "fullTitle": "2834 - Pharmaceutical Preparations"
                },
                {
                    "id": "2835",
                    "title": "In Vitro and In Vivo Diagnostic Substances",
                    "fullTitle": "2835 - In Vitro and In Vivo Diagnostic Substances"
                },
                {
                    "id": "2836",
                    "title": "Biological Products, Except Diagnostic Substances",
                    "fullTitle": "2836 - Biological Products, Except Diagnostic Substances"
                },
                {
                    "id": "2841",
                    "title": "Soap and Other Detergents, Except Specialty Cleaners",
                    "fullTitle": "2841 - Soap and Other Detergents, Except Specialty Cleaners"
                },
                {
                    "id": "2842",
                    "title": "Specialty Cleaning, Polishing, and Sanitation Preparations",
                    "fullTitle": "2842 - Specialty Cleaning, Polishing, and Sanitation Preparations"
                },
                {
                    "id": "2843",
                    "title": "Surface Active Agents, Finishing Agents, Sulfonated Oils, and Assistants",
                    "fullTitle": "2843 - Surface Active Agents, Finishing Agents, Sulfonated Oils, and Assistants"
                },
                {
                    "id": "2844",
                    "title": "Perfumes, Cosmetics, and Other Toilet Preparations",
                    "fullTitle": "2844 - Perfumes, Cosmetics, and Other Toilet Preparations"
                },
                {
                    "id": "2851",
                    "title": "Paints, Varnishes, Lacquers, Enamels, and Allied Products",
                    "fullTitle": "2851 - Paints, Varnishes, Lacquers, Enamels, and Allied Products"
                },
                {
                    "id": "2861",
                    "title": "Gum and Wood Chemicals",
                    "fullTitle": "2861 - Gum and Wood Chemicals"
                },
                {
                    "id": "2865",
                    "title": "Cyclic Organic Crudes and Intermediates, and organic Dyes and Pigments",
                    "fullTitle": "2865 - Cyclic Organic Crudes and Intermediates, and organic Dyes and Pigments"
                },
                {
                    "id": "2869",
                    "title": "Industrial Organic Chemicals, Not Elsewhere Classified",
                    "fullTitle": "2869 - Industrial Organic Chemicals, Not Elsewhere Classified"
                },
                {
                    "id": "2873",
                    "title": "Nitrogenous Fertilizers",
                    "fullTitle": "2873 - Nitrogenous Fertilizers"
                },
                {
                    "id": "2874",
                    "title": "Phosphatic Fertilizers",
                    "fullTitle": "2874 - Phosphatic Fertilizers"
                },
                {
                    "id": "2875",
                    "title": "Fertilizers, Mixing only",
                    "fullTitle": "2875 - Fertilizers, Mixing only"
                },
                {
                    "id": "2879",
                    "title": "Pesticides and Agricultural Chemicals, Not Elsewhere Classified",
                    "fullTitle": "2879 - Pesticides and Agricultural Chemicals, Not Elsewhere Classified"
                },
                {
                    "id": "2891",
                    "title": "Adhesives and Sealants",
                    "fullTitle": "2891 - Adhesives and Sealants"
                },
                {
                    "id": "2892",
                    "title": "Explosives",
                    "fullTitle": "2892 - Explosives"
                },
                {
                    "id": "2893",
                    "title": "Printing Ink",
                    "fullTitle": "2893 - Printing Ink"
                },
                {
                    "id": "2895",
                    "title": "Carbon Black",
                    "fullTitle": "2895 - Carbon Black"
                },
                {
                    "id": "2899",
                    "title": "Chemicals and Chemical Preparations, Not Elsewhere Classified",
                    "fullTitle": "2899 - Chemicals and Chemical Preparations, Not Elsewhere Classified"
                },
                {
                    "id": "2911",
                    "title": "Petroleum Refining",
                    "fullTitle": "2911 - Petroleum Refining"
                },
                {
                    "id": "2951",
                    "title": "Asphalt Paving Mixtures and Blocks",
                    "fullTitle": "2951 - Asphalt Paving Mixtures and Blocks"
                },
                {
                    "id": "2952",
                    "title": "Asphalt Felts and Coatings",
                    "fullTitle": "2952 - Asphalt Felts and Coatings"
                },
                {
                    "id": "2992",
                    "title": "Lubricating Oils and Greases",
                    "fullTitle": "2992 - Lubricating Oils and Greases"
                },
                {
                    "id": "2999",
                    "title": "Products of Petroleum and Coal, Not Elsewhere Classified",
                    "fullTitle": "2999 - Products of Petroleum and Coal, Not Elsewhere Classified"
                },
                {
                    "id": "3011",
                    "title": "Tires and Inner Tubes",
                    "fullTitle": "3011 - Tires and Inner Tubes"
                },
                {
                    "id": "3021",
                    "title": "Rubber and Plastics Footwear",
                    "fullTitle": "3021 - Rubber and Plastics Footwear"
                },
                {
                    "id": "3052",
                    "title": "Rubber and Plastics Hose and Belting",
                    "fullTitle": "3052 - Rubber and Plastics Hose and Belting"
                },
                {
                    "id": "3053",
                    "title": "Gaskets, Packing, and Sealing Devices",
                    "fullTitle": "3053 - Gaskets, Packing, and Sealing Devices"
                },
                {
                    "id": "3061",
                    "title": "Molded, Extruded, and Lathe",
                    "fullTitle": "3061 - Molded, Extruded, and Lathe"
                },
                {
                    "id": "3069",
                    "title": "Fabricated Rubber Products, Not Elsewhere Classified",
                    "fullTitle": "3069 - Fabricated Rubber Products, Not Elsewhere Classified"
                },
                {
                    "id": "3081",
                    "title": "Unsupported Plastics Film and Sheet",
                    "fullTitle": "3081 - Unsupported Plastics Film and Sheet"
                },
                {
                    "id": "3082",
                    "title": "Unsupported Plastics Profile Shapes",
                    "fullTitle": "3082 - Unsupported Plastics Profile Shapes"
                },
                {
                    "id": "3083",
                    "title": "Laminated Plastics Plate, Sheet, and Profile Shapes",
                    "fullTitle": "3083 - Laminated Plastics Plate, Sheet, and Profile Shapes"
                },
                {
                    "id": "3084",
                    "title": "Plastics Pipe",
                    "fullTitle": "3084 - Plastics Pipe"
                },
                {
                    "id": "3085",
                    "title": "Plastics Bottles",
                    "fullTitle": "3085 - Plastics Bottles"
                },
                {
                    "id": "3086",
                    "title": "Plastics Foam Products",
                    "fullTitle": "3086 - Plastics Foam Products"
                },
                {
                    "id": "3087",
                    "title": "Custom Compounding of Purchased Plastics Resins",
                    "fullTitle": "3087 - Custom Compounding of Purchased Plastics Resins"
                },
                {
                    "id": "3088",
                    "title": "Plastics Plumbing Fixtures",
                    "fullTitle": "3088 - Plastics Plumbing Fixtures"
                },
                {
                    "id": "3089",
                    "title": "Plastics Products, Not Elsewhere Classified",
                    "fullTitle": "3089 - Plastics Products, Not Elsewhere Classified"
                },
                {
                    "id": "3111",
                    "title": "Leather Tanning and Finishing",
                    "fullTitle": "3111 - Leather Tanning and Finishing"
                },
                {
                    "id": "3131",
                    "title": "Boot and Shoe Cut Stock and Findings",
                    "fullTitle": "3131 - Boot and Shoe Cut Stock and Findings"
                },
                {
                    "id": "3142",
                    "title": "House Slippers",
                    "fullTitle": "3142 - House Slippers"
                },
                {
                    "id": "3143",
                    "title": "Men's Footwear, Except Athletic",
                    "fullTitle": "3143 - Men's Footwear, Except Athletic"
                },
                {
                    "id": "3144",
                    "title": "Women's Footwear, Except Athletic",
                    "fullTitle": "3144 - Women's Footwear, Except Athletic"
                },
                {
                    "id": "3149",
                    "title": "Footwear, Except Rubber, Not Elsewhere Classified",
                    "fullTitle": "3149 - Footwear, Except Rubber, Not Elsewhere Classified"
                },
                {
                    "id": "3151",
                    "title": "Leather Gloves and Mittens",
                    "fullTitle": "3151 - Leather Gloves and Mittens"
                },
                {
                    "id": "3161",
                    "title": "Luggage",
                    "fullTitle": "3161 - Luggage"
                },
                {
                    "id": "3171",
                    "title": "Women's Handbags and Purses",
                    "fullTitle": "3171 - Women's Handbags and Purses"
                },
                {
                    "id": "3172",
                    "title": "Personal Leather Goods, Except Women's Handbags and Purses",
                    "fullTitle": "3172 - Personal Leather Goods, Except Women's Handbags and Purses"
                },
                {
                    "id": "3199",
                    "title": "Leather Goods, Not Elsewhere Classified",
                    "fullTitle": "3199 - Leather Goods, Not Elsewhere Classified"
                },
                {
                    "id": "3211",
                    "title": "Flat Glass",
                    "fullTitle": "3211 - Flat Glass"
                },
                {
                    "id": "3221",
                    "title": "Glass Containers",
                    "fullTitle": "3221 - Glass Containers"
                },
                {
                    "id": "3229",
                    "title": "Pressed and Blown Glass and Glassware, Not Elsewhere Classified",
                    "fullTitle": "3229 - Pressed and Blown Glass and Glassware, Not Elsewhere Classified"
                },
                {
                    "id": "3231",
                    "title": "Glass Products, Made of Purchased Glass",
                    "fullTitle": "3231 - Glass Products, Made of Purchased Glass"
                },
                {
                    "id": "3241",
                    "title": "Cement, Hydraulic",
                    "fullTitle": "3241 - Cement, Hydraulic"
                },
                {
                    "id": "3251",
                    "title": "Brick and Structural Clay Tile",
                    "fullTitle": "3251 - Brick and Structural Clay Tile"
                },
                {
                    "id": "3253",
                    "title": "Ceramic Wall and Floor Tile",
                    "fullTitle": "3253 - Ceramic Wall and Floor Tile"
                },
                {
                    "id": "3255",
                    "title": "Clay Refractories",
                    "fullTitle": "3255 - Clay Refractories"
                },
                {
                    "id": "3259",
                    "title": "Structural Clay Products, Not Elsewhere Classified",
                    "fullTitle": "3259 - Structural Clay Products, Not Elsewhere Classified"
                },
                {
                    "id": "3261",
                    "title": "Vitreous China Plumbing Fixtures and China and Earthenware Fittings and Bathroom Accessories",
                    "fullTitle": "3261 - Vitreous China Plumbing Fixtures and China and Earthenware Fittings and Bathroom Accessories"
                },
                {
                    "id": "3262",
                    "title": "Vitreous China Table and Kitchen Articles",
                    "fullTitle": "3262 - Vitreous China Table and Kitchen Articles"
                },
                {
                    "id": "3263",
                    "title": "Fine Earthenware (Whiteware) Table and Kitchen Articles",
                    "fullTitle": "3263 - Fine Earthenware (Whiteware) Table and Kitchen Articles"
                },
                {
                    "id": "3264",
                    "title": "Porcelain Electrical Supplies",
                    "fullTitle": "3264 - Porcelain Electrical Supplies"
                },
                {
                    "id": "3269",
                    "title": "Pottery Products, Not Elsewhere Classified",
                    "fullTitle": "3269 - Pottery Products, Not Elsewhere Classified"
                },
                {
                    "id": "3271",
                    "title": "Concrete Block and Brick",
                    "fullTitle": "3271 - Concrete Block and Brick"
                },
                {
                    "id": "3272",
                    "title": "Concrete Products, Except Block and Brick",
                    "fullTitle": "3272 - Concrete Products, Except Block and Brick"
                },
                {
                    "id": "3273",
                    "title": "Ready-Mixed Concrete",
                    "fullTitle": "3273 - Ready-Mixed Concrete"
                },
                {
                    "id": "3274",
                    "title": "Lime",
                    "fullTitle": "3274 - Lime"
                },
                {
                    "id": "3275",
                    "title": "Gypsum Products",
                    "fullTitle": "3275 - Gypsum Products"
                },
                {
                    "id": "3281",
                    "title": "Cut Stone and Stone Products",
                    "fullTitle": "3281 - Cut Stone and Stone Products"
                },
                {
                    "id": "3291",
                    "title": "Abrasive Products",
                    "fullTitle": "3291 - Abrasive Products"
                },
                {
                    "id": "3292",
                    "title": "Asbestos Products",
                    "fullTitle": "3292 - Asbestos Products"
                },
                {
                    "id": "3295",
                    "title": "Minerals and Earths, Ground or Otherwise Treated",
                    "fullTitle": "3295 - Minerals and Earths, Ground or Otherwise Treated"
                },
                {
                    "id": "3296",
                    "title": "Mineral Wool",
                    "fullTitle": "3296 - Mineral Wool"
                },
                {
                    "id": "3297",
                    "title": "Nonclay Refractories",
                    "fullTitle": "3297 - Nonclay Refractories"
                },
                {
                    "id": "3299",
                    "title": "Nonmetallic Mineral Products, Not Elsewhere Classified",
                    "fullTitle": "3299 - Nonmetallic Mineral Products, Not Elsewhere Classified"
                },
                {
                    "id": "3312",
                    "title": "Steel Works, Blast Furnaces (Including Coke Ovens), and Rolling Mills",
                    "fullTitle": "3312 - Steel Works, Blast Furnaces (Including Coke Ovens), and Rolling Mills"
                },
                {
                    "id": "3313",
                    "title": "Electrometallurgical Products, Except Steel",
                    "fullTitle": "3313 - Electrometallurgical Products, Except Steel"
                },
                {
                    "id": "3315",
                    "title": "Steel Wiredrawing and Steel Nails and Spikes",
                    "fullTitle": "3315 - Steel Wiredrawing and Steel Nails and Spikes"
                },
                {
                    "id": "3316",
                    "title": "Cold-rolled Steel Sheet, Strip, and Bars",
                    "fullTitle": "3316 - Cold-rolled Steel Sheet, Strip, and Bars"
                },
                {
                    "id": "3317",
                    "title": "Steel Pipe and Tubes",
                    "fullTitle": "3317 - Steel Pipe and Tubes"
                },
                {
                    "id": "3321",
                    "title": "Gray and Ductile Iron Foundries",
                    "fullTitle": "3321 - Gray and Ductile Iron Foundries"
                },
                {
                    "id": "3322",
                    "title": "Malleable Iron Foundries",
                    "fullTitle": "3322 - Malleable Iron Foundries"
                },
                {
                    "id": "3324",
                    "title": "Steel Investment Foundries",
                    "fullTitle": "3324 - Steel Investment Foundries"
                },
                {
                    "id": "3325",
                    "title": "Steel Foundries, Not Elsewhere Classified",
                    "fullTitle": "3325 - Steel Foundries, Not Elsewhere Classified"
                },
                {
                    "id": "3331",
                    "title": "Primary Smelting and Refining of Copper",
                    "fullTitle": "3331 - Primary Smelting and Refining of Copper"
                },
                {
                    "id": "3334",
                    "title": "Primary Production of Aluminum",
                    "fullTitle": "3334 - Primary Production of Aluminum"
                },
                {
                    "id": "3339",
                    "title": "Primary Smelting and Refining of Nonferrous Metals, Except Copper and Aluminum",
                    "fullTitle": "3339 - Primary Smelting and Refining of Nonferrous Metals, Except Copper and Aluminum"
                },
                {
                    "id": "3341",
                    "title": "Secondary Smelting and Refining of Nonferrous Metals",
                    "fullTitle": "3341 - Secondary Smelting and Refining of Nonferrous Metals"
                },
                {
                    "id": "3351",
                    "title": "Rolling, Drawing, and Extruding of Copper",
                    "fullTitle": "3351 - Rolling, Drawing, and Extruding of Copper"
                },
                {
                    "id": "3353",
                    "title": "Aluminum Sheet, Plate, and Foil",
                    "fullTitle": "3353 - Aluminum Sheet, Plate, and Foil"
                },
                {
                    "id": "3354",
                    "title": "Aluminum Extruded Products",
                    "fullTitle": "3354 - Aluminum Extruded Products"
                },
                {
                    "id": "3355",
                    "title": "Aluminum Rolling and Drawing, Not Elsewhere Classified",
                    "fullTitle": "3355 - Aluminum Rolling and Drawing, Not Elsewhere Classified"
                },
                {
                    "id": "3356",
                    "title": "Rolling, Drawing, and Extruding of Nonferrous Metals, Except Copper and Aluminum",
                    "fullTitle": "3356 - Rolling, Drawing, and Extruding of Nonferrous Metals, Except Copper and Aluminum"
                },
                {
                    "id": "3357",
                    "title": "Drawing and Insulating of Nonferrous Wire",
                    "fullTitle": "3357 - Drawing and Insulating of Nonferrous Wire"
                },
                {
                    "id": "3363",
                    "title": "Aluminum Die-Castings",
                    "fullTitle": "3363 - Aluminum Die-Castings"
                },
                {
                    "id": "3364",
                    "title": "Nonferrous Die-Castings, except Aluminum",
                    "fullTitle": "3364 - Nonferrous Die-Castings, except Aluminum"
                },
                {
                    "id": "3365",
                    "title": "Aluminum Foundries",
                    "fullTitle": "3365 - Aluminum Foundries"
                },
                {
                    "id": "3366",
                    "title": "Copper Foundries",
                    "fullTitle": "3366 - Copper Foundries"
                },
                {
                    "id": "3369",
                    "title": "Nonferrous Foundries, Except Aluminum and Copper",
                    "fullTitle": "3369 - Nonferrous Foundries, Except Aluminum and Copper"
                },
                {
                    "id": "3398",
                    "title": "Metal Heat Treating",
                    "fullTitle": "3398 - Metal Heat Treating"
                },
                {
                    "id": "3399",
                    "title": "Primary Metal Products, Not Elsewhere Classified",
                    "fullTitle": "3399 - Primary Metal Products, Not Elsewhere Classified"
                },
                {
                    "id": "3411",
                    "title": "Metal Cans",
                    "fullTitle": "3411 - Metal Cans"
                },
                {
                    "id": "3412",
                    "title": "Metal Shipping Barrels, Drums, Kegs, and Pails",
                    "fullTitle": "3412 - Metal Shipping Barrels, Drums, Kegs, and Pails"
                },
                {
                    "id": "3421",
                    "title": "Cutlery",
                    "fullTitle": "3421 - Cutlery"
                },
                {
                    "id": "3423",
                    "title": "Hand and Edge Tools, Except Machine Tools and Handsaws",
                    "fullTitle": "3423 - Hand and Edge Tools, Except Machine Tools and Handsaws"
                },
                {
                    "id": "3425",
                    "title": "Saw Blades and Handsaws",
                    "fullTitle": "3425 - Saw Blades and Handsaws"
                },
                {
                    "id": "3429",
                    "title": "Hardware, Not Elsewhere Classified",
                    "fullTitle": "3429 - Hardware, Not Elsewhere Classified"
                },
                {
                    "id": "3431",
                    "title": "Enameled Iron and Metal Sanitary Ware",
                    "fullTitle": "3431 - Enameled Iron and Metal Sanitary Ware"
                },
                {
                    "id": "3432",
                    "title": "Plumbing Fixture Fittings and Trim",
                    "fullTitle": "3432 - Plumbing Fixture Fittings and Trim"
                },
                {
                    "id": "3433",
                    "title": "Heating Equipment, Except Electric and Warm Air Furnaces",
                    "fullTitle": "3433 - Heating Equipment, Except Electric and Warm Air Furnaces"
                },
                {
                    "id": "3441",
                    "title": "Fabricated Structural Metal",
                    "fullTitle": "3441 - Fabricated Structural Metal"
                },
                {
                    "id": "3442",
                    "title": "Metal Doors, Sash, Frames, Molding, and Trim Manufacturing",
                    "fullTitle": "3442 - Metal Doors, Sash, Frames, Molding, and Trim Manufacturing"
                },
                {
                    "id": "3443",
                    "title": "Fabricated Plate Work (Boiler Shops)",
                    "fullTitle": "3443 - Fabricated Plate Work (Boiler Shops)"
                },
                {
                    "id": "3444",
                    "title": "Sheet Metal Work",
                    "fullTitle": "3444 - Sheet Metal Work"
                },
                {
                    "id": "3446",
                    "title": "Architectural and Ornamental Metal Work",
                    "fullTitle": "3446 - Architectural and Ornamental Metal Work"
                },
                {
                    "id": "3448",
                    "title": "Prefabricated Metal Buildings and Components",
                    "fullTitle": "3448 - Prefabricated Metal Buildings and Components"
                },
                {
                    "id": "3449",
                    "title": "Miscellaneous Structural Metal Work",
                    "fullTitle": "3449 - Miscellaneous Structural Metal Work"
                },
                {
                    "id": "3451",
                    "title": "Screw Machine Products",
                    "fullTitle": "3451 - Screw Machine Products"
                },
                {
                    "id": "3452",
                    "title": "Bolts, Nuts, Screws, Rivets, and Washers",
                    "fullTitle": "3452 - Bolts, Nuts, Screws, Rivets, and Washers"
                },
                {
                    "id": "3462",
                    "title": "Iron and Steel Forgings",
                    "fullTitle": "3462 - Iron and Steel Forgings"
                },
                {
                    "id": "3463",
                    "title": "Nonferrous Forgings",
                    "fullTitle": "3463 - Nonferrous Forgings"
                },
                {
                    "id": "3465",
                    "title": "Automotive Stampings",
                    "fullTitle": "3465 - Automotive Stampings"
                },
                {
                    "id": "3466",
                    "title": "Crowns and Closures",
                    "fullTitle": "3466 - Crowns and Closures"
                },
                {
                    "id": "3469",
                    "title": "Metal Stampings, Not Elsewhere Classified",
                    "fullTitle": "3469 - Metal Stampings, Not Elsewhere Classified"
                },
                {
                    "id": "3471",
                    "title": "Electroplating, Plating, Polishing, Anodizing, and Coloring",
                    "fullTitle": "3471 - Electroplating, Plating, Polishing, Anodizing, and Coloring"
                },
                {
                    "id": "3479",
                    "title": "Coating, Engraving, and Allied Services, Not Elsewhere Classified",
                    "fullTitle": "3479 - Coating, Engraving, and Allied Services, Not Elsewhere Classified"
                },
                {
                    "id": "3482",
                    "title": "Small Arms Ammunition",
                    "fullTitle": "3482 - Small Arms Ammunition"
                },
                {
                    "id": "3483",
                    "title": "Ammunition, Except for Small Arms",
                    "fullTitle": "3483 - Ammunition, Except for Small Arms"
                },
                {
                    "id": "3484",
                    "title": "Small Arms",
                    "fullTitle": "3484 - Small Arms"
                },
                {
                    "id": "3489",
                    "title": "Ordnance and Accessories, Not Elsewhere Classified",
                    "fullTitle": "3489 - Ordnance and Accessories, Not Elsewhere Classified"
                },
                {
                    "id": "3491",
                    "title": "Industrial Valves",
                    "fullTitle": "3491 - Industrial Valves"
                },
                {
                    "id": "3492",
                    "title": "Fluid Power Valves and Hose Fittings",
                    "fullTitle": "3492 - Fluid Power Valves and Hose Fittings"
                },
                {
                    "id": "3493",
                    "title": "Steel Springs, Except Wire",
                    "fullTitle": "3493 - Steel Springs, Except Wire"
                },
                {
                    "id": "3494",
                    "title": "Valves and Pipe Fittings, Not Elsewhere Classified",
                    "fullTitle": "3494 - Valves and Pipe Fittings, Not Elsewhere Classified"
                },
                {
                    "id": "3495",
                    "title": "Wire Springs",
                    "fullTitle": "3495 - Wire Springs"
                },
                {
                    "id": "3496",
                    "title": "Miscellaneous Fabricated Wire Products",
                    "fullTitle": "3496 - Miscellaneous Fabricated Wire Products"
                },
                {
                    "id": "3497",
                    "title": "Metal Foil and Leaf",
                    "fullTitle": "3497 - Metal Foil and Leaf"
                },
                {
                    "id": "3498",
                    "title": "Fabricated Pipe and Pipe Fittings",
                    "fullTitle": "3498 - Fabricated Pipe and Pipe Fittings"
                },
                {
                    "id": "3499",
                    "title": "Fabricated Metal Products, Not Elsewhere Classified",
                    "fullTitle": "3499 - Fabricated Metal Products, Not Elsewhere Classified"
                },
                {
                    "id": "3511",
                    "title": "Steam, Gas, and Hydraulic Turbines, and Turbine Generator Set Units",
                    "fullTitle": "3511 - Steam, Gas, and Hydraulic Turbines, and Turbine Generator Set Units"
                },
                {
                    "id": "3519",
                    "title": "Internal Combustion Engines, Not Elsewhere Classified",
                    "fullTitle": "3519 - Internal Combustion Engines, Not Elsewhere Classified"
                },
                {
                    "id": "3523",
                    "title": "Farm Machinery and Equipment",
                    "fullTitle": "3523 - Farm Machinery and Equipment"
                },
                {
                    "id": "3524",
                    "title": "Lawn and Garden Tractors and Home Lawn and Garden Equipment",
                    "fullTitle": "3524 - Lawn and Garden Tractors and Home Lawn and Garden Equipment"
                },
                {
                    "id": "3531",
                    "title": "Construction Machinery and Equipment",
                    "fullTitle": "3531 - Construction Machinery and Equipment"
                },
                {
                    "id": "3532",
                    "title": "Mining Machinery and Equipment, Except Oil and Gas Field Machinery and Equipment",
                    "fullTitle": "3532 - Mining Machinery and Equipment, Except Oil and Gas Field Machinery and Equipment"
                },
                {
                    "id": "3533",
                    "title": "Oil and Gas Field Machinery and Equipment",
                    "fullTitle": "3533 - Oil and Gas Field Machinery and Equipment"
                },
                {
                    "id": "3534",
                    "title": "Elevators and Moving Stairways",
                    "fullTitle": "3534 - Elevators and Moving Stairways"
                },
                {
                    "id": "3535",
                    "title": "Conveyors and Conveying Equipment",
                    "fullTitle": "3535 - Conveyors and Conveying Equipment"
                },
                {
                    "id": "3536",
                    "title": "Overhead Traveling Cranes, Hoists, and Monorail Systems",
                    "fullTitle": "3536 - Overhead Traveling Cranes, Hoists, and Monorail Systems"
                },
                {
                    "id": "3537",
                    "title": "Industrial Trucks, Tractors, Trailers, and Stackers",
                    "fullTitle": "3537 - Industrial Trucks, Tractors, Trailers, and Stackers"
                },
                {
                    "id": "3541",
                    "title": "Machine Tools, Metal Cutting Types",
                    "fullTitle": "3541 - Machine Tools, Metal Cutting Types"
                },
                {
                    "id": "3542",
                    "title": "Machine Tools, Metal Forming Types",
                    "fullTitle": "3542 - Machine Tools, Metal Forming Types"
                },
                {
                    "id": "3543",
                    "title": "Industrial Patterns",
                    "fullTitle": "3543 - Industrial Patterns"
                },
                {
                    "id": "3544",
                    "title": "Special Dies and Tools, Die Sets, Jigs and Fixtures, and Industrial Molds",
                    "fullTitle": "3544 - Special Dies and Tools, Die Sets, Jigs and Fixtures, and Industrial Molds"
                },
                {
                    "id": "3545",
                    "title": "Cutting Tools, Machine Tool Accessories, and Machinists' Precision Measuring Devices",
                    "fullTitle": "3545 - Cutting Tools, Machine Tool Accessories, and Machinists' Precision Measuring Devices"
                },
                {
                    "id": "3546",
                    "title": "Power-Driven Hand Tools",
                    "fullTitle": "3546 - Power-Driven Hand Tools"
                },
                {
                    "id": "3547",
                    "title": "Rolling Mill Machinery and Equipment",
                    "fullTitle": "3547 - Rolling Mill Machinery and Equipment"
                },
                {
                    "id": "3548",
                    "title": "Electric and Gas Welding and Soldering Equipment",
                    "fullTitle": "3548 - Electric and Gas Welding and Soldering Equipment"
                },
                {
                    "id": "3549",
                    "title": "Metalworking Machinery, Not Elsewhere Classified",
                    "fullTitle": "3549 - Metalworking Machinery, Not Elsewhere Classified"
                },
                {
                    "id": "3552",
                    "title": "Textile Machinery",
                    "fullTitle": "3552 - Textile Machinery"
                },
                {
                    "id": "3553",
                    "title": "Woodworking Machinery",
                    "fullTitle": "3553 - Woodworking Machinery"
                },
                {
                    "id": "3554",
                    "title": "Paper Industries Machinery",
                    "fullTitle": "3554 - Paper Industries Machinery"
                },
                {
                    "id": "3555",
                    "title": "Printing Trades Machinery and Equipment",
                    "fullTitle": "3555 - Printing Trades Machinery and Equipment"
                },
                {
                    "id": "3556",
                    "title": "Food Products Machinery",
                    "fullTitle": "3556 - Food Products Machinery"
                },
                {
                    "id": "3559",
                    "title": "Special Industry Machinery, Not Elsewhere Classified",
                    "fullTitle": "3559 - Special Industry Machinery, Not Elsewhere Classified"
                },
                {
                    "id": "3561",
                    "title": "Pumps and Pumping Equipment",
                    "fullTitle": "3561 - Pumps and Pumping Equipment"
                },
                {
                    "id": "3562",
                    "title": "Ball and Roller Bearings",
                    "fullTitle": "3562 - Ball and Roller Bearings"
                },
                {
                    "id": "3563",
                    "title": "Air and Gas Compressors",
                    "fullTitle": "3563 - Air and Gas Compressors"
                },
                {
                    "id": "3564",
                    "title": "Industrial and Commercial Fans and Blowers and Air Purification Equipment",
                    "fullTitle": "3564 - Industrial and Commercial Fans and Blowers and Air Purification Equipment"
                },
                {
                    "id": "3565",
                    "title": "Packaging Machinery",
                    "fullTitle": "3565 - Packaging Machinery"
                },
                {
                    "id": "3566",
                    "title": "Speed Changers, Industrial High",
                    "fullTitle": "3566 - Speed Changers, Industrial High"
                },
                {
                    "id": "3567",
                    "title": "Industrial Process Furnaces and Ovens",
                    "fullTitle": "3567 - Industrial Process Furnaces and Ovens"
                },
                {
                    "id": "3568",
                    "title": "Mechanical Power Transmission Equipment, Not Elsewhere Classified",
                    "fullTitle": "3568 - Mechanical Power Transmission Equipment, Not Elsewhere Classified"
                },
                {
                    "id": "3569",
                    "title": "General Industrial Machinery and Equipment, Not Elsewhere Classified",
                    "fullTitle": "3569 - General Industrial Machinery and Equipment, Not Elsewhere Classified"
                },
                {
                    "id": "3571",
                    "title": "Electronic Computers",
                    "fullTitle": "3571 - Electronic Computers"
                },
                {
                    "id": "3572",
                    "title": "Computer Storage Devices",
                    "fullTitle": "3572 - Computer Storage Devices"
                },
                {
                    "id": "3575",
                    "title": "Computer Terminals",
                    "fullTitle": "3575 - Computer Terminals"
                },
                {
                    "id": "3577",
                    "title": "Computer Peripheral Equipment, Not Elsewhere Classified",
                    "fullTitle": "3577 - Computer Peripheral Equipment, Not Elsewhere Classified"
                },
                {
                    "id": "3578",
                    "title": "Calculating and Accounting Machines, Except Electronic Computers",
                    "fullTitle": "3578 - Calculating and Accounting Machines, Except Electronic Computers"
                },
                {
                    "id": "3579",
                    "title": "Office Machines, Not Elsewhere Classified",
                    "fullTitle": "3579 - Office Machines, Not Elsewhere Classified"
                },
                {
                    "id": "3581",
                    "title": "Automatic Vending Machines",
                    "fullTitle": "3581 - Automatic Vending Machines"
                },
                {
                    "id": "3582",
                    "title": "Commercial Laundry, Drycleaning, and Pressing Machines",
                    "fullTitle": "3582 - Commercial Laundry, Drycleaning, and Pressing Machines"
                },
                {
                    "id": "3585",
                    "title": "Air-Conditioning and Warm Air Heating Equipment and Commercial and Industrial Refrigeration Equipment",
                    "fullTitle": "3585 - Air-Conditioning and Warm Air Heating Equipment and Commercial and Industrial Refrigeration Equipment"
                },
                {
                    "id": "3586",
                    "title": "Measuring and Dispensing Pumps",
                    "fullTitle": "3586 - Measuring and Dispensing Pumps"
                },
                {
                    "id": "3589",
                    "title": "Service Industry Machinery, Not Elsewhere Classified",
                    "fullTitle": "3589 - Service Industry Machinery, Not Elsewhere Classified"
                },
                {
                    "id": "3592",
                    "title": "Carburetors, Pistons, Piston Rings, and Valves",
                    "fullTitle": "3592 - Carburetors, Pistons, Piston Rings, and Valves"
                },
                {
                    "id": "3593",
                    "title": "Fluid Power Cylinders and Actuators",
                    "fullTitle": "3593 - Fluid Power Cylinders and Actuators"
                },
                {
                    "id": "3594",
                    "title": "Fluid Power Pumps and Motors",
                    "fullTitle": "3594 - Fluid Power Pumps and Motors"
                },
                {
                    "id": "3596",
                    "title": "Scales and Balances, Except Laboratory",
                    "fullTitle": "3596 - Scales and Balances, Except Laboratory"
                },
                {
                    "id": "3599",
                    "title": "Industrial and Commercial Machinery and Equipment, Not Elsewhere Classified",
                    "fullTitle": "3599 - Industrial and Commercial Machinery and Equipment, Not Elsewhere Classified"
                },
                {
                    "id": "3612",
                    "title": "Power, Distribution, and Specialty Transformers",
                    "fullTitle": "3612 - Power, Distribution, and Specialty Transformers"
                },
                {
                    "id": "3613",
                    "title": "Switchgear and Switchboard Apparatus",
                    "fullTitle": "3613 - Switchgear and Switchboard Apparatus"
                },
                {
                    "id": "3621",
                    "title": "Motors and Generators",
                    "fullTitle": "3621 - Motors and Generators"
                },
                {
                    "id": "3624",
                    "title": "Carbon and Graphite Products",
                    "fullTitle": "3624 - Carbon and Graphite Products"
                },
                {
                    "id": "3625",
                    "title": "Relays and Industrial Controls",
                    "fullTitle": "3625 - Relays and Industrial Controls"
                },
                {
                    "id": "3629",
                    "title": "Electrical Industrial Apparatus, Not Elsewhere Classified",
                    "fullTitle": "3629 - Electrical Industrial Apparatus, Not Elsewhere Classified"
                },
                {
                    "id": "3631",
                    "title": "Household Cooking Equipment",
                    "fullTitle": "3631 - Household Cooking Equipment"
                },
                {
                    "id": "3632",
                    "title": "Household Refrigerators and HOme and Farm Freezers",
                    "fullTitle": "3632 - Household Refrigerators and HOme and Farm Freezers"
                },
                {
                    "id": "3633",
                    "title": "Household Laundry Equipment",
                    "fullTitle": "3633 - Household Laundry Equipment"
                },
                {
                    "id": "3634",
                    "title": "Electric Housewares and Fans",
                    "fullTitle": "3634 - Electric Housewares and Fans"
                },
                {
                    "id": "3635",
                    "title": "Household Vacuum Cleaners",
                    "fullTitle": "3635 - Household Vacuum Cleaners"
                },
                {
                    "id": "3639",
                    "title": "Household Appliances, Not Elsewhere Classified",
                    "fullTitle": "3639 - Household Appliances, Not Elsewhere Classified"
                },
                {
                    "id": "3641",
                    "title": "Electric Lamp Bulbs and Tubes",
                    "fullTitle": "3641 - Electric Lamp Bulbs and Tubes"
                },
                {
                    "id": "3643",
                    "title": "Current-Carrying Wiring Devices",
                    "fullTitle": "3643 - Current-Carrying Wiring Devices"
                },
                {
                    "id": "3644",
                    "title": "Noncurrent-Carrying Wiring Devices",
                    "fullTitle": "3644 - Noncurrent-Carrying Wiring Devices"
                },
                {
                    "id": "3645",
                    "title": "Residential Electric Lighting Fixtures",
                    "fullTitle": "3645 - Residential Electric Lighting Fixtures"
                },
                {
                    "id": "3646",
                    "title": "Commercial, Industrial, and Institutional Electric Lighting Fixtures",
                    "fullTitle": "3646 - Commercial, Industrial, and Institutional Electric Lighting Fixtures"
                },
                {
                    "id": "3647",
                    "title": "Vehicular Lighting Equipment",
                    "fullTitle": "3647 - Vehicular Lighting Equipment"
                },
                {
                    "id": "3648",
                    "title": "Lighting Equipment, Not Elsewhere Classified",
                    "fullTitle": "3648 - Lighting Equipment, Not Elsewhere Classified"
                },
                {
                    "id": "3651",
                    "title": "Household Audio and Video Equipment",
                    "fullTitle": "3651 - Household Audio and Video Equipment"
                },
                {
                    "id": "3652",
                    "title": "Phonograph Records and Prerecorded Audio Tapes and Disks",
                    "fullTitle": "3652 - Phonograph Records and Prerecorded Audio Tapes and Disks"
                },
                {
                    "id": "3661",
                    "title": "Telephone and Telegraph Apparatus",
                    "fullTitle": "3661 - Telephone and Telegraph Apparatus"
                },
                {
                    "id": "3663",
                    "title": "Radio and Television Broadcasting and Communications Equipment",
                    "fullTitle": "3663 - Radio and Television Broadcasting and Communications Equipment"
                },
                {
                    "id": "3669",
                    "title": "Communications Equipment, Not Elsewhere Classified",
                    "fullTitle": "3669 - Communications Equipment, Not Elsewhere Classified"
                },
                {
                    "id": "3671",
                    "title": "Electron Tubes",
                    "fullTitle": "3671 - Electron Tubes"
                },
                {
                    "id": "3672",
                    "title": "Printed Circuit Boards",
                    "fullTitle": "3672 - Printed Circuit Boards"
                },
                {
                    "id": "3674",
                    "title": "Semiconductors and Related Devices",
                    "fullTitle": "3674 - Semiconductors and Related Devices"
                },
                {
                    "id": "3675",
                    "title": "Electronic Capacitors",
                    "fullTitle": "3675 - Electronic Capacitors"
                },
                {
                    "id": "3676",
                    "title": "Electronic Resistors",
                    "fullTitle": "3676 - Electronic Resistors"
                },
                {
                    "id": "3677",
                    "title": "Electronic Coils, Transformers, and Other Inductors",
                    "fullTitle": "3677 - Electronic Coils, Transformers, and Other Inductors"
                },
                {
                    "id": "3678",
                    "title": "Electronic Connectors",
                    "fullTitle": "3678 - Electronic Connectors"
                },
                {
                    "id": "3679",
                    "title": "Electronic Components, Not Elsewhere Classified",
                    "fullTitle": "3679 - Electronic Components, Not Elsewhere Classified"
                },
                {
                    "id": "3691",
                    "title": "Storage Batteries",
                    "fullTitle": "3691 - Storage Batteries"
                },
                {
                    "id": "3692",
                    "title": "Primary Batteries, Dry and Wet",
                    "fullTitle": "3692 - Primary Batteries, Dry and Wet"
                },
                {
                    "id": "3694",
                    "title": "Electrical Equipment for Internal Combustion Engines",
                    "fullTitle": "3694 - Electrical Equipment for Internal Combustion Engines"
                },
                {
                    "id": "3695",
                    "title": "Magnetic and Optical Recording Media",
                    "fullTitle": "3695 - Magnetic and Optical Recording Media"
                },
                {
                    "id": "3699",
                    "title": "Electrical Machinery, Equipment, and Supplies, Not Elsewhere Classified",
                    "fullTitle": "3699 - Electrical Machinery, Equipment, and Supplies, Not Elsewhere Classified"
                },
                {
                    "id": "3711",
                    "title": "Motor Vehicles and Passenger Car Bodies",
                    "fullTitle": "3711 - Motor Vehicles and Passenger Car Bodies"
                },
                {
                    "id": "3713",
                    "title": "Truck and Bus Bodies",
                    "fullTitle": "3713 - Truck and Bus Bodies"
                },
                {
                    "id": "3714",
                    "title": "Motor Vehicle Parts and Accessories",
                    "fullTitle": "3714 - Motor Vehicle Parts and Accessories"
                },
                {
                    "id": "3715",
                    "title": "Truck Trailers",
                    "fullTitle": "3715 - Truck Trailers"
                },
                {
                    "id": "3716",
                    "title": "Motor Homes",
                    "fullTitle": "3716 - Motor Homes"
                },
                {
                    "id": "3721",
                    "title": "Aircraft",
                    "fullTitle": "3721 - Aircraft"
                },
                {
                    "id": "3724",
                    "title": "Aircraft Engines and Engine Parts",
                    "fullTitle": "3724 - Aircraft Engines and Engine Parts"
                },
                {
                    "id": "3728",
                    "title": "Aircraft Parts and Auxiliary Equipment, Not Elsewhere Classified",
                    "fullTitle": "3728 - Aircraft Parts and Auxiliary Equipment, Not Elsewhere Classified"
                },
                {
                    "id": "3731",
                    "title": "Ship Building and Repairing",
                    "fullTitle": "3731 - Ship Building and Repairing"
                },
                {
                    "id": "3732",
                    "title": "Boat Building and Repairing",
                    "fullTitle": "3732 - Boat Building and Repairing"
                },
                {
                    "id": "3743",
                    "title": "Railroad Equipment",
                    "fullTitle": "3743 - Railroad Equipment"
                },
                {
                    "id": "3751",
                    "title": "Motorcycles, Bicycles, and Parts",
                    "fullTitle": "3751 - Motorcycles, Bicycles, and Parts"
                },
                {
                    "id": "3761",
                    "title": "Guided Missiles and Space Vehicles",
                    "fullTitle": "3761 - Guided Missiles and Space Vehicles"
                },
                {
                    "id": "3764",
                    "title": "Guided Missile and Space Vehicle Propulsion Units and Propulsion Unit Parts",
                    "fullTitle": "3764 - Guided Missile and Space Vehicle Propulsion Units and Propulsion Unit Parts"
                },
                {
                    "id": "3769",
                    "title": "Guided Missile Space Vehicle Parts and Auxiliary Equipment, Not Elsewhere Classified",
                    "fullTitle": "3769 - Guided Missile Space Vehicle Parts and Auxiliary Equipment, Not Elsewhere Classified"
                },
                {
                    "id": "3792",
                    "title": "Travel Trailers and Campers",
                    "fullTitle": "3792 - Travel Trailers and Campers"
                },
                {
                    "id": "3795",
                    "title": "Tanks and Tank Components",
                    "fullTitle": "3795 - Tanks and Tank Components"
                },
                {
                    "id": "3799",
                    "title": "Transportation Equipment, Not Elsewhere Classified",
                    "fullTitle": "3799 - Transportation Equipment, Not Elsewhere Classified"
                },
                {
                    "id": "3812",
                    "title": "Search, Detection, Navigation, Guidance, Aeronautical, and Nautical Systems and Instruments",
                    "fullTitle": "3812 - Search, Detection, Navigation, Guidance, Aeronautical, and Nautical Systems and Instruments"
                },
                {
                    "id": "3821",
                    "title": "Laboratory Apparatus and Furniture",
                    "fullTitle": "3821 - Laboratory Apparatus and Furniture"
                },
                {
                    "id": "3822",
                    "title": "Automatic Controls for Regulating Residential and Commercial Environments and Appliances",
                    "fullTitle": "3822 - Automatic Controls for Regulating Residential and Commercial Environments and Appliances"
                },
                {
                    "id": "3823",
                    "title": "Industrial Instruments for Measurement, Display, and Control of Process Variables; and Related Products",
                    "fullTitle": "3823 - Industrial Instruments for Measurement, Display, and Control of Process Variables; and Related Products"
                },
                {
                    "id": "3824",
                    "title": "Totalizing Fluid Meters and Counting Devices",
                    "fullTitle": "3824 - Totalizing Fluid Meters and Counting Devices"
                },
                {
                    "id": "3825",
                    "title": "Instruments for Measuring and Testing of Electricity and Electrical Signals",
                    "fullTitle": "3825 - Instruments for Measuring and Testing of Electricity and Electrical Signals"
                },
                {
                    "id": "3826",
                    "title": "Laboratory Analytical Instruments",
                    "fullTitle": "3826 - Laboratory Analytical Instruments"
                },
                {
                    "id": "3827",
                    "title": "Optical Instruments and Lenses",
                    "fullTitle": "3827 - Optical Instruments and Lenses"
                },
                {
                    "id": "3829",
                    "title": "Measuring and Controlling Devices, Not Elsewhere Classified",
                    "fullTitle": "3829 - Measuring and Controlling Devices, Not Elsewhere Classified"
                },
                {
                    "id": "3841",
                    "title": "Surgical and Medical Instruments and Apparatus",
                    "fullTitle": "3841 - Surgical and Medical Instruments and Apparatus"
                },
                {
                    "id": "3842",
                    "title": "Orthopedic, Prosthetic, and Surgical Appliances and Supplies",
                    "fullTitle": "3842 - Orthopedic, Prosthetic, and Surgical Appliances and Supplies"
                },
                {
                    "id": "3843",
                    "title": "Dental Equipment and Supplies",
                    "fullTitle": "3843 - Dental Equipment and Supplies"
                },
                {
                    "id": "3844",
                    "title": "X-ray Apparatus and Tubes",
                    "fullTitle": "3844 - X-ray Apparatus and Tubes"
                },
                {
                    "id": "3845",
                    "title": "Electromedical and Electrotherapeutic Apparatus",
                    "fullTitle": "3845 - Electromedical and Electrotherapeutic Apparatus"
                },
                {
                    "id": "3851",
                    "title": "Ophthalmic Goods",
                    "fullTitle": "3851 - Ophthalmic Goods"
                },
                {
                    "id": "3861",
                    "title": "Photographic Equipment and Supplies",
                    "fullTitle": "3861 - Photographic Equipment and Supplies"
                },
                {
                    "id": "3873",
                    "title": "Watches, Clocks, Clockwork Operated Devices, and Parts",
                    "fullTitle": "3873 - Watches, Clocks, Clockwork Operated Devices, and Parts"
                },
                {
                    "id": "3911",
                    "title": "Jewelry, Precious Metal",
                    "fullTitle": "3911 - Jewelry, Precious Metal"
                },
                {
                    "id": "3914",
                    "title": "Silverware, Plated Ware, and Stainless Steel Ware",
                    "fullTitle": "3914 - Silverware, Plated Ware, and Stainless Steel Ware"
                },
                {
                    "id": "3915",
                    "title": "Jewelers' Findings and Materials, and Lapidary Work",
                    "fullTitle": "3915 - Jewelers' Findings and Materials, and Lapidary Work"
                },
                {
                    "id": "3931",
                    "title": "Musical Instruments",
                    "fullTitle": "3931 - Musical Instruments"
                },
                {
                    "id": "3942",
                    "title": "Dolls and Stuffed Toys",
                    "fullTitle": "3942 - Dolls and Stuffed Toys"
                },
                {
                    "id": "3944",
                    "title": "Games, Toys, and Children's Vehicles, Except Dolls and Bicycles",
                    "fullTitle": "3944 - Games, Toys, and Children's Vehicles, Except Dolls and Bicycles"
                },
                {
                    "id": "3949",
                    "title": "Sporting and Athletic Goods, Not Elsewhere Classified",
                    "fullTitle": "3949 - Sporting and Athletic Goods, Not Elsewhere Classified"
                },
                {
                    "id": "3951",
                    "title": "Pens, Mechanical Pencils, and Parts",
                    "fullTitle": "3951 - Pens, Mechanical Pencils, and Parts"
                },
                {
                    "id": "3952",
                    "title": "Lead Pencils, Crayons, and Artists' Materials",
                    "fullTitle": "3952 - Lead Pencils, Crayons, and Artists' Materials"
                },
                {
                    "id": "3953",
                    "title": "Marking Devices",
                    "fullTitle": "3953 - Marking Devices"
                },
                {
                    "id": "3955",
                    "title": "Carbon Paper and Inked Ribbons",
                    "fullTitle": "3955 - Carbon Paper and Inked Ribbons"
                },
                {
                    "id": "3961",
                    "title": "Costume Jewelry and Costume Novelties, Except Precious Metal",
                    "fullTitle": "3961 - Costume Jewelry and Costume Novelties, Except Precious Metal"
                },
                {
                    "id": "3965",
                    "title": "Fasteners, Buttons, Needles, and Pins",
                    "fullTitle": "3965 - Fasteners, Buttons, Needles, and Pins"
                },
                {
                    "id": "3991",
                    "title": "Brooms and Brushes",
                    "fullTitle": "3991 - Brooms and Brushes"
                },
                {
                    "id": "3993",
                    "title": "Signs and Advertising Specialties",
                    "fullTitle": "3993 - Signs and Advertising Specialties"
                },
                {
                    "id": "3995",
                    "title": "Burial Caskets",
                    "fullTitle": "3995 - Burial Caskets"
                },
                {
                    "id": "3996",
                    "title": "Linoleum, Asphalted",
                    "fullTitle": "3996 - Linoleum, Asphalted"
                },
                {
                    "id": "3999",
                    "title": "Manufacturing Industries, Not Elsewhere Classified",
                    "fullTitle": "3999 - Manufacturing Industries, Not Elsewhere Classified"
                },
                {
                    "id": "4011",
                    "title": "Railroads, Line",
                    "fullTitle": "4011 - Railroads, Line"
                },
                {
                    "id": "4013",
                    "title": "Railroad Switching and Terminal Establishments",
                    "fullTitle": "4013 - Railroad Switching and Terminal Establishments"
                },
                {
                    "id": "4111",
                    "title": "Local and Suburban Transit",
                    "fullTitle": "4111 - Local and Suburban Transit"
                },
                {
                    "id": "4119",
                    "title": "Local Passenger Transportation, Not Elsewhere Classified",
                    "fullTitle": "4119 - Local Passenger Transportation, Not Elsewhere Classified"
                },
                {
                    "id": "4121",
                    "title": "Taxicabs",
                    "fullTitle": "4121 - Taxicabs"
                },
                {
                    "id": "4131",
                    "title": "Intercity and Rural Bus Transportation",
                    "fullTitle": "4131 - Intercity and Rural Bus Transportation"
                },
                {
                    "id": "4141",
                    "title": "Local Bus Charter Service",
                    "fullTitle": "4141 - Local Bus Charter Service"
                },
                {
                    "id": "4142",
                    "title": "Bus Charter Service, Except Local",
                    "fullTitle": "4142 - Bus Charter Service, Except Local"
                },
                {
                    "id": "4151",
                    "title": "School Buses",
                    "fullTitle": "4151 - School Buses"
                },
                {
                    "id": "4173",
                    "title": "Terminal and Service Facilities for Motor Vehicle Passenger Transportation",
                    "fullTitle": "4173 - Terminal and Service Facilities for Motor Vehicle Passenger Transportation"
                },
                {
                    "id": "4212",
                    "title": "Local Trucking Without Storage",
                    "fullTitle": "4212 - Local Trucking Without Storage"
                },
                {
                    "id": "4213",
                    "title": "Trucking, Except Local",
                    "fullTitle": "4213 - Trucking, Except Local"
                },
                {
                    "id": "4214",
                    "title": "Local Trucking With Storage",
                    "fullTitle": "4214 - Local Trucking With Storage"
                },
                {
                    "id": "4215",
                    "title": "Courier Services, Except by Air",
                    "fullTitle": "4215 - Courier Services, Except by Air"
                },
                {
                    "id": "4221",
                    "title": "Farm Product Warehousing and Storage",
                    "fullTitle": "4221 - Farm Product Warehousing and Storage"
                },
                {
                    "id": "4222",
                    "title": "Refrigerated Warehousing and Storage",
                    "fullTitle": "4222 - Refrigerated Warehousing and Storage"
                },
                {
                    "id": "4225",
                    "title": "General Warehousing and Storage",
                    "fullTitle": "4225 - General Warehousing and Storage"
                },
                {
                    "id": "4226",
                    "title": "Special Warehousing and Storage, Not Elsewhere Classified",
                    "fullTitle": "4226 - Special Warehousing and Storage, Not Elsewhere Classified"
                },
                {
                    "id": "4231",
                    "title": "Terminal and Joint Terminal Maintenance Facilities for Motor Freight Transportation",
                    "fullTitle": "4231 - Terminal and Joint Terminal Maintenance Facilities for Motor Freight Transportation"
                },
                {
                    "id": "4311",
                    "title": "United States Postal Service",
                    "fullTitle": "4311 - United States Postal Service"
                },
                {
                    "id": "4412",
                    "title": "Deep Sea Foreign Transportation of Freight",
                    "fullTitle": "4412 - Deep Sea Foreign Transportation of Freight"
                },
                {
                    "id": "4424",
                    "title": "Deep Sea Domestic Transportation of Freight",
                    "fullTitle": "4424 - Deep Sea Domestic Transportation of Freight"
                },
                {
                    "id": "4432",
                    "title": "Freight Transportation on the Great Lakes",
                    "fullTitle": "4432 - Freight Transportation on the Great Lakes"
                },
                {
                    "id": "4449",
                    "title": "Water Transportation of Freight, Not Elsewhere Classified",
                    "fullTitle": "4449 - Water Transportation of Freight, Not Elsewhere Classified"
                },
                {
                    "id": "4481",
                    "title": "Deep Sea Transportation of Passengers, Except by Ferry",
                    "fullTitle": "4481 - Deep Sea Transportation of Passengers, Except by Ferry"
                },
                {
                    "id": "4482",
                    "title": "Ferries",
                    "fullTitle": "4482 - Ferries"
                },
                {
                    "id": "4489",
                    "title": "Water Transportation of Passengers, Not Elsewhere Classified",
                    "fullTitle": "4489 - Water Transportation of Passengers, Not Elsewhere Classified"
                },
                {
                    "id": "4491",
                    "title": "Marine Cargo Handling",
                    "fullTitle": "4491 - Marine Cargo Handling"
                },
                {
                    "id": "4492",
                    "title": "Towing and Tugboat Services",
                    "fullTitle": "4492 - Towing and Tugboat Services"
                },
                {
                    "id": "4493",
                    "title": "Marinas",
                    "fullTitle": "4493 - Marinas"
                },
                {
                    "id": "4499",
                    "title": "Water Transportation Services, Not Elsewhere Classified",
                    "fullTitle": "4499 - Water Transportation Services, Not Elsewhere Classified"
                },
                {
                    "id": "4512",
                    "title": "Air Transportation, Scheduled",
                    "fullTitle": "4512 - Air Transportation, Scheduled"
                },
                {
                    "id": "4513",
                    "title": "Air Courier Services",
                    "fullTitle": "4513 - Air Courier Services"
                },
                {
                    "id": "4522",
                    "title": "Air Transportation, Nonscheduled",
                    "fullTitle": "4522 - Air Transportation, Nonscheduled"
                },
                {
                    "id": "4581",
                    "title": "Airports, Flying Fields, and Airport Terminal Services",
                    "fullTitle": "4581 - Airports, Flying Fields, and Airport Terminal Services"
                },
                {
                    "id": "4612",
                    "title": "Crude Petroleum Pipelines",
                    "fullTitle": "4612 - Crude Petroleum Pipelines"
                },
                {
                    "id": "4613",
                    "title": "Refined Petroleum Pipelines",
                    "fullTitle": "4613 - Refined Petroleum Pipelines"
                },
                {
                    "id": "4619",
                    "title": "Pipelines, Not Elsewhere Classified",
                    "fullTitle": "4619 - Pipelines, Not Elsewhere Classified"
                },
                {
                    "id": "4724",
                    "title": "Travel Agencies",
                    "fullTitle": "4724 - Travel Agencies"
                },
                {
                    "id": "4725",
                    "title": "Tour Operators",
                    "fullTitle": "4725 - Tour Operators"
                },
                {
                    "id": "4729",
                    "title": "Arrangement of Passenger Transportation, Not Elsewhere Classified",
                    "fullTitle": "4729 - Arrangement of Passenger Transportation, Not Elsewhere Classified"
                },
                {
                    "id": "4731",
                    "title": "Arrangement of Transportation of Freight and Cargo",
                    "fullTitle": "4731 - Arrangement of Transportation of Freight and Cargo"
                },
                {
                    "id": "4741",
                    "title": "Rental of Railroad Cars",
                    "fullTitle": "4741 - Rental of Railroad Cars"
                },
                {
                    "id": "4783",
                    "title": "Packing and Crating",
                    "fullTitle": "4783 - Packing and Crating"
                },
                {
                    "id": "4785",
                    "title": "Fixed Facilities and Inspection and Weighing Services for Motor Vehicle Transportation",
                    "fullTitle": "4785 - Fixed Facilities and Inspection and Weighing Services for Motor Vehicle Transportation"
                },
                {
                    "id": "4789",
                    "title": "Transportation Services, Not Elsewhere Classified",
                    "fullTitle": "4789 - Transportation Services, Not Elsewhere Classified"
                },
                {
                    "id": "4812",
                    "title": "Radiotelephone Communications",
                    "fullTitle": "4812 - Radiotelephone Communications"
                },
                {
                    "id": "4813",
                    "title": "Telephone Communications, Except Radiotelephone",
                    "fullTitle": "4813 - Telephone Communications, Except Radiotelephone"
                },
                {
                    "id": "4822",
                    "title": "Telegraph and Other Message Communications",
                    "fullTitle": "4822 - Telegraph and Other Message Communications"
                },
                {
                    "id": "4832",
                    "title": "Radio Broadcasting Stations",
                    "fullTitle": "4832 - Radio Broadcasting Stations"
                },
                {
                    "id": "4833",
                    "title": "Television Broadcasting Stations",
                    "fullTitle": "4833 - Television Broadcasting Stations"
                },
                {
                    "id": "4841",
                    "title": "Cable and Other Pay Television Services",
                    "fullTitle": "4841 - Cable and Other Pay Television Services"
                },
                {
                    "id": "4899",
                    "title": "Communications Services, Not Elsewhere Classified",
                    "fullTitle": "4899 - Communications Services, Not Elsewhere Classified"
                },
                {
                    "id": "4911",
                    "title": "Electric Services",
                    "fullTitle": "4911 - Electric Services"
                },
                {
                    "id": "4922",
                    "title": "Natural Gas Transmission",
                    "fullTitle": "4922 - Natural Gas Transmission"
                },
                {
                    "id": "4923",
                    "title": "Natural Gas Transmission and Distribution",
                    "fullTitle": "4923 - Natural Gas Transmission and Distribution"
                },
                {
                    "id": "4924",
                    "title": "Natural Gas Distribution",
                    "fullTitle": "4924 - Natural Gas Distribution"
                },
                {
                    "id": "4925",
                    "title": "Mixed, Manufactured, or Liquefied Petroleum Gas Production",
                    "fullTitle": "4925 - Mixed, Manufactured, or Liquefied Petroleum Gas Production"
                },
                {
                    "id": "4931",
                    "title": "Electric and Other Services Combined",
                    "fullTitle": "4931 - Electric and Other Services Combined"
                },
                {
                    "id": "4932",
                    "title": "Gas and Other Services Combined",
                    "fullTitle": "4932 - Gas and Other Services Combined"
                },
                {
                    "id": "4939",
                    "title": "Combination Utilities, Not Elsewhere Classified",
                    "fullTitle": "4939 - Combination Utilities, Not Elsewhere Classified"
                },
                {
                    "id": "4941",
                    "title": "Water Supply",
                    "fullTitle": "4941 - Water Supply"
                },
                {
                    "id": "4952",
                    "title": "Sewerage Systems",
                    "fullTitle": "4952 - Sewerage Systems"
                },
                {
                    "id": "4953",
                    "title": "Refuse Systems",
                    "fullTitle": "4953 - Refuse Systems"
                },
                {
                    "id": "4959",
                    "title": "Sanitary Services, Not Elsewhere Classified",
                    "fullTitle": "4959 - Sanitary Services, Not Elsewhere Classified"
                },
                {
                    "id": "4961",
                    "title": "Steam and Air",
                    "fullTitle": "4961 - Steam and Air"
                },
                {
                    "id": "4971",
                    "title": "Irrigation Systems",
                    "fullTitle": "4971 - Irrigation Systems"
                },
                {
                    "id": "5012",
                    "title": "Automobiles and Other Motor Vehicles",
                    "fullTitle": "5012 - Automobiles and Other Motor Vehicles"
                },
                {
                    "id": "5013",
                    "title": "Motor Vehicle Supplies and New Parts",
                    "fullTitle": "5013 - Motor Vehicle Supplies and New Parts"
                },
                {
                    "id": "5014",
                    "title": "Tires and Tubes",
                    "fullTitle": "5014 - Tires and Tubes"
                },
                {
                    "id": "5015",
                    "title": "Motor Vehicle Parts, Used",
                    "fullTitle": "5015 - Motor Vehicle Parts, Used"
                },
                {
                    "id": "5021",
                    "title": "Furniture",
                    "fullTitle": "5021 - Furniture"
                },
                {
                    "id": "5023",
                    "title": "Home furnishings",
                    "fullTitle": "5023 - Home furnishings"
                },
                {
                    "id": "5031",
                    "title": "Lumber, Plywood, Millwork, and Wood Panels",
                    "fullTitle": "5031 - Lumber, Plywood, Millwork, and Wood Panels"
                },
                {
                    "id": "5032",
                    "title": "Brick, Stone, and Related Construction Materials",
                    "fullTitle": "5032 - Brick, Stone, and Related Construction Materials"
                },
                {
                    "id": "5033",
                    "title": "Roofing, Siding, and Insulation Materials",
                    "fullTitle": "5033 - Roofing, Siding, and Insulation Materials"
                },
                {
                    "id": "5039",
                    "title": "Construction Materials, Not Elsewhere Classified",
                    "fullTitle": "5039 - Construction Materials, Not Elsewhere Classified"
                },
                {
                    "id": "5043",
                    "title": "Photographic Equipment and Supplies",
                    "fullTitle": "5043 - Photographic Equipment and Supplies"
                },
                {
                    "id": "5044",
                    "title": "Office Equipment",
                    "fullTitle": "5044 - Office Equipment"
                },
                {
                    "id": "5045",
                    "title": "Computers and Computer Peripheral Equipment and Software",
                    "fullTitle": "5045 - Computers and Computer Peripheral Equipment and Software"
                },
                {
                    "id": "5046",
                    "title": "Commercial Equipment, Not Elsewhere Classified",
                    "fullTitle": "5046 - Commercial Equipment, Not Elsewhere Classified"
                },
                {
                    "id": "5047",
                    "title": "Medical, Dental, and Hospital Equipment and Supplies",
                    "fullTitle": "5047 - Medical, Dental, and Hospital Equipment and Supplies"
                },
                {
                    "id": "5048",
                    "title": "Ophthalmic Goods",
                    "fullTitle": "5048 - Ophthalmic Goods"
                },
                {
                    "id": "5049",
                    "title": "Professional Equipment and Supplies, Not Elsewhere Classified",
                    "fullTitle": "5049 - Professional Equipment and Supplies, Not Elsewhere Classified"
                },
                {
                    "id": "5051",
                    "title": "Metals Service Centers and Offices",
                    "fullTitle": "5051 - Metals Service Centers and Offices"
                },
                {
                    "id": "5052",
                    "title": "Coal and Other Minerals and Ores",
                    "fullTitle": "5052 - Coal and Other Minerals and Ores"
                },
                {
                    "id": "5063",
                    "title": "Electrical Apparatus and Equipment Wiring Supplies, and Construction Materials",
                    "fullTitle": "5063 - Electrical Apparatus and Equipment Wiring Supplies, and Construction Materials"
                },
                {
                    "id": "5064",
                    "title": "Electrical Appliances, Television and Radio Sets",
                    "fullTitle": "5064 - Electrical Appliances, Television and Radio Sets"
                },
                {
                    "id": "5065",
                    "title": "Electronic Parts and Equipment, Not Elsewhere Classified",
                    "fullTitle": "5065 - Electronic Parts and Equipment, Not Elsewhere Classified"
                },
                {
                    "id": "5072",
                    "title": "Hardware",
                    "fullTitle": "5072 - Hardware"
                },
                {
                    "id": "5074",
                    "title": "Plumbing and Heating Equipment and Supplies (Hydronics)",
                    "fullTitle": "5074 - Plumbing and Heating Equipment and Supplies (Hydronics)"
                },
                {
                    "id": "5075",
                    "title": "Warm Air Heating and Air",
                    "fullTitle": "5075 - Warm Air Heating and Air"
                },
                {
                    "id": "5078",
                    "title": "Refrigeration Equipment and Supplies",
                    "fullTitle": "5078 - Refrigeration Equipment and Supplies"
                },
                {
                    "id": "5082",
                    "title": "Construction and Mining (Except Petroleum) Machinery and Equipment",
                    "fullTitle": "5082 - Construction and Mining (Except Petroleum) Machinery and Equipment"
                },
                {
                    "id": "5083",
                    "title": "Farm and Garden Machinery and Equipment",
                    "fullTitle": "5083 - Farm and Garden Machinery and Equipment"
                },
                {
                    "id": "5084",
                    "title": "Industrial Machinery and Equipment",
                    "fullTitle": "5084 - Industrial Machinery and Equipment"
                },
                {
                    "id": "5085",
                    "title": "Industrial Supplies",
                    "fullTitle": "5085 - Industrial Supplies"
                },
                {
                    "id": "5087",
                    "title": "Service Establishment Equipment and Supplies",
                    "fullTitle": "5087 - Service Establishment Equipment and Supplies"
                },
                {
                    "id": "5088",
                    "title": "Transportation Equipment and Supplies, Except Motor Vehicles",
                    "fullTitle": "5088 - Transportation Equipment and Supplies, Except Motor Vehicles"
                },
                {
                    "id": "5091",
                    "title": "Sporting and Recreational Goods and Supplies",
                    "fullTitle": "5091 - Sporting and Recreational Goods and Supplies"
                },
                {
                    "id": "5092",
                    "title": "Toys and Hobby Goods and Supplies",
                    "fullTitle": "5092 - Toys and Hobby Goods and Supplies"
                },
                {
                    "id": "5093",
                    "title": "Scrap and Waste Materials",
                    "fullTitle": "5093 - Scrap and Waste Materials"
                },
                {
                    "id": "5094",
                    "title": "Jewelry, Watches, Precious Stones, and Precious Metals",
                    "fullTitle": "5094 - Jewelry, Watches, Precious Stones, and Precious Metals"
                },
                {
                    "id": "5099",
                    "title": "Durable Goods, Not Elsewhere Classified",
                    "fullTitle": "5099 - Durable Goods, Not Elsewhere Classified"
                },
                {
                    "id": "5111",
                    "title": "Printing and Writing Paper",
                    "fullTitle": "5111 - Printing and Writing Paper"
                },
                {
                    "id": "5112",
                    "title": "Stationery and Office Supplies",
                    "fullTitle": "5112 - Stationery and Office Supplies"
                },
                {
                    "id": "5113",
                    "title": "Industrial and Personal Service Paper",
                    "fullTitle": "5113 - Industrial and Personal Service Paper"
                },
                {
                    "id": "5122",
                    "title": "Drugs, Drug Proprietaries, and Druggists' Sundries",
                    "fullTitle": "5122 - Drugs, Drug Proprietaries, and Druggists' Sundries"
                },
                {
                    "id": "5131",
                    "title": "Piece Goods, Notions, and Other Dry Good",
                    "fullTitle": "5131 - Piece Goods, Notions, and Other Dry Good"
                },
                {
                    "id": "5136",
                    "title": "Men's and Boy's Clothing and Furnishings",
                    "fullTitle": "5136 - Men's and Boy's Clothing and Furnishings"
                },
                {
                    "id": "5137",
                    "title": "Women's, Children's, and Infants' Clothing and Accessories",
                    "fullTitle": "5137 - Women's, Children's, and Infants' Clothing and Accessories"
                },
                {
                    "id": "5139",
                    "title": "Footwear",
                    "fullTitle": "5139 - Footwear"
                },
                {
                    "id": "5141",
                    "title": "Groceries, General Line",
                    "fullTitle": "5141 - Groceries, General Line"
                },
                {
                    "id": "5142",
                    "title": "Packaged Frozen Foods",
                    "fullTitle": "5142 - Packaged Frozen Foods"
                },
                {
                    "id": "5143",
                    "title": "Dairy Products, Except Dried or Canned",
                    "fullTitle": "5143 - Dairy Products, Except Dried or Canned"
                },
                {
                    "id": "5144",
                    "title": "Poultry and Poultry Products",
                    "fullTitle": "5144 - Poultry and Poultry Products"
                },
                {
                    "id": "5145",
                    "title": "Confectionery",
                    "fullTitle": "5145 - Confectionery"
                },
                {
                    "id": "5146",
                    "title": "Fish and Seafoods",
                    "fullTitle": "5146 - Fish and Seafoods"
                },
                {
                    "id": "5147",
                    "title": "Meats and Meat Products",
                    "fullTitle": "5147 - Meats and Meat Products"
                },
                {
                    "id": "5148",
                    "title": "Fresh Fruits and Vegetables",
                    "fullTitle": "5148 - Fresh Fruits and Vegetables"
                },
                {
                    "id": "5149",
                    "title": "Groceries and Related Products, Not Elsewhere Classified",
                    "fullTitle": "5149 - Groceries and Related Products, Not Elsewhere Classified"
                },
                {
                    "id": "5153",
                    "title": "Grain and Field Beans",
                    "fullTitle": "5153 - Grain and Field Beans"
                },
                {
                    "id": "5154",
                    "title": "Livestock",
                    "fullTitle": "5154 - Livestock"
                },
                {
                    "id": "5159",
                    "title": "Farm-Product Raw Materials, not elsewhere classified",
                    "fullTitle": "5159 - Farm-Product Raw Materials, not elsewhere classified"
                },
                {
                    "id": "5162",
                    "title": "Plastics Materials and Basic Forms and Shapes",
                    "fullTitle": "5162 - Plastics Materials and Basic Forms and Shapes"
                },
                {
                    "id": "5169",
                    "title": "Chemicals and Allied Products, Not Elsewhere Classified",
                    "fullTitle": "5169 - Chemicals and Allied Products, Not Elsewhere Classified"
                },
                {
                    "id": "5171",
                    "title": "Petroleum Bulk stations and Terminals",
                    "fullTitle": "5171 - Petroleum Bulk stations and Terminals"
                },
                {
                    "id": "5172",
                    "title": "Petroleum and Petroleum Products Wholesalers, Except Bulk Stations and Terminals",
                    "fullTitle": "5172 - Petroleum and Petroleum Products Wholesalers, Except Bulk Stations and Terminals"
                },
                {
                    "id": "5181",
                    "title": "Beer and Ale",
                    "fullTitle": "5181 - Beer and Ale"
                },
                {
                    "id": "5182",
                    "title": "Wine and Distilled Alcoholic Beverages",
                    "fullTitle": "5182 - Wine and Distilled Alcoholic Beverages"
                },
                {
                    "id": "5191",
                    "title": "Farm Supplies",
                    "fullTitle": "5191 - Farm Supplies"
                },
                {
                    "id": "5192",
                    "title": "Books, Periodicals, and Newspapers",
                    "fullTitle": "5192 - Books, Periodicals, and Newspapers"
                },
                {
                    "id": "5193",
                    "title": "Flowers, Nursery Stock, and Florists' Supplies",
                    "fullTitle": "5193 - Flowers, Nursery Stock, and Florists' Supplies"
                },
                {
                    "id": "5194",
                    "title": "Tobacco and Tobacco Products",
                    "fullTitle": "5194 - Tobacco and Tobacco Products"
                },
                {
                    "id": "5198",
                    "title": "Paints, Varnishes, and Supplies",
                    "fullTitle": "5198 - Paints, Varnishes, and Supplies"
                },
                {
                    "id": "5199",
                    "title": "Nondurable Goods, Not Elsewhere Classified",
                    "fullTitle": "5199 - Nondurable Goods, Not Elsewhere Classified"
                },
                {
                    "id": "5211",
                    "title": "Lumber and Other Building Materials Dealers",
                    "fullTitle": "5211 - Lumber and Other Building Materials Dealers"
                },
                {
                    "id": "5231",
                    "title": "Paint, Glass, and Wallpaper Stores",
                    "fullTitle": "5231 - Paint, Glass, and Wallpaper Stores"
                },
                {
                    "id": "5251",
                    "title": "Hardware Stores",
                    "fullTitle": "5251 - Hardware Stores"
                },
                {
                    "id": "5261",
                    "title": "Retail Nurseries, Lawn and Garden Supply Stores",
                    "fullTitle": "5261 - Retail Nurseries, Lawn and Garden Supply Stores"
                },
                {
                    "id": "5271",
                    "title": "Mobile Home Dealers",
                    "fullTitle": "5271 - Mobile Home Dealers"
                },
                {
                    "id": "5311",
                    "title": "Department Stores",
                    "fullTitle": "5311 - Department Stores"
                },
                {
                    "id": "5331",
                    "title": "Variety Stores",
                    "fullTitle": "5331 - Variety Stores"
                },
                {
                    "id": "5399",
                    "title": "Miscellaneous General Merchandise Stores",
                    "fullTitle": "5399 - Miscellaneous General Merchandise Stores"
                },
                {
                    "id": "5411",
                    "title": "Grocery Stores",
                    "fullTitle": "5411 - Grocery Stores"
                },
                {
                    "id": "5421",
                    "title": "Meat and Fish (Seafood) Markets, Including Freezer Provisioners",
                    "fullTitle": "5421 - Meat and Fish (Seafood) Markets, Including Freezer Provisioners"
                },
                {
                    "id": "5431",
                    "title": "Fruit and Vegetable Markets",
                    "fullTitle": "5431 - Fruit and Vegetable Markets"
                },
                {
                    "id": "5441",
                    "title": "Candy, Nut, and Confectionery Stores",
                    "fullTitle": "5441 - Candy, Nut, and Confectionery Stores"
                },
                {
                    "id": "5451",
                    "title": "Dairy Products Stores",
                    "fullTitle": "5451 - Dairy Products Stores"
                },
                {
                    "id": "5461",
                    "title": "Retail Bakeries",
                    "fullTitle": "5461 - Retail Bakeries"
                },
                {
                    "id": "5499",
                    "title": "Miscellaneous Food Stores",
                    "fullTitle": "5499 - Miscellaneous Food Stores"
                },
                {
                    "id": "5511",
                    "title": "Motor Vehicle Dealers (New and Used)",
                    "fullTitle": "5511 - Motor Vehicle Dealers (New and Used)"
                },
                {
                    "id": "5521",
                    "title": "Motor Vehicle Dealers (Used only)",
                    "fullTitle": "5521 - Motor Vehicle Dealers (Used only)"
                },
                {
                    "id": "5531",
                    "title": "Auto and Home Supply Stores",
                    "fullTitle": "5531 - Auto and Home Supply Stores"
                },
                {
                    "id": "5541",
                    "title": "Gasoline Service Stations",
                    "fullTitle": "5541 - Gasoline Service Stations"
                },
                {
                    "id": "5551",
                    "title": "Boat Dealers",
                    "fullTitle": "5551 - Boat Dealers"
                },
                {
                    "id": "5561",
                    "title": "Recreational Vehicle Dealers",
                    "fullTitle": "5561 - Recreational Vehicle Dealers"
                },
                {
                    "id": "5571",
                    "title": "Motorcycle Dealers",
                    "fullTitle": "5571 - Motorcycle Dealers"
                },
                {
                    "id": "5599",
                    "title": "Automotive Dealers, Not Elsewhere Classified",
                    "fullTitle": "5599 - Automotive Dealers, Not Elsewhere Classified"
                },
                {
                    "id": "5611",
                    "title": "Men's and Boys' Clothing and Accessory Stores",
                    "fullTitle": "5611 - Men's and Boys' Clothing and Accessory Stores"
                },
                {
                    "id": "5621",
                    "title": "Women's Clothing Stores",
                    "fullTitle": "5621 - Women's Clothing Stores"
                },
                {
                    "id": "5632",
                    "title": "Women's Accessory and Specialty Stores",
                    "fullTitle": "5632 - Women's Accessory and Specialty Stores"
                },
                {
                    "id": "5641",
                    "title": "Children's and Infants' Wear Stores",
                    "fullTitle": "5641 - Children's and Infants' Wear Stores"
                },
                {
                    "id": "5651",
                    "title": "Family Clothing Stores",
                    "fullTitle": "5651 - Family Clothing Stores"
                },
                {
                    "id": "5661",
                    "title": "Shoe Stores",
                    "fullTitle": "5661 - Shoe Stores"
                },
                {
                    "id": "5699",
                    "title": "Miscellaneous Apparel and Accessory Stores",
                    "fullTitle": "5699 - Miscellaneous Apparel and Accessory Stores"
                },
                {
                    "id": "5712",
                    "title": "Furniture Stores",
                    "fullTitle": "5712 - Furniture Stores"
                },
                {
                    "id": "5713",
                    "title": "Floor Covering Stores",
                    "fullTitle": "5713 - Floor Covering Stores"
                },
                {
                    "id": "5714",
                    "title": "Drapery, Curtain, and Upholstery Stores",
                    "fullTitle": "5714 - Drapery, Curtain, and Upholstery Stores"
                },
                {
                    "id": "5719",
                    "title": "Miscellaneous home furnishings Stores",
                    "fullTitle": "5719 - Miscellaneous home furnishings Stores"
                },
                {
                    "id": "5722",
                    "title": "Household Appliance Stores",
                    "fullTitle": "5722 - Household Appliance Stores"
                },
                {
                    "id": "5731",
                    "title": "Radio, Television, and Consumer Electronics Stores",
                    "fullTitle": "5731 - Radio, Television, and Consumer Electronics Stores"
                },
                {
                    "id": "5734",
                    "title": "Computer and Computer Software Stores",
                    "fullTitle": "5734 - Computer and Computer Software Stores"
                },
                {
                    "id": "5735",
                    "title": "Record and Prerecorded Tape Stores",
                    "fullTitle": "5735 - Record and Prerecorded Tape Stores"
                },
                {
                    "id": "5736",
                    "title": "Musical Instrument Stores",
                    "fullTitle": "5736 - Musical Instrument Stores"
                },
                {
                    "id": "5812",
                    "title": "Eating Places",
                    "fullTitle": "5812 - Eating Places"
                },
                {
                    "id": "5813",
                    "title": "Drinking Places (Alcoholic Beverages)",
                    "fullTitle": "5813 - Drinking Places (Alcoholic Beverages)"
                },
                {
                    "id": "5912",
                    "title": "Drug Stores and Proprietary Stores",
                    "fullTitle": "5912 - Drug Stores and Proprietary Stores"
                },
                {
                    "id": "5921",
                    "title": "Liquor Stores",
                    "fullTitle": "5921 - Liquor Stores"
                },
                {
                    "id": "5932",
                    "title": "Used Merchandise Stores",
                    "fullTitle": "5932 - Used Merchandise Stores"
                },
                {
                    "id": "5941",
                    "title": "Sporting Goods Stores and Bicycle Shops",
                    "fullTitle": "5941 - Sporting Goods Stores and Bicycle Shops"
                },
                {
                    "id": "5942",
                    "title": "Book Stores",
                    "fullTitle": "5942 - Book Stores"
                },
                {
                    "id": "5943",
                    "title": "Stationery Stores",
                    "fullTitle": "5943 - Stationery Stores"
                },
                {
                    "id": "5944",
                    "title": "Jewelry Stores",
                    "fullTitle": "5944 - Jewelry Stores"
                },
                {
                    "id": "5945",
                    "title": "Hobby, Toy, and Game Shops",
                    "fullTitle": "5945 - Hobby, Toy, and Game Shops"
                },
                {
                    "id": "5946",
                    "title": "Camera and Photographic Supply Stores",
                    "fullTitle": "5946 - Camera and Photographic Supply Stores"
                },
                {
                    "id": "5947",
                    "title": "Gift, Novelty, and Souvenir Shops",
                    "fullTitle": "5947 - Gift, Novelty, and Souvenir Shops"
                },
                {
                    "id": "5948",
                    "title": "Luggage and Leather Goods Stores",
                    "fullTitle": "5948 - Luggage and Leather Goods Stores"
                },
                {
                    "id": "5949",
                    "title": "Sewing, Needlework, and Piece Goods Stores",
                    "fullTitle": "5949 - Sewing, Needlework, and Piece Goods Stores"
                },
                {
                    "id": "5961",
                    "title": "Catalog and Mail",
                    "fullTitle": "5961 - Catalog and Mail"
                },
                {
                    "id": "5962",
                    "title": "Automatic Merchandising Machine Operators",
                    "fullTitle": "5962 - Automatic Merchandising Machine Operators"
                },
                {
                    "id": "5963",
                    "title": "Direct Selling Establishments",
                    "fullTitle": "5963 - Direct Selling Establishments"
                },
                {
                    "id": "5983",
                    "title": "Fuel Oil Dealers",
                    "fullTitle": "5983 - Fuel Oil Dealers"
                },
                {
                    "id": "5984",
                    "title": "Liquefied Petroleum Gas (Bottled Gas) Dealers",
                    "fullTitle": "5984 - Liquefied Petroleum Gas (Bottled Gas) Dealers"
                },
                {
                    "id": "5989",
                    "title": "Fuel Dealers, Not Elsewhere Classified",
                    "fullTitle": "5989 - Fuel Dealers, Not Elsewhere Classified"
                },
                {
                    "id": "5992",
                    "title": "Florists",
                    "fullTitle": "5992 - Florists"
                },
                {
                    "id": "5993",
                    "title": "Tobacco Stores and Stands",
                    "fullTitle": "5993 - Tobacco Stores and Stands"
                },
                {
                    "id": "5994",
                    "title": "News Dealers and Newsstands",
                    "fullTitle": "5994 - News Dealers and Newsstands"
                },
                {
                    "id": "5995",
                    "title": "Optical Goods Stores",
                    "fullTitle": "5995 - Optical Goods Stores"
                },
                {
                    "id": "5999",
                    "title": "Miscellaneous Retail Stores, Not Elsewhere Classified",
                    "fullTitle": "5999 - Miscellaneous Retail Stores, Not Elsewhere Classified"
                },
                {
                    "id": "6011",
                    "title": "Federal Reserve Banks",
                    "fullTitle": "6011 - Federal Reserve Banks"
                },
                {
                    "id": "6019",
                    "title": "Central Reserve Depository Institutions, Not Elsewhere Classified",
                    "fullTitle": "6019 - Central Reserve Depository Institutions, Not Elsewhere Classified"
                },
                {
                    "id": "6021",
                    "title": "National Commercial Banks",
                    "fullTitle": "6021 - National Commercial Banks"
                },
                {
                    "id": "6022",
                    "title": "State Commercial Banks",
                    "fullTitle": "6022 - State Commercial Banks"
                },
                {
                    "id": "6029",
                    "title": "Commercial Banks, Not Elsewhere Classified",
                    "fullTitle": "6029 - Commercial Banks, Not Elsewhere Classified"
                },
                {
                    "id": "6035",
                    "title": "Savings Institutions, Federally Chartered",
                    "fullTitle": "6035 - Savings Institutions, Federally Chartered"
                },
                {
                    "id": "6036",
                    "title": "Savings Institutions, Not Federally Chartered",
                    "fullTitle": "6036 - Savings Institutions, Not Federally Chartered"
                },
                {
                    "id": "6061",
                    "title": "Credit Unions, Federally Chartered",
                    "fullTitle": "6061 - Credit Unions, Federally Chartered"
                },
                {
                    "id": "6062",
                    "title": "Credit Unions, Not Federally Chartered",
                    "fullTitle": "6062 - Credit Unions, Not Federally Chartered"
                },
                {
                    "id": "6081",
                    "title": "Branches and Agencies of Foreign Banks",
                    "fullTitle": "6081 - Branches and Agencies of Foreign Banks"
                },
                {
                    "id": "6082",
                    "title": "Foreign Trade and International Banking Institutions",
                    "fullTitle": "6082 - Foreign Trade and International Banking Institutions"
                },
                {
                    "id": "6091",
                    "title": "Non-deposit Trust Facilities",
                    "fullTitle": "6091 - Non-deposit Trust Facilities"
                },
                {
                    "id": "6099",
                    "title": "Functions Related to Depository Banking, Not Elsewhere Classified",
                    "fullTitle": "6099 - Functions Related to Depository Banking, Not Elsewhere Classified"
                },
                {
                    "id": "6111",
                    "title": "Federal and Federally-Sponsored Credit Agencies",
                    "fullTitle": "6111 - Federal and Federally-Sponsored Credit Agencies"
                },
                {
                    "id": "6141",
                    "title": "Personal Credit Institutions",
                    "fullTitle": "6141 - Personal Credit Institutions"
                },
                {
                    "id": "6153",
                    "title": "Short-Term Business Credit Institutions, except Agricultural",
                    "fullTitle": "6153 - Short-Term Business Credit Institutions, except Agricultural"
                },
                {
                    "id": "6159",
                    "title": "Miscellaneous Business Credit Institutions",
                    "fullTitle": "6159 - Miscellaneous Business Credit Institutions"
                },
                {
                    "id": "6162",
                    "title": "Mortgage Bankers and Loan Correspondents",
                    "fullTitle": "6162 - Mortgage Bankers and Loan Correspondents"
                },
                {
                    "id": "6163",
                    "title": "Loan Brokers",
                    "fullTitle": "6163 - Loan Brokers"
                },
                {
                    "id": "6211",
                    "title": "Security Brokers, Dealers, and Flotation Companies",
                    "fullTitle": "6211 - Security Brokers, Dealers, and Flotation Companies"
                },
                {
                    "id": "6221",
                    "title": "Commodity Contracts Brokers and Dealers",
                    "fullTitle": "6221 - Commodity Contracts Brokers and Dealers"
                },
                {
                    "id": "6231",
                    "title": "Security and Commodity Exchanges",
                    "fullTitle": "6231 - Security and Commodity Exchanges"
                },
                {
                    "id": "6282",
                    "title": "Investment Advice",
                    "fullTitle": "6282 - Investment Advice"
                },
                {
                    "id": "6289",
                    "title": "Services Allied With the Exchange of Securities or Commodities, Not Elsewhere Classified",
                    "fullTitle": "6289 - Services Allied With the Exchange of Securities or Commodities, Not Elsewhere Classified"
                },
                {
                    "id": "6311",
                    "title": "Life Insurance",
                    "fullTitle": "6311 - Life Insurance"
                },
                {
                    "id": "6321",
                    "title": "Accident and Health Insurance",
                    "fullTitle": "6321 - Accident and Health Insurance"
                },
                {
                    "id": "6324",
                    "title": "Hospital and Medical Service Plans",
                    "fullTitle": "6324 - Hospital and Medical Service Plans"
                },
                {
                    "id": "6331",
                    "title": "Fire, Marine, and Casualty Insurance",
                    "fullTitle": "6331 - Fire, Marine, and Casualty Insurance"
                },
                {
                    "id": "6351",
                    "title": "Surety Insurance",
                    "fullTitle": "6351 - Surety Insurance"
                },
                {
                    "id": "6361",
                    "title": "Title Insurance",
                    "fullTitle": "6361 - Title Insurance"
                },
                {
                    "id": "6371",
                    "title": "Pension, Health, and Welfare Funds",
                    "fullTitle": "6371 - Pension, Health, and Welfare Funds"
                },
                {
                    "id": "6399",
                    "title": "Insurance Carriers, Not Elsewhere Classified",
                    "fullTitle": "6399 - Insurance Carriers, Not Elsewhere Classified"
                },
                {
                    "id": "6411",
                    "title": "Insurance Agents, Brokers, and Service",
                    "fullTitle": "6411 - Insurance Agents, Brokers, and Service"
                },
                {
                    "id": "6512",
                    "title": "Operators of Nonresidential Buildings",
                    "fullTitle": "6512 - Operators of Nonresidential Buildings"
                },
                {
                    "id": "6513",
                    "title": "Operators or Apartment Buildings",
                    "fullTitle": "6513 - Operators or Apartment Buildings"
                },
                {
                    "id": "6514",
                    "title": "Operators of Dwellings Other Than Apartment Buildings",
                    "fullTitle": "6514 - Operators of Dwellings Other Than Apartment Buildings"
                },
                {
                    "id": "6515",
                    "title": "Operators of Residential Mobile Home Sites",
                    "fullTitle": "6515 - Operators of Residential Mobile Home Sites"
                },
                {
                    "id": "6517",
                    "title": "Lessors of Railroad Property",
                    "fullTitle": "6517 - Lessors of Railroad Property"
                },
                {
                    "id": "6519",
                    "title": "Lessors of Real Property, Not Elsewhere Classified",
                    "fullTitle": "6519 - Lessors of Real Property, Not Elsewhere Classified"
                },
                {
                    "id": "6531",
                    "title": "Real Estate Agents and Managers",
                    "fullTitle": "6531 - Real Estate Agents and Managers"
                },
                {
                    "id": "6541",
                    "title": "Title Abstract Offices",
                    "fullTitle": "6541 - Title Abstract Offices"
                },
                {
                    "id": "6552",
                    "title": "Land Subdividers and Developers, Except Cemeteries",
                    "fullTitle": "6552 - Land Subdividers and Developers, Except Cemeteries"
                },
                {
                    "id": "6553",
                    "title": "Cemetery Subdividers and Developers",
                    "fullTitle": "6553 - Cemetery Subdividers and Developers"
                },
                {
                    "id": "6712",
                    "title": "Offices of Bank Holding Companies",
                    "fullTitle": "6712 - Offices of Bank Holding Companies"
                },
                {
                    "id": "6719",
                    "title": "Offices of Holding Companies, Not Elsewhere Classified",
                    "fullTitle": "6719 - Offices of Holding Companies, Not Elsewhere Classified"
                },
                {
                    "id": "6722",
                    "title": "Management Investment Offices, Open",
                    "fullTitle": "6722 - Management Investment Offices, Open"
                },
                {
                    "id": "6726",
                    "title": "Unit Investment Trusts, Face-Amount Certificate Offices, and Closed-End Management Investment Offices",
                    "fullTitle": "6726 - Unit Investment Trusts, Face-Amount Certificate Offices, and Closed-End Management Investment Offices"
                },
                {
                    "id": "6732",
                    "title": "Educational, Religious, and Charitable Trusts",
                    "fullTitle": "6732 - Educational, Religious, and Charitable Trusts"
                },
                {
                    "id": "6733",
                    "title": "Trusts, Except Educational, Religious, and Charitable",
                    "fullTitle": "6733 - Trusts, Except Educational, Religious, and Charitable"
                },
                {
                    "id": "6792",
                    "title": "Oil Royalty Traders",
                    "fullTitle": "6792 - Oil Royalty Traders"
                },
                {
                    "id": "6794",
                    "title": "Patent Owners and Lessors",
                    "fullTitle": "6794 - Patent Owners and Lessors"
                },
                {
                    "id": "6798",
                    "title": "Real Estate Investment Trusts",
                    "fullTitle": "6798 - Real Estate Investment Trusts"
                },
                {
                    "id": "6799",
                    "title": "Investors, Not Elsewhere Classified",
                    "fullTitle": "6799 - Investors, Not Elsewhere Classified"
                },
                {
                    "id": "7011",
                    "title": "Hotels and Motels",
                    "fullTitle": "7011 - Hotels and Motels"
                },
                {
                    "id": "7021",
                    "title": "Rooming and Boarding Houses",
                    "fullTitle": "7021 - Rooming and Boarding Houses"
                },
                {
                    "id": "7032",
                    "title": "Sporting and Recreational Camps",
                    "fullTitle": "7032 - Sporting and Recreational Camps"
                },
                {
                    "id": "7033",
                    "title": "Recreational Vehicle Parks and Campsites",
                    "fullTitle": "7033 - Recreational Vehicle Parks and Campsites"
                },
                {
                    "id": "7041",
                    "title": "Organization Hotels and Lodging Houses, on Membership Basis",
                    "fullTitle": "7041 - Organization Hotels and Lodging Houses, on Membership Basis"
                },
                {
                    "id": "7211",
                    "title": "Power Laundries, Family and Commercial",
                    "fullTitle": "7211 - Power Laundries, Family and Commercial"
                },
                {
                    "id": "7212",
                    "title": "Garment Pressing, and Agents for Laundries and Drycleaners",
                    "fullTitle": "7212 - Garment Pressing, and Agents for Laundries and Drycleaners"
                },
                {
                    "id": "7213",
                    "title": "Linen Supply",
                    "fullTitle": "7213 - Linen Supply"
                },
                {
                    "id": "7215",
                    "title": "Coin-Operated Laundries and Drycleaning",
                    "fullTitle": "7215 - Coin-Operated Laundries and Drycleaning"
                },
                {
                    "id": "7216",
                    "title": "Drycleaning Plants, Except Rug Cleaning",
                    "fullTitle": "7216 - Drycleaning Plants, Except Rug Cleaning"
                },
                {
                    "id": "7217",
                    "title": "Carpet and Upholstery Cleaning",
                    "fullTitle": "7217 - Carpet and Upholstery Cleaning"
                },
                {
                    "id": "7218",
                    "title": "Industrial Launderers",
                    "fullTitle": "7218 - Industrial Launderers"
                },
                {
                    "id": "7219",
                    "title": "Laundry and Garment Services, Not Elsewhere Classified",
                    "fullTitle": "7219 - Laundry and Garment Services, Not Elsewhere Classified"
                },
                {
                    "id": "7221",
                    "title": "Photographic Studios, Portrait",
                    "fullTitle": "7221 - Photographic Studios, Portrait"
                },
                {
                    "id": "7231",
                    "title": "Beauty Shops",
                    "fullTitle": "7231 - Beauty Shops"
                },
                {
                    "id": "7241",
                    "title": "Barber Shops",
                    "fullTitle": "7241 - Barber Shops"
                },
                {
                    "id": "7251",
                    "title": "Shoe Repair Shops and Shoeshine Parlors",
                    "fullTitle": "7251 - Shoe Repair Shops and Shoeshine Parlors"
                },
                {
                    "id": "7261",
                    "title": "Funeral Service and Crematories",
                    "fullTitle": "7261 - Funeral Service and Crematories"
                },
                {
                    "id": "7291",
                    "title": "Tax Return Preparation Services",
                    "fullTitle": "7291 - Tax Return Preparation Services"
                },
                {
                    "id": "7299",
                    "title": "Miscellaneous Personal Services, Not Elsewhere Classified",
                    "fullTitle": "7299 - Miscellaneous Personal Services, Not Elsewhere Classified"
                },
                {
                    "id": "7311",
                    "title": "Advertising Agencies",
                    "fullTitle": "7311 - Advertising Agencies"
                },
                {
                    "id": "7312",
                    "title": "Outdoor Advertising Services",
                    "fullTitle": "7312 - Outdoor Advertising Services"
                },
                {
                    "id": "7313",
                    "title": "Radio, Television, and Publishers' Advertising Representatives",
                    "fullTitle": "7313 - Radio, Television, and Publishers' Advertising Representatives"
                },
                {
                    "id": "7319",
                    "title": "Advertising, Not Elsewhere Classified",
                    "fullTitle": "7319 - Advertising, Not Elsewhere Classified"
                },
                {
                    "id": "7322",
                    "title": "Adjustment and Collection Services",
                    "fullTitle": "7322 - Adjustment and Collection Services"
                },
                {
                    "id": "7323",
                    "title": "Credit Reporting Services",
                    "fullTitle": "7323 - Credit Reporting Services"
                },
                {
                    "id": "7331",
                    "title": "Direct Mail Advertising Services",
                    "fullTitle": "7331 - Direct Mail Advertising Services"
                },
                {
                    "id": "7334",
                    "title": "Photocopying and Duplicating Services",
                    "fullTitle": "7334 - Photocopying and Duplicating Services"
                },
                {
                    "id": "7335",
                    "title": "Commercial Photography",
                    "fullTitle": "7335 - Commercial Photography"
                },
                {
                    "id": "7336",
                    "title": "Commercial Art and Graphic Design",
                    "fullTitle": "7336 - Commercial Art and Graphic Design"
                },
                {
                    "id": "7338",
                    "title": "Secretarial and Court Reporting Services",
                    "fullTitle": "7338 - Secretarial and Court Reporting Services"
                },
                {
                    "id": "7342",
                    "title": "Disinfecting and Pest Control Services",
                    "fullTitle": "7342 - Disinfecting and Pest Control Services"
                },
                {
                    "id": "7349",
                    "title": "Building Cleaning and Maintenance Services, Not Elsewhere Classified",
                    "fullTitle": "7349 - Building Cleaning and Maintenance Services, Not Elsewhere Classified"
                },
                {
                    "id": "7352",
                    "title": "Medical Equipment Rental and Leasing",
                    "fullTitle": "7352 - Medical Equipment Rental and Leasing"
                },
                {
                    "id": "7353",
                    "title": "Heavy Construction Equipment Rental and Leasing",
                    "fullTitle": "7353 - Heavy Construction Equipment Rental and Leasing"
                },
                {
                    "id": "7359",
                    "title": "Equipment Rental and Leasing, Not Elsewhere Classified",
                    "fullTitle": "7359 - Equipment Rental and Leasing, Not Elsewhere Classified"
                },
                {
                    "id": "7361",
                    "title": "Employment Agencies",
                    "fullTitle": "7361 - Employment Agencies"
                },
                {
                    "id": "7363",
                    "title": "Help Supply Services",
                    "fullTitle": "7363 - Help Supply Services"
                },
                {
                    "id": "7371",
                    "title": "Computer Programming Services",
                    "fullTitle": "7371 - Computer Programming Services"
                },
                {
                    "id": "7372",
                    "title": "Prepackaged Software",
                    "fullTitle": "7372 - Prepackaged Software"
                },
                {
                    "id": "7373",
                    "title": "Computer Integrated Systems Design",
                    "fullTitle": "7373 - Computer Integrated Systems Design"
                },
                {
                    "id": "7374",
                    "title": "Computer Processing and Data Preparation and Processing Services",
                    "fullTitle": "7374 - Computer Processing and Data Preparation and Processing Services"
                },
                {
                    "id": "7375",
                    "title": "Information Retrieval Services",
                    "fullTitle": "7375 - Information Retrieval Services"
                },
                {
                    "id": "7376",
                    "title": "Computer Facilities Management Services",
                    "fullTitle": "7376 - Computer Facilities Management Services"
                },
                {
                    "id": "7377",
                    "title": "Computer Rental and Leasing",
                    "fullTitle": "7377 - Computer Rental and Leasing"
                },
                {
                    "id": "7378",
                    "title": "Computer Maintenance and Repair",
                    "fullTitle": "7378 - Computer Maintenance and Repair"
                },
                {
                    "id": "7379",
                    "title": "Computer Related Services, Not Elsewhere Classified",
                    "fullTitle": "7379 - Computer Related Services, Not Elsewhere Classified"
                },
                {
                    "id": "7381",
                    "title": "Detective, Guard, and Armored Car Services",
                    "fullTitle": "7381 - Detective, Guard, and Armored Car Services"
                },
                {
                    "id": "7382",
                    "title": "Security Systems Services",
                    "fullTitle": "7382 - Security Systems Services"
                },
                {
                    "id": "7383",
                    "title": "News Syndicates",
                    "fullTitle": "7383 - News Syndicates"
                },
                {
                    "id": "7384",
                    "title": "Photofinishing Laboratories",
                    "fullTitle": "7384 - Photofinishing Laboratories"
                },
                {
                    "id": "7389",
                    "title": "Business Services, Not Elsewhere Classified",
                    "fullTitle": "7389 - Business Services, Not Elsewhere Classified"
                },
                {
                    "id": "7513",
                    "title": "Truck Rental and Leasing, Without Drivers",
                    "fullTitle": "7513 - Truck Rental and Leasing, Without Drivers"
                },
                {
                    "id": "7514",
                    "title": "Passenger Car Rental",
                    "fullTitle": "7514 - Passenger Car Rental"
                },
                {
                    "id": "7515",
                    "title": "Passenger Car Leasing",
                    "fullTitle": "7515 - Passenger Car Leasing"
                },
                {
                    "id": "7519",
                    "title": "Utility Trailer and Recreational Vehicle Rental",
                    "fullTitle": "7519 - Utility Trailer and Recreational Vehicle Rental"
                },
                {
                    "id": "7521",
                    "title": "Automobile Parking",
                    "fullTitle": "7521 - Automobile Parking"
                },
                {
                    "id": "7532",
                    "title": "Top, Body, and Upholstery Repair Shops and Paint Shops",
                    "fullTitle": "7532 - Top, Body, and Upholstery Repair Shops and Paint Shops"
                },
                {
                    "id": "7533",
                    "title": "Automotive Exhaust System Repair Shops",
                    "fullTitle": "7533 - Automotive Exhaust System Repair Shops"
                },
                {
                    "id": "7534",
                    "title": "Tire Retreading and Repair Shops",
                    "fullTitle": "7534 - Tire Retreading and Repair Shops"
                },
                {
                    "id": "7536",
                    "title": "Automotive Glass Replacement Shops",
                    "fullTitle": "7536 - Automotive Glass Replacement Shops"
                },
                {
                    "id": "7537",
                    "title": "Automotive Transmission Repair Shops",
                    "fullTitle": "7537 - Automotive Transmission Repair Shops"
                },
                {
                    "id": "7538",
                    "title": "General Automotive Repair Shops",
                    "fullTitle": "7538 - General Automotive Repair Shops"
                },
                {
                    "id": "7539",
                    "title": "Automotive Repair Shops, Not Elsewhere Classified",
                    "fullTitle": "7539 - Automotive Repair Shops, Not Elsewhere Classified"
                },
                {
                    "id": "7542",
                    "title": "Carwashes",
                    "fullTitle": "7542 - Carwashes"
                },
                {
                    "id": "7549",
                    "title": "Automotive Services, Except Repair and Carwashes",
                    "fullTitle": "7549 - Automotive Services, Except Repair and Carwashes"
                },
                {
                    "id": "7622",
                    "title": "Radio and Television Repair Shops",
                    "fullTitle": "7622 - Radio and Television Repair Shops"
                },
                {
                    "id": "7623",
                    "title": "Refrigeration and Air-conditioning Service and Repair Shops",
                    "fullTitle": "7623 - Refrigeration and Air-conditioning Service and Repair Shops"
                },
                {
                    "id": "7629",
                    "title": "Electrical and Electronic Repair Shops, Not Elsewhere Classified",
                    "fullTitle": "7629 - Electrical and Electronic Repair Shops, Not Elsewhere Classified"
                },
                {
                    "id": "7631",
                    "title": "Watch, Clock, and Jewelry Repair",
                    "fullTitle": "7631 - Watch, Clock, and Jewelry Repair"
                },
                {
                    "id": "7641",
                    "title": "Reupholstery and Furniture Repair",
                    "fullTitle": "7641 - Reupholstery and Furniture Repair"
                },
                {
                    "id": "7692",
                    "title": "Welding Repair",
                    "fullTitle": "7692 - Welding Repair"
                },
                {
                    "id": "7694",
                    "title": "Armature Rewinding Shops",
                    "fullTitle": "7694 - Armature Rewinding Shops"
                },
                {
                    "id": "7699",
                    "title": "Repair Shops and Related Services, Not Elsewhere Classified",
                    "fullTitle": "7699 - Repair Shops and Related Services, Not Elsewhere Classified"
                },
                {
                    "id": "7812",
                    "title": "Motion Picture and Video Tape Production",
                    "fullTitle": "7812 - Motion Picture and Video Tape Production"
                },
                {
                    "id": "7819",
                    "title": "Services Allied to Motion Picture Production",
                    "fullTitle": "7819 - Services Allied to Motion Picture Production"
                },
                {
                    "id": "7822",
                    "title": "Motion Picture and Video Tape Distribution",
                    "fullTitle": "7822 - Motion Picture and Video Tape Distribution"
                },
                {
                    "id": "7829",
                    "title": "Services Allied to Motion Picture Distribution",
                    "fullTitle": "7829 - Services Allied to Motion Picture Distribution"
                },
                {
                    "id": "7832",
                    "title": "Motion Picture Theaters, Except Drive",
                    "fullTitle": "7832 - Motion Picture Theaters, Except Drive"
                },
                {
                    "id": "7833",
                    "title": "Drive-In Motion Picture Theaters",
                    "fullTitle": "7833 - Drive-In Motion Picture Theaters"
                },
                {
                    "id": "7841",
                    "title": "Video Tape Rental",
                    "fullTitle": "7841 - Video Tape Rental"
                },
                {
                    "id": "7911",
                    "title": "Dance Studios, Schools, and Halls",
                    "fullTitle": "7911 - Dance Studios, Schools, and Halls"
                },
                {
                    "id": "7922",
                    "title": "Theatrical Producers (Except Motion Picture) and Miscellaneous Theatrical Services",
                    "fullTitle": "7922 - Theatrical Producers (Except Motion Picture) and Miscellaneous Theatrical Services"
                },
                {
                    "id": "7929",
                    "title": "Bands, Orchestras, Actors, and Other Entertainers and Entertainment Groups",
                    "fullTitle": "7929 - Bands, Orchestras, Actors, and Other Entertainers and Entertainment Groups"
                },
                {
                    "id": "7933",
                    "title": "Bowling Centers",
                    "fullTitle": "7933 - Bowling Centers"
                },
                {
                    "id": "7941",
                    "title": "Professional Sports Clubs and Promoters",
                    "fullTitle": "7941 - Professional Sports Clubs and Promoters"
                },
                {
                    "id": "7948",
                    "title": "Racing, Including Track Operation",
                    "fullTitle": "7948 - Racing, Including Track Operation"
                },
                {
                    "id": "7991",
                    "title": "Physical Fitness Facilities",
                    "fullTitle": "7991 - Physical Fitness Facilities"
                },
                {
                    "id": "7992",
                    "title": "Public Golf Courses",
                    "fullTitle": "7992 - Public Golf Courses"
                },
                {
                    "id": "7993",
                    "title": "Coin-Operated Amusement Devices",
                    "fullTitle": "7993 - Coin-Operated Amusement Devices"
                },
                {
                    "id": "7996",
                    "title": "Amusement Parks",
                    "fullTitle": "7996 - Amusement Parks"
                },
                {
                    "id": "7997",
                    "title": "Membership Sports and Recreation Clubs",
                    "fullTitle": "7997 - Membership Sports and Recreation Clubs"
                },
                {
                    "id": "7999",
                    "title": "Amusement and Recreation Services, Not Elsewhere Classified",
                    "fullTitle": "7999 - Amusement and Recreation Services, Not Elsewhere Classified"
                },
                {
                    "id": "8011",
                    "title": "Offices and Clinics of Doctors of Medicine",
                    "fullTitle": "8011 - Offices and Clinics of Doctors of Medicine"
                },
                {
                    "id": "8021",
                    "title": "Offices and Clinics of Dentists",
                    "fullTitle": "8021 - Offices and Clinics of Dentists"
                },
                {
                    "id": "8031",
                    "title": "Offices and Clinics of Doctors of Osteopathy",
                    "fullTitle": "8031 - Offices and Clinics of Doctors of Osteopathy"
                },
                {
                    "id": "8041",
                    "title": "Offices and Clinics of Chiropractors",
                    "fullTitle": "8041 - Offices and Clinics of Chiropractors"
                },
                {
                    "id": "8042",
                    "title": "Offices and Clinics of Optometrists",
                    "fullTitle": "8042 - Offices and Clinics of Optometrists"
                },
                {
                    "id": "8043",
                    "title": "Offices and Clinics of Podiatrists",
                    "fullTitle": "8043 - Offices and Clinics of Podiatrists"
                },
                {
                    "id": "8049",
                    "title": "Offices and Clinics of Health Practitioners, Not Elsewhere Classified",
                    "fullTitle": "8049 - Offices and Clinics of Health Practitioners, Not Elsewhere Classified"
                },
                {
                    "id": "8051",
                    "title": "Skilled Nursing Care Facilities",
                    "fullTitle": "8051 - Skilled Nursing Care Facilities"
                },
                {
                    "id": "8052",
                    "title": "Intermediate Care Facilities",
                    "fullTitle": "8052 - Intermediate Care Facilities"
                },
                {
                    "id": "8059",
                    "title": "Nursing and Personal Care Facilities, Not Elsewhere Classified",
                    "fullTitle": "8059 - Nursing and Personal Care Facilities, Not Elsewhere Classified"
                },
                {
                    "id": "8062",
                    "title": "General Medical and Surgical Hospitals",
                    "fullTitle": "8062 - General Medical and Surgical Hospitals"
                },
                {
                    "id": "8063",
                    "title": "Psychiatric Hospitals",
                    "fullTitle": "8063 - Psychiatric Hospitals"
                },
                {
                    "id": "8069",
                    "title": "Specialty Hospitals, Except Psychiatric",
                    "fullTitle": "8069 - Specialty Hospitals, Except Psychiatric"
                },
                {
                    "id": "8071",
                    "title": "Medical Laboratories",
                    "fullTitle": "8071 - Medical Laboratories"
                },
                {
                    "id": "8072",
                    "title": "Dental Laboratories",
                    "fullTitle": "8072 - Dental Laboratories"
                },
                {
                    "id": "8082",
                    "title": "Home Health Care Services",
                    "fullTitle": "8082 - Home Health Care Services"
                },
                {
                    "id": "8092",
                    "title": "Kidney Dialysis Centers",
                    "fullTitle": "8092 - Kidney Dialysis Centers"
                },
                {
                    "id": "8093",
                    "title": "Specialty Outpatient Facilities, Not Elsewhere Classified",
                    "fullTitle": "8093 - Specialty Outpatient Facilities, Not Elsewhere Classified"
                },
                {
                    "id": "8099",
                    "title": "Health and Allied Services, Not Elsewhere Classified",
                    "fullTitle": "8099 - Health and Allied Services, Not Elsewhere Classified"
                },
                {
                    "id": "8111",
                    "title": "Legal Services",
                    "fullTitle": "8111 - Legal Services"
                },
                {
                    "id": "8211",
                    "title": "Elementary and Secondary Schools",
                    "fullTitle": "8211 - Elementary and Secondary Schools"
                },
                {
                    "id": "8221",
                    "title": "Colleges, Universities, and Professional Schools",
                    "fullTitle": "8221 - Colleges, Universities, and Professional Schools"
                },
                {
                    "id": "8222",
                    "title": "Junior Colleges and Technical Institutes",
                    "fullTitle": "8222 - Junior Colleges and Technical Institutes"
                },
                {
                    "id": "8231",
                    "title": "Libraries",
                    "fullTitle": "8231 - Libraries"
                },
                {
                    "id": "8243",
                    "title": "Data Processing Schools",
                    "fullTitle": "8243 - Data Processing Schools"
                },
                {
                    "id": "8244",
                    "title": "Business and Secretarial Schools",
                    "fullTitle": "8244 - Business and Secretarial Schools"
                },
                {
                    "id": "8249",
                    "title": "Vocational Schools, Not Elsewhere Classified",
                    "fullTitle": "8249 - Vocational Schools, Not Elsewhere Classified"
                },
                {
                    "id": "8299",
                    "title": "Schools and Educational Services, Not Elsewhere Classified",
                    "fullTitle": "8299 - Schools and Educational Services, Not Elsewhere Classified"
                },
                {
                    "id": "8322",
                    "title": "Individual and Family Social Services",
                    "fullTitle": "8322 - Individual and Family Social Services"
                },
                {
                    "id": "8331",
                    "title": "Job Training and Vocational Rehabilitation Services",
                    "fullTitle": "8331 - Job Training and Vocational Rehabilitation Services"
                },
                {
                    "id": "8351",
                    "title": "Child Day Care Services",
                    "fullTitle": "8351 - Child Day Care Services"
                },
                {
                    "id": "8361",
                    "title": "Residential Care",
                    "fullTitle": "8361 - Residential Care"
                },
                {
                    "id": "8399",
                    "title": "Social Services, Not Elsewhere Classified",
                    "fullTitle": "8399 - Social Services, Not Elsewhere Classified"
                },
                {
                    "id": "8412",
                    "title": "Museums and Art Galleries",
                    "fullTitle": "8412 - Museums and Art Galleries"
                },
                {
                    "id": "8422",
                    "title": "Arboreta and Botanical or Zoological Gardens",
                    "fullTitle": "8422 - Arboreta and Botanical or Zoological Gardens"
                },
                {
                    "id": "8611",
                    "title": "Business Associations",
                    "fullTitle": "8611 - Business Associations"
                },
                {
                    "id": "8621",
                    "title": "Professional Membership Organizations",
                    "fullTitle": "8621 - Professional Membership Organizations"
                },
                {
                    "id": "8631",
                    "title": "Labor Unions and Similar Labor organizations",
                    "fullTitle": "8631 - Labor Unions and Similar Labor organizations"
                },
                {
                    "id": "8641",
                    "title": "Civic, Social, and Fraternal Associations",
                    "fullTitle": "8641 - Civic, Social, and Fraternal Associations"
                },
                {
                    "id": "8651",
                    "title": "Political Organizations",
                    "fullTitle": "8651 - Political Organizations"
                },
                {
                    "id": "8661",
                    "title": "Religious Organizations",
                    "fullTitle": "8661 - Religious Organizations"
                },
                {
                    "id": "8699",
                    "title": "Membership organizations, Not Elsewhere Classified",
                    "fullTitle": "8699 - Membership organizations, Not Elsewhere Classified"
                },
                {
                    "id": "8711",
                    "title": "Engineering Services",
                    "fullTitle": "8711 - Engineering Services"
                },
                {
                    "id": "8712",
                    "title": "Architectural Services",
                    "fullTitle": "8712 - Architectural Services"
                },
                {
                    "id": "8713",
                    "title": "Surveying Services",
                    "fullTitle": "8713 - Surveying Services"
                },
                {
                    "id": "8721",
                    "title": "Accounting, Auditing, and Bookkeeping Services",
                    "fullTitle": "8721 - Accounting, Auditing, and Bookkeeping Services"
                },
                {
                    "id": "8731",
                    "title": "Commercial Physical and Biological Research",
                    "fullTitle": "8731 - Commercial Physical and Biological Research"
                },
                {
                    "id": "8732",
                    "title": "Commercial Economic, Sociological, and Educational Research",
                    "fullTitle": "8732 - Commercial Economic, Sociological, and Educational Research"
                },
                {
                    "id": "8733",
                    "title": "Noncommercial Research organizations",
                    "fullTitle": "8733 - Noncommercial Research organizations"
                },
                {
                    "id": "8734",
                    "title": "Testing Laboratories",
                    "fullTitle": "8734 - Testing Laboratories"
                },
                {
                    "id": "8741",
                    "title": "Management Services",
                    "fullTitle": "8741 - Management Services"
                },
                {
                    "id": "8742",
                    "title": "Management Consulting Services",
                    "fullTitle": "8742 - Management Consulting Services"
                },
                {
                    "id": "8743",
                    "title": "Public Relations Services",
                    "fullTitle": "8743 - Public Relations Services"
                },
                {
                    "id": "8744",
                    "title": "Facilities Support Management Services",
                    "fullTitle": "8744 - Facilities Support Management Services"
                },
                {
                    "id": "8748",
                    "title": "Business Consulting Services, Not Elsewhere Classified",
                    "fullTitle": "8748 - Business Consulting Services, Not Elsewhere Classified"
                },
                {
                    "id": "8811",
                    "title": "Private Households",
                    "fullTitle": "8811 - Private Households"
                },
                {
                    "id": "8999",
                    "title": "Services, Not Elsewhere Classified",
                    "fullTitle": "8999 - Services, Not Elsewhere Classified"
                },
                {
                    "id": "9111",
                    "title": "Executive Offices",
                    "fullTitle": "9111 - Executive Offices"
                },
                {
                    "id": "9121",
                    "title": "Legislative Bodies",
                    "fullTitle": "9121 - Legislative Bodies"
                },
                {
                    "id": "9131",
                    "title": "Executive and Legislative Offices Combined",
                    "fullTitle": "9131 - Executive and Legislative Offices Combined"
                },
                {
                    "id": "9199",
                    "title": "General Government, Not Elsewhere Classified",
                    "fullTitle": "9199 - General Government, Not Elsewhere Classified"
                },
                {
                    "id": "9211",
                    "title": "Courts",
                    "fullTitle": "9211 - Courts"
                },
                {
                    "id": "9221",
                    "title": "Police Protection",
                    "fullTitle": "9221 - Police Protection"
                },
                {
                    "id": "9222",
                    "title": "Legal Counsel and Prosecution",
                    "fullTitle": "9222 - Legal Counsel and Prosecution"
                },
                {
                    "id": "9223",
                    "title": "Correctional Institutions",
                    "fullTitle": "9223 - Correctional Institutions"
                },
                {
                    "id": "9224",
                    "title": "Fire Protection",
                    "fullTitle": "9224 - Fire Protection"
                },
                {
                    "id": "9229",
                    "title": "Public order and Safety, Not Elsewhere Classified",
                    "fullTitle": "9229 - Public order and Safety, Not Elsewhere Classified"
                },
                {
                    "id": "9311",
                    "title": "Public Finance, Taxation, and Monetary Policy",
                    "fullTitle": "9311 - Public Finance, Taxation, and Monetary Policy"
                },
                {
                    "id": "9411",
                    "title": "Administration of Educational Programs",
                    "fullTitle": "9411 - Administration of Educational Programs"
                },
                {
                    "id": "9431",
                    "title": "Administration of Public Health Programs",
                    "fullTitle": "9431 - Administration of Public Health Programs"
                },
                {
                    "id": "9441",
                    "title": "Administration of Social, Human Resource and Income Maintenance Programs",
                    "fullTitle": "9441 - Administration of Social, Human Resource and Income Maintenance Programs"
                },
                {
                    "id": "9451",
                    "title": "Administration of Veterans' Affairs, Except Health and Insurance",
                    "fullTitle": "9451 - Administration of Veterans' Affairs, Except Health and Insurance"
                },
                {
                    "id": "9511",
                    "title": "Air and Water Resource and Solid Waste Management",
                    "fullTitle": "9511 - Air and Water Resource and Solid Waste Management"
                },
                {
                    "id": "9512",
                    "title": "Land, Mineral, Wildlife, and Forest Conservation",
                    "fullTitle": "9512 - Land, Mineral, Wildlife, and Forest Conservation"
                },
                {
                    "id": "9531",
                    "title": "Administration of Housing Programs",
                    "fullTitle": "9531 - Administration of Housing Programs"
                },
                {
                    "id": "9532",
                    "title": "Administration of Urban Planning and Community and Rural Development",
                    "fullTitle": "9532 - Administration of Urban Planning and Community and Rural Development"
                },
                {
                    "id": "9611",
                    "title": "Administration of General Economic Programs",
                    "fullTitle": "9611 - Administration of General Economic Programs"
                },
                {
                    "id": "9621",
                    "title": "Regulation and Administration of Transportation Programs",
                    "fullTitle": "9621 - Regulation and Administration of Transportation Programs"
                },
                {
                    "id": "9631",
                    "title": "Regulation and Administration of Communications, Electric, Gas, and Other Utilities",
                    "fullTitle": "9631 - Regulation and Administration of Communications, Electric, Gas, and Other Utilities"
                },
                {
                    "id": "9641",
                    "title": "Regulation of Agricultural Marketing and Commodities",
                    "fullTitle": "9641 - Regulation of Agricultural Marketing and Commodities"
                },
                {
                    "id": "9651",
                    "title": "Regulation, Licensing, and Inspection of Miscellaneous Commercial Sectors",
                    "fullTitle": "9651 - Regulation, Licensing, and Inspection of Miscellaneous Commercial Sectors"
                },
                {
                    "id": "9661",
                    "title": "Space and Research and Technology",
                    "fullTitle": "9661 - Space and Research and Technology"
                },
                {
                    "id": "9711",
                    "title": "National Security",
                    "fullTitle": "9711 - National Security"
                },
                {
                    "id": "9721",
                    "title": "International Affairs",
                    "fullTitle": "9721 - International Affairs"
                },
                {
                    "id": "9999",
                    "title": "Nonclassifiable Establishments",
                    "fullTitle": "9999 - Nonclassifiable Establishments"
                }
              ],
              'fullTitle'
            ]
            expect(actualSearchArgs).to.deep.equal(expectedSearchArgs);
            expect(actualSearchArgs.length).to.equal(expectedSearchArgs.length);

            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(function () {
        autoCompleteServiceInstanceStub.search = sinon.stub();
      });
    });

    context('Check if correct params are passed for getting list of sic code', function () {
      before(function () {
        autoCompleteServiceInstanceStub.search = sinon.stub().throws(new Error('Something went wrong'));
      });
      it('Should return `500` when some internal error occurs', function (done) {
        // Arrange
        const next = function (error, result) {
          if (error) throw error;
          return result;
        };
        const req = {
          query: {},
          user: {
            email: 'dev.pmgr1@nexsales.com',
            roles: ['manager'],
          },
        };
        const res = {
          statusCode: null,
          data: null,
          status: (code) => {
            res.statusCode = code;
            return res;
          },
          json: () => res,
          send: (data) => {
            res.data = data;
            return res;
          },
        };
        sicCodeControllerModule.get(settingsConfig, req, res, next)
          .then(function (result) {
            // Assert
            const actualStatusCode = result.statusCode;
            const actualData = result.data;
            const expectedStatusCode = 500;
            const expectedData = {
              err: 'Something went wrong',
              desc: 'Could Not Get Master SIC Code',
            };

            expect(actualStatusCode).to.equal(expectedStatusCode);
            expect(actualData).to.deep.equal(expectedData);
            done();
          })
          .catch(function (err) {
            done(err);
          });
      });
      after(function () {
        autoCompleteServiceInstanceStub.search = sinon.stub();
      });
    });
  });
});