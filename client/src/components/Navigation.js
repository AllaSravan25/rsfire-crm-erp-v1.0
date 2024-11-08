import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Home,
  FileText,
  Users,
  CreditCard,
  PhoneCall,
  LogOut,
  Bell,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_URL = "https://rsfire-crm-erp-backend-v1-0.vercel.app";

const Navigation = () => {
  const { userType, logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showNotificationContainer, setShowNotificationContainer] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotificationContainer(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const adminNavItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: FileText, label: "Projects", path: "/projects" },
    { icon: Users, label: "Team", path: "/team" },
    { icon: CreditCard, label: "Accounts", path: "/accounts" },
    { icon: PhoneCall, label: "CRM", path: "/crm" },
  ];

  const employeeNavItems = [
    { icon: Home, label: "Home", path: "/employee-home" },
  ];

  const navItems = userType === "admin" ? adminNavItems : employeeNavItems;

  const showNotifications = () => {
    setShowNotificationContainer(!showNotificationContainer);
    handleNotification();
  };

  const handleNotification = async () => {
    try {
      const response = await axios.get(`${API_URL}/approvals`);
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    }
  };

  const handleAccept = async (notification) => {
    console.log(`Accepted approval request for project - ${notification.projectName} from - ${notification.employeeName}`);
    try {
      // Mark the project as completed
      await axios.put(`${API_URL}/projectslist/activeProjects/markAsCompleted/${notification.projectId}`);
      
      // Update the approval status
      await axios.put(`${API_URL}/approvals/updateApproval/${notification.projectId}`);
      
      // Refresh the notifications
      handleNotification();
    } catch (error) {
      console.error("Error handling approval:", error);
      // You might want to show an error message to the user here
    }
  };

  const handleReject = (notification) => {
    console.log(`Rejected approval request for project - ${notification.projectName} from - ${notification.employeeName}`);
    // Here you can add more logic, such as sending a request to the server to update the approval status
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="bg-white p-6">
      <nav className="flex justify-between items-center mb-8">
        <div className="w-40 h-12 bg-red-500 rounded-md"></div>
        <div className="flex space-x-6">
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <item.icon className="w-5 h-5 mr-1" />
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
          {userType === "admin" ? (
          <div className="relative" ref={notificationRef}>
            <button onClick={showNotifications}>
              <div>
                <Bell className="w-5 h-5 mr-1" />
              </div>
            </button>
            {showNotificationContainer && (
              <div className={`notification-container ${showNotificationContainer ? 'visible' : ''} overflow-y`}>
                <div className="w-100 rounded-md">
                  <ul className="list-none p-0 m-0 flex flex-col">
                  {notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                      notification ? 
                      <li key={index} className="p-2 text-wrap">
                        Approval request for project - { notification.projectName} from - {notification.employeeName}
                        <span>
                          <button 
                            className="accept-button"
                            onClick={() => handleAccept(notification)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="green"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="white"
                              className="size-6"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                              />
                            </svg>
                          </button>
                          <button 
                            className="reject-button"
                            onClick={() => handleReject(notification)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="red"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="white"
                              className="size-6"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                              />
                            </svg>
                          </button>
                        </span>
                      </li>
                      : <li className="p-2 text-wrap">No notifications</li>
                    ))
                  ) : (
                    <li className="p-2 text-wrap">No notifications</li>
                  )}
                  </ul>
                </div>
              </div>
            )}
          </div>
          ) : null}
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-5 h-5 mr-1" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
        <div className="w-12 h-12 bg-yellow-400 rounded-full"></div>
      </nav>
    </div>
  );
};

export default Navigation;