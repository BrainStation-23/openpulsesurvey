
import { useState } from "react";
import { DayPickerSingleProps, ActiveModifiers } from "react-day-picker";
import type { MouseEvent } from 'react';

export function useCalendarState(props: DayPickerSingleProps) {
  const [viewMode, setViewMode] = useState<"days" | "months" | "years">("days");
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  const handleYearSelect = (year: number) => {
    if (props.selected instanceof Date && props.mode === "single") {
      const newDate = new Date(props.selected);
      newDate.setFullYear(year);
      props.onSelect?.(newDate, props.selected, {} as ActiveModifiers, {} as React.MouseEvent<Element, MouseEvent>);
    }
    setCurrentYear(year);
    setViewMode("months");
  };

  const handleMonthSelect = (monthIndex: number) => {
    if (props.selected instanceof Date && props.mode === "single") {
      const newDate = new Date(props.selected);
      newDate.setMonth(monthIndex);
      props.onSelect?.(newDate, props.selected, {} as ActiveModifiers, {} as React.MouseEvent<Element, MouseEvent>);
    }
    setCurrentMonth(monthIndex);
    setViewMode("days");
  };

  const handleTodayClick = () => {
    const today = new Date();
    if (props.mode === "single") {
      props.onSelect?.(today, props.selected, {} as ActiveModifiers, {} as React.MouseEvent<Element, MouseEvent>);
    }
  };

  const handleHeaderClick = () => {
    setViewMode(viewMode === "days" ? "months" : "years");
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return {
    viewMode,
    currentYear,
    currentMonth,
    handleYearSelect,
    handleMonthSelect,
    handleTodayClick,
    handleHeaderClick,
    handlePrevMonth,
    handleNextMonth,
  };
}
