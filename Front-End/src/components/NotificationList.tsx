
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getNotifications, markNotificationRead, deleteNotification } from '@/api/notifications';
import { useToast } from '@/hooks/use-toast';

const NotificationList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Notification deleted",
        description: "The notification has been removed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete notification",
        variant: "destructive",
      });
    }
  });

  const handleMarkRead = (id: number) => {
    markReadMutation.mutate(id);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const notificationList = notifications?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-6">
        <Bell className="w-5 h-5" />
        <h2 className="text-lg font-semibold">Notifications</h2>
        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
          {notificationList.length}
        </span>
      </div>

      {notificationList.length === 0 ? (
        <Card className="p-6 text-center">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No notifications yet</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notificationList.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 ${notification.isRead ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className={`${notification.isRead ? 'text-gray-700' : 'text-blue-900 font-medium'}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                    {new Date(notification.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkRead(notification.id)}
                      disabled={markReadMutation.isPending}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(notification.id)}
                    disabled={deleteMutation.isPending}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationList;
