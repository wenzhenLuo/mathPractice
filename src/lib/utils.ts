import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// 定义数据模型类型
export interface MathProblem {
  id: string;
  num1: number;
  num2: number;
  operator: '+' | '-';
  result: number;
  userAnswer?: number;
  isCorrect?: boolean;
}

export interface PracticeRecord {
  id: string;
  timestamp: Date;
  score: number;
  total: number;
  accuracy: number;
}

// 本地存储相关函数
export const STORAGE_KEYS = {
  HISTORY: 'mathPracticeHistory',
  ERRORS: 'mathErrorProblems',
  DAILY_PRACTICE_COUNT: 'dailyPracticeCount',
  LAST_PRACTICE_DATE: 'lastPracticeDate'
};

// 保存练习记录
export function savePracticeRecord(score: number, total: number): void {
  const record: PracticeRecord = {
    id: Date.now().toString(),
    timestamp: new Date(),
    score,
    total,
    accuracy: (score / total) * 100
  };
  
  const history = getPracticeHistory();
  history.unshift(record); // 添加到数组开头
  
  // 限制历史记录数量为100条
  if (history.length > 100) {
    history.pop();
  }
  
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
}

// 获取练习历史记录
export function getPracticeHistory(): PracticeRecord[] {
  const historyJson = localStorage.getItem(STORAGE_KEYS.HISTORY);
  return historyJson ? JSON.parse(historyJson) : [];
}

// 保存错题
export function saveErrorProblems(problems: MathProblem[]): void {
  const errors = getErrorProblems();
  const newErrors = problems.filter(p => !p.isCorrect);
  
  // 添加新错题，避免重复
  newErrors.forEach(newError => {
    if (!errors.some(e => e.id === newError.id)) {
      errors.push(newError);
    }
  });
  
  localStorage.setItem(STORAGE_KEYS.ERRORS, JSON.stringify(errors));
}

// 获取错题集
export function getErrorProblems(): MathProblem[] {
  const errorsJson = localStorage.getItem(STORAGE_KEYS.ERRORS);
  return errorsJson ? JSON.parse(errorsJson) : [];
}

// 清除特定错题
export function removeErrorProblem(id: string): void {
  const errors = getErrorProblems();
  const updatedErrors = errors.filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEYS.ERRORS, JSON.stringify(updatedErrors));
}

// 获取今天的日期字符串（YYYY-MM-DD）
export function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// 检查并重置每日练习次数（如果跨天）
export function checkAndResetDailyCount(): void {
  const today = getTodayDateString();
  const lastDate = localStorage.getItem(STORAGE_KEYS.LAST_PRACTICE_DATE);
  
  if (lastDate !== today) {
    localStorage.setItem(STORAGE_KEYS.DAILY_PRACTICE_COUNT, '0');
    localStorage.setItem(STORAGE_KEYS.LAST_PRACTICE_DATE, today);
  }
}

// 增加每日练习次数
export function incrementDailyPracticeCount(): void {
  checkAndResetDailyCount();
  const currentCount = parseInt(localStorage.getItem(STORAGE_KEYS.DAILY_PRACTICE_COUNT) || '0', 10);
  localStorage.setItem(STORAGE_KEYS.DAILY_PRACTICE_COUNT, (currentCount + 1).toString());
}

// 获取当前每日练习次数
export function getDailyPracticeCount(): number {
  checkAndResetDailyCount();
  return parseInt(localStorage.getItem(STORAGE_KEYS.DAILY_PRACTICE_COUNT) || '0', 10);
}

// 检查是否达到每日练习限制
export function hasReachedDailyLimit(): boolean {
  return getDailyPracticeCount() >= 3;
}

// 检查是否可以进行新的每日练习（考虑错题数量）
export function canPracticeNewProblems(): boolean {
  const errorCount = getErrorProblems().length;
  return errorCount < 100;
}

// 从错题集中消除指定数量的错题
export function eliminateErrorProblems(count: number): MathProblem[] {
  const errors = getErrorProblems();
  if (count >= errors.length) {
    localStorage.removeItem(STORAGE_KEYS.ERRORS);
    return [];
  }
  
  // 保留后面的错题，移除前面的count个
  const remainingErrors = errors.slice(count);
  localStorage.setItem(STORAGE_KEYS.ERRORS, JSON.stringify(remainingErrors));
  return remainingErrors;
}

// 清除所有错题
export function clearErrorProblems(): void {
  localStorage.removeItem(STORAGE_KEYS.ERRORS);
}

// 清除所有错题（已禁用，仅供内部使用）


// 工具函数：合并classnames
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}