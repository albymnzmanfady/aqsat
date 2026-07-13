"use client";

import { useState } from "react";
import { useNotifications, Notification } from "@/contexts/NotificationsContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  BellRing,
  CheckCheck,
  Trash2,
  AlertTriangle,
  Clock,
  Package,
  FileText,
  CreditCard,
  RefreshCw,
} from "lucide-react";

const priorityStyles = {
  high: "border-r-4 border-r-rose-400",
  medium: "border-r-4 border-r-amber-400",
  low: "border-r-4 border-r-blue-400",
};

const typeColors: Record<string, string> = {
  overdue_installment: "from-rose-500 to-pink-500",
  upcoming_installment: "from-amber-500 to-orange-500",
  low_stock: "from-amber-500 to-orange-500",
  out_of_stock: "from-rose-500 to-red-500",
  new_contract: "from-emerald-500 to-teal-500",
  payment_received: "from-violet-500 to-purple-500",
};

const typeIcons: Record<string, React.ElementType> = {
  overdue_installment: AlertTriangle,
  upcoming_installment: Clock,
  low_stock: Package,
  out_of_stock: Package,
  new_contract: FileText,
  payment_received: CreditCard,
};

interface NotificationsDropdownProps {
  triggerClassName?: string;
}

const NotificationsDropdown = ({ triggerClassName }: NotificationsDropdownProps) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    refreshNotifications,
    navigateToNotification,
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = (notification: Notification) => {
    navigateToNotification(notification);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative h-10 w-10 rounded-xl active:scale-90", triggerClassName)}
        >
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5 text-violet-600 animate-pulse" />
          ) : (
            <Bell className="h-5 w-5 text-slate-600" />
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -left-0.5 flex items-center justify-center">
              <span className="absolute h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
              <span className="relative flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-bold shadow-md">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[380px] max-h-[70vh] overflow-hidden rounded-2xl p-0 shadow-2xl shadow-slate-200/50 border border-slate-100"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-gradient-to-l from-violet-50 to-purple-50/50">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-violet-600" />
            <h3 className="font-bold text-slate-800 text-sm">الإشعارات</h3>
            {unreadCount > 0 && (
              <Badge className="bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0 rounded-lg text-[10px] px-1.5 py-0">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 rounded-lg text-xs gap-1 text-violet-600 hover:text-violet-700 hover:bg-violet-50"
              onClick={() => { refreshNotifications(); }}
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 rounded-lg text-xs gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                onClick={markAllAsRead}
              >
                <CheckCheck className="h-3 w-3" />
                قراءة الكل
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-[55vh]">
          {notifications.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-500 font-medium">لا توجد إشعارات</p>
              <p className="text-xs text-slate-400 mt-1">كل شيء يعمل بشكل طبيعي ✅</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = typeIcons[notification.type] || Bell;
              const gradientColor = typeColors[notification.type] || "from-slate-500 to-gray-500";

              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 cursor-pointer transition-all duration-200 hover:bg-slate-50/80 border-b border-slate-50",
                    !notification.read && "bg-violet-50/30",
                    priorityStyles[notification.priority]
                  )}
                >
                  {/* Icon */}
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br shadow-sm text-sm",
                    gradientColor
                  )}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-sm">{notification.icon}</span>
                      <p className={cn(
                        "text-sm truncate",
                        !notification.read ? "font-bold text-slate-800" : "font-medium text-slate-600"
                      )}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {notification.message}
                    </p>
                  </div>

                  {/* Remove button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-lg flex-shrink-0 opacity-0 group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-500 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {notifications.filter(n => !n.read).length} غير مقروء من {notifications.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 rounded-lg text-xs text-violet-600 hover:text-violet-700 hover:bg-violet-50"
                onClick={markAllAsRead}
              >
                <CheckCheck className="h-3 w-3 ml-1" />
                تحديد الكل كمقروء
              </Button>
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;