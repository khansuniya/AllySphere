import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const EventsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // 🔐 Check admin role
  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .single();

      if (data?.role === 'admin') {
        setIsAdmin(true);
      }
    };

    if (user) checkAdmin();
  }, [user]);

  // 📥 Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (data) setEvents(data);
    };

    fetchEvents();
  }, []);

  return (
    <Layout>
      <div className="container py-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Events</h1>
            <p className="text-gray-500">
              Stay connected through networking events
            </p>
          </div>

          {/* ✅ FIXED BUTTON */}
          {true && (
            <button
              onClick={() => navigate('/add-event')}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Create Event
            </button>
          )}
        </div>

        {/* EVENTS LIST */}
        {events.length === 0 ? (
          <div className="text-center mt-10">
            <p>No events found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event: any) => (
              <div key={event.id} className="p-4 border rounded">
                <h2 className="font-bold text-lg">{event.title}</h2>
                <p>{event.description}</p>
                <p className="text-sm text-gray-500">
                  {new Date(event.event_date).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}

      </div>
    </Layout>
  );
};

export default EventsPage;


