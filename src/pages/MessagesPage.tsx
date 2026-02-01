import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message, ProfilePublic } from '@/types/database';
import { Send, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Conversation {
  userId: string;
  profile: ProfilePublic;
  lastMessage?: Message;
  unreadCount: number;
}

const MessagesPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toUserId = searchParams.get('to');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(toUserId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      markAsRead(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.sender_id === user.id || newMsg.receiver_id === user.id) {
            if (selectedConversation && 
                (newMsg.sender_id === selectedConversation || newMsg.receiver_id === selectedConversation)) {
              setMessages(prev => [...prev, newMsg]);
            }
            fetchConversations();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedConversation]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      // Fetch all messages involving the user
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (!messagesData) return;

      // Group by conversation partner
      const conversationMap = new Map<string, { messages: Message[] }>();
      
      messagesData.forEach((msg) => {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, { messages: [] });
        }
        conversationMap.get(partnerId)!.messages.push(msg as Message);
      });

      // Fetch profiles for all partners
      const partnerIds = Array.from(conversationMap.keys());
      
      // If there's a toUserId and it's not in conversations, add it
      if (toUserId && !partnerIds.includes(toUserId)) {
        partnerIds.push(toUserId);
        conversationMap.set(toUserId, { messages: [] });
      }

      if (partnerIds.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // Use profiles_public to avoid exposing sensitive PII
      const { data: profiles } = await supabase
        .from('profiles_public')
        .select('*')
        .in('user_id', partnerIds);

      const convos: Conversation[] = partnerIds.map(partnerId => {
        const conv = conversationMap.get(partnerId)!;
        const profile = profiles?.find(p => p.user_id === partnerId);
        const unreadCount = conv.messages.filter(
          m => m.receiver_id === user.id && !m.is_read
        ).length;

        return {
          userId: partnerId,
          profile: profile as ProfilePublic,
          lastMessage: conv.messages[0],
          unreadCount,
        };
      }).filter(c => c.profile);

      // Sort by last message
      convos.sort((a, b) => {
        const aTime = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0;
        const bTime = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0;
        return bTime - aTime;
      });

      setConversations(convos);

      // Auto-select first conversation or the one from URL
      if (toUserId && convos.find(c => c.userId === toUserId)) {
        setSelectedConversation(toUserId);
      } else if (convos.length > 0 && !selectedConversation) {
        setSelectedConversation(convos[0].userId);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (partnerId: string) => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true });

      setMessages((data as Message[]) || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markAsRead = async (partnerId: string) => {
    if (!user) return;

    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('sender_id', partnerId)
      .eq('receiver_id', user.id)
      .eq('is_read', false);
  };

  const sendMessage = async () => {
    if (!user || !selectedConversation || !newMessage.trim()) return;

    setSending(true);
    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: selectedConversation,
        content: newMessage.trim(),
      });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  const selectedProfile = conversations.find(c => c.userId === selectedConversation)?.profile;

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-[600px]" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-8">Messages</h1>

        <div className="grid h-[600px] gap-4 md:grid-cols-3">
          {/* Conversations List */}
          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[520px]">
                {conversations.length > 0 ? (
                  conversations.map((conv) => (
                    <div
                      key={conv.userId}
                      className={cn(
                        'flex items-center gap-3 p-4 cursor-pointer transition-colors hover:bg-muted/50 border-b border-border',
                        selectedConversation === conv.userId && 'bg-muted'
                      )}
                      onClick={() => setSelectedConversation(conv.userId)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conv.profile?.avatar_url} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(conv.profile?.full_name || '')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {conv.profile?.full_name}
                        </p>
                        {conv.lastMessage && (
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.lastMessage.content}
                          </p>
                        )}
                      </div>
                      {conv.unreadCount > 0 && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                          {conv.unreadCount}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-muted-foreground">No conversations yet</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="md:col-span-2">
            {selectedConversation && selectedProfile ? (
              <>
                <CardHeader className="border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedProfile.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(selectedProfile.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{selectedProfile.full_name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col h-[480px] p-0">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={cn(
                            'flex',
                            msg.sender_id === user?.id ? 'justify-end' : 'justify-start'
                          )}
                        >
                          <div
                            className={cn(
                              'max-w-[70%] rounded-lg px-4 py-2',
                              msg.sender_id === user?.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-foreground'
                            )}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p className={cn(
                              'text-xs mt-1',
                              msg.sender_id === user?.id
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            )}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  <div className="border-t border-border p-4">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        sendMessage();
                      }}
                      className="flex gap-2"
                    >
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={sending}
                      />
                      <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default MessagesPage;
