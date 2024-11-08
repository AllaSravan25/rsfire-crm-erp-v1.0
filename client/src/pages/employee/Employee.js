import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardContent } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
// import { Calendar } from 'lucide-react'


const API_BASE_URL = "https://rsfire-crm-erp-backend-v1-0.vercel.app";


const performanceData = [
  { month: 'JAN', value: 20 },
  { month: 'FEB', value: 28 },
  { month: 'MAR', value: 25 },
  { month: 'APR', value: 35 },
  { month: 'MAY', value: 34 },
]

// const activeTasks = [
//   { clientName: 'Rainbow vistas', requirement: 'AMC', contact: '9876789546', location: 'Mancherial, hyderabad', workProfs: 'upload docs', status: 'Started' },
//   { clientName: 'Slate School', requirement: 'NOC', contact: '9876789546', location: 'Mancherial, hyderabad', workProfs: 'upload docs', status: 'Started' },
//   { clientName: 'Rainbow vistas', requirement: 'AMC', contact: '9876789546', location: 'Mancherial, hyderabad', workProfs: 'upload docs', status: 'Pending' },
//   { clientName: 'Rainbow vistas', requirement: 'AMC', contact: '9876789546', location: 'Mancherial, hyderabad', workProfs: 'upload docs', status: 'Pending' },
//   { clientName: 'Rainbow vistas', requirement: 'AMC', contact: '9876789546', location: 'Mancherial, hyderabad', workProfs: 'upload docs', status: 'Pending' },
// ]

const StatCard = ({ bgColor, icon, value, label }) => (
  <Card className="text-white rounded-2xl overflow-hidden" style={{ backgroundColor: bgColor }}>
    <CardContent className="p-6 flex flex-col items-center justify-center h-full">
      {icon}
      <span className="text-5xl font-bold mt-2">{value}</span>
      <span className="text-sm mt-1">{label}</span>
    </CardContent>
  </Card>
)

