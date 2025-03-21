"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { motion } from "framer-motion";
import { Bell, Search, User, LogOut, Activity, Shield, AlertTriangle, BarChart3, Menu, X } from "lucide-react";

interface FraudulentApp {
  app_name: string;
  developer: string;
  category: string;
  risk_level: string;
  reported_on: string;
}

interface FraudulentUrl {
  url: string;
  risk_level: string;
  detected_on: string;
  category: string;
}

interface FraudTrend {
  date: string;
  fraud_cases_detected: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const COLORS = {
  phishing: "#8884d8",
  malware: "#FF8042",
  scams: "#00C49F",
  low: "#82ca9d",
  medium: "#FFBB28",
  high: "#FF8042"
};

export default function Dashboard() {
  const [fraudApps, setFraudApps] = useState<FraudulentApp[]>([]);
  const [fraudUrls, setFraudUrls] = useState<FraudulentUrl[]>([]);
  const [fraudTrends, setFraudTrends] = useState<FraudTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if(!localStorage.getItem("token")) {
        window.location.href = "/signin";
    }
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const appsResponse = await axios.get("https://seahorse-app-8her7.ondigitalocean.app/fraud-apps");
        const urlsResponse = await axios.get("https://seahorse-app-8her7.ondigitalocean.app/fraud-url");
        const trendsResponse = await axios.get("https://seahorse-app-8her7.ondigitalocean.app/fraud-trends");
        
        if (appsResponse.data && 
            Array.isArray(appsResponse.data) && 
            appsResponse.data.length > 0 && 
            appsResponse.data[0].fraudulent_apps) {
          
          const cleanApps = appsResponse.data[0].fraudulent_apps.map((app: any) => ({
            app_name: app.app_name || 'Unknown App',
            developer: app.developer || 'Unknown Developer',
            category: app.category || 'Unknown',
            risk_level: app.risk_level || 'Unknown',
            reported_on: app.reported_on || 'Unknown'
          }));
          setFraudApps(cleanApps);
        } else {
          setFraudApps([]);
        }
        
        if (urlsResponse.data && 
            Array.isArray(urlsResponse.data) && 
            urlsResponse.data.length > 0 && 
            urlsResponse.data[0].fraudulent_urls) {
          
          const cleanUrls = urlsResponse.data[0].fraudulent_urls.map((url: any) => ({
            url: url.url || 'Unknown URL',
            risk_level: url.risk_level || 'Unknown',
            detected_on: url.detected_on || 'Unknown',
            category: url.category || 'Unknown'
          }));
          setFraudUrls(cleanUrls);
        } else {
          setFraudUrls([]);
        }
        
        if (trendsResponse.data && 
            Array.isArray(trendsResponse.data) && 
            trendsResponse.data.length > 0 && 
            trendsResponse.data[0].fraud_trends_30_days) {
          
          setFraudTrends(trendsResponse.data[0].fraud_trends_30_days);
        } else {
          setFraudTrends([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setFraudApps([]);
        setFraudUrls([]);
        setFraudTrends([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    if (!level) return '#999';
    
    switch(level.toLowerCase()) {
      case 'high': return COLORS.high;
      case 'medium': return COLORS.medium;
      case 'low': return COLORS.low;
      default: return '#999';
    }
  };

  const getTotalsByRiskLevel = () => {
    const data = [
      { name: 'High', value: fraudUrls.filter(url => url.risk_level && url.risk_level.toLowerCase() === 'high').length },
      { name: 'Medium', value: fraudUrls.filter(url => url.risk_level && url.risk_level.toLowerCase() === 'medium').length },
      { name: 'Low', value: fraudUrls.filter(url => url.risk_level && url.risk_level.toLowerCase() === 'low').length }
    ];
    return data;
  };
  
  const getTotalsByCategory = () => {
    const data = [
      { name: 'Phishing', value: fraudUrls.filter(url => url.category && url.category.toLowerCase() === 'phishing').length },
      { name: 'Malware', value: fraudUrls.filter(url => url.category && url.category.toLowerCase() === 'malware').length },
      { name: 'Scams', value: fraudUrls.filter(url => url.category && (url.category.toLowerCase() === 'scam' || url.category.toLowerCase().includes('scam'))).length }
    ];
    return data;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/signin";
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-lg font-medium text-white">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-900 md:flex-row">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-slate-800 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between border-b border-slate-700 px-4">
          <div className="flex items-center">
            <Shield className="mr-2 h-6 w-6 text-blue-400" />
            <span className="text-lg font-bold text-white">SecureURL Shield</span>
          </div>
          <button onClick={toggleSidebar} className="p-2 text-slate-400 md:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => handleTabChange("overview")}
                className={`flex w-full items-center rounded-lg px-4 py-2 text-left transition-colors ${
                  activeTab === "overview" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-700"
                }`}
              >
                <Activity className="mr-3 h-5 w-5" />
                <span>Overview</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleTabChange("apps")}
                className={`flex w-full items-center rounded-lg px-4 py-2 text-left transition-colors ${
                  activeTab === "apps" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-700"
                }`}
              >
                <AlertTriangle className="mr-3 h-5 w-5" />
                <span>Fraudulent Apps</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleTabChange("urls")}
                className={`flex w-full items-center rounded-lg px-4 py-2 text-left transition-colors ${
                  activeTab === "urls" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-700"
                }`}
              >
                <Shield className="mr-3 h-5 w-5" />
                <span>Fraudulent URLs</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleTabChange("trends")}
                className={`flex w-full items-center rounded-lg px-4 py-2 text-left transition-colors ${
                  activeTab === "trends" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-700"
                }`}
              >
                <BarChart3 className="mr-3 h-5 w-5" />
                <span>Trend Analysis</span>
              </button>
            </li>
          </ul>
          <div className="mt-8 border-t border-slate-700 pt-4">
            <button onClick={handleLogout} className="flex w-full items-center rounded-lg px-4 py-2 text-left text-slate-300 transition-colors hover:bg-slate-700">
              <LogOut className="mr-3 h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </nav>
      </aside>
      
      <div className={`fixed inset-0 z-40 bg-slate-900 bg-opacity-50 transition-opacity ${sidebarOpen ? 'block' : 'hidden'} md:hidden`} onClick={toggleSidebar}></div>
      
      <main className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-700 bg-slate-800 px-4 md:px-6">
          <div className="flex items-center space-x-4">
            <button onClick={toggleSidebar} className="p-2 text-slate-400 md:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden items-center rounded-full bg-slate-700 px-3 py-1.5 sm:flex">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="ml-2 bg-transparent text-sm text-white focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-1">
              <Bell className="h-5 w-5 text-slate-300" />
              <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">3</span>
            </button>
            <div className="flex items-center">
              <div className="mr-2 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <span className="hidden text-sm font-medium text-white sm:inline">Admin User</span>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6">
          {activeTab === "overview" && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <motion.h1 
                variants={itemVariants}
                className="text-xl font-bold text-white md:text-2xl"
              >
                Security Dashboard Overview
              </motion.h1>
              
              <motion.div 
                variants={itemVariants}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6"
              >
                <div className="rounded-lg bg-gradient-to-br from-red-500/20 to-red-600/20 p-4 border border-red-500/20 md:p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-medium text-red-400 md:text-lg">High Risk Threats</h3>
                    <span className="rounded-full bg-red-500/20 p-2">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                    </span>
                  </div>
                  <p className="mt-4 text-2xl font-bold text-white md:text-3xl">
                    {fraudUrls.filter(url => url.risk_level && url.risk_level.toLowerCase() === 'high').length}
                  </p>
                  <p className="mt-1 text-xs text-slate-400 md:text-sm">Requires immediate attention</p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/20 p-4 border border-amber-500/20 md:p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-medium text-amber-400 md:text-lg">Medium Risk</h3>
                    <span className="rounded-full bg-amber-500/20 p-2">
                      <Shield className="h-5 w-5 text-amber-400" />
                    </span>
                  </div>
                  <p className="mt-4 text-2xl font-bold text-white md:text-3xl">
                    {fraudUrls.filter(url => url.risk_level && url.risk_level.toLowerCase() === 'medium').length}
                  </p>
                  <p className="mt-1 text-xs text-slate-400 md:text-sm">Monitor closely</p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/20 p-4 border border-green-500/20 md:p-6 sm:col-span-2 md:col-span-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-medium text-green-400 md:text-lg">Low Risk</h3>
                    <span className="rounded-full bg-green-500/20 p-2">
                      <Activity className="h-5 w-5 text-green-400" />
                    </span>
                  </div>
                  <p className="mt-4 text-2xl font-bold text-white md:text-3xl">
                    {fraudUrls.filter(url => url.risk_level && url.risk_level.toLowerCase() === 'low').length}
                  </p>
                  <p className="mt-1 text-xs text-slate-400 md:text-sm">Standard monitoring</p>
                </div>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="grid grid-cols-1 gap-4 lg:grid-cols-2 md:gap-6"
              >
                <div className="rounded-lg border border-slate-700 bg-slate-800 p-4 md:p-6">
                  <h3 className="mb-3 text-base font-medium text-white md:mb-4 md:text-lg">Risk Level Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getTotalsByRiskLevel()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius="70%"
                          fill="#8884d8"
                          dataKey="value"
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {getTotalsByRiskLevel().map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={getRiskLevelColor(entry.name)} 
                            />
                          ))}
                        </Pie>
                        <Tooltip wrapperStyle={{ fontSize: '12px' }} />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-700 bg-slate-800 p-4 md:p-6">
                  <h3 className="mb-3 text-base font-medium text-white md:mb-4 md:text-lg">Threat Category Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getTotalsByCategory()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius="70%"
                          fill="#8884d8"
                          dataKey="value"
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell key="cell-0" fill={COLORS.phishing} />
                          <Cell key="cell-1" fill={COLORS.malware} />
                          <Cell key="cell-2" fill={COLORS.scams} />
                        </Pie>
                        <Tooltip wrapperStyle={{ fontSize: '12px' }} />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="rounded-lg border border-slate-700 bg-slate-800 p-4 md:p-6"
              >
                <h3 className="mb-3 text-base font-medium text-white md:mb-4 md:text-lg">Recent Fraudulent Activities</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-800">
                      <tr>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-400 md:px-6 md:py-3">
                          Type
                        </th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-400 md:px-6 md:py-3">
                          Name/URL
                        </th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-400 md:px-6 md:py-3">
                          Risk Level
                        </th>
                        <th scope="col" className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400 sm:table-cell">
                          Category
                        </th>
                        <th scope="col" className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400 md:table-cell">
                          Detected On
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700 bg-slate-800">
                      {fraudApps.slice(0, 2).map((app, index) => (
                        <tr key={`app-${index}`} className="hover:bg-slate-700">
                          <td className="whitespace-nowrap px-3 py-2 md:px-6 md:py-4">
                            <span className="text-xs font-medium text-slate-300 md:text-sm">App</span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 md:px-6 md:py-4">
                            <span className="text-xs text-slate-300 md:text-sm">{app.app_name}</span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 md:px-6 md:py-4">
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              app.risk_level && app.risk_level.toLowerCase() === 'high' ? 'bg-red-900 text-red-300' : 
                              app.risk_level && app.risk_level.toLowerCase() === 'medium' ? 'bg-amber-900 text-amber-300' : 
                              'bg-green-900 text-green-300'
                            }`}>
                              {app.risk_level}
                            </span>
                          </td>
                          <td className="hidden whitespace-nowrap px-6 py-4 sm:table-cell">
                            <span className="text-xs text-slate-300 md:text-sm">{app.category}</span>
                          </td>
                          <td className="hidden whitespace-nowrap px-6 py-4 md:table-cell">
                            <span className="text-xs text-slate-300 md:text-sm">{app.reported_on}</span>
                          </td>
                        </tr>
                      ))}
                      {fraudUrls.slice(0, 2).map((url, index) => (
                        <tr key={`url-${index}`} className="hover:bg-slate-700">
                          <td className="whitespace-nowrap px-3 py-2 md:px-6 md:py-4">
                            <span className="text-xs font-medium text-slate-300 md:text-sm">URL</span>
                          </td>
                          <td className="max-w-[120px] truncate px-3 py-2 md:max-w-none md:whitespace-nowrap md:px-6 md:py-4">
                            <span className="text-xs text-slate-300 md:text-sm">{url.url}</span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 md:px-6 md:py-4">
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              url.risk_level && url.risk_level.toLowerCase() === 'high' ? 'bg-red-900 text-red-300' : 
                              url.risk_level && url.risk_level.toLowerCase() === 'medium' ? 'bg-amber-900 text-amber-300' : 
                              'bg-green-900 text-green-300'
                            }`}>
                              {url.risk_level}
                            </span>
                          </td>
                          <td className="hidden whitespace-nowrap px-6 py-4 sm:table-cell">
                            <span className="text-xs text-slate-300 md:text-sm">{url.category}</span>
                          </td>
                          <td className="hidden whitespace-nowrap px-6 py-4 md:table-cell">
                            <span className="text-xs text-slate-300 md:text-sm">{url.detected_on}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === "apps" && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4 md:space-y-6"
            >
              <motion.div variants={itemVariants} className="flex flex-col items-start justify-between space-y-3 sm:flex-row sm:items-center sm:space-y-0">
                <h1 className="text-xl font-bold text-white md:text-2xl">Fraudulent Applications</h1>
                <div className="flex flex-wrap gap-2">
                  <button className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-600 md:px-4 md:py-2 md:text-sm">
                    Filter
                  </button>
                  <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 md:px-4 md:py-2 md:text-sm">
                    Export Data
                  </button>
                </div>
              </motion.div>

              <motion.div 
                variants={itemVariants} 
                className="rounded-lg border border-slate-700 bg-slate-800"
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-800">
                      <tr>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-400 md:px-6 md:py-3">
                          App Name
                        </th>
                        <th scope="col" className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400 md:table-cell">
                          Developer
                        </th>
                        <th scope="col" className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400 sm:table-cell">
                          Category
                        </th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-400 md:px-6 md:py-3">
                          Risk Level
                        </th>
                        <th scope="col" className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400 sm:table-cell">
                          Reported On
                        </th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-400 md:px-6 md:py-3">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700 bg-slate-800">
                      {fraudApps.map((app, index) => (
                        <tr key={index} className="hover:bg-slate-700">
                          <td className="whitespace-nowrap px-3 py-2 md:px-6 md:py-4">
                            <div className="flex items-center">
                              <div className="h-8 w-8 flex-shrink-0 rounded-full bg-slate-700 flex items-center justify-center md:h-10 md:w-10">
                                <span className="text-base font-semibold text-slate-400 md:text-lg">{app.app_name[0]}</span>
                              </div>
                              <div className="ml-2 md:ml-4">
                                <div className="text-xs font-medium text-white md:text-sm">{app.app_name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="hidden whitespace-nowrap px-6 py-4 md:table-cell">
                            <span className="text-xs text-slate-300 md:text-sm">{app.developer}</span>
                          </td>
                          <td className="hidden whitespace-nowrap px-6 py-4 sm:table-cell">
                            <span className="text-xs text-slate-300 md:text-sm">{app.category}</span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 md:px-6 md:py-4">
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              app.risk_level && app.risk_level.toLowerCase() === 'high' ? 'bg-red-900 text-red-300' : 
                              app.risk_level && app.risk_level.toLowerCase() === 'medium' ? 'bg-amber-900 text-amber-300' : 
                              'bg-green-900 text-green-300'
                            }`}>
                              {app.risk_level}
                            </span>
                          </td>
                          <td className="hidden whitespace-nowrap px-6 py-4 sm:table-cell">
                            <span className="text-xs text-slate-300 md:text-sm">{app.reported_on}</span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 md:px-6 md:py-4">
                            <div className="flex space-x-1 md:space-x-2">
                              <button className="rounded bg-blue-900/30 px-1.5 py-0.5 text-xs font-medium text-blue-400 hover:bg-blue-800/30 md:px-2 md:py-1">
                                Report
                              </button>
                              <button className="rounded bg-red-900/30 px-1.5 py-0.5 text-xs font-medium text-red-400 hover:bg-red-800/30 md:px-2 md:py-1">
                                Block
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants} className="rounded-lg border border-slate-700 bg-slate-800 p-4 md:p-6">
                <h3 className="mb-3 text-base font-medium text-white md:mb-4 md:text-lg">Apps by Risk Level</h3>
                <div className="h-60 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={fraudApps.map(app => ({
                        name: app.app_name,
                        value: app.risk_level === 'High' ? 3 : app.risk_level === 'Medium' ? 2 : 1
                      }))}
                      margin={{
                        top: 20,
                        right: 10,
                        left: 0,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#ccc" 
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
                      />
                      <YAxis stroke="#ccc" tick={{ fontSize: 10 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', fontSize: '12px' }} 
                        labelStyle={{ color: 'white' }}
                        formatter={(value: any) => [value === 3 ? 'High' : value === 2 ? 'Medium' : 'Low', 'Risk Level']}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="value" name="Risk Score" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === "urls" && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4 md:space-y-6"
            >
              <motion.div variants={itemVariants} className="flex flex-col items-start justify-between space-y-3 sm:flex-row sm:items-center sm:space-y-0">
                <h1 className="text-xl font-bold text-white md:text-2xl">Fraudulent URLs</h1>
                <div className="flex flex-wrap gap-2">
                  <button className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-600 md:px-4 md:py-2 md:text-sm">
                    Filter
                  </button>
                  <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 md:px-4 md:py-2 md:text-sm">
                    Export Data
                  </button>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                <div className="rounded-lg border border-slate-700 bg-slate-800 p-4 md:p-6">
                  <h3 className="mb-3 text-base font-medium text-white md:mb-4 md:text-lg">URLs by Risk Level</h3>
                  <div className="h-60 md:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getTotalsByRiskLevel()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius="70%"
                          fill="#8884d8"
                          dataKey="value"
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {getTotalsByRiskLevel().map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={getRiskLevelColor(entry.name)} 
                            />
                          ))}
                        </Pie>
                        <Tooltip wrapperStyle={{ fontSize: '12px' }} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-700 bg-slate-800 p-4 md:p-6">
                  <h3 className="mb-3 text-base font-medium text-white md:mb-4 md:text-lg">URLs by Category</h3>
                  <div className="h-60 md:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getTotalsByCategory()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius="70%"
                          fill="#8884d8"
                          dataKey="value"
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell key="cell-0" fill={COLORS.phishing} />
                          <Cell key="cell-1" fill={COLORS.malware} />
                          <Cell key="cell-2" fill={COLORS.scams} />
                        </Pie>
                        <Tooltip wrapperStyle={{ fontSize: '12px' }} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="rounded-lg border border-slate-700 bg-slate-800">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-800">
                      <tr>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-400 md:px-6 md:py-3">
                          URL
                        </th>
                        <th scope="col" className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400 sm:table-cell">
                          Category
                        </th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-400 md:px-6 md:py-3">
                          Risk Level
                        </th>
                        <th scope="col" className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400 sm:table-cell">
                          Detected On
                        </th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-slate-400 md:px-6 md:py-3">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700 bg-slate-800">
                      {fraudUrls.map((url, index) => (
                        <tr key={index} className="hover:bg-slate-700">
                          <td className="max-w-[120px] truncate px-3 py-2 md:max-w-xs md:px-6 md:py-4">
                            <span className="text-xs text-slate-300 md:text-sm">{url.url}</span>
                          </td>
                          <td className="hidden whitespace-nowrap px-6 py-4 sm:table-cell">
                            <span className="text-xs text-slate-300 md:text-sm">{url.category}</span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 md:px-6 md:py-4">
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              url.risk_level && url.risk_level.toLowerCase() === 'high' ? 'bg-red-900 text-red-300' : 
                              url.risk_level && url.risk_level.toLowerCase() === 'medium' ? 'bg-amber-900 text-amber-300' : 
                              'bg-green-900 text-green-300'
                            }`}>
                              {url.risk_level}
                            </span>
                          </td>
                          <td className="hidden whitespace-nowrap px-6 py-4 sm:table-cell">
                            <span className="text-xs text-slate-300 md:text-sm">{url.detected_on}</span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 md:px-6 md:py-4">
                            <div className="flex flex-wrap gap-1 md:space-x-2">
                              <button className="rounded bg-blue-900/30 px-1.5 py-0.5 text-xs font-medium text-blue-400 hover:bg-blue-800/30 md:px-2 md:py-1">
                                Report
                              </button>
                              <button className="rounded bg-red-900/30 px-1.5 py-0.5 text-xs font-medium text-red-400 hover:bg-red-800/30 md:px-2 md:py-1">
                                Block
                              </button>
                              <button className="rounded bg-amber-900/30 px-1.5 py-0.5 text-xs font-medium text-amber-400 hover:bg-amber-800/30 md:px-2 md:py-1">
                                Investigate
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === "trends" && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4 md:space-y-6"
            >
              <motion.h1 variants={itemVariants} className="text-xl font-bold text-white md:text-2xl">
                30-Day Fraud Trend Analysis
              </motion.h1>
              
              <motion.div variants={itemVariants} className="rounded-lg border border-slate-700 bg-slate-800 p-4 md:p-6">
                <h3 className="mb-3 text-base font-medium text-white md:mb-4 md:text-lg">Fraud Activity Over Time</h3>
                <div className="h-60 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={fraudTrends}
                      margin={{
                        top: 20,
                        right: 10,
                        left: 0,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#ccc"
                        tick={{ fontSize: 10 }}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return `${date.getMonth()+1}/${date.getDate()}`;
                        }}
                      />
                      <YAxis stroke="#ccc" tick={{ fontSize: 10 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', fontSize: '12px' }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Line
                        type="monotone"
                        dataKey="fraud_cases_detected"
                        name="Fraud Cases"
                        stroke="#3b82f6"
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants} className="rounded-lg border border-slate-700 bg-slate-800 p-4 md:p-6">
                <h3 className="mb-3 text-base font-medium text-white md:mb-4 md:text-lg">Monthly Summary</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
                  <div className="rounded-lg bg-slate-700/50 p-4">
                    <h4 className="text-sm font-medium text-blue-400 md:text-base">Total Fraud Cases</h4>
                    <div className="mt-2 flex items-end justify-between">
                      <p className="text-xl font-bold text-white md:text-2xl">
                        {fraudTrends.reduce((sum, item) => sum + item.fraud_cases_detected, 0)}
                      </p>
                      <div className="text-xs text-green-400 md:text-sm">+18% from last month</div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-700/50 p-4">
                    <h4 className="text-sm font-medium text-orange-400 md:text-base">Average Daily Cases</h4>
                    <div className="mt-2 flex items-end justify-between">
                      <p className="text-xl font-bold text-white md:text-2xl">
                        {fraudTrends.length > 0 
                          ? Math.round(fraudTrends.reduce((sum, item) => sum + item.fraud_cases_detected, 0) / fraudTrends.length) 
                          : 0}
                      </p>
                      <div className="text-xs text-red-400 md:text-sm">+24% from last month</div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-700/50 p-4">
                    <h4 className="text-sm font-medium text-green-400 md:text-base">Peak Day</h4>
                    <div className="mt-2 flex items-end justify-between">
                      <p className="text-xl font-bold text-white md:text-2xl">
                        {fraudTrends.length > 0 
                          ? fraudTrends.reduce((max, item) => 
                              item.fraud_cases_detected > max.fraud_cases_detected ? item : max, 
                              fraudTrends[0]
                            ).fraud_cases_detected
                          : 0}
                      </p>
                      <div className="text-xs text-amber-400 md:text-sm">+5% from last month</div>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                <div className="rounded-lg border border-slate-700 bg-slate-800 p-4 md:p-6">
                  <h3 className="mb-3 text-base font-medium text-white md:mb-4 md:text-lg">Top Fraud Categories</h3>
                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <div className="mb-1 flex items-center justify-between md:mb-2">
                        <span className="text-xs font-medium text-slate-300 md:text-sm">Phishing</span>
                        <span className="text-xs font-medium text-slate-300 md:text-sm">64%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-700 md:h-2">
                        <div className="h-1.5 rounded-full bg-blue-500 md:h-2" style={{ width: '64%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between md:mb-2">
                        <span className="text-xs font-medium text-slate-300 md:text-sm">Malware Distribution</span>
                        <span className="text-xs font-medium text-slate-300 md:text-sm">28%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-700 md:h-2">
                        <div className="h-1.5 rounded-full bg-orange-500 md:h-2" style={{ width: '28%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between md:mb-2">
                        <span className="text-xs font-medium text-slate-300 md:text-sm">Financial Scams</span>
                        <span className="text-xs font-medium text-slate-300 md:text-sm">43%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-700 md:h-2">
                        <div className="h-1.5 rounded-full bg-green-500 md:h-2" style={{ width: '43%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between md:mb-2">
                        <span className="text-xs font-medium text-slate-300 md:text-sm">Crypto Scams</span>
                        <span className="text-xs font-medium text-slate-300 md:text-sm">35%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-700 md:h-2">
                        <div className="h-1.5 rounded-full bg-purple-500 md:h-2" style={{ width: '35%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-slate-700 bg-slate-800 p-4 md:p-6">
                  <h3 className="mb-3 text-base font-medium text-white md:mb-4 md:text-lg">Fraud Prevention Impact</h3>
                  <div className="space-y-3 md:space-y-4">
                    <div className="rounded-lg bg-green-900/20 p-3 border border-green-900/30 md:p-4">
                      <h4 className="text-sm font-medium text-green-400 md:text-base">Threats Blocked</h4>
                      <div className="mt-1 flex items-center justify-between md:mt-2">
                        <p className="text-lg font-bold text-white md:text-2xl">1,243</p>
                        <div className="text-xs text-green-400 md:text-sm">+18% from last month</div>
                      </div>
                    </div>
                    <div className="rounded-lg bg-blue-900/20 p-3 border border-blue-900/30 md:p-4">
                      <h4 className="text-sm font-medium text-blue-400 md:text-base">Users Protected</h4>
                      <div className="mt-1 flex items-center justify-between md:mt-2">
                        <p className="text-lg font-bold text-white md:text-2xl">8,547</p>
                        <div className="text-xs text-blue-400 md:text-sm">+22% from last month</div>
                      </div>
                    </div>
                    <div className="rounded-lg bg-amber-900/20 p-3 border border-amber-900/30 md:p-4">
                      <h4 className="text-sm font-medium text-amber-400 md:text-base">Estimated Savings</h4>
                      <div className="mt-1 flex items-center justify-between md:mt-2">
                        <p className="text-lg font-bold text-white md:text-2xl">$324,500</p>
                        <div className="text-xs text-amber-400 md:text-sm">+15% from last month</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}