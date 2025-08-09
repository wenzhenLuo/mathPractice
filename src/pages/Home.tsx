import { useState, useEffect } from 'react';
import MathProblemGenerator from '@/components/MathProblemGenerator';
import { Link } from 'react-router-dom';
import { getDailyPracticeCount, getErrorProblems } from '@/lib/utils';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 py-4 px-4">
      <div className="max-w-2xl mx-auto mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">选择练习模式</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Link to="/" className="p-6 bg-blue-600 text-white rounded-xl text-center hover:bg-blue-700 transition-all transform hover:scale-105 active:scale-95">
              <i class="fa-solid fa-calculator text-3xl mb-3"></i>
              <div className="text-lg">常规练习</div>
            </Link>
            <Link to="/history" className="p-6 bg-green-600 text-white rounded-xl text-center hover:bg-green-700 transition-all transform hover:scale-105 active:scale-95">
              <i class="fa-solid fa-history text-3xl mb-3"></i>
              <div className="text-lg">练习记录</div>
            </Link>
           <Link to="/errors" className="p-6 bg-orange-600 text-white rounded-xl text-center hover:bg-orange-700 transition-all transform hover:scale-105 active:scale-95">
               <i class="fa-solid fa-exclamation-circle text-3xl mb-3"></i>
               <div className="text-lg">错题消除</div>
             </Link>
          </div>
        </div>
         
         {/* 显示每日练习次数和错题数量 */}
         <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
           <div className="flex justify-between items-center">
             <div className="flex items-center">
               <i class="fa-solid fa-calendar-day text-blue-500 mr-2"></i>
               <span className="text-gray-700">今日练习次数: {getDailyPracticeCount()}/3</span>
             </div>
             <div className="flex items-center">
               <i class="fa-solid fa-exclamation-circle text-orange-500 mr-2"></i>
               <span className={`text-gray-700 ${getErrorProblems().length >= 100 ? 'text-red-600 font-bold' : ''}`}>
                 错题数量: {getErrorProblems().length}/100
               </span>
             </div>
           </div>
           {getErrorProblems().length >= 100 && (
             <div className="mt-2 text-sm text-red-500 flex items-center">
               <i class="fa-solid fa-info-circle mr-1"></i>
               错题数量已达上限，请先练习错题
             </div>
           )}
         </div>
         
         <MathProblemGenerator />
       </div>
    </div>
  );
}