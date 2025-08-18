import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import { PrivateAxios } from '../environment/AxiosInstance';

const CustomLineChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch data from the API
    const fetchData = async () => {
      try {
        const response = await PrivateAxios.get('purchase/getperyrwise');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Helper function to format date
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
        margin={{
          top: 20, right: 30, left: 20, bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="created_at" 
          tickFormatter={formatDate} // Format the dates
        />
        <YAxis />
        <Tooltip 
          formatter={(value) => value.toFixed(2)} // Format tooltip values
        />
        <Legend />
        <Line type="monotone" dataKey="total_amount" stroke="#ff7300" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CustomLineChart;
