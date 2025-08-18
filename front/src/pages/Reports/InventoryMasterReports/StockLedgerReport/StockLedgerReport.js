import React, { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { process } from '@progress/kendo-data-query';
import { Button } from '@mui/material';
import StockGraph from './StockGraph';

function StockLedgerReport() {
    const [selectedRange, setSelectedRange] = useState("3m");
    const [fmsData, setFmsData] = useState({
        startDate: null,
        endDate: null
    });

    const [filter, setFilter] = useState({
        logic: "and",
        filters: []
    });

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
        console.log("Selected Range:", selectedRange);
        console.log("Date Range:", fmsData);
    };

    const handleReset = () => {
        setSelectedRange("3m");
        setFmsData({
            startDate: null,
            endDate: null
        });
        setFilter({
            logic: "and",
            filters: []
        });
    };

    const data = [
        {
            id: 1,
            name: 'Samsung TV',
            code: '1234',
            location: 'Location 1',
            purchaseValue: 100,
            saleValue: 150
        }
    ];

    return (
        <div className='p-4'>
            <div className='mb-3'>
                <Button className="btn link-btn text-dark"
                    onClick={() => window.history.back()}
                >
                    <i className="fas fa-long-arrow-alt-left me-1" />
                    Back
                </Button>
            </div>

            <form onSubmit={handleGenerateReport}>
                <div className='card'>
                    <div className='card-header'>
                        <h4 className='card-title'>Stock Ledger Report</h4>
                    </div>
                    <div className='card-body pb-1'>
                        <div className='row'>
                            <div className='col-xl-6'>
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
                                                {range === "3m" ? "3 Months" :
                                                    range === "6m" ? "6 Months" : "Custom Range"}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                {selectedRange === "custom" && (
                                    <div className='row'>
                                        <div className='col-md-6 col-12'>
                                            <div className='form-group'>
                                                <label className='col-form-label'>From <span className='text-exp-red'>*</span></label>
                                                <div className="exp-datepicker-cont">
                                                    <span className="cal-icon"><i className="fas fa-calendar-alt" /></span>
                                                    <DatePicker
                                                        required
                                                        selected={fmsData.startDate}
                                                        onChange={(date) => setFmsData({ ...fmsData, startDate: date })}
                                                        dateFormat="dd/MM/yyyy"
                                                        placeholderText='Select Date'
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className='col-md-6 col-12'>
                                            <div className='form-group'>
                                                <label className='col-form-label'>To <span className='text-exp-red'>*</span></label>
                                                <div className="exp-datepicker-cont">
                                                    <span className="cal-icon"><i className="fas fa-calendar-alt" /></span>
                                                    <DatePicker
                                                        required
                                                        selected={fmsData.endDate}
                                                        onChange={(date) => setFmsData({ ...fmsData, endDate: date })}
                                                        dateFormat="dd/MM/yyyy"
                                                        placeholderText='Select Date'
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
                        <button
                            type="button"
                            name="reset_button"
                            className="btn btn-exp-light me-2"
                            onClick={handleReset}
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            name="submit_button"
                            className="btn btn-exp-green"
                        >
                            Generate Report
                        </button>
                    </div>
                </div>
            </form>

            <div className='card mt-4'>
                <div className='card-header bg-primary'>
                    <h4 className='card-title'>Report Preview</h4>
                </div>
                <div className='card-body p-0 rounded-10'>
                    <div className='row g-4'>
                        <div className='col-lg-12'>
                            <StockGraph />
                        </div>
                        <div className='col-lg-12'>
                            <div className='table-responsive mb-0'>
                                <Grid
                                    data={process(data, { filter })}
                                    filterable={true}
                                    filter={filter}
                                    onFilterChange={(e) => setFilter(e.filter)}
                                    style={{ width: '100%', minWidth: '800px' }}
                                >
                                    <GridColumn
                                        field="id"
                                        title="#"
                                        width="80px"
                                        filterable={false}
                                        headerStyle={{ minWidth: '80px' }}
                                        cellStyle={{ minWidth: '80px' }}
                                        headerClassName="fw-bold"
                                    />
                                    <GridColumn
                                        title="Item"
                                        filterable={true}
                                        cell={(props) => (
                                            <td style={{ minWidth: '200px' }}>
                                                <div>Name: <span className='fw-bold'>{props.dataItem.name}</span></div>
                                                <div>Code: <span className='fw-bold'>{props.dataItem.code}</span></div>
                                            </td>
                                        )}
                                        headerStyle={{ minWidth: '200px' }}
                                        cellStyle={{ minWidth: '200px' }}
                                        headerClassName="fw-bold"
                                    />
                                    <GridColumn
                                        field="location"
                                        title="Location"
                                        width="150px"
                                        headerStyle={{ minWidth: '150px' }}
                                        cellStyle={{ minWidth: '150px' }}
                                        headerClassName="fw-bold"
                                    />
                                    <GridColumn
                                        field="purchaseValue"
                                        title="Purchase Value"
                                        width="150px"
                                        headerStyle={{ minWidth: '150px' }}
                                        cellStyle={{ minWidth: '150px' }}
                                        headerClassName="fw-bold"
                                    />
                                    <GridColumn
                                        field="saleValue"
                                        title="Sale Value"
                                        width="150px"
                                        headerStyle={{ minWidth: '150px' }}
                                        cellStyle={{ minWidth: '150px' }}
                                        headerClassName="fw-bold"
                                    />
                                </Grid>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}

export default StockLedgerReport;