/* eslint-disable no-unused-vars */
/* eslint-disable no-unreachable */
import React, { useEffect, useRef, useState } from 'react'
import Papa from 'papaparse';
import { Form, Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import Loading from '../loding/Loading';
import { CSVLink } from "react-csv";
function UploadForm() {

    const [rowCount, setRowCount] = useState(0);
    const [headers, setHeaders] = useState([]);
    const [data, setData] = useState([])
    const [filteredData, setFilteredData] = useState([])
    const fixedHeaders = [
        { label: "Name", key: "name" },
        { label: "Website", key: "website" },
        { label: "Industry", key: "industry" },
        { label: "SubIndustry", key: "subIndustry" },
        { label: "Revenue", key: "revenue" },
        { label: "CompanySize", key: "size" }
    ]
    const [dataReady, setDataReady] = useState(true)
    const [companyName, setCompanyName] = useState(1);
    const [website, setWebsite] = useState(2);
    const [industry, setIndustry] = useState(3);
    const [subIndustry, setSubIndustry] = useState(4);
    const [revenue, setRevenue] = useState(5);
    const [companySize, setCompanySize] = useState(6);
    // const [companyName, setCompanyName] = useState(0);
    // const [website, setWebsite] = useState(0);
    // const [industry, setIndustry] = useState(0);
    // const [subIndustry, setSubIndustry] = useState(0);
    // const [revenue, setRevenue] = useState(0);
    // const [companySize, setCompanySize] = useState(0);
    // let rejectedObjects = [["yash"]]
    const [rejectedObjects, setRejectedObjects] = useState([])

    const [globalCounter, setGlobalCounter] = useState(0);
    let count = 0
    const [totalRequests, setTotalRequests] = useState(0);
    const [isParse, setIsParse] = useState(false);
    const [csvObject, setCsvObject] = useState({
        data: [],
        headers: fixedHeaders,
        filename: 'RejectedData.csv'
    })

    const chunkSize = 500
    const [showMapper, setShowMapper] = useState(false);
    const form = useRef()

    const handleClose = () => { setShowMapper(false); }
    const handleShow = () => { setShowMapper(true); }


    const handleFileUpload = (event) => {
        setGlobalCounter(0)
        setTotalRequests(0)
        setDataReady(true)
        setIsParse(false)

        const file = event.target.files[0];

        if (file) {

            countRowsInCSV(file)
                .then(({ headers, count, data }) => {
                    if (data) {
                        delete data[0];
                    }
                    setHeaders(headers)
                    //console.log("data in then", headers);
                    setRowCount(count);
                    setData(data)
                    setTotalRequests(Math.floor(data.length / chunkSize) + 1)
                    setHeadersArray()
                    setDataReady(false)
                })
                .catch((error) => {
                    console.error('Error parsing CSV:', error);
                });
        }

    };

    const setHeadersArray = () => {

        const defaultOption = <option key="default" value="">Select</option>;

        const header = headers.map((header, index = 0) => (
            <  option key={index} value={index}>{header}</option>
        ));

        return [defaultOption, ...header];

    }

    const countRowsInCSV = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            let count = 0;

            reader.onload = (event) => {
                const csvData = event.target.result;
                console.time("time")
                Papa.parse(csvData, {
                    // worker: true, // Enable Web Worker for better performance
                    complete: (results) => {
                        const headers = results.data[0];
                        const totalRows = count;
                        const data = results.data
                        //console.log("Total Rows: ", headers);
                        //console.log("Data Count: ", data.length);
                        console.timeEnd("time")

                        resolve({ headers, totalRows, data });
                    },
                    error: (error) => {
                        reject(error);
                    }
                });
            };

            reader.readAsText(file);
        });
    };

    useEffect(() => {
        //console.log("write reject oject", csvObject);
        writeRejectedObject()
    }, [totalRequests, globalCounter])

    const filterData = (chunk) => {

        let filteredArray = []
        for (let i = 0; i < chunk.length - 1; i++) {
            //console.log("inside filter data", i);
            const singletonData = chunk[i]
            if (singletonData[companyName] == undefined || singletonData[website] == undefined ||
                singletonData[industry] == undefined || singletonData[revenue] == undefined ||
                singletonData[companySize] == undefined || singletonData[companyName].trim() == "" ||
                singletonData[website].trim() == "" || singletonData[industry].trim() == "" ||
                singletonData[revenue].trim() == "" || singletonData[companySize].trim() == "") {
                let rejectedObject = {
                    name: singletonData[companyName],
                    website: singletonData[website],
                    industry: singletonData[industry],
                    subIndustry: singletonData[subIndustry],
                    revenue: singletonData[revenue],
                    size: singletonData[companySize],
                }
                setRejectedObjects(prev =>
                    [...prev, rejectedObject]
                )
                // rejectedObjects.push(rejectedObject)
            } else {
                let filteredObject
                filteredObject = {
                    name: singletonData[companyName].trim(),
                    website: singletonData[website].trim(),
                    industry: singletonData[industry].trim(),
                    subIndustry: singletonData[subIndustry].trim(),
                    revenue: singletonData[revenue].trim(),
                    size: singletonData[companySize].trim(),
                }
                filteredArray.push(filteredObject)
            }
        }
        return filteredArray
    }

    const checkForRepeatHeaders = () => {
        let numbers = []
        let count = 0
        numbers.push(companyName, website, industry, subIndustry, revenue, companySize)
        for (let i = 0; i < numbers.length; i++) {
            for (let j = 0; j < numbers.length; j++) {
                //console.log("comparing", numbers[i], numbers[j]);
                if (numbers[i] == numbers[j]) {

                    count++
                    //console.log("count", count);
                }
            }
        }
        if (count > numbers.length) {
            return false
        } else {
            return true
        }

    }

    const parseData = async (e) => {
        e.preventDefault()
        setGlobalCounter(0)
        const dataCheck = checkForRepeatHeaders()

        if (dataCheck == true) {
            handleClose()
            setIsParse(true)
            count = 0
            // rejectedObjects = []
            setRejectedObjects([])
            // //console.log("totalRequests:", totalRequests);
            const currTime = new Date().toLocaleTimeString();
            console.log("time start", currTime);



            

            for (let i = 1; i < data.length; i += chunkSize) {
                // //console.log("inside for loop of for in parsing data", data.length);

                const chunk = data.slice(i, i + chunkSize);
                const filteredChunk = filterData(chunk)
                await addEntries(filteredChunk)
            }
        } else {
            alert("headers cannot be same")
        }

    }
    const writeRejectedObject = () => {

        // let csvReport = {
        //     data: rejectedObjects,
        //     headers: fixedHeaders,
        //     filename: 'RejectedData.csv'
        // };

        //console.log("rejectedObjectswriteRejectedObject >>>>>>>>>>>>>>>>>>", rejectedObjects)
        // setCsvObject((prev) => {
        //     //console.log("rejectedObjects>>>>>>>>>>>>>>>>>>>>", rejectedObjects)
        //     //console.log("prev.data>>>>>>>>>>", prev.data)
        //     prev.data = rejectedObjects
        //     return prev
        // })
        setCsvObject(prev => {
            //console.log("rejectedObjects>>>>>>>>>>>>>>>>>>>>", rejectedObjects)
            //console.log("prev.data>>>>>>>>>>", prev.data)
            return {
                ...prev,
                data: rejectedObjects
            };
        });
        const currTime = new Date().toLocaleTimeString();
        console.log("time end", currTime);

    }


    const test = (e) => {

    }


    const addEntries = async (chunk) => {

        try {
            const response = await axios.post('http://127.0.0.1:20100/api/v1/parser', { data: chunk });
            //console.log("entries done", response.data);
            const currTime = new Date().toLocaleTimeString();
            count++

            if (response.data.length > 0) {
                setRejectedObjects(prev =>
                    [...prev, ...response.data]
                )
                // rejectedObjects.push(...response.data)
            }
            // console.log("time print", currTime, "total rejected objects:", rejectedObjects);
            setGlobalCounter(count)
        } catch (error) {
            alert(error.response)
        }
    };

    return (
        <div className="container px-2 py-2" >
            <>
                <Form>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control type="file" accept=".csv" onChange={handleFileUpload} />
                        {/* onChange={setFile.bind(this)} */}
                    </Form.Group>
                    <Button variant="primary" disabled={dataReady} onClick={handleShow} >
                        Submit
                    </Button>
                </Form>

                <p>Number of rows: {rowCount}</p>
                {showMapper && (
                    <div >
                        <Modal
                            show={showMapper}
                            onHide={handleClose}
                            backdrop="static"
                            keyboard={false}
                        >
                            <Modal.Header closeButton>
                                <div>
                                    <Modal.Title>Map columns</Modal.Title>
                                </div>

                            </Modal.Header>
                            <Modal.Body>
                                <Form ref={form}>
                                    <Form.Group className="mb-3" controlId="name">
                                        <Form.Label>Name</Form.Label>
                                        <Form.Select onChange={(e) => setCompanyName(e.target.value)}  >
                                            {setHeadersArray()}
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="name">
                                        <Form.Label>Website</Form.Label>
                                        <Form.Select onChange={(e) => setWebsite(e.target.value)}  >
                                            {setHeadersArray()}
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="name">
                                        <Form.Label>Industry</Form.Label>
                                        <Form.Select onChange={(e) => setIndustry(e.target.value)}  >
                                            {setHeadersArray()}
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="name">
                                        <Form.Label>SubIndustry</Form.Label>
                                        <Form.Select onChange={(e) => setSubIndustry(e.target.value)}  >
                                            {setHeadersArray()}
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="name">
                                        <Form.Label>Revenue</Form.Label>
                                        <Form.Select onChange={(e) => setRevenue(e.target.value)}  >
                                            {setHeadersArray()}
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="name">
                                        <Form.Label>CompanySize</Form.Label>
                                        <Form.Select onChange={(e) => setCompanySize(e.target.value)}  >
                                            {setHeadersArray()}
                                        </Form.Select>
                                    </Form.Group>

                                </Form>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={handleClose}>
                                    Close
                                </Button>
                                <div>
                                    <Button variant="primary" onClick={parseData}>Parse </Button>


                                </div>
                            </Modal.Footer>
                        </Modal>
                    </div>
                )}
                <div className=''>
                    <div className="card-footer white-background">
                        {totalRequests > 0 && isParse && < Loading totalRequests={totalRequests} globalCounter={globalCounter} />}
                    </div>
                </div>
                <div>
                    {totalRequests == globalCounter && totalRequests > 0 && (<div>
                        <h3>Export data to CSV </h3>
                        <CSVLink {...csvObject}>Export to CSV</CSVLink>
                    </div>)
                    }

                </div>

            </>

        </div>
    )

}

export default UploadForm;