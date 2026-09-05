"use client";

import { useState } from "react";
import { updateSubscriptionRequestStatus } from "@/actions/subscription";
import { CreditCard, Check, X, Clock, MapPin, Phone, GraduationCap, BookOpen, AlertCircle, RefreshCw, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { getWilayaName } from "@/lib/constants";

type RequestType = {
  id: string;
  studentId: string;
  subjectIds: string[];
  level: string;
  stream: string;
  wilaya: string;
  baladiya: string | null;
  address: string;
  phoneNumber: string;
  status: string;
  createdAt: Date;
  student: {
    fullName: string;
    phoneNumber: string;
    avatarUrl: string | null;
  };
};

export function SubscriptionRequestsList({ 
  initialRequests,
  subjectMap
}: { 
  initialRequests: any[];
  subjectMap: Record<string, string>;
}) {
  const [requests, setRequests] = useState<RequestType[]>(initialRequests);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const router = useRouter();

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setIsUpdating(id);
    const result = await updateSubscriptionRequestStatus(id, newStatus);
    
    if (result.error) {
      alert(result.error);
    } else {
      alert("تم تحديث حالة الطلب بنجاح");
      setRequests(requests.map(req => 
        req.id === id ? { ...req, status: newStatus } : req
      ));
      router.refresh();
    }
    setIsUpdating(null);
  };

  const pendingRequests = requests.filter(r => r.status === "PENDING");
  const otherRequests = requests.filter(r => r.status !== "PENDING");

  return (
    <div className="space-y-6">
      
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-2xl flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold mb-1">إجمالي الطلبات</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{requests.length}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-2xl flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold mb-1">قيد الانتظار</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{pendingRequests.length}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-2xl flex items-center justify-center shrink-0">
            <Check className="w-6 h-6" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold mb-1">تمت المعالجة</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{otherRequests.length}</h3>
          </div>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
          <div className="w-20 h-20 bg-slate-50 text-slate-400 dark:bg-slate-800 mx-auto rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">لا توجد طلبات اشتراك</h2>
          <p className="text-slate-500 mt-2">عندما يقوم الطلاب بطلب اشتراك ستظهر هنا</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {requests.map((request) => (
            <div key={request.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-6">
              
              {/* Student Info */}
              <div className="md:w-1/3 flex flex-col gap-4 border-b md:border-b-0 md:border-l border-slate-100 dark:border-slate-800 pb-6 md:pb-0 md:pl-6">
                <div className="flex items-center gap-4">
                  {request.student.avatarUrl ? (
                    <img src={request.student.avatarUrl} alt="" className="w-14 h-14 rounded-full object-cover border border-slate-200" />
                  ) : (
                    <div className="w-14 h-14 bg-sky-100 text-sky-700 font-bold rounded-full flex items-center justify-center text-xl shrink-0">
                      {request.student.fullName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{request.student.fullName}</h3>
                    <div className="flex items-center gap-2 mt-1 text-slate-500 text-sm">
                      <GraduationCap className="w-4 h-4" />
                      <span>{request.level} - {request.stream}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mt-2">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <Phone className="w-4 h-4 text-emerald-500" />
                    <span dir="ltr" className="font-medium">{request.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    <span className="font-medium">{getWilayaName(request.wilaya)}{request.baladiya ? ` - ${request.baladiya}` : ''} - {request.address}</span>
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div className="md:w-2/3 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-sky-500" />
                      المواد المطلوبة
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {request.subjectIds.map(id => (
                        <span key={id} className="bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 px-3 py-1.5 rounded-lg text-sm font-bold border border-sky-100 dark:border-sky-800">
                          {subjectMap[id] || "مادة غير معروفة"}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="shrink-0">
                    {request.status === "PENDING" && (
                      <span className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        قيد الانتظار
                      </span>
                    )}
                    {request.status === "ACCEPTED" && (
                      <span className="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        مقبول
                      </span>
                    )}
                    {request.status === "DELIVERED" && (
                      <span className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                        <Send className="w-3.5 h-3.5" />
                        تم التوصيل
                      </span>
                    )}
                    {request.status === "REJECTED" && (
                      <span className="bg-rose-100 text-rose-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                        <X className="w-3.5 h-3.5" />
                        مرفوض
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-auto pt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-medium text-slate-400 flex-1">
                    تاريخ الطلب: {new Date(request.createdAt).toLocaleDateString('ar-DZ')}
                  </span>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 w-full sm:w-auto">
                    {request.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(request.id, "ACCEPTED")}
                          disabled={isUpdating === request.id}
                          className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                        >
                          {isUpdating === request.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          قبول الطلب
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(request.id, "REJECTED")}
                          disabled={isUpdating === request.id}
                          className="flex-1 sm:flex-none bg-rose-50 text-rose-600 hover:bg-rose-100 px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          رفض
                        </button>
                      </>
                    )}
                    
                    {request.status === "ACCEPTED" && (
                      <button
                        onClick={() => handleStatusUpdate(request.id, "DELIVERED")}
                        disabled={isUpdating === request.id}
                        className="flex-1 sm:flex-none bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                      >
                        {isUpdating === request.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        تم التوصيل / التسليم
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
