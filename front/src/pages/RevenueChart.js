import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import { PrivateAxios } from '../environment/AxiosInstance';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Array for month names
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const RevenueChart = () => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await PrivateAxios.get('purchase/getperyrwise');
        const data = response.data;

        // Process data to aggregate by month
        const monthlyData = data.reduce((acc, item) => {
          const date = new Date(item.created_at);
          const month = date.getMonth(); // Numeric month (0-11)
          const year = date.getFullYear();
          const monthYear = `${month}-${year}`;
          if (!acc[monthYear]) {
            acc[monthYear] = 0;
          }
          acc[monthYear] += item.total_amount;
          return acc;
        }, {});

        // Convert numeric month-year to full month names
        const labels = Object.keys(monthlyData).map(monthYear => {
          const [monthIndex, year] = monthYear.split('-');
          return `${monthNames[parseInt(monthIndex, 10)]} ${year}`;
        });

        const dataValues = labels.map(label => monthlyData[`${monthNames.indexOf(label.split(' ')[0])}-${label.split(' ')[1]}`]);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Revenue',
              data: dataValues,
              backgroundColor: '#3ebc3e',
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Revenue Breakdown by Month',
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default RevenueChart;
