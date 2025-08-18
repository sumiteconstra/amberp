import React, { useEffect, useRef, useState } from 'react';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { process } from '@progress/kendo-data-query';
import { Button } from '@mui/material';
import { PDFExport } from '@progress/kendo-react-pdf';
import Select from 'react-select';
import moment from 'moment';
import { Line } from 'react-chartjs-2';
import {
  CategoryScale,
  Chart as ChartJS,
  LineElement,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
} from 'chart.js';
import { PrivateAxios } from '../../../../environment/AxiosInstance';

ChartJS.register(CategoryScale, LineElement, LinearScale, PointElement, Legend, Tooltip);

function ItemWiseSalesReport() {
  const [originalData, setOriginalData] = useState([]); // store full fetched data
  const [reportData, setReportData] = useState([]);
  const [filter, setFilter] = useState({ logic: 'and', filters: [] });
  const [chartData, setChartData] = useState(null);
  const [monthOptions, setMonthOptions] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState([]); // store selected months from react-select
  const pdfExportComponent = useRef(null);

  const generateColor = () => {
    const colors = {};
    return (key) => {
      if (!colors[key]) {
        colors[key] = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
      }
      return colors[key];
    };
  };
  const getColor = generateColor();
const colorCache = new Map();

const getPersistentColor = (key) => {
  if (!colorCache.has(key)) {
    const newColor = `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')}`;
    colorCache.set(key, newColor);
  }
  return colorCache.get(key);
};
  const fetchData = async () => {
    try {
      const res = await PrivateAxios.get('/sales/dispatch/allworkorderdispatchfor_report');
      const salesData = res?.data || [];
      setOriginalData(salesData); // keep full data

      // Prepare month options for filter dropdown
      const labelsSet = new Set();
      salesData.forEach((item) => {
        const month = moment(item.created_at).format('YYYY-MM');
        labelsSet.add(month);
      });
      const labels = Array.from(labelsSet).sort();
      setMonthOptions(labels.map((m) => ({ label: m, value: m })));

      // Initially show all data
      generateReport(salesData);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  // Generate report (table + chart) from raw sales data filtered by selected months
  const generateReport = (salesData) => {
    const summary = {};
    const labelsSet = new Set();

    salesData.forEach((item) => {
      const category = item.ProductsItem?.Categories?.title || 'Uncategorized';
      const productName = item.ProductsItem?.product_name || 'Unknown';
      const productCode = item.ProductsItem?.product_code || '-';
      const month = moment(item.created_at).format('YYYY-MM');
      const amount = parseFloat(item.taxIncl) || 0;
      const qty = parseFloat(item.qty) || 0;

      const key = `${category}-${productName}-${productCode}`;
      labelsSet.add(month);

      if (!summary[key]) {
        summary[key] = {
          meta: { category, name: productName, code: productCode },
          months: {},
        };
      }

      if (!summary[key].months[month]) {
        summary[key].months[month] = { totalAmount: 0, totalQty: 0 };
      }

      summary[key].months[month].totalAmount += amount;
      summary[key].months[month].totalQty += qty;
    });

    // Flatten summary for table
    const flattened = [];
    Object.values(summary).forEach(({ meta, months }) => {
      Object.entries(months).forEach(([month, stats]) => {
        flattened.push({
          ...meta,
          month,
          totalQty: stats.totalQty,
          totalAmount: stats.totalAmount,
        });
      });
    });

    setReportData(flattened);

    // Chart data
    const labels = Array.from(labelsSet).sort();

 const datasets = Object.entries(summary).map(([key, { meta, months }]) => ({
  label: `${meta.category} - ${meta.name}`,
  data: labels.map((month) => months[month]?.totalAmount || 0),
  borderColor: getPersistentColor(key),
  backgroundColor: getPersistentColor(key),
  tension: 0.3,
  fill: false,
}));

    setChartData({ labels, datasets });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handler for Generate Report button: filter originalData by selectedMonths and regenerate report
  const handleGenerateReport = () => {
    if (selectedMonths.length === 0) {
      // no filter: show all data
      generateReport(originalData);
    } else {
      const filteredData = originalData.filter((item) => {
        const itemMonth = moment(item.created_at).format('YYYY-MM');
        return selectedMonths.includes(itemMonth);
      });
      generateReport(filteredData);
    }
  };

//   const handleExportPDF = () => {
//     if (pdfExportComponent.current) {
//       pdfExportComponent.current.save();
//     }
//   };

  return (
    <div className="p-4">
      <div className="mb-3">
        <Button className="btn link-btn text-dark" onClick={() => window.history.back()}>
          <i className="fas fa-long-arrow-alt-left me-1" /> Back
        </Button>
      </div>

      <form>
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Item Wise Sales Report</h4>
          </div>
          <div className="card-body pb-1">
            <div className="row align-items-end">
              <div className="col-xl-6">
                <div className="form-group">
                  <label className="col-form-label">
                    Select Month <span className="text-exp-red">*</span>
                  </label>
                  <div className="custom-select-wrap">
                    <Select
                      isMulti
                      options={monthOptions}
                      placeholder="Select Month(s)"
                      onChange={(selected) => {
                        const months = selected ? selected.map((s) => s.value) : [];
                        setSelectedMonths(months);
                      }}
                    />
                  </div>
                </div>
                {/* <div className="mb-3">
                  <Button variant="contained" color="primary" onClick={handleExportPDF}>
                    Export to PDF
                  </Button>
                </div> */}
              </div>
              <div className="col-xl-6">
                <div className="form-group d-flex gap-2">
                  <button type="button" className="btn btn-exp-green" onClick={handleGenerateReport}>
                    Generate Report
                  </button>
                  <button
                    type="button"
                    className="btn btn-exp-light"
                    onClick={() => {
                      setSelectedMonths([]);
                      generateReport(originalData);
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      <div className="card mt-4">
        <div className="card-header bg-primary">
          <h4 className="card-title">Report Preview</h4>
        </div>
        <div className="card-body p-0 rounded-10">
          <div className="row g-4">
            <div className="col-lg-12">
              {chartData && (
               <div style={{ height: '400px' }}>
            <Line
                data={chartData}
                options={{
                responsive: true,
                maintainAspectRatio: false, // allow custom height
                plugins: {
                    legend: { position: 'top' },
                    tooltip: { mode: 'index', intersect: false },
                },
                scales: {
                    x: { title: { display: true, text: 'Month' } },
                    y: { title: { display: true, text: 'Sales Amount (₹)' } },
                },
                }}
            />
            </div>
              )}
            </div>

            <div className="col-lg-12">
              <div className="table-responsive mb-0">
                <PDFExport ref={pdfExportComponent} paperSize="A4">
                  <Grid
                    data={process(reportData, { filter })}
                    filterable={true}
                    filter={filter}
                    onFilterChange={(e) => setFilter(e.filter)}
                    style={{ width: '100%', minWidth: '800px' }}
                  >
                    <GridColumn
                      title="Item"
                      field="name"
                      filterable={true}
                      cell={(props) => (
                        <td style={{ minWidth: '200px' }}>
                          <div>
                            Name: <span className="fw-bold">{props.dataItem.name}</span>
                          </div>
                          <div>
                            Code: <span className="fw-bold">{props.dataItem.code}</span>
                          </div>
                        </td>
                      )}
                      headerStyle={{ minWidth: '200px' }}
                      cellStyle={{ minWidth: '200px' }}
                    />
                    <GridColumn field="category" title="Category" width="200px" />
                    <GridColumn field="month" title="Month" width="150px" />
                    <GridColumn field="totalQty" title="Total Qty" width="150px" />
                    <GridColumn
                      field="totalAmount"
                      title="Total Amount"
                      width="150px"
                      cell={(props) => <td>₹{props.dataItem.totalAmount.toFixed(2)}</td>}
                    />
                  </Grid>
                </PDFExport>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemWiseSalesReport;
