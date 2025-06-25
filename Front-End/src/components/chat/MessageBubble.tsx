
import React from 'react';
import { ChatMessage } from '@/api/chat';
import { FileText, Download, Image as ImageIcon, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageBubbleProps {
  message: ChatMessage;
  isCurrentUser: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isCurrentUser }) => {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderAttachment = (attachment: any) => {
    switch (attachment.fileType) {
      case 'IMAGE':
        return (
          <div className="mt-2">
            <img
              src={attachment.fileUrl}
              alt={attachment.fileName}
              className="max-w-xs rounded-lg cursor-pointer"
              onClick={() => window.open(attachment.fileUrl, '_blank')}
            />
          </div>
        );
      
      case 'PDF':
        return (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2 flex items-center space-x-3">
            <FileText className="w-8 h-8 text-red-500" />
            <div className="flex-1">
              <div className="font-medium text-red-700">{attachment.fileName}</div>
              <div className="text-sm text-red-500">
                {attachment.fileSize ? `${(attachment.fileSize / 1024 / 1024).toFixed(1)} MB` : 'PDF'}
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => downloadFile(attachment.fileUrl, attachment.fileName)}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        );
      
      case 'AUDIO':
        return (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
            <div className="flex items-center space-x-3">
              <Mic className="w-6 h-6 text-green-500" />
              <div className="flex-1">
                <audio controls className="w-full">
                  <source src={attachment.fileUrl} />
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2 flex items-center space-x-3">
            <FileText className="w-8 h-8 text-blue-500" />
            <div className="flex-1">
              <div className="font-medium text-blue-700">{attachment.fileName}</div>
              <div className="text-sm text-blue-500">Document</div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => downloadFile(attachment.fileUrl, attachment.fileName)}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        );
    }
  };

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-2' : 'order-1'}`}>
        {!isCurrentUser && (
          <div className="flex items-center mb-1">
            <div className="w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center text-white text-xs font-medium">
              {message.user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="ml-2 text-xs font-medium text-gray-600">
              {message.user?.name?.split(' ')[0]}
            </span>
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
              message.user?.role?.toLowerCase() === 'admin'
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {message.user?.role?.toLowerCase() === 'admin' ? 'Admin' : 'Vendor'}
            </span>
          </div>
        )}
        
        <div className={`rounded-2xl px-4 py-2 ${
          isCurrentUser 
            ? 'bg-purple-500 text-white rounded-br-md' 
            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
        }`}>
          {message.message && (
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.message}
            </p>
          )}
          
          {message.attachments && message.attachments.map((attachment, index) => 
            renderAttachment(attachment)
          )}
          
          <div className={`text-xs mt-1 ${
            isCurrentUser ? 'text-purple-100' : 'text-gray-500'
          }`}>
            {formatTime(message.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
