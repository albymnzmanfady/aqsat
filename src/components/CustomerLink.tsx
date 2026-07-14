"use client";

import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface CustomerLinkProps {
  customerId?: number;
  customerName: string;
  className?: string;
  showOnHover?: boolean;
}

const CustomerLink = ({ customerId, customerName, className, showOnHover = false }: CustomerLinkProps) => {
  const navigate = useNavigate();

  if (!customerId) {
    return <span className={className}>{customerName}</span>;
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/customers/${customerId}`);
      }}
      className={cn(
        "text-inherit font-inherit transition-all duration-200 rounded-lg px-1.5 py-0.5 -mx-1.5 hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:text-violet-600 dark:hover:text-violet-400 cursor-pointer",
        showOnHover && "group-hover:bg-violet-50 dark:group-hover:bg-violet-950/30 group-hover:text-violet-600 dark:group-hover:text-violet-400",
        className
      )}
    >
      {customerName}
    </button>
  );
};

export default CustomerLink;