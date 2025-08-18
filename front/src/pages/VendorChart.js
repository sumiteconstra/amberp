import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import axios from 'axios';
import { PrivateAxios } from '../environment/AxiosInstance';

const CustomBarChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await PrivateAxios.get('purchase/vendordonecount');
        const vendorData = response.data.vendorStatus7Count
          .map((item) => ({
            name: item.vendor.vendor_name,
            value: item.count,
          }))
          .sort((a, b) => b.value - a.value);
        setData(vendorData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Custom color array (you can modify or expand it)
  const customColors = [
    '#3289c7', // blue
    '#ec8123', // orange
    '#3ebc3e', // green
    '#e04040', // red
    '#a371d2', // purple
    '#b45f4e', // brown
    '#e377c2', // pink
    '#7f7f7f', // gray
    '#b6b628', // lime
    '#2cafbe'  // cyan
  ];

  return (
    <ResponsiveContainer width="100%" height={535}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={180} />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" barSize={80}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={customColors[index % customColors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CustomBarChart;
