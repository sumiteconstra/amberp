import React, { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { process } from '@progress/kendo-data-query';
import { Button } from '@mui/material';
import { PrivateAxios } from '../../../../environment/AxiosInstance';

function ItemWisePurchaseReport() {
    const [selectedRange, setSelectedRange] = useState("3m");
    const [fmsData, setFmsData] = useState({
        startDate: null,
        endDate: null,
    });

    const [filter, setFilter] = useState({ logic: "and", filters: [] });
    const [gridData, setGridData] = useState([]);
    const [allData, setAllData] = useState([]);

    const fetchData = async () => {
        try {
            const response = await PrivateAxios.get('purchase/done_count');
            const purchases = response.data.products || [];

            const flattened = purchases.flatMap(purchase =>
                (purchase.products || []).map(product => {
                    const item = product.ProductsItem;
                    const createdDate = new Date(purchase.created_at);

                    return {
                        id: product.id,
                        referenceNumber: purchase.reference_number,
                        itemName: item?.product_name || 'N/A',
                        itemCode: item?.product_code || 'N/A',
                        purchaseValue: product.taxIncl || '0.00',
                        createdDate: createdDate,
                    };
                })
            );

            setAllData(flattened);
            applyDateFilter(flattened); // Apply 3m filter by default
        } catch (err) {
            console.error('Error fetching report:', err.message || err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const applyDateFilter = (data) => {
        let fromDate, toDate = new Date();

        if (selectedRange === "3m") {
            fromDate = new Date();
            fromDate.setMonth(fromDate.getMonth() - 3);
        } else if (selectedRange === "6m") {
            fromDate = new Date();
            fromDate.setMonth(fromDate.getMonth() - 6);
        } else if (selectedRange === "custom") {
            fromDate = fmsData.startDate;
            toDate = fmsData.endDate;
        }

        const filtered = data.filter(entry => {
            const date = new Date(entry.createdDate);
            return (!fromDate || date >= fromDate) && (!toDate || date <= toDate);
        });

        setGridData(filtered);
    };

    const handleGenerateReport = (e) => {
        e.preventDefault();
        if (selectedRange === "custom") {
            if (!fmsData.startDate || !fmsData.endDate) {
                alert("Please select both start and end dates.");
                return;
            }
            if (fmsData.startDate > fmsData.endDate) {
                alert("Start date cannot be after end date.");
                return;
            }
        }
        applyDateFilter(allData);
    };

    const handleReset = () => {
        setSelectedRange("3m");
        setFmsData({ startDate: null, endDate: null });
        setFilter({ logic: "and", filters: [] });
        applyDateFilter(allData);
    };

    return (
        <div className="p-4">
            <div className="mb-3">
                <Button className="btn link-btn text-dark" onClick={() => window.history.back()}>
                    <i className="fas fa-long-arrow-alt-left me-1" /> Back
                </Button>
            </div>

            <form onSubmit={handleGenerateReport}>
                <div className="card">
                    <div className="card-header">
                        <h4 className="card-title">Item-wise Purchase Report</h4>
                    </div>
                    <div className="card-body pb-1">
                        <div className="row">
                            <div className="col-xl-6">
                                <label className="col-form-label">Quick Report <span className="text-exp-red">*</span></label>
                                <div className="d-flex flex-wrap">
                                    {["3m", "6m", "custom"].map((range) => (
                                        <label key={range} className="custom-radio btn-type-radio mb-2 me-3">
                                            <input
                                                type="radio"
                                                name="reportRange"
                                                value={range}
                                                checked={selectedRange === range}
                                                onChange={() => setSelectedRange(range)}
                                            />
                                            <span className="checkmark" />
                                            <span className='text-'>
                                                {range === "3m" ? "3 Months" : range === "6m" ? "6 Months" : "Custom Range"}
                                            </span>
                                        </label>
                                    ))}
                                </div>

                                {selectedRange === "custom" && (
                                    <div className="row">
                                        <div className="col-md-6 col-12">
                                            <div className="form-group">
                                                <label className="col-form-label">From <span className="text-exp-red">*</span></label>
                                                <div className="exp-datepicker-cont">
                                                    <span className="cal-icon"><i className="fas fa-calendar-alt" /></span>
                                                    <DatePicker
                                                        required
                                                        selected={fmsData.startDate}
                                                        onChange={(date) => setFmsData({ ...fmsData, startDate: date })}
                                                        dateFormat="dd/MM/yyyy"
                                                        placeholderText="Select Date"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6 col-12">
                                            <div className="form-group">
                                                <label className="col-form-label">To <span className="text-exp-red">*</span></label>
                                                <div className="exp-datepicker-cont">
                                                    <span className="cal-icon"><i className="fas fa-calendar-alt" /></span>
                                                    <DatePicker
                                                        required
                                                        selected={fmsData.endDate}
                                                        onChange={(date) => setFmsData({ ...fmsData, endDate: date })}
                                                        dateFormat="dd/MM/yyyy"
                                                        placeholderText="Select Date"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="card-footer d-flex justify-content-end">
                        <button type="button" className="btn btn-exp-light me-2" onClick={handleReset}>
                            Reset
                        </button>
                        <button type="submit" className="btn btn-exp-green">
                            Generate Report
                        </button>
                    </div>
                </div>
            </form>

            <div className="card mt-4">
                <div className="card-header bg-primary">
                    <h4 className="card-title">Report Preview</h4>
                </div>
                <div className="card-body p-0 rounded-10 table-responsive mb-0">
                    <Grid
                        data={process(gridData, { filter })}
                        filterable={true}
                        filter={filter}
                        onFilterChange={(e) => setFilter(e.filter)}
                    >
                        <GridColumn
                            field="id"
                            title="#"
                            filterable={false}
                            width="80px"
                            headerStyle={{ minWidth: '80px' }}
                            cellStyle={{ minWidth: '80px' }}
                            headerClassName="fw-bold"
                        />
                        <GridColumn
                            field="referenceNumber"
                            title="Reference #"
                            filterable={true}
                            width="150px"
                            headerStyle={{ minWidth: '150px' }}
                            cellStyle={{ minWidth: '150px' }}
                            headerClassName="fw-bold"
                        />
                        <GridColumn
                            title="Item"
                            field='itemName'
                            width="200px"
                            headerStyle={{ minWidth: '200px' }}
                            cellStyle={{ minWidth: '200px' }}
                            headerClassName="fw-bold"
                            cell={(props) => (
                                <td>
                                    <div>Name: <span className='fw-bold'>{props.dataItem.itemName}</span></div>
                                    <div>Code: <span className='fw-bold'>{props.dataItem.itemCode}</span></div>
                                </td>
                            )}
                        />
                        <GridColumn
                            field="purchaseValue"
                            title="Purchase Value"
                            width="200px"
                            headerStyle={{ minWidth: '200px' }}
                            cellStyle={{ minWidth: '200px' }}
                            headerClassName="fw-bold justify-content-end"
                            cell={(props) => (
                                <td>
                                    <div className='text-end'>₹ <span>{props.dataItem.purchaseValue}</span></div>
                                </td>
                            )}
                        />
                        <GridColumn
                            field="createdDate"
                            title="Created Date"
                            width="200px"
                            headerStyle={{ minWidth: '200px' }}
                            cellStyle={{ minWidth: '200px' }}
                            headerClassName="fw-bold"
                            cell={(props) => (
                                <td>
                                    <span>{new Date(props.dataItem.createdDate).toLocaleDateString()}</span>
                                </td>
                            )}
                        />
                    </Grid>
                </div>
            </div>
        </div>
    );
}

export default ItemWisePurchaseReport;
