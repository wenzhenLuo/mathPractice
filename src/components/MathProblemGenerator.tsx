import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { cn, savePracticeRecord, saveErrorProblems, getErrorProblems, incrementDailyPracticeCount, canPracticeNewProblems, hasReachedDailyLimit, STORAGE_KEYS } from '@/lib/utils';

// 定义算式类型
interface MathProblem {
  id: string;
  num1: number;
  num2: number;
  operator: '+' | '-';
  result: number;
  userAnswer?: number;
  isCorrect?: boolean;
}

import { useLocation, useNavigate } from 'react-router-dom';

export default function MathProblemGenerator({ practiceErrors = false }: { practiceErrors?: boolean }) {
  // 状态管理
  const [problems, setProblems] = useState<MathProblem[]>([]);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [allAnswered, setAllAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const location = useLocation();
  const navigate = useNavigate();
  const [showEliminateOptions, setShowEliminateOptions] = useState<boolean>(false);
  const [selectedErrors, setSelectedErrors] = useState<string[]>([]);
  
  // 生成随机两位数 (10-99)
  const generateTwoDigitNumber = (): number => {
    return Math.floor(Math.random() * 90) + 10;
  };
  
  // 生成随机运算符
  const generateOperator = (): '+' | '-' => {
    return Math.random() > .5 ? '+' : '-';
  };
  
  // 生成唯一的算式ID
  
  const generateProblemId = (num1: number, num2: number, operator: '+' | '-'): string => {
    return `${num1}${operator}${num2}`;
  };
  
  // 检查算式是否已存在
  const isProblemDuplicate = (id: string, existingProblems: MathProblem[]): boolean => {
    return existingProblems.some(problem => problem.id === id);
  };
  
  // 生成单个算式
  const generateProblem = (existingProblems: MathProblem[]): MathProblem => {
    let num1: number, num2: number, operator: '+' | '-', result: number, id: string;
    
    do {
      num1 = generateTwoDigitNumber();
      num2 = generateTwoDigitNumber();
      operator = generateOperator();
      
      // 减法确保结果非负
      if (operator === '-' && num1 < num2) {
        [num1, num2] = [num2, num1]; // 交换两个数
      }
      
      // 计算结果
      result = operator === '+' ? num1 + num2 : num1 - num2;
      
      // 确保结果在100以内
      if (result > 100) continue;
      
      id = generateProblemId(num1, num2, operator);
    } while (isProblemDuplicate(id, existingProblems));
    
    return { id, num1, num2, operator, result };
  };
  
  // 生成10个不重复的算式
  const generateProblems = () => {
    const newProblems: MathProblem[] = [];
    
    while (newProblems.length < 10) {
      const problem = generateProblem(newProblems);
      newProblems.push(problem);
    }
    
    setProblems(newProblems);
    setIsChecking(false);
    setScore(0);
  };
  
  // 处理答案输入变化
  const handleAnswerChange = (id: string, value: string) => {
    // If value is empty, set to undefined
    if (!value) {
      setProblems(prevProblems => 
        prevProblems.map(problem => 
          problem.id === id 
            ? { ...problem, userAnswer: undefined } 
            : problem
        )
      );
      return;
    }
    
    const numericValue = parseInt(value, 10);
    
    // Check if the value is negative
    if (numericValue < 0) {
      toast.error('答案不能为负数');
      return; // Don't update the state with negative values
    }
    
    setProblems(prevProblems => 
      prevProblems.map(problem => 
        problem.id === id 
          ? { ...problem, userAnswer: numericValue } 
          : problem
      )
    );
  };
  
  // 检查所有答案
  const checkAnswers = () => {
    setIsChecking(true);
    
    // 计算得分
    const newScore = problems.reduce((acc, problem) => {
      const isCorrect = problem.userAnswer === problem.result;
      return isCorrect ? acc + 1 : acc;
    }, 0);
    
     setScore(newScore);
     
      // 更新每个问题的正确性状态
      const updatedProblems = problems.map(problem => ({
        ...problem,
        isCorrect: problem.userAnswer === problem.result
      }));
     
     setProblems(updatedProblems);
     
      // 保存练习记录和错题
      savePracticeRecord(newScore, problems.length);
      
      // 如果是错题练习且全部答对，允许消除两个错题
      if (practiceErrors && newScore === problems.length) {
        toast.success('太棒了！全部答对！🎉 您可以消除两道错题！');
        setShowEliminateOptions(true);
        
        // 如果不是错题练习，增加每日练习次数
      } else if (!practiceErrors) {
        incrementDailyPracticeCount();
        saveErrorProblems(updatedProblems);
      } else {
        saveErrorProblems(updatedProblems);
      }
      
      // 显示结果提示
      if (!practiceErrors) {
        if (newScore === 10) {
          toast.success('太棒了！全部答对！🎉');
        } else if (newScore > 5) {
          toast.success(`不错哦！答对了 ${newScore} 道题！继续加油！`);
        } else {
          toast.info(`答对了 ${newScore} 道题，再试一次吧！`);
        }
      }
   }
  
  // 检查是否所有问题都已回答
  useEffect(() => {
    
    const allAnswered = problems.every(problem => problem.userAnswer !== undefined);
    setAllAnswered(allAnswered);
  }, [problems]);
  
   // 初始生成问题或加载错题
   useEffect(() => {
      if (practiceErrors) {
        const errorProblems = getErrorProblems();
        setSelectedErrors([]);
        setShowEliminateOptions(false);
        
        if (errorProblems.length > 0) {
          // 如果错题数量不足10题，只使用现有错题
         setProblems(errorProblems.slice(0, 10));
        } else {
          toast.info('没有错题可以练习！');
          navigate('/errors');
        }
      } else {
        // 检查是否可以进行新的每日练习
        if (!canPracticeNewProblems()) {
          toast.error('错题数量已达100道，请先练习并消除错题后再进行新的练习！');
          navigate('/errors');
          return;
        }
        
        // 检查是否达到每日练习限制
        if (hasReachedDailyLimit()) {
          toast.info('今日练习次数已达上限（3次），建议休息一下！可以去练习错题哦~');
          navigate('/errors');
          return;
        }
        
        generateProblems();
      }
   }, [practiceErrors, navigate]);
   
  return (
    <div className="w-full mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* 头部 */}
       <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
          <h1 className="text-2xl font-bold mb-1">{practiceErrors ? '错题消除' : '儿童口算练习'}</h1>
         <p className="opacity-90">
            {practiceErrors 
              ? '练习错题，全部答对可消除错题' 
              : '100以内两位数加减法练习'}
         </p>
       </div>
       
      {/* 内容区域 */}      
      <div className="p-6">
        {/* 控制区域 */}
         <div className="flex justify-between items-center mb-8">
           <div className="text-sm text-gray-500">
             {practiceErrors 
               ? `共${problems.length}题 | ${isChecking ? `得分: ${score}/${problems.length}` : '请输入答案'}` 
               : `共10题 | ${isChecking ? `得分: ${score}/10` : '请输入答案'}`}
           </div>
           
           {location.pathname !== '/' && (
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium mr-2"
              >
                <i class="fa-solid fa-arrow-left mr-1"></i> 返回
              </button>
           )}
           
          <div className="flex gap-2">
            <button
              onClick={generateProblems}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              <i class="fa-solid fa-refresh mr-1"></i> 换一组
            </button>
            
            <button
              onClick={checkAnswers}
              disabled={!allAnswered || isChecking}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fa-solid fa-check mr-1"></i> 检查答案
            </button>
          </div>
        </div>
        
        {/* 题目列表 */}
        <div className="space-y-4">
          {problems.map((problem, index) => (
            <div 
              key={problem.id}
              className={`p-4 rounded-xl border transition-all duration-300 ${
                isChecking 
                  ? problem.isCorrect 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-五十' 
                  : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 font-medium text-sm">
                    {index + 1}
                  </span>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-xl font-medium">{problem.num1}</span>
                    <span className="text-xl font-medium">{problem.operator}</span>
                    <span className="text-xl font-medium">{problem.num2}</span>
                    <span className="text-xl font-medium">=</span>
                    
                     <input
                      type="number"
                      min="0"
                      value={problem.userAnswer ?? ''}
                      onChange={(e) => handleAnswerChange(problem.id, e.target.value)}
                      disabled={isChecking}
                      className={`w-20 h-14 text-center text-xl border rounded-lg ${isChecking ? problem.isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`}
                    />
                  </div>
                </div>
                
                {/* Correct answer display (only after checking) */}
                {isChecking && (
                  <div className={`flex items-center ${
                    problem.isCorrect 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {problem.isCorrect ? (
                      <i class="fa-solid fa-check-circle mr-1"></i>
                    ) : (
                      <>
                        <i class="fa-solid fa-times-circle mr-1"></i>                        
                        <span className="font-medium">正确答案: {problem.result}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Result feedback (displayed after checking) */}
         {isChecking && (
           <>
             <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className={`mt-8 p-4 rounded-xl text-center ${
                 score === problems.length 
                   ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white' 
                   : score > problems.length / 2
                     ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                     : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
               }`}
             >
               <h3 className="text-xl font-bold mb-2">
                  {score === problems.length 
                   ? '太棒了！全部正确！' 
                   : score > problems.length / 2
                     ? `不错哦！得分 ${score}/${problems.length}`
                     : `继续努力！得分 ${score}/${problems.length}`}
               </h3>
               <p>
                 {score === problems.length 
                   ? '你真是个数学小天才！' 
                   : score > problems.length / 2
                     ? '继续练习，你会越来越棒！'
                     : '多练习就能提高口算能力！'}
               </p>
             </motion.div>
             
             {practiceErrors && showEliminateOptions && score === problems.length && (
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200"
               >
                 <h4 className="text-lg font-semibold text-blue-800 mb-3">恭喜！可以消除2道错题</h4>
                 <p className="text-blue-700 mb-4">请选择要消除的错题：</p>
                 
                 <div className="grid grid-cols-2 gap-2 mb-4">
                   {problems.slice(0, 10).map((problem) => (
                     <label key={problem.id} className="flex items-center p-2 border rounded-lg cursor-pointer hover:bg-blue-100">
                       <input
                         type="checkbox"
                         value={problem.id}
                         checked={selectedErrors.includes(problem.id)}
                         onChange={(e) => {
                           if (e.target.checked) {
                             if (selectedErrors.length < 2) {
                               setSelectedErrors([...selectedErrors, e.target.value]);
                             }
                           } else {
                             setSelectedErrors(selectedErrors.filter(id => id !== e.target.value));
                           }
                         }}
                         className="mr-2"
                       />
                       <span className="text-sm">{problem.num1} {problem.operator} {problem.num2} = {problem.result}</span>
                     </label>
                   ))}
                 </div>
                 
                 <button
                   onClick={() => {
                     if (selectedErrors.length === 2) {
                       // 从错题集中移除选中的错题
                       const errors = getErrorProblems();
                       const remainingErrors = errors.filter(e => !selectedErrors.includes(e.id));
                       localStorage.setItem(STORAGE_KEYS.ERRORS, JSON.stringify(remainingErrors));
                       
                       toast.success('已成功消除2道错题！');
                       setShowEliminateOptions(false);
                       setSelectedErrors([]);
                       
                       // 如果还有错题，重新加载错题练习
                       const remainingErrorCount = getErrorProblems().length;
                       if (remainingErrorCount > 0) {
                         const newErrorProblems = getErrorProblems().slice(0, 10);
                         setProblems(newErrorProblems);
                         setIsChecking(false);
                         setScore(0);
                       } else {
                         navigate('/errors');
                       }
                     } else {
                       toast.warning('请选择2道要消除的错题');
                     }
                   }}
                   disabled={selectedErrors.length !== 2}
                   className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   确认消除选中的错题
                 </button>
               </motion.div>
             )}
           </>
         )}
      </div>
    </div>    
  );
}