"use client";

import { useState, useRef } from "react";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function AddEmployeeModal({ isOpen, onClose, onSave }: AddEmployeeModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAiScanned, setIsAiScanned] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    idNumber: "",
    address: "",
    position: "",
    location: "",
    startDate: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processAiScan();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processAiScan();
    }
  };

  const processAiScan = () => {
    setIsProcessing(true);
    setIsAiScanned(false);
    
    // Simulate AI Processing time
    setTimeout(() => {
      setIsProcessing(false);
      setIsAiScanned(true);
      setFormData({
        name: "Nguyễn Minh Tuấn",
        dob: "1995-08-15", // formatted for date input
        idNumber: "079095123456",
        address: "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
        position: "Nhân viên bán hàng",
        location: "Emart Gò Vấp",
        startDate: "2026-06-01", // formatted for date input
      });
    }, 2500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const highlightClass = isAiScanned 
    ? "border-green-500/50 bg-green-500/5 text-on-surface focus:border-green-400 focus:ring-1 focus:ring-green-400" 
    : "border-outline-variant/30 bg-surface-container-high text-on-surface focus:border-primary focus:ring-1 focus:ring-primary";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-container w-full max-w-2xl rounded-2xl border border-surface-container-highest shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-surface-container-highest p-5 flex justify-between items-center relative overflow-hidden shrink-0 border-b border-surface-container-highest">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
          <h2 className="font-headline-md text-on-surface font-bold z-10 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person_add</span>
            Thêm nhân viên mới
          </h2>
          <button onClick={onClose} className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors z-10">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 custom-scrollbar">
          
          {/* Smart Upload Zone */}
          <div 
            className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all ${
              isDragging ? "border-primary bg-primary/5" : "border-outline-variant/50 hover:border-primary/50 hover:bg-surface-container-high"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".pdf,.jpg,.jpeg,.png" 
              onChange={handleFileSelect}
            />
            
            {isProcessing ? (
              <div className="flex flex-col items-center gap-4 animate-pulse">
                <div className="relative">
                  <span className="material-symbols-outlined text-[48px] text-primary relative z-10">document_scanner</span>
                  <div className="absolute top-0 left-0 w-full h-1 bg-green-400 opacity-70 blur-sm scan-line-animation"></div>
                </div>
                <div className="space-y-2">
                  <p className="font-label-md text-primary font-bold tracking-wide">AI đang quét và trích xuất dữ liệu hợp đồng...</p>
                  <div className="w-48 h-1.5 bg-surface-container-highest rounded-full overflow-hidden mx-auto">
                    <div className="h-full bg-primary animate-progress-indeterminate rounded-full"></div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center mb-4 text-primary">
                  <span className="material-symbols-outlined text-[32px]">cloud_upload</span>
                </div>
                <h3 className="font-headline-sm text-on-surface font-bold mb-1">Tải lên Hợp đồng lao động (PDF, JPG, PNG)</h3>
                <p className="font-body-md text-on-surface-variant mb-4">Kéo thả file vào đây hoặc click để chọn file</p>
                <div className="bg-tertiary-container/20 text-tertiary border border-tertiary/20 px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                  <span className="font-label-sm font-bold">Hệ thống AI sẽ tự động đọc và điền thông tin nhân sự</span>
                </div>
              </>
            )}
          </div>

          {/* Form */}
          <div className="space-y-4">
            <h3 className="font-label-md font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">feed</span>
              Thông tin nhân viên
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-label-sm text-on-surface-variant">Họ và tên</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name} 
                  onChange={handleInputChange}
                  placeholder="Nhập họ và tên..."
                  className={`w-full rounded-lg px-4 py-2 border transition-all outline-none ${highlightClass}`}
                />
              </div>
              
              <div className="space-y-1">
                <label className="font-label-sm text-on-surface-variant">Ngày sinh</label>
                <input 
                  type="date" 
                  name="dob"
                  value={formData.dob} 
                  onChange={handleInputChange}
                  className={`w-full rounded-lg px-4 py-2 border transition-all outline-none ${highlightClass} [color-scheme:dark]`}
                />
              </div>

              <div className="space-y-1">
                <label className="font-label-sm text-on-surface-variant">Số CCCD / CMND</label>
                <input 
                  type="text" 
                  name="idNumber"
                  value={formData.idNumber} 
                  onChange={handleInputChange}
                  placeholder="Nhập số CCCD..."
                  className={`w-full rounded-lg px-4 py-2 border transition-all outline-none ${highlightClass}`}
                />
              </div>
              
              <div className="space-y-1">
                <label className="font-label-sm text-on-surface-variant">Chức danh / Vị trí</label>
                <input 
                  type="text" 
                  name="position"
                  value={formData.position} 
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Nhân viên bán hàng"
                  className={`w-full rounded-lg px-4 py-2 border transition-all outline-none ${highlightClass}`}
                />
              </div>

              <div className="space-y-1">
                <label className="font-label-sm text-on-surface-variant">Nơi làm việc (Chi nhánh)</label>
                <input 
                  type="text" 
                  name="location"
                  value={formData.location} 
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Emart Gò Vấp"
                  className={`w-full rounded-lg px-4 py-2 border transition-all outline-none ${highlightClass}`}
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="font-label-sm text-on-surface-variant">Địa chỉ thường trú</label>
                <input 
                  type="text" 
                  name="address"
                  value={formData.address} 
                  onChange={handleInputChange}
                  placeholder="Nhập địa chỉ đầy đủ..."
                  className={`w-full rounded-lg px-4 py-2 border transition-all outline-none ${highlightClass}`}
                />
              </div>

              <div className="space-y-1">
                <label className="font-label-sm text-on-surface-variant">Ngày bắt đầu làm việc</label>
                <input 
                  type="date" 
                  name="startDate"
                  value={formData.startDate} 
                  onChange={handleInputChange}
                  className={`w-full rounded-lg px-4 py-2 border transition-all outline-none ${highlightClass} [color-scheme:dark]`}
                />
              </div>
            </div>
            
            {isAiScanned && (
              <div className="bg-status-success/10 border border-status-success/30 rounded-lg p-3 mt-4 flex items-start gap-3">
                <span className="material-symbols-outlined text-status-success mt-0.5">check_circle</span>
                <div>
                  <p className="font-label-md text-status-success font-bold">Trích xuất dữ liệu thành công!</p>
                  <p className="font-body-sm text-on-surface-variant mt-1">Vui lòng kiểm tra lại các thông tin được tự động điền. Bạn có thể chỉnh sửa thủ công nếu có sai sót.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-surface-container-highest p-4 border-t border-surface-container-highest flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose} 
            className="px-6 py-2 rounded-lg font-label-md text-on-surface border border-outline-variant hover:bg-surface-container-low transition-colors"
          >
            Hủy
          </button>
          <button 
            onClick={onSave}
            disabled={isProcessing}
            className="px-6 py-2 rounded-lg font-label-md font-bold bg-primary text-on-primary hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            Lưu nhân viên
          </button>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes scan {
          0% { top: -10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }
        .scan-line-animation {
          animation: scan 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes indeterminate {
          0% { width: 0%; margin-left: -50%; }
          100% { width: 100%; margin-left: 100%; }
        }
        .animate-progress-indeterminate {
          animation: indeterminate 1.5s infinite linear;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
