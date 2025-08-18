// ✅ React Component: PendingPOReport
import React, { useState, useEffect } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { process } from '@progress/kendo-data-query';
import { Button } from '@mui/material';
import { subMonths } from 'date-fns';
import { PrivateAxios } from '../../../../environment/AxiosInstance';

function PendingPOReport() {
    const [selectedRange, setSelectedRange] = useState("3m");
    const [fmsData, setFmsData] = useState({ startDate: null, endDate: null });
    const [filter, setFilter] = useState({ logic: "and", filters: [] });
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const today = new Date();
        const threeMonthsAgo = subMonths(today, 3);
        setFmsData({ startDate: threeMonthsAgo, endDate: today });
        fetchReportData(threeMonthsAgo, today);
    }, []);

    const fetchReportData = async (startDate, endDate) => {
        try {
            setLoading(true);
            const response = await PrivateAxios.get('purchase/status-9', {
                params: {
                    start_date: startDate.toISOString(),
                    end_date: endDate.toISOString(),
                }
            });
            const fetchedData = response.data?.data || [];

            const formatted = fetchedData.map((item, index) => ({
                id: index + 1,
                poNumber: item.reference_number || 'N/A',
                vendorName: item.vendor_name || 'N/A',
                item: item.product_name || item.item_name || 'N/A',
                qty: item.qty || 0,
                poAmount: item.taxIncl || item.total_amount || 0,
            }));

            setReportData(formatted);
        } catch (error) {
            console.error("Failed to fetch report data:", error);
            alert("Failed to fetch data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReport = (e) => {
        e.preventDefault();
        let startDate, endDate;
        const today = new Date();

        if (selectedRange === "custom") {
            if (!fmsData.startDate || !fmsData.endDate || fmsData.startDate > fmsData.endDate) {
                alert("Please provide a valid custom date range.");
                return;
            }
            startDate = fmsData.startDate;
            endDate = fmsData.endDate;
        } else {
            const months = selectedRange === "3m" ? 3 : 6;
            startDate = subMonths(today, months);
            endDate = today;
            setFmsData({ startDate, endDate });
        }

        fetchReportData(startDate, endDate);
    };

    const handleReset = () => {
        const today = new Date();
        const threeMonthsAgo = subMonths(today, 3);
        setSelectedRange("3m");
        setFmsData({ startDate: threeMonthsAgo, endDate: today });
        setFilter({ logic: "and", filters: [] });
        fetchReportData(threeMonthsAgo, today);
    };

    return (
        <div className="p-4">
            <div className="mb-3">
                <Button className="btn link-btn text-dark" onClick={() => window.history.back()}>
                    <i className="fas fa-long-arrow-alt-left me-1" />
                    Back
                </Button>
            </div>
            <form onSubmit={handleGenerateReport}>
                <div className="card">
                    <div className="card-header">
                        <h4 className="card-title">Pending PO Report</h4>
                    </div>
                    <div className="card-body pb-1">
                        <div className="row">
                            <div className="col-xl-6">
                                <label className="col-form-label">Quick Report <span className="text-exp-red">*</span></label>
                                <div className='form-group'>
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
                                            <div className="col-md-6 col-12">
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
                                    )}
                                </div>
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
                <div className="card-body p-0 table-responsive">
                    {loading ? (
                        <div className="p-4 text-center">Loading report data...</div>
                    ) : (
                        <Grid
                            data={process(reportData, { filter })}
                            filterable={true}
                            filter={filter}
                            onFilterChange={(e) => setFilter(e.filter)}
                        >
                            <GridColumn field="id" title="#" width="80px" />
                            <GridColumn field="poNumber" title="Reference Number" width="200px" />
                            <GridColumn field="vendorName" title="Vendor Name" width="200px" />
                            <GridColumn field="item" title="Item" width="200px" />
                            <GridColumn field="qty" title="Qty" width="100px" />
                            <GridColumn field="poAmount" title="P.O. Amount" width="150px"
                                cell={(props) => (
                                    <td className="text-end">₹ {props.dataItem.poAmount}</td>
                                )}
                            />
                        </Grid>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PendingPOReport;
