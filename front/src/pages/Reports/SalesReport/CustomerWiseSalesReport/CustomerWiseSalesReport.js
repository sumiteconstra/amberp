import React, { useEffect, useState } from 'react';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { process } from '@progress/kendo-data-query';
import { Button } from '@mui/material';
import Select from 'react-select';
import { PrivateAxios } from '../../../../environment/AxiosInstance';

function CustomerWiseSalesReport() {
    const [data, setData] = useState([]);
    const [filter, setFilter] = useState(null);
    const [selectedMonths, setSelectedMonths] = useState([]);

    useEffect(() => {
        fetchCustomerWiseSalesReport([]);
    }, []);

    const fetchCustomerWiseSalesReport = async (months = []) => {
        try {
            const res = await PrivateAxios.get('sales/dispatch/allworkorderdispatchfor_report');
            const apiData = res.data;

            const selectedMonthValues = months.map(m => m.value); // e.g., ["2024-05"]

            const filteredData = selectedMonthValues.length > 0
                ? apiData.filter(item => {
                    const createdAt = new Date(item.created_at || item.createdAt);
                    const itemMonth = `${createdAt.getFullYear()}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}`;
                    return selectedMonthValues.includes(itemMonth);
                })
                : apiData;

            const grouped = {};
            filteredData.forEach(item => {
                const customerName = item.purchase?.customer?.name || "Unknown Customer";
                if (!grouped[customerName]) {
                    grouped[customerName] = {
                        customerName,
                        demandProduct: 0,
                        productValue: 0,
                    };
                }
                grouped[customerName].demandProduct += parseFloat(item.qty) || 0;
                grouped[customerName].productValue += parseFloat(item.taxIncl) || 0;
            });

            const formatted = Object.values(grouped).map((item, index) => ({
                id: index + 1,
                customerName: item.customerName,
                demandProduct: item.demandProduct,
                productValue: '₹'+item.productValue.toFixed(2),
            }));

            setData(formatted);
        } catch (err) {
            console.error("Error fetching report:", err);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchCustomerWiseSalesReport(selectedMonths);
    };

    const handleReset = () => {
        setSelectedMonths([]);
        fetchCustomerWiseSalesReport([]);
    };

    const monthOptions = Array.from({ length: 12 }).map((_, index) => {
        const date = new Date();
        date.setMonth(date.getMonth() - index);
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        return {
            value: `${year}-${(date.getMonth() + 1).toString().padStart(2, '0')}`,
            label: `${month} ${year}`
        };
    });

    return (
        <div className='p-4'>
            <div className='mb-3'>
                <Button className="btn link-btn text-dark" onClick={() => window.history.back()}>
                    <i className="fas fa-long-arrow-alt-left me-1" /> Back
                </Button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className='card'>
                    <div className='card-header d-flex justify-content-between align-items-center'>
                        <h4 className='card-title mb-0'>Customer Wise Sales Report</h4>
               
                    </div>
                    <div className='card-body pb-1'>
                        <div className='row align-items-end'>
                            <div className='col-xl-6'>
                                <div className='form-group'>
                                    <label className="col-form-label">Select Month <span className="text-exp-red">*</span></label>
                                    <div className="custom-select-wrap">
                                        <Select
                                            isMulti
                                            options={monthOptions}
                                            value={selectedMonths}
                                            onChange={setSelectedMonths}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-6">
                                <div className='form-group d-flex gap-2'>
                                    <button type="submit" className="btn btn-exp-green">Generate Report</button>
                                    <button type="button" className="btn btn-exp-light" onClick={handleReset}>Reset</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            <div className='card mt-4'>
                <div className='card-header bg-primary text-white'>
                    <h4 className='card-title mb-0'>Report Preview</h4>
                </div>
                <div className='card-body p-0 rounded-10'>
                    <div className='table-responsive mb-0'>
                        <Grid
                            data={process(data, { filter })}
                            filterable={true}
                            filter={filter}
                            onFilterChange={(e) => setFilter(e.filter)}
                            style={{ width: '100%', minWidth: '800px' }}
                        >
                            <GridColumn field="id" title="#" width="80px" filterable={false} />
                            <GridColumn field="customerName" title="Customer Name" />
                            <GridColumn field="demandProduct" title="Demanded Product" />
                            <GridColumn field="productValue" title="Product Value" />
                        </Grid>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CustomerWiseSalesReport;
