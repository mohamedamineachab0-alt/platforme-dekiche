"use client";

import { Bell, ShieldAlert, GraduationCap, X, CheckCircle2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const MOCK_NOTIFICATIONS = [
  { 
    id: "1", 
    title: "تأجيل حصة الرياضيات", 
    message: "تأجيل حصة الرياضيات إلى غدٍ الأربعاء على الساعة 10 صباحاً.", 
    type: "TEACHER", 
    isRead: false, 
    createdAt: "منذ 15 دقيقة" 
  },
  { 
    id: "2", 
    title: "تم تأكيد ربط حساب الولي", 
    message: "تم تأكيد ربط حساب الولي بنجاح. يمكن لولي أمرك الآن متابعة تقدمك.", 
    type: "ADMIN", 
    isRead: false, 
    createdAt: "منذ ساعتين" 
  },
  { 
    id: "3", 
    title: "تمت إضافة درس جديد", 
    message: "تمت إضافة درس جديد في الفيزياء: الميكانيك والسرعة.", 
    type: "TEACHER", 
    isRead: true, 
    createdAt: "أمس" 
  },
];

export default function NotificationsDropdown({ 
  buttonClassName = "text-slate-700 hover:text-[#6D28D9] hover:bg-[#6D28D9]/5",
  iconClassName = "w-5 h-5 md:w-6 md:h-6"
}: { 
  buttonClassName?: string;
  iconClassName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full transition-colors flex items-center justify-center ${buttonClassName}`}
      >
        <Bell className={iconClassName} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-14 w-80 md:w-96 bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-4 duration-200" dir="rtl">
          
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-50 bg-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#6D28D9]/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            <h3 className="font-extrabold text-slate-800 text-lg relative z-10 flex items-center gap-2">
              الإشعارات
              {unreadCount > 0 && (
                <span className="bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded-lg border border-red-100">{unreadCount} جديد</span>
              )}
            </h3>
            <button 
              onClick={markAllAsRead}
              className="text-xs font-bold text-[#6D28D9] hover:text-[#5b21b6] relative z-10"
            >
              تحديد الكل كمقروء
            </button>
          </div>

          {/* Body */}
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400 font-semibold text-sm">
                لا توجد إشعارات حالياً
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`flex items-start gap-4 p-5 border-b border-gray-50 transition-colors hover:bg-gray-50/50 cursor-pointer ${
                      !notif.isRead ? "bg-[#6D28D9]/[0.02]" : ""
                    }`}
                  >
                    <div className={`p-2.5 rounded-2xl shrink-0 border ${
                      notif.type === 'TEACHER' 
                        ? 'bg-[#6D28D9]/10 text-[#6D28D9] border-[#6D28D9]/20' 
                        : 'bg-green-50 text-green-600 border-green-100'
                    }`}>
                      {notif.type === 'TEACHER' ? <GraduationCap className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-sm font-bold ${!notif.isRead ? 'text-slate-800' : 'text-slate-600'}`}>
                          {notif.title}
                        </h4>
                        {!notif.isRead && <span className="w-2 h-2 bg-[#6D28D9] rounded-full shrink-0 mt-1.5" />}
                      </div>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed mb-2">
                        {notif.message}
                      </p>
                      <span className="text-[10px] font-bold text-gray-400">{notif.createdAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-4 text-center bg-gray-50 border-t border-gray-100">
             <button className="text-xs font-bold text-slate-600 hover:text-[#6D28D9] transition-colors">
               عرض كل الإشعارات
             </button>
          </div>

        </div>
      )}
    </div>
  );
}
