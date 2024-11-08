import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FileText, Users, CreditCard, PhoneCall } from "lucide-react";
import "../pages/styles/home.css";
import AttendanceCalendar from "../components/attendanceMontly";
import QuickSection from "../components/quickSection";
import RevenueChart from "../components/RevenueChart";
import { useNavigate } from "react-router-dom";
const API_BASE_URL = "http://localhost:5038";

export default function Home() {
  const [employeeCount, setEmployeeCount] = useState(0);
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [projectsData, setProjectsData] = useState({ completed: 0, active: 0, inFunnel: 0 });
  const [crmData, setCrmData] = useState({ totalLeads: 0, todayLeads: 0, prospects: 0 });
  const [accountsData, setAccountsData] = useState({ balance: 0, revenue: 0, expenses: 0 });

  const fetchRevenueData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/transactions/monthly`);
      setMonthlyData(response.data);

      const transactionsResponse = await axios.get(`${API_BASE_URL}/transactions`);
      const transactions = transactionsResponse.data;
      const revenue = transactions
        .filter(t => t.type.toLowerCase() === 'received' || t.type.toLowerCase() === 'recieved')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      setTotalRevenue(revenue);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      setError("Failed to fetch revenue data");
    }
  }, []);

  const fetchProjectsData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/projectslist`);
      const { activeProjects, completedProjects } = response.data;
      setProjectsData({
        completed: completedProjects.length,
        active: activeProjects.length,
        total: activeProjects.length + completedProjects.length
      });
    } catch (error) {
      console.error("Error fetching projects data:", error);
      setError("Failed to fetch projects data");
    }
  }, []);

  const fetchCRMData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/contacts`);
      const { lead, prospect, client } = response.data;
      setCrmData({
        totalLeads: lead.length + prospect.length + client.length,
        todayLeads: lead.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length,
        prospects: prospect.length
      });
    } catch (error) {
      console.error("Error fetching CRM data:", error);
      setError("Failed to fetch CRM data");
    }
  }, []);

  const fetchAccountsData = useCallback(async () => {
    try {
      // const balanceResponse = await axios.get(`${API_BASE_URL}/account-balance`);
      const transactionsResponse = await axios.get(`${API_BASE_URL}/transactions`);
      const transactions = transactionsResponse.data;
      
      const revenue = transactions
        .filter(t => t.type.toLowerCase() === 'received' || t.type.toLowerCase() === 'recieved')
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      
      const expenses = transactions
        .filter(t => t.type.toLowerCase() === 'sent')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      setAccountsData({
        balance: revenue - expenses,
        revenue: revenue,
        expenses: expenses
      });
    } catch (error) {
      console.error("Error fetching accounts data:", error);
      setError("Failed to fetch accounts data");
    }
  }, []);

  const handleTransactionAdded = useCallback(async () => {
    await fetchRevenueData();
    await fetchAccountsData();
  }, [fetchRevenueData, fetchAccountsData]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [employeeResponse, attendanceResponse, absentResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/employees/count`),
          axios.get(`${API_BASE_URL}/attendance/present`,
             {
            params: { date: new Date().toISOString().split("T")[0] },
          }),
          axios.get(`${API_BASE_URL}/attendance/absent`,
          {
            params: { date: new Date().toISOString().split("T")[0] },
          }),
        ]);
        setEmployeeCount(employeeResponse.data.count);
        setPresentCount(attendanceResponse.data.count);
        setAbsentCount(absentResponse.data.count);
        await Promise.all([
          fetchRevenueData(),
          fetchProjectsData(),
          fetchCRMData(),
          fetchAccountsData()
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fetchRevenueData, fetchProjectsData, fetchCRMData, fetchAccountsData]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
  };

  const formatLakhsAndThousands = (value) => {
    if (value >= 100000) {
      return `${(value / 100000).toFixed(1)}L`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    } else {
      return value.toString();
    }
  };

  if (isLoading) return <div>Loading...</div>;
  // if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold">Hello Sridhar,</h1>
        <p className="text-gray-600">This is RS FIRE PROTECTION'S dashboard</p>
      </div>

      <section id="dashboard">
        <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
    
        <div className="flex flex-col md:flex-row md:justify-between">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 w-full md:w-2/3">
            <DashboardCard
              title="Projects"
              icon={<FileText className="w-5 h-5 text-blue-500" />}
              mainStat={{ label: "Completed", value: projectsData.completed }}
              secondaryStat={{ label: "Active", value: projectsData.active }}
              inFunnel={{ label: "Total", value: projectsData.total }}
            />
            <DashboardCard
              title="Employees"
              icon={<Users className="w-5 h-5 text-blue-500" />}
              mainStat={{ label: "Total", value: employeeCount }}
              secondaryStat={{ label: "Present", value: presentCount }}
              inFunnel={{ label: "Absent", value: absentCount }}
            />
            <DashboardCard
              title="CRM"
              icon={<PhoneCall className="w-5 h-5 text-blue-500" />}
              mainStat={{ label: "Total Leads", value: crmData.totalLeads }}
              secondaryStat={{ label: "Today", value: crmData.todayLeads }}
              inFunnel={{ label: "Prospects", value: crmData.prospects }}
            />
            <DashboardCard
              title="Accounts"
              icon={<CreditCard className="w-5 h-5 text-blue-500" />}
              mainStat={{ label: "Balance", value: formatLakhsAndThousands(accountsData.balance) }}
              secondaryStat={{ label: "Revenue", value: formatLakhsAndThousands(accountsData.revenue) }}
              inFunnel={{ label: "Expenses", value: formatLakhsAndThousands(accountsData.expenses) }}
            />
          </div>
    
          <div className="bg-white rounded-lg shadow p-4 mb-6 w-full md:w-1/3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Revenue</h3>
            </div>
            <RevenueChart 
              data={monthlyData} 
              totalRevenue={totalRevenue} 
              formatCurrency={formatCurrency} 
            />
          </div>
        </div>
      </section>

      <section id="attendance">
        <AttendanceCalendar />
      </section>

      <section id="quick-actions">
        <QuickSection onTransactionAdded={handleTransactionAdded} />
      </section>
    </div>
  );
}

function DashboardCard({ title, icon, mainStat, secondaryStat, inFunnel }) {
  const navigate = useNavigate();

  const handleViewMore = () => {
    switch (title.toLowerCase()) {
      case 'projects':
        navigate('/projects');
        break;
      case 'employees':
        navigate('/employee');
        break;
      case 'crm':
        navigate('/crm');
        break;
      case 'accounts':
        navigate('/accounts');
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-white flex w-full items-center rounded-lg shadow p-4 outer-block">
      <div className="inner-block  w-full ">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            {icon}
            <h3 className="text-lg  ml-2">{title}</h3>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex w-full gap-2 items-center">
            <p className="text-gray-600 col-6">{mainStat.label}</p>
            <p className="text-2xl  col-6" style={{ fontSize: "1.1rem" }}>
              {mainStat.value}
            </p>
          </div>
          <div className="text-right flex w-full justify-end gap-5 items-center">
            <p className="text-gray-600 ">{secondaryStat.label}</p>
            <p className="text-2xl " style={{ fontSize: "1.1rem" }}>
              {secondaryStat.value}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between items-center">
            <div className="flex w-50 gap-2 items-center">
              <p className="text-gray-600 col-6">{inFunnel.label}</p>
              <p className="text-1xl  col-6">{inFunnel.value}</p>
            </div>
            <button 
              onClick={handleViewMore}
              className="text-sm text-red-500 font-bold hover:text-red-700 hover:underline transition-colors duration-200"
            >
              View more
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
