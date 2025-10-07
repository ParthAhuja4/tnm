import React, { useEffect, useState } from "react";
import { Calendar as CalendarIcon, X, Loader2 } from "lucide-react";
import { Calendar } from "react-big-calendar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useDropzone } from "react-dropzone";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { dateFnsLocalizer } from "react-big-calendar";
import { format, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { cn } from "@/lib/utils.ts";
import { api } from "@/services/api";

function formatPostingTime(time: string): string {
  const [hh, mm] = time.split(":"); // ["11", "01", ...]
  let hour = parseInt(hh, 10);
  const minute = mm;
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12; // convert 0 → 12, 13 → 1
  const hourStr = hour.toString().padStart(2, "0");
  return `${hourStr}:${minute} ${ampm}`; // "11:01 AM"
}

// Localizer for react-big-calendar
const locales = {
  "en-US": enUS,
};
const localizer = dateFnsLocalizer({
  format,
  startOfWeek,
  getDay,
  locales,
});

// Event type with all necessary fields
type Event = {
  event_id: number;
  event_name: string;
  event_date: string;
  posting_time: string;
  media_url: string; // Media URL (for both image and video)
  media_type: "image" | "video"; // Type of media (image or video)
  status: "pending" | "approved" | "disapproved";
  comments: Array<{ from: string; comment: string }>;
  client_name: string;
  created_at: string;
  updated_at: string;
};

type CalendarEvent = Event & {
  title: string;
  start: Date;
  end: Date;
};

// Function to create default event
const createDefaultEventForm = (): Event => ({
  event_id: 0,
  event_name: "",
  event_date: "",
  posting_time: "10:00 AM",
  media_url: "https://via.placeholder.com/150", // Default placeholder
  media_type: "image", // Default to image
  status: "pending",
  comments: [],
  client_name: "",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState<Event>(createDefaultEventForm());
  const [newComment, setNewComment] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  // const role: string =
  //   JSON.parse(localStorage.getItem("user") || "null")?.role || "";

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);

      try {
        const response: any = await api.get("/api/events");

        if (response.status !== 200) {
          throw new Error("Failed to fetch");
        }

        const payload: any = response?.data?.data?.data ?? [];

        const mappedEvents: Event[] = Array.isArray(payload)
          ? payload.map((e: any) => ({
              event_id: e.id,
              event_name: e.event_name,
              event_date: e.event_date.split("T")[0],
              posting_time: formatPostingTime(e.posting_time),
              media_url: e.image_url,
              media_type: e.media_type,
              status: e.status,
              comments: e.comments.map((cmnt: any) => ({
                from: cmnt.author_type,
                comment: cmnt.body,
              })),
              client_name: e.client_name,
              created_at: e.created_at,
              updated_at: e.updated_at,
            }))
          : [];
        setEvents(mappedEvents);
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [], "video/*": [] }, // Accept both image and video files
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const fileUrl = URL.createObjectURL(file);
        const fileType = file.type.split("/")[0]; // Get type: "image" or "video"

        setEventForm((previous) => ({
          ...previous,
          media_url: fileUrl,
          media_type: fileType === "image" ? "image" : "video",
        }));
      }
    },
  });

  // Handle date click to open form
  const handleDateClick = (date: Date) => {
    setIsEditing(false);
    setModalOpen(true);
    setNewComment("");
    const baseForm = createDefaultEventForm();

    setEventForm({
      ...baseForm,
      event_date: format(date, "yyyy-MM-dd"), // Set event date when date is clicked
    });
  };

  const handleEditEvent = (eventId: number) => {
    const eventToEdit = events.find((item) => item.event_id === eventId);

    if (!eventToEdit) {
      return;
    }

    setIsEditing(true);
    setNewComment("");
    setEventForm({
      ...eventToEdit,
      comments: [...eventToEdit.comments],
    });
    setModalOpen(true);
  };

  // Handle form field changes
  const handleChange = (field: string, value: string) => {
    setEventForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const closeModal = () => {
    setModalOpen(false);
    setIsEditing(false);
    setEventForm(createDefaultEventForm());
    setNewComment("");
  };

  // Persist the event and optionally append a new comment
  const handleSubmitEvent = () => {
    const timestamp = new Date().toISOString();
    const trimmedComment = newComment.trim();
    const updatedEvent: Event = {
      ...eventForm,
      comments: [...eventForm.comments],
      updated_at: timestamp,
    };

    if (!isEditing) {
      updatedEvent.created_at = timestamp;
    }

    if (trimmedComment) {
      updatedEvent.comments = [
        ...updatedEvent.comments,
        { from: "Client", comment: trimmedComment },
      ];
    }

    if (isEditing) {
      setEvents((previousEvents) =>
        previousEvents.map((existingEvent) =>
          existingEvent.event_id === updatedEvent.event_id
            ? updatedEvent
            : existingEvent
        )
      );
    } else {
      setEvents((previousEvents) => {
        const nextId =
          previousEvents.length > 0
            ? Math.max(...previousEvents.map((event) => event.event_id)) + 1
            : 1;

        return [...previousEvents, { ...updatedEvent, event_id: nextId }];
      });
    }

    closeModal();
  };

  const inputClassName =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 shadow-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-60";

  // Render event cards
  const calendarEvents = events.map(
    (event) =>
      ({
        ...event,
        title: event.event_name,
        start: event.event_date ? new Date(event.event_date) : new Date(),
        end: event.event_date ? new Date(event.event_date) : new Date(),
      } as CalendarEvent)
  );

  const renderEvent = (event: Event) => (
    <div
      key={event.event_id}
      className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white/90 p-4 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
    >
      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-gray-900">
            {event.event_name}
          </h3>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEditEvent(event.event_id)}
            >
              Edit
            </Button>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                event.status === "approved"
                  ? "bg-green-100 text-green-800"
                  : event.status === "disapproved"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              )}
            >
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </span>
          </div>
        </div>
        <p className="text-sm font-medium text-indigo-600">
          {event.client_name}
        </p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
          <span>
            {event.event_date} at {event.posting_time}
          </span>{" "}
          {/* Displaying posting date and time */}
        </div>
        {event.media_type === "image" ? (
          <img
            src={event.media_url}
            alt="Event"
            className="w-16 h-16 object-cover rounded-lg"
          />
        ) : (
          <video width="150" height="150" controls className="rounded-lg">
            <source src={event.media_url} type="video/mp4" />
          </video>
        )}
        <div className="space-y-2">
          {event.comments.map((comment, idx) => (
            <div key={idx} className="text-xs text-gray-500">
              <strong>{comment.from}: </strong>
              {comment.comment}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-8">
      <div className="rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 shadow-xl transition-shadow hover:shadow-2xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4 text-white">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-white/20 p-3">
                <CalendarIcon className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-2xl font-semibold md:text-3xl">
                  Event Calendar
                </h2>
                <p className="text-sm text-white/80">
                  Plan and track events with ease.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="rounded-3xl border-0 bg-white/90 shadow-xl backdrop-blur lg:col-span-7 xl:col-span-8">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <CardTitle className="text-lg font-semibold">
              Calendar View
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[560px] overflow-hidden rounded-b-3xl text-black bg-white p-4 sm:p-6">
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                selectable
                onSelectSlot={({ start }) => handleDateClick(start)} // Opens the form on date click
                onSelectEvent={(calendarEvent) =>
                  handleEditEvent((calendarEvent as CalendarEvent).event_id)
                } // Opens the form on event click
                style={{ height: "100%" }}
                defaultView="month" // Only month view
                views={["month"]} // Disabling week and day views
                culture="en-US"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6 lg:col-span-5 xl:col-span-4">
          <Card className="rounded-3xl border-0 bg-white/90 shadow-xl backdrop-blur">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-purple-600 to-pink-500 text-white">
              <CardTitle className="text-lg font-semibold">
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {events.length > 0 ? (
                events.map(renderEvent)
              ) : (
                <p className="text-sm text-gray-500">No upcoming events yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Event Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/40 bg-white/95 shadow-2xl">
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    {isEditing ? "Edit Event" : "Add Event"}
                  </h2>
                  <p className="mt-1 text-sm text-white/80">
                    {isEditing
                      ? "Update your event details and share the latest changes."
                      : "Fill in the details to schedule a new event."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full bg-white/20 p-2 text-white transition hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/40"
                >
                  <span className="sr-only">Close modal</span>
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-6">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Event Name"
                  value={eventForm.event_name}
                  onChange={(e) => handleChange("event_name", e.target.value)}
                  className={inputClassName}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Client Name"
                    value={eventForm.client_name}
                    onChange={(e) =>
                      handleChange("client_name", e.target.value)
                    }
                    className={inputClassName}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="date"
                    value={eventForm.event_date}
                    onChange={(e) => handleChange("event_date", e.target.value)}
                    className={inputClassName}
                  />
                  <input
                    type="time"
                    value={eventForm.posting_time}
                    onChange={(e) =>
                      handleChange("posting_time", e.target.value)
                    }
                    className={inputClassName}
                  />
                </div>
              </div>

              <div
                {...getRootProps()}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/60 px-4 py-6 text-center text-sm font-medium text-indigo-600 transition hover:border-indigo-400 hover:bg-indigo-50"
              >
                <input {...getInputProps()} />
                <p>Drag & drop an image or video here</p>
                <p className="text-xs text-indigo-400">
                  or click to browse files from your device
                </p>
              </div>

              {eventForm.media_url && (
                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-inner">
                  {eventForm.media_type === "image" ? (
                    <img
                      src={eventForm.media_url}
                      alt="Event preview"
                      className="mx-auto h-40 w-full max-w-sm rounded-xl object-cover shadow-sm"
                    />
                  ) : (
                    <video
                      controls
                      className="mx-auto h-40 w-full max-w-sm rounded-xl shadow-sm"
                    >
                      <source src={eventForm.media_url} type="video/mp4" />
                    </video>
                  )}
                </div>
              )}

              <textarea
                placeholder="Add a comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className={[inputClassName, "min-h-[120px] resize-none"].join(
                  " "
                )}
              />

              <select
                value={eventForm.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className={inputClassName}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="disapproved">Disapproved</option>
              </select>
            </div>
            <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={closeModal}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="gradient"
                onClick={handleSubmitEvent}
                className="w-full px-6 py-2.5 text-sm font-semibold shadow-lg sm:w-auto"
              >
                {isEditing ? "Save Changes" : "Add Event"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
