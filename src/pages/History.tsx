import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PracticeRecord, getPracticeHistory } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function HistoryPage() {
  const [history, setHistory] = useState<PracticeRecord[]>([]);
  
  useEffect(() => {
    const practiceHistory = getPracticeHistory();
    setHistory(practiceHistory);
  }, []);
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-5xl text-gray-300 mb-4">
            <i class="fa-solid fa-clock-rotate-left"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">暂无练习记录</h2>
          <p className="text-gray-500 mb-6">完成口算练习后，这里将显示您的练习历史</p>
          <Link 
            to="/" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            开始练习
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 py-4 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6">
          <h1 className="text-2xl font-bold mb-1">练习历史记录</h1>
          <p className="opacity-90">查看您的练习成绩和进度</p>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">共 {history.length} 条记录</h2>
            <Link 
              to="/" 
              className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i class="fa-solid fa-arrow-left mr-1"></i> 返回练习
            </Link>
          </div>
          
          <div className="space-y-4">
            {history.map((record) => (
              <motion.div 
                key={record.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-800">{formatDate(record.timestamp)}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    record.accuracy === 100 
                      ? 'bg-green-100 text-green-800' 
                      : record.accuracy >= 70
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {record.accuracy}% 正确率
                  </span>
                </div>
                <div className="text-gray-600">
                  得分: <span className="font-semibold">{record.score}</span>/{record.total}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}