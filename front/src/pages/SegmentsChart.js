// src/SegmentsChart.js
import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { PrivateAxios } from '../environment/AxiosInstance';

ChartJS.register(ArcElement, Tooltip, Legend);

const SegmentsChart = () => {
  const [totalUserscountrfq, setTotalrfq] = useState(0);
  const [totalUserscountapp, setTotalapp] = useState(0);
  const [totalUserscountconf, setTotalconfi] = useState(0);
  const [totalUserscountconfBill, setTotalconfiBill] = useState(0);
  const [totalUserscountconfBilldone, setTotalconfiBilldone] = useState(0);
  
  const [error, setError] = useState(null);
 
  //total rfq count
  const totalrfq = async () => {
    try {
      const response = await PrivateAxios.get('purchase/rfq_count'); // Adjust URL to your API endpoint
    
      setTotalrfq(response.data.totalCountrfq);
      
    } catch (error) {
      setError(error.message);
    } 
  };

  const totalapp = async () => {
    try {
      const totalCountapp = await PrivateAxios.get('purchase/appro'); // Adjust URL to your API endpoint
    
      setTotalapp(totalCountapp.data.totalCountapp);
      
    } catch (error) {
      setError(error.message);
    } 
  };
  const totalconf = async () => {
    try {
      const totalCountocon = await PrivateAxios.get('purchase/approcon'); // Adjust URL to your API endpoint
      setTotalconfi(totalCountocon.data.totalCountocon);
      
    } catch (error) {
      setError(error.message);
    } 
  };

  // bill created
  const totalBillcreated = async () => {
    try {
      const totalbill = await PrivateAxios.get('purchase/apprbillcre'); // Adjust URL to your API endpoint
      setTotalconfiBill(totalbill.data.totalCountbill);
      
    } catch (error) {
      setError(error.message);
    } 
  };
  // done created
  const totalBilldone = async () => {
    try {
      const totalbilldone = await PrivateAxios.get('purchase/done_count'); // Adjust URL to your API endpoint
      setTotalconfiBilldone(totalbilldone.data.totalCountdone);
      
    } catch (error) {
      setError(error.message);
    } 
  };

  useEffect(() => {
    totalBilldone();
    totalBillcreated();
    totalconf();
    totalapp();
    totalrfq();
    
  }, []); 
  const data = {
    labels: ['RFQ', ' Approve Quotation',  'Order Confirmed', 'Bill Created','Done Purchase'],
    datasets: [
      {
        data: [totalUserscountrfq, totalUserscountapp, totalUserscountconf, totalUserscountconfBill,totalUserscountconfBilldone],
        backgroundColor:  ['#e04040', '#68adde', '#ec8123', '#328e99', '#3ebc3e'],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Status',
      },
    },
  };

  return <Pie data={data} options={options} />;
};

export default SegmentsChart;
