// Utility functions for date and time formatting

export const formatTime = (date) => {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false 
  });
};

export const formatDate = (date) => {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = String(date.getFullYear()).slice(-2);
  return `${d}-${m}-${y}`;
};

export const formatDateTime = (date) => {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = String(date.getFullYear()).slice(-2);
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${d}-${m}-${y} ${h}:${min}:${s}`;
};

export const calculateAgeStats = (birthDate) => {
  const now = new Date();
  const birth = new Date(birthDate);
  
  // Calculate age properly (accounting for whether birthday has passed this year)
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();
  
  // Adjust for negative days
  if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  
  // Adjust for negative months
  if (months < 0) {
    years--;
    months += 12;
  }
  
  // Calculate total seconds lived
  const totalSecondsBorn = Math.floor((now - birth) / 1000);
  const secondsInYear = 365.25 * 24 * 60 * 60;
  const yearsAsDecimal = totalSecondsBorn / secondsInYear;
  
  // Calculate 80th birthday
  const eightieth = new Date(birth);
  eightieth.setFullYear(eightieth.getFullYear() + 80);
  
  // Time remaining until 80th birthday
  const remainingMs = eightieth - now;
  const remainingSeconds = Math.floor(remainingMs / 1000);
  const remainingDays = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
  const remainingWeeks = Math.floor(remainingDays / 7);
  const remainingSundays = Math.ceil(remainingDays / 7);
  
  // Estimate remaining life (assuming 80 years)
  const estimatedLifespan = 80;
  const remainingYears = Math.max(0, estimatedLifespan - yearsAsDecimal);
  const totalLifeSeconds = estimatedLifespan * secondsInYear;
  
  // Calculate remaining months and days for display until next birthday
  let nextBday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
  if (nextBday < now) {
    nextBday.setFullYear(nextBday.getFullYear() + 1);
  }
  
  const remainingToBday = nextBday - now;
  const remDaysUntilBday = Math.ceil(remainingToBday / (1000 * 60 * 60 * 24));
  let remMonthsUntilBday = nextBday.getMonth() - now.getMonth();
  if (remMonthsUntilBday < 0) remMonthsUntilBday += 12;
  
  return {
    years,
    months,
    days,
    totalSecondsBorn,
    yearsAsDecimal,
    remainingYears,
    progressPercentage: (yearsAsDecimal / estimatedLifespan) * 100,
    remainingSeconds,
    totalLifeSeconds,
    remainingDays,
    remainingWeeks,
    remainingSundays,
    remainingMonths: remMonthsUntilBday,
    remainingDaysDisplay: remDaysUntilBday,
    eightieth
  };
};