export default function EmployeeHome() {
  const [employeeName, setEmployeeName] = useState('')
  const [attendanceData, setAttendanceData] = useState({
    presentDays: 0,
    absentDays: 0,
    leaveDays: 0
  })

  console.log(attendanceData)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [activeProjects, setActiveProjects] = useState([])
  const [userId, setUserId] = useState(localStorage.getItem('userId'))
  // const [completedProjects, setCompletedProjects] = useState([])

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      const userId = localStorage.getItem('userId')
      console.log(`userId: ${userId}`);
      setUserId(userId)
      if (userId) {
        try {
          const [nameResponse, attendanceResponse] = await Promise.all([
            axios.get(`${API_BASE_URL}/employee/${userId}`),
            axios.get(`${API_BASE_URL}/employee/attendance/${userId}`, {
              params: { month: selectedMonth + 1, year: selectedYear }
            })
          ])
          
          const { firstName, lastName } = nameResponse.data
          setEmployeeName(`${firstName} ${lastName}`)
          
          setAttendanceData(attendanceResponse.data)
        } catch (error) {
          console.error('Error fetching employee details:', error)
        }
      }
    }

    fetchEmployeeDetails()
  }, [selectedMonth, selectedYear])

  const handleMonthChange = (event) => {
    setSelectedMonth(parseInt(event.target.value))
  }

  const handleYearChange = (event) => {
    setSelectedYear(parseInt(event.target.value))
  }


  const fetchActiveProjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/projectslist`);
      const { activeProjects } = response.data;
      console.log(activeProjects);
      setActiveProjects(activeProjects)
      // setCompletedProjects(completedProjects)
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  useEffect(() => {
    fetchActiveProjects()
  }, [])


  const handleMarkAsCompleted = async (projectId) => {
    try {
      console.log(`projectId being sent from client: ${projectId}`);
      console.log(`userId being sent from client: ${userId}`);
      
      const confirmCompletion = window.confirm("Are you sure you want to mark this project as completed?");
      
      if (confirmCompletion) {
        const response = await axios.put(`${API_BASE_URL}/approvals/addApproval/${projectId}/${userId}`);
        console.log(response);
        fetchActiveProjects();
      }
    } catch (error) {
      console.error('Error marking project as completed:', error);
    }
  };


  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-4xl font-bold mb-2">Hello {employeeName},</h1>
      <h2 className="text-2xl font-semibold mb-6">Dashboard</h2>

      <div className="mb-6 flex items-center w-1/4">
        {/* <Calendar className="w-8 h-8 text-gray-500 mr-2" /> */}
        <select value={selectedMonth} onChange={handleMonthChange} className="mr-2 p-2 border rounded">
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>
              {new Date(0, i).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>
        <select value={selectedYear} onChange={handleYearChange} className="p-2 border rounded">
          {Array.from({ length: 5 }, (_, i) => (
            <option key={i} value={new Date().getFullYear() - i}>
              {new Date().getFullYear() - i}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2 grid grid-cols-2 gap-6">
          <StatCard bgColor="#EF4444"  value={attendanceData.absentDays} label="Absent Days" />
          <StatCard bgColor="#10B981"  value={attendanceData.presentDays} label="Present Days" />
          <StatCard bgColor="#3B82F6"  value={attendanceData.leaveDays} label="Total Leaves" />
          <StatCard bgColor="#F59E0B"  value={32} label="Tasks Done" />
        </div>
        <Card className="bg-gray-900 text-white rounded-2xl overflow-hidden">
          <CardContent className="p-4">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#333', border: 'none' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-2xl font-semibold mb-4">Active Tasks:</h3>
      <div className="overflow-x-auto">
        <Table className='w-full'>
          <TableHeader>
            <TableRow className='flex justify-between'>
              <TableHead className="font-semibold" style={{ width: '18%', textAlign: 'left', padding:'20px', fontWeight: '600', color: 'grey'}}>Client Name</TableHead>
              <TableHead className="font-semibold" style={{ width: '18%', textAlign: 'left', padding:'20px', fontWeight: '600', color: 'grey' }}>Requirement</TableHead>
              <TableHead className="font-semibold" style={{ width: '18%', textAlign: 'left', padding:'20px', fontWeight: '600', color: 'grey' }}>Contact</TableHead>
              <TableHead className="font-semibold" style={{ width: '18%', textAlign: 'left', padding:'20px', fontWeight: '600', color: 'grey' }}>Location</TableHead>
              <TableHead className="font-semibold" style={{ width: '18%', textAlign: 'left', padding:'20px', fontWeight: '600', color: 'grey' }}>Work Prof's</TableHead>
              <TableHead className="font-semibold" style={{ width: '18%', textAlign: 'left', padding:'20px', fontWeight: '600', color: 'grey' }}>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeProjects.map((project, index) => {
              // console.log(`project.assignTeam: ${project.assignTeam}`);
              // console.log(`userId: ${userId}`);
              if (project.assignTeam === userId) {  
                return (
                  <div style={{ borderTop: '1px solid #e1e1e1' }}>
                  <TableRow key={index} className='flex justify-between align-center'>
                    <TableCell style={{ width: '18%', textAlign: 'left', display: 'flex', alignItems: 'center', fontWeight: '500', textWrap: 'nowrap' }}>{project.name}</TableCell>
                    <TableCell style={{ width: '18%', textAlign: 'left', display: 'flex', alignItems: 'center', fontWeight: '500', textWrap: 'nowrap' }}>{project.requirement}</TableCell>
                    <TableCell style={{ width: '18%', textAlign: 'left', display: 'flex', alignItems: 'center', fontWeight: '500', textWrap: 'nowrap' }}>{project.contact}</TableCell>
                    <TableCell style={{ width: '18%', textAlign: 'left', display: 'flex', alignItems: 'center', fontWeight: '500', textWrap: 'nowrap' }}>{project.location}</TableCell>
                      <TableCell style={{ width: '18%', textAlign: 'left', display: 'flex', alignItems: 'center', fontWeight: '500', textWrap: 'nowrap' }}>{project.workProfs}</TableCell>
                      <TableCell style={{ width: '18%', textAlign: 'left', display: 'flex', alignItems: 'center', fontWeight: '500', textWrap: 'nowrap' }}>
                      <button onClick={() => handleMarkAsCompleted(project.ProjectId)} style={{ backgroundColor: '#56aeff', color: 'white', padding: '5px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer' }}>Mark as Completed</button>
                    </TableCell>
                  </TableRow>
                  </div>
                );
              }
              return null
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}