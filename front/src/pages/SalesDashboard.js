import React, { useContext, useEffect, useState } from 'react'

import { OverlayTrigger, Popover, Tab, Tabs, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { FaDownload, FaShoppingCart, FaUsers, FaChartPie } from 'react-icons/fa';
import './Dashboard.css';
import RevenueChart from './RevenueChart';
import SegmentsChart from './SegmentsChart';
import CustomBarChart from './VendorChart';

import { PrivateAxios } from '../environment/AxiosInstance';
import CustomTable from './VendorMis';
import CustomLineChart from './CustomLineChart';
// import { UserContext } from '../routes/ProtectedRoute';
ChartJS.register(ArcElement, Legend);
//data workflow


const Dashboard = () => {
  const [totalCountreject, setTotalCount] = useState(0);
  const [totalCountdone, setTotaldoneCount] = useState(0);
  const [totalUserscount, setTotalUsers] = useState(0);
  const [totalUserscountrfq, setTotalrfq] = useState(0);
  const [error, setError] = useState(null);
  const fetchData = async () => {
    try {
      const response = await PrivateAxios.get('sales/reject_count'); // Adjust URL to your API endpoint
      setTotalCount(response.data.totalCount);

    } catch (error) {
      setError(error.message);
    }
  };
  const fetchDatadone = async () => {
    try {
      const response = await PrivateAxios.get('sales/done_count'); // Adjust URL to your API endpoint

      setTotaldoneCount(response.data.totalCountdone);

    } catch (error) {
      setError(error.message);
    }
  };
  //total user count
  const totalUsers = async () => {
    try {
      const response = await PrivateAxios.get('sales/allusercount'); // Adjust URL to your API endpoint

      setTotalUsers(response.data.totalCountuser);

    } catch (error) {
      setError(error.message);
    }
  };

  //total rfq count
  const totalrfq = async () => {
    try {
      const response = await PrivateAxios.get('sales/rfq_count'); // Adjust URL to your API endpoint

      setTotalrfq(response.data.totalCountrfq);

    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    totalrfq();
    totalUsers();
    fetchDatadone();
    fetchData();
  }, []);


  return (
    <div className="container-fluid">
      <div className="row">

        {/* Main content */}
        <main className="col-md-12 ms-sm-auto col-lg-12 px-md-4">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">

          </div>

          <div className="row">
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <div className="card warning-gredient mb-3">
                <div className="card-body">
                  <div className="card-title fs-4">{totalCountreject} Rejected</div>
                  <div className="card-text"><FaDownload /> +3% from last month</div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <div className="card danger-gredient mb-3">
                <div className="card-body">
                  <div className="card-title fs-4">{totalCountdone} PO Uploaded</div>
                  <div className="card-text"><FaShoppingCart /> +4% from last month</div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <div className="card success-gredient mb-3">
                <div className="card-body">
                  <div className="card-title fs-4">{totalUserscount} Customers</div>
                  <div className="card-text"><FaUsers /> +3% from last month</div>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12">
              <div className="card info-gredient mb-3">
                <div className="card-body">
                  <div className="card-title fs-4">{totalUserscountrfq} Quotations</div>
                  <div className="card-text"><FaChartPie /> -2% from last month</div>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-xl-8 col-lg-6 col-md-12">
              <div className="card mb-4 shadow-sm">
                <div className="card-header ">
                  <h5 className='card-title'>Vendor Performance</h5>
                </div>
                <div className="card-body card-body-height-dashboard">
                  <CustomBarChart />
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-lg-6 col-md-12">
              <div className="card mb-4 shadow-sm">
                <div className="card-header ">
                  <h5 className='card-title'>Status</h5>
                </div>
                <div className="card-body card-body-height-dashboard">
                  <SegmentsChart />
                </div>
              </div>
            </div>
          
            <div className="col-xl-6 col-lg-6 col-md-12">
              <div className="card mb-4 shadow-sm">
                <div className="card-header ">
                  <h5 className='card-title'>Yearly Sale</h5>
                </div>
                <div className="card-body card-body-height-dashboard">
                  <CustomLineChart />
                </div>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6 col-md-12">
              <div className="card mb-4 shadow-sm">
                <div className="card-header ">
                  <h5 className='card-title'>Revenue</h5>
                </div>
                <div className="card-body card-body-height-dashboard">
                  <RevenueChart />
                </div>
              </div>
            </div>
          </div>
          {/* <div className="row">
            <div className="col-12">
            <div className="card mb-4 shadow-sm">
            <div className="card-header bg-primary text-white">
            Vendor Report
            </div>
            <div className="card-body">
            <CustomTable />
                </div></div>
            </div>
          </div> */}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;