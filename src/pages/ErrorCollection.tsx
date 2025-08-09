import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MathProblem, getErrorProblems, removeErrorProblem, clearErrorProblems } from '@/lib/utils';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ErrorCollectionPage() {
  const [errors, setErrors] = useState<MathProblem[]>([]);
  
  useEffect(() => {
    loadErrors();
  }, []);
  
  const loadErrors = () => {
    const errorProblems = getErrorProblems();
    setErrors(errorProblems);
  };
  
  const handleRemoveError = (id: string) => {
    removeErrorProblem(id);
    loadErrors();
    toast.success('错题已移除');
  };
  

  
  if (errors.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-5xl text-gray-300 mb-4">
            <i class="fa-solid fa-check-circle"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">暂无错题</h2>
          <p className="text-gray-500 mb-6">做得很棒！继续保持练习</p>
          <Link 
            to="/" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回练习
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 py-4 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white p-6">
          <h1 className="text-2xl font-bold mb-1">错题集</h1>
  <p className="opacity-90">练习并消除错题，提升计算能力</p>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">共 {errors.length} 道错题</h2>
           <div className="flex gap-2">
               <Link
                 to="/practice-errors" 
                 className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
               >
                 <i class="fa-solid fa-pencil mr-1"></i> 错题消除
               </Link>
               <Link
                 to="/" 
                 className="text-sm px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
               >
                 <i class="fa-solid fa-home mr-1"></i> 返回首页
               </Link>
             

            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {errors.map((problem) => (
              <motion.div 
                key={problem.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all flex justify-between items-center"
              >
                <div className="text-lg font-medium">
                  {problem.num1} {problem.operator} {problem.num2} = {problem.result}
                </div>
                 <span className="text-gray-400 cursor-not-allowed" title="错题只能通过全部答对后消除">
                   <i class="fa-solid fa-lock"></i>
                 </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}