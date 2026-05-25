"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      // 1. Gửi request đăng nhập tới Next.js API Route (Backend)
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Đăng nhập thất bại, vui lòng kiểm tra lại thông tin");
        setIsLoading(false);
        return;
      }

      // 2. Cập nhật thông tin User vào Zustand Global State (Lưu ở Frontend)
      login(data.user);
      
      // 3. Chuyển hướng người dùng vào giao diện Dashboard sau khi đăng nhập thành công
      if (data.user.role === 'admin' || data.user.role === 'admin_company') {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setErrorMsg("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fe] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Decorator Elements - Làm mờ và trang trí */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute top-1/2 right-10 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl transform rotate-3 hover:rotate-0 transition-all duration-300">
            <span className="drop-shadow-md">HRM</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Hệ thống Quản lý Nhân sự
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 font-medium">
          Đăng nhập để truy cập cổng thông tin Sagrifood
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-xl py-10 px-6 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/40">
          <form className="space-y-6" onSubmit={handleLogin}>
            
            {/* Input Tên đăng nhập */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700">
                Tên đăng nhập
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm text-gray-900 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                  placeholder="VD: staff_100"
                />
              </div>
            </div>

            {/* Input Mật khẩu */}
            <div>
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Mật khẩu
                </label>
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline transition-all">
                  Quên mật khẩu?
                </a>
              </div>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm text-gray-900 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Hiển thị lỗi */}
            {errorMsg && (
              <div className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg flex items-center gap-2 border border-red-100">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errorMsg}
              </div>
            )}

            {/* Nút đăng nhập có Loading */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xác thực...
                  </>
                ) : (
                  "Đăng nhập ngay"
                )}
              </button>
            </div>
          </form>

          {/* Gợi ý tài khoản Demo (Bấm vào sẽ tự động điền) */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 text-center">
              Tài khoản Test Demo
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <div 
                className="bg-gray-50 p-3 rounded-lg flex items-center justify-between text-sm border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer" 
                onClick={() => {setUsername('staff_100'); setPassword('123456'); setErrorMsg("");}}
              >
                <span className="text-gray-600 font-mono text-xs">staff_100 <span className="text-gray-400 mx-1">/</span> 123456</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Nhân viên</span>
              </div>
              <div 
                className="bg-gray-50 p-3 rounded-lg flex items-center justify-between text-sm border border-gray-100 hover:border-purple-200 hover:shadow-sm transition-all cursor-pointer" 
                onClick={() => {setUsername('manager_100'); setPassword('123456'); setErrorMsg("");}}
              >
                <span className="text-gray-600 font-mono text-xs">manager_100 <span className="text-gray-400 mx-1">/</span> 123456</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Quản lý</span>
              </div>
              <div 
                className="bg-gray-50 p-3 rounded-lg flex items-center justify-between text-sm border border-gray-100 hover:border-red-200 hover:shadow-sm transition-all cursor-pointer" 
                onClick={() => {setUsername('admin_company_100'); setPassword('123456'); setErrorMsg("");}}
              >
                <span className="text-gray-600 font-mono text-xs">admin_company_100 <span className="text-gray-400 mx-1">/</span> 123456</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Admin</span>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-center mt-6 text-xs text-gray-500 font-medium">
          &copy; {new Date().getFullYear()} Sagrifood HRM. Phát triển với Next.js & Tailwind CSS.
        </p>
      </div>
    </div>
  );
}
