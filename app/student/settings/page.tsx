"use client";

import { Settings as SettingsIcon, Monitor, Smartphone, Tablet, Ban, Key, Bell, Shield, User, Globe, Save } from "lucide-react";
import { useState } from "react";

const MOCK_DEVICES = [
  { id: 1, type: "mac", device: "MacBook Pro M2", browser: "Safari 17", location: "الجزائر العاصمة", ip: "197.112.45.12", time: "نشط الآن", isCurrent: true },
  { id: 2, type: "phone", device: "iPhone 14 Pro", browser: "Safari iOS", location: "وهران", ip: "105.101.22.4", time: "منذ ساعتين", isCurrent: false },
  { id: 3, type: "windows", device: "Windows 11 PC", browser: "Chrome 120", location: "عنابة", ip: "41.200.11.89", time: "منذ 3 أيام", isCurrent: false },
];

export default function StudentSettingsPage() {
  const [activeTab, setActiveTab] = useState("devices");

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="mb-8 md:mb-10 flex items-center gap-3">
        <div className="p-3 bg-white text-[#6D28D9] rounded-2xl shadow-sm border border-gray-100">
          <SettingsIcon className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">الإعدادات والأمان</h2>
          <p className="text-slate-500 mt-1">إدارة حسابك، حماية أجهزتك، وتخصيص تجربتك</p>
        </div>
      </div>

      {/* Horizontal Pill Navigation Tabs */}
      <div className="flex flex-row overflow-x-auto gap-3 md:gap-4 mb-8 pb-2 custom-scrollbar">
        <button 
          onClick={() => setActiveTab("devices")}
          className={`flex-shrink-0 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold transition-all shadow-sm ${
            activeTab === "devices" 
              ? "bg-[#6D28D9] text-white shadow-[#6D28D9]/20" 
              : "bg-white text-slate-700 hover:bg-gray-50 border border-gray-100"
          }`}
        >
          <Shield className="w-5 h-5" /> أجهزتي المتصلة
        </button>
        
        <button 
          onClick={() => setActiveTab("account")}
          className={`flex-shrink-0 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold transition-all shadow-sm ${
            activeTab === "account" 
              ? "bg-[#6D28D9] text-white shadow-[#6D28D9]/20" 
              : "bg-white text-slate-700 hover:bg-gray-50 border border-gray-100"
          }`}
        >
          <User className="w-5 h-5" /> إعدادات الحساب
        </button>
        
        <button 
          onClick={() => setActiveTab("notifications")}
          className={`flex-shrink-0 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold transition-all shadow-sm ${
            activeTab === "notifications" 
              ? "bg-[#6D28D9] text-white shadow-[#6D28D9]/20" 
              : "bg-white text-slate-700 hover:bg-gray-50 border border-gray-100"
          }`}
        >
          <Bell className="w-5 h-5" /> الإشعارات
        </button>
      </div>

      {/* Settings Content Area */}
      <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 border border-gray-100 min-h-[500px]">
        
        {/* DEVICES TAB */}
        {activeTab === "devices" && (
          <div className="animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-slate-800 mb-2">أجهزتي المتصلة والحظر</h3>
            <p className="text-sm text-gray-500 mb-8 pb-4 border-b border-gray-100">
              راجع الأجهزة التي سجلت الدخول منها. يمكنك حظر أي جهاز غير معروف فوراً.
            </p>

            <div className="space-y-4">
              {MOCK_DEVICES.map((device) => (
                <div key={device.id} className={`flex flex-col lg:flex-row lg:items-center justify-between p-5 md:p-6 rounded-3xl border transition-all ${
                  device.isCurrent ? "bg-[#6D28D9]/5 border-[#6D28D9]/20" : "bg-white border-gray-200 hover:shadow-md"
                }`}>
                  <div className="flex items-start lg:items-center gap-5 mb-5 lg:mb-0">
                    <div className={`p-4 rounded-2xl shrink-0 ${device.isCurrent ? "bg-white text-[#6D28D9] shadow-sm border border-[#6D28D9]/20" : "bg-gray-50 text-slate-500 border border-gray-100"}`}>
                      {device.type === "mac" || device.type === "windows" ? <Monitor className="w-7 h-7" /> : 
                       device.type === "phone" ? <Smartphone className="w-7 h-7" /> : 
                       <Tablet className="w-7 h-7" />}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h4 className="font-extrabold text-lg text-slate-800 leading-none">{device.device}</h4>
                        {device.isCurrent && (
                          <span className="text-[10px] font-bold bg-[#6D28D9] text-white px-2.5 py-1 rounded-lg">الجهاز الحالي</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 font-semibold">
                        <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-gray-400" /> {device.browser}</span>
                        <span className="hidden sm:inline text-gray-300">•</span>
                        <span>{device.location} ({device.ip})</span>
                        <span className="hidden sm:inline text-gray-300">•</span>
                        <span className={device.isCurrent ? "text-[#6D28D9] font-bold" : ""}>{device.time}</span>
                      </div>
                    </div>
                  </div>
                  
                  {!device.isCurrent ? (
                    <button className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-red-50 border border-red-100 text-red-600 font-bold rounded-2xl hover:bg-red-100 hover:border-red-200 transition-colors shrink-0 shadow-sm whitespace-nowrap">
                      <Ban className="w-5 h-5" /> حظر الجهاز
                    </button>
                  ) : (
                    <div className="hidden lg:block w-[140px]"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACCOUNT TAB */}
        {activeTab === "account" && (
          <div className="animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-slate-800 mb-2">إعدادات الحساب والأمان</h3>
            <p className="text-sm text-gray-500 mb-8 pb-4 border-b border-gray-100">
              قم بتحديث معلوماتك الشخصية وتغيير كلمة المرور الخاصة بك.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
              {/* Profile Form */}
              <div className="space-y-6">
                <h4 className="font-bold text-slate-700 flex items-center gap-2 text-lg"><User className="w-5 h-5 text-[#6D28D9]" /> المعلومات الشخصية</h4>
                
                <div className="space-y-5 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">الإسم واللقب</label>
                    <input type="text" defaultValue="محمد الأمين" className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">المستوى الدراسي</label>
                    <input type="text" defaultValue="السنة الرابعة متوسط" className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف</label>
                    <input type="tel" defaultValue="0555123456" dir="ltr" className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all text-right shadow-sm" />
                  </div>
                  
                  <button className="flex items-center justify-center gap-2 w-full bg-[#6D28D9] text-white font-bold px-6 py-4 rounded-2xl hover:bg-[#5b21b6] transition-all shadow-md shadow-[#6D28D9]/20 mt-4">
                    <Save className="w-5 h-5" /> حفظ التعديلات
                  </button>
                </div>
              </div>

              {/* Password Form */}
              <div className="space-y-6">
                <h4 className="font-bold text-slate-700 flex items-center gap-2 text-lg"><Key className="w-5 h-5 text-[#6D28D9]" /> تغيير كلمة المرور</h4>
                
                <div className="space-y-5 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور الحالية</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">كلمة المرور الجديدة</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">تأكيد كلمة المرور</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all shadow-sm" />
                  </div>
                  
                  <button className="flex items-center justify-center w-full bg-white border-2 border-slate-200 text-slate-700 font-bold px-6 py-4 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm mt-4">
                    تحديث كلمة المرور
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div className="animate-in fade-in duration-300">
              <h3 className="text-xl font-bold text-slate-800 mb-2">تفضيلات الإشعارات</h3>
              <p className="text-sm text-gray-500 mb-8 pb-4 border-b border-gray-100">
                تحكم في كيفية وموعد تلقيك للتنبيهات من الأكاديمية.
              </p>

              <div className="space-y-5 max-w-2xl">
                
                {/* Toggle 1 */}
                <div className="flex items-center justify-between p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div>
                    <h4 className="font-extrabold text-slate-800 mb-1 text-lg">إشعارات التمارين اليومية</h4>
                    <p className="text-sm font-medium text-gray-500">تلقي تذكير يومي لإنجاز التمارين المطلوبة</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#6D28D9]"></div>
                  </label>
                </div>

                {/* Toggle 2 */}
                <div className="flex items-center justify-between p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div>
                    <h4 className="font-extrabold text-slate-800 mb-1 text-lg">إعلانات الأستاذ</h4>
                    <p className="text-sm font-medium text-gray-500">الحصول على تنبيهات عند إضافة دروس أو بث مباشر جديد</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#6D28D9]"></div>
                  </label>
                </div>

                {/* Toggle 3 */}
                <div className="flex items-center justify-between p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div>
                    <h4 className="font-extrabold text-slate-800 mb-1 text-lg">رسائل البريد الإلكتروني</h4>
                    <p className="text-sm font-medium text-gray-500">استلام تقرير التقدم الأسبوعي عبر البريد</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#6D28D9]"></div>
                  </label>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
  );
}
