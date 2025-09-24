import React, { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "react-big-calendar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useDropzone } from "react-dropzone";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { dateFnsLocalizer } from "react-big-calendar";
import { format, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { cn } from "@/lib/utils.ts";

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
  assigned_to: string;
  created_at: string;
  updated_at: string;
};

// Initial events data
const initialEvents: Event[] = [
  {
    event_id: 1,
    event_name: "Product Launch",
    event_date: "2025-09-30",
    posting_time: "10:00 AM",
    media_url: "https://example.com/images/product_launch.jpg",
    media_type: "image",
    status: "pending",
    comments: [
      { from: "Client", comment: "Looks great, can we tweak the image a bit?" },
      {
        from: "Design Company",
        comment: "Sure, we will update it as per your feedback.",
      },
    ],
    client_name: "John Doe",
    assigned_to: "Jane Smith",
    created_at: "2025-09-10T15:00:00Z",
    updated_at: "2025-09-15T10:30:00Z",
  },
];

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
  assigned_to: "",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [eventForm, setEventForm] = useState<Event>(createDefaultEventForm());
  const [newComment, setNewComment] = useState<string>("");

  const { getRootProps, getInputProps } = useDropzone({
    accept: ["image/*", "video/*"], // Accept both image and video files
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
    setSelectedDate(date);
    setModalOpen(true);
    setEventForm((prev) => ({
      ...prev,
      event_date: format(date, "yyyy-MM-dd"), // Set event date when date is clicked
    }));
  };

  // Handle form field changes
  const handleChange = (field: string, value: string) => {
    setEventForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Add the comment automatically when the event is created
  const handleAddEvent = () => {
    const updatedEventForm = { ...eventForm };

    // Add the comment to the event automatically if the comment field is populated
    if (newComment.trim()) {
      updatedEventForm.comments.push({ from: "Client", comment: newComment });
    }

    setEvents((previousEvents) => [
      ...previousEvents,
      { ...updatedEventForm, event_id: previousEvents.length + 1 },
    ]);
    setModalOpen(false);
    setEventForm(createDefaultEventForm()); // Reset form
    setNewComment(""); // Clear comment input after submitting the event
  };

  // Render event cards
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
                events={events.map((event) => ({
                  ...event,
                  title: event.event_name,
                  start: new Date(event.event_date), // Using event date
                  end: new Date(event.event_date), // Using event date
                }))}
                startAccessor="start"
                endAccessor="end"
                selectable
                onSelectSlot={({ start }) => handleDateClick(start)} // Opens the form on date click
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
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-70">
          <div
            className="bg-white p-6 rounded-xl shadow-lg w-96 overflow-y-auto"
            style={{ maxHeight: "80vh" }}
          >
            <h2 className="text-xl font-semibold mb-4">Add Event</h2>
            <input
              type="text"
              placeholder="Event Name"
              value={eventForm.event_name}
              onChange={(e) => handleChange("event_name", e.target.value)}
              className="w-full mb-4 p-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Client Name"
              value={eventForm.client_name}
              onChange={(e) => handleChange("client_name", e.target.value)}
              className="w-full mb-4 p-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Assigned To"
              value={eventForm.assigned_to}
              onChange={(e) => handleChange("assigned_to", e.target.value)}
              className="w-full mb-4 p-2 border border-gray-300 rounded"
            />
            <input
              type="date"
              value={eventForm.event_date}
              onChange={(e) => handleChange("event_date", e.target.value)}
              className="w-full mb-4 p-2 border border-gray-300 rounded"
            />
            <input
              type="time"
              value={eventForm.posting_time}
              onChange={(e) => handleChange("posting_time", e.target.value)}
              className="w-full mb-4 p-2 border border-gray-300 rounded"
            />
            {/* Dropzone for image/video upload */}
            <div
              {...getRootProps()}
              className="mb-4 w-full p-2 border border-dashed border-gray-300 text-center"
            >
              <input {...getInputProps()} />
              <p>Drag and drop an image or video, or click to select a file</p>
            </div>
            {eventForm.media_url && eventForm.media_type === "image" && (
              <div className="mb-4">
                <img
                  src={eventForm.media_url}
                  alt="Event Preview"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
            )}
            {eventForm.media_url && eventForm.media_type === "video" && (
              <div className="mb-4">
                <video width="150" height="150" controls className="rounded-lg">
                  <source src={eventForm.media_url} type="video/mp4" />
                </video>
              </div>
            )}

            {/* Comment input */}
            <textarea
              placeholder="Add a comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full mb-4 p-2 border border-gray-300 rounded"
            />

            {/* Event Status Dropdown */}
            <select
              value={eventForm.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full mb-4 p-2 border border-gray-300 rounded"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="disapproved">Disapproved</option>
            </select>

            <Button
              onClick={handleAddEvent}
              className="w-full bg-blue-500 text-white p-2 rounded"
            >
              Add Event
            </Button>
            <Button
              onClick={() => setModalOpen(false)}
              className="w-full bg-red-500 text-white p-2 rounded mt-2"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
