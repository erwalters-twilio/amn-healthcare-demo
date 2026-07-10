import { MessageSquare, User, Bot } from 'lucide-react';
import { format } from 'date-fns';
import { TwilioConversation } from '../types';

interface ConversationViewProps {
  conversations: TwilioConversation[];
}

export function ConversationView({ conversations }: ConversationViewProps) {
  const isAIAgent = (author: string) => {
    const lower = author.toLowerCase();
    return lower.includes('ai') || lower.includes('agent') || lower === 'system';
  };

  const totalMessages = conversations.reduce((sum, conv) => sum + conv.messages.length, 0);

  return (
    <div className="bg-white border border-gray-200/60 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="gradient-green px-6 py-4 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-white" />
          <h2 className="text-xl font-bold text-white">Conversation History</h2>
          <span className="ml-auto bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs text-white font-bold shadow-sm">
            {totalMessages} messages
          </span>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium">No conversation history</p>
        </div>
      ) : (
        <div className="p-6 max-h-[600px] overflow-y-auto space-y-6">
          {conversations.map((conversation) => (
            <div key={conversation.sid} className="space-y-3">
              {conversation.friendlyName && (
                <div className="text-xs font-bold text-gray-700 uppercase tracking-wider px-2">
                  {conversation.friendlyName}
                </div>
              )}

              <div className="space-y-3">
                {conversation.messages.map((message) => {
                  const isAI = isAIAgent(message.author);

                  return (
                    <div
                      key={message.sid}
                      className={`flex gap-3 ${isAI ? 'flex-row' : 'flex-row-reverse'}`}
                    >
                      {/* Avatar */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
                        isAI ? 'bg-gradient-to-br from-blue-100 to-blue-200' : 'bg-gradient-to-br from-green-100 to-green-200'
                      }`}>
                        {isAI ? (
                          <Bot className="w-5 h-5 text-blue-700" />
                        ) : (
                          <User className="w-5 h-5 text-green-700" />
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div className={`flex-1 max-w-[85%] ${
                        isAI ? 'items-start' : 'items-end flex flex-col'
                      }`}>
                        <div className={`rounded-2xl px-4 py-3 shadow-md hover:shadow-lg transition-shadow duration-200 ${
                          isAI
                            ? 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900'
                            : 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed font-medium">
                            {message.body}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500 mt-2 px-2 font-semibold">
                          {format(new Date(message.dateCreated), 'MMM d, h:mm a')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
