import React, { useState, useEffect, PureComponent } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { process } from '@progress/kendo-data-query';
import { Button } from '@mui/material';
import { PrivateAxios } from '../../../../environment/AxiosInstance';

// ----- Graph Components -----
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Custom Label for graph points
class CustomizedLabel extends PureComponent {
  render() {
    const { x, y, stroke, value } = this.props;
    return (
      <text x={x} y={y} dy={-8} fill={stroke} fontSize={10} textAnchor="middle">
        ₹{value.toLocaleString('en-IN')}
      </text>
    );
  }
}

// Custom X-Axis tick with rotation
class CustomizedAxisTick extends PureComponent {
  render() {
    const { x, y, payload } = this.props;
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-35)">
          {payload.value}
        </text>
      </g>
    );
  }
}

// Tooltip formatter for INR
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #ccc',
        padding: 10,
        fontSize: 12,
      }}>
        <p><strong>{label}</strong></p>
        {payload.map((pld) => (
          <p key={pld.dataKey} style={{ color: pld.color, margin: 0 }}>
            {pld.name}: ₹{pld.value.toLocaleString('en-IN')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Graph Component that receives data as props
const MonthWisePurchaseValueGraph = ({ data }) => (
  <div style={{ width: '100%', height: '350px' }}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 40, right: 40, left: 10, bottom: 30 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={<CustomizedAxisTick />} />
        <YAxis
          yAxisId="left"
          tickFormatter={(val) => `₹${val.toLocaleString('en-IN')}`}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={(val) => `₹${val.toLocaleString('en-IN')}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="rfqCount"
          stroke="#03a03f"
          name="No of RFQs"
          yAxisId="left"
          label={<CustomizedLabel />}
          activeDot={{ r: 8 }}
        />
        <Line
          type="monotone"
          dataKey="rfqTotalAmount"
          stroke="#1c13ca"
          name="RFQ Amount (₹)"
          yAxisId="right"
          label={<CustomizedLabel />}
          activeDot={{ r: 8 }}
        />
        <Line
          type="monotone"
          dataKey="purchaseCount"
          stroke="#f39c12"
          name="Purchase Done Count"
          yAxisId="left"
          label={<CustomizedLabel />}
          activeDot={{ r: 8 }}
        />
        <Line
          type="monotone"
          dataKey="purchaseTotalAmount"
          stroke="#c0392b"
          name="Purchase Done Amount (₹)"
          yAxisId="right"
          label={<CustomizedLabel />}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);


// ----- Main Component -----
function MonthWisePurchaseValue() {
  const [selectedRange, setSelectedRange] = useState("3m");
  const [fmsData, setFmsData] = useState({ startDate: null, endDate: null });
  const [filter, setFilter] = useState({ logic: "and", filters: [] });
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper: Frontend filter in case backend doesn't filter by dates
  const filterByDateRange = (dataArray, startDate, endDate) => {
    if (!startDate || !endDate) return dataArray;

    return dataArray.filter(item => {
      // Assuming item.month is YYYY-MM string, create Date from first day of month
      const itemDate = new Date(item.month + '-01');
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  // Fetch report data from API
  const fetchReportData = async (startDate, endDate) => {
    setLoading(true);
    try {
      const params = {};
      if (startDate && endDate) {
        params.startDate = startDate.toISOString();
        params.endDate = endDate.toISOString();
      }
      console.log('Fetching data with params:', params);

      const res = await PrivateAxios.get('purchase/monthly-report', { params });
      console.log('Response:', res.data);

      const dataArray = Array.isArray(res.data)
        ? res.data
        : res.data.result || res.data.data || [];

      // Frontend filter fallback (in case backend ignores dates)
      const filteredData = filterByDateRange(dataArray, startDate, endDate);
      console.log('Filtered data:', filteredData);

      const formattedData = filteredData.map((item, index) => ({
        id: index + 1,
        month: item.month,
        rfqCount: item.rfqCount || 0,
        rfqTotalAmount: parseFloat(item.rfqTotalAmount || 0),
        purchaseCount: item.purchaseCount || 0,
        purchaseTotalAmount: parseFloat(item.purchaseTotalAmount || 0),
      }));

      console.log('Formatted data:', formattedData);

      setReportData(formattedData);
    } catch (error) {
      console.error("Error fetching purchase done count:", error);
      setReportData([]);
    }
    setLoading(false);
  };

  // Generate report on form submit
  const handleGenerateReport = (e) => {
    if (e) e.preventDefault();

    if (selectedRange === "custom") {
      if (!fmsData.startDate || !fmsData.endDate) {
        alert("Please select both start and end dates.");
        return;
      }
      if (fmsData.startDate > fmsData.endDate) {
        alert("Start date cannot be after end date.");
        return;
      }
      fetchReportData(fmsData.startDate, fmsData.endDate);
    } else {
      const now = new Date();
      let start = new Date();
      if (selectedRange === "3m") {
        start.setMonth(now.getMonth() - 3);
      } else if (selectedRange === "6m") {
        start.setMonth(now.getMonth() - 6);
      }
      fetchReportData(start, now);
    }
  };

  const handleReset = () => {
    setSelectedRange("3m");
    setFmsData({ startDate: null, endDate: null });
    setFilter({ logic: "and", filters: [] });
    setReportData([]);
    // Fetch default data for last 3 months again
    handleGenerateReport();
  };

  // Fetch default data on mount for last 3 months
  useEffect(() => {
    handleGenerateReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get last two months data for top right cards
  const lastTwoMonthsData = reportData.slice(-2);

  return (
    <>
      <div className='p-4'>
        <div className='mb-3'>
          <Button
            className="btn link-btn text-dark"
            onClick={() => window.history.back()}
          >
            <i className="fas fa-long-arrow-alt-left me-1" />
            Back
          </Button>
        </div>

        <div className='row'>
          <div className='col-lg-6'>
            <form onSubmit={handleGenerateReport}>
              <div className='card'>
                <div className='card-header'>
                  <h4 className='card-title'>Month Wise Purchase Value</h4>
                </div>
                <div className='card-body pb-1'>
                  <div className='row'>
                    <div className='col-xl-12'>
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
                            <span className='text-'>{range === "3m" ? "3 Months" : range === "6m" ? "6 Months" : "Custom Range"}</span>
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
                            onChange={date => setFmsData({ ...fmsData, startDate: date })}
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
                            onChange={date => setFmsData({ ...fmsData, endDate: date })}
                                 
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
                    className="btn btn-exp-green"  disabled={loading}
                  >
                    {loading ? "Loading..." : "Generate Report"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className='col-lg-6'>
            <div className='row'>
              {lastTwoMonthsData.length > 0 ? lastTwoMonthsData.map((item, idx) => (
                <div className='col-md-6' key={idx}>
                  <div className={`month_card_view rounded-10 mb-3 p-3 shadow ${
                    idx === 0 ? 'month_po' : 'month_inv'
                  }`}>
                    <span className='badge badge-secondary mb-3'>{item.month}</span>
                    <p className='mb-1'>No. of RFQ</p>
                    <h6 className='mb-3 fs-5 fw-bold'>{item.rfqCount}</h6>
                    <p className='mb-1'>RFQ Value</p>
                    <h6 className='mb-0 fs-5 fw-bold'>₹ {item.rfqTotalAmount.toLocaleString('en-IN')}</h6>
                    <div className='icon__card'>
                      {/* You can add your SVG icon here if you want */}
                    </div>
                    <hr />
                    <p className='mb-1'>Purchase Done Count</p>
                    <h6 className='mb-3 fs-5 fw-bold'>{item.purchaseCount}</h6>
                    <p className='mb-1'>Purchase Done Value</p>
                    <h6 className='mb-0 fs-5 fw-bold'>₹ {item.purchaseTotalAmount.toLocaleString('en-IN')}</h6>
                  </div>
                </div>
              )) : (
                <p>No recent months data available.</p>
              )}
            </div>
          </div>
        </div>

        <div className='card mt-2'>
          <div className='card-header bg-primary'>
            <h4 className='card-title'>Report Preview</h4>
          </div>
          <div className='card-body p-0 rounded-10'>
            <div className='row g-4'>
              <div className='col-lg-12'>
                <MonthWisePurchaseValueGraph data={reportData} />
              </div>
              <div className='col-lg-12'>
                <div className='table-responsive mb-0'>
                  <Grid
            style={{ height: 'auto' }}
            data={process(reportData, filter)}
            filterable={true}
            filter={filter}
            onFilterChange={e => setFilter(e.filter)}
            sortable={true}
          >
            <GridColumn field="month" title="Month" filterable={true} />
            <GridColumn field="rfqCount" title="No of RFQs" />
            <GridColumn field="rfqTotalAmount" title="RFQ Amount (₹)" />
            <GridColumn field="purchaseCount" title="Purchase Done Count" />
            <GridColumn field="purchaseTotalAmount" title="Purchase Done Amount (₹)" />
          </Grid>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MonthWisePurchaseValue;
