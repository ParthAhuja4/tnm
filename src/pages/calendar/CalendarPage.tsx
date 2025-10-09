import React, { useEffect, useState } from "react";
import { Calendar as CalendarIcon, X, Loader2 } from "lucide-react";
import { Calendar } from "react-big-calendar";
import { Button } from "../../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { useDropzone } from "react-dropzone";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { dateFnsLocalizer } from "react-big-calendar";
import { format, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { cn } from "../../lib/utils.ts";
import { api } from "../../services/api";

const formatCommentsForApi = (comments: { from: string; comment: string }[]) =>
  comments.map((c) => ({
    author_type: c.from,
    body: c.comment,
  }));

// Helper function to format posting time from server format (14:20:00) to UI format (2:20 PM)
function formatPostingTimeFromServer(time: string): string {
  const [hh, mm] = time.split(":");
  let hour = parseInt(hh, 10);
  const minute = mm;
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  const hourStr = hour.toString().padStart(2, "0");
  return `${hourStr}:${minute} ${ampm}`;
}

// Helper function to format posting time from UI format (2:20 PM) to server format (14:20:00)
function formatPostingTimeToServer(timeStr: string): string {
  const [time, period] = timeStr.split(" ");
  const [hours, minutes] = time.split(":");
  let hour24 = parseInt(hours, 10);

  if (period === "PM" && hour24 !== 12) {
    hour24 += 12;
  } else if (period === "AM" && hour24 === 12) {
    hour24 = 0;
  }

  return `${hour24.toString().padStart(2, "0")}:${minutes}:00`;
}

// Helper function to format date from server format to UI format
function formatDateFromServer(dateString: string): string {
  return dateString.split("T")[0]; // Convert '2025-10-10T00:00:00.000000Z' to '2025-10-10'
}

// Helper function to format date from UI format to server format
function formatDateToServer(dateString: string): string {
  return `${dateString}T00:00:00.000000Z`; // Convert '2025-10-10' to '2025-10-10T00:00:00.000000Z'
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
  media_url: string; // Media URL for both image and video
  media_type: "image" | "video"; // Type of media: image or video
  status: "pending" | "approved" | "disapproved";
  comments: Array<{ from: string; comment: string }>;
  client_name: string;
  client_id: string;
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
  client_id: "",
  created_at: "",
  updated_at: "",
});

const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState<Event>(createDefaultEventForm());
  const [newComment, setNewComment] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const role: string = JSON.parse(localStorage.getItem("user") || "null")?.role;
  const filterClientId: string = JSON.parse(
    localStorage.getItem("user") || "null"
  )?.id;

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
              event_date: formatDateFromServer(e.event_date),
              posting_time: formatPostingTimeFromServer(e.posting_time),
              media_url: e.image_url,
              media_type: e.media_type,
              status: e.status,
              comments: e.comments.map((cmnt: any) => ({
                from: cmnt.author_type,
                comment: cmnt.body,
              })),
              client_name: e.client_name,
              client_id: e.client_id,
              created_at: e.created_at,
              updated_at: e.updated_at,
            }))
          : [];

        const filteredEvents: Event[] = mappedEvents.filter(
          (e: any) => e.client_id === filterClientId
        );

        setEvents(filteredEvents);
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
        const fileType = file.type.split("/")[0]; // Get type: 'image' or 'video'

        setSelectedFile(file); // Store the actual file for API upload
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
    const baseForm = createDefaultEventForm();

    // Shift to UTC by subtracting local offset, then format as ISO date string
    const localIsoDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    )
      .toISOString()
      .split("T")[0];

    setEventForm({
      ...baseForm,
      event_date: localIsoDate,
    });

    setModalOpen(true);
  };

  // Handle event click to open form
  const handleEventClick = (event: CalendarEvent) => {
    setIsEditing(true);
    setModalOpen(true);
    setNewComment("");
    setSelectedFile(null);
    setEventForm(event);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEventForm(createDefaultEventForm());
    setNewComment("");
    setSelectedFile(null);
    setIsSubmitting(false);
  };

  // Enhanced submit handler with API integration and proper TypeScript handling
  const handleSubmitEvent = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const timestamp = new Date().toISOString();
      const trimmedComment = newComment.trim();

      if (!isEditing) {
        // For new events, make API call to create event
        const formData = new FormData();

        // Prepare API payload with proper typing
        // Combine existing comments with new comment if it exists
        const allComments = [...eventForm.comments];
        if (trimmedComment) {
          allComments.push({
            from: role,
            comment: trimmedComment,
          });
        }

        const apiPayload: Record<string, any> = {
          event_name: eventForm.event_name,
          event_date: formatDateToServer(eventForm.event_date),
          posting_time: formatPostingTimeToServer(eventForm.posting_time),
          media_type: eventForm.media_type,
          status: eventForm.status,
          client_name:
            JSON.parse(localStorage.getItem("user") || "null")?.name || "",
          client_id:
            JSON.parse(localStorage.getItem("user") || "null")?.id || "",
          comments: formatCommentsForApi(allComments),
        };

        // Add form fields with proper type handling
        Object.keys(apiPayload).forEach((key) => {
          const value = apiPayload[key];
          if (typeof value === "object") {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value);
          }
        });

        // Add image/video file if selected
        if (selectedFile) {
          formData.append("image", selectedFile);
        }

        // Make API call
        const response = await api.post("/api/events", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.status === 200 || response.status === 201) {
          // Update local state optimistically
          const updatedEvent: Event = {
            ...eventForm,
            comments: trimmedComment
              ? [...eventForm.comments, { from: role, comment: trimmedComment }]
              : eventForm.comments,
            created_at: timestamp,
            updated_at: timestamp,
          };

          setEvents((previousEvents) => {
            const nextId =
              previousEvents.length > 0
                ? Math.max(...previousEvents.map((event) => event.event_id)) + 1
                : 1;

            const newEvent = {
              ...updatedEvent,
              event_id: response.data?.data?.id || nextId,
              media_url:
                response.data?.data?.image_url || updatedEvent.media_url,
            };

            return [...previousEvents, newEvent];
          });
        } else {
          throw new Error("Failed to create event");
        }
      } else {
        // For editing, keep local functionality as requested
        let comments = [...eventForm.comments];
        if (trimmedComment) {
          comments.push({ from: role, comment: trimmedComment });
        }

        const updatedEvent: Event = {
          ...eventForm,
          comments,
          updated_at: timestamp,
        };

        setEvents((previousEvents) =>
          previousEvents.map((existingEvent) =>
            existingEvent.event_id === updatedEvent.event_id
              ? updatedEvent
              : existingEvent
          )
        );
      }

      closeModal();
    } catch (error) {
      console.error("Error submitting event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addComment = () => {
    const trimmedComment = newComment.trim();
    if (trimmedComment) {
      setEventForm((previous) => ({
        ...previous,
        comments: [
          ...previous.comments,
          { from: role, comment: trimmedComment },
        ],
      }));
      setNewComment("");
    }
  };

  const inputClassName =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 shadow-sm transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-60";

  // Render event cards
  const calendarEvents = events.map((event) => ({
    ...event,
    title: event.event_name,
    start: event.event_date ? new Date(event.event_date) : new Date(),
    end: event.event_date ? new Date(event.event_date) : new Date(),
  })) as CalendarEvent[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 p-3 shadow-lg">
              <CalendarIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="mb-2 bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-4xl font-bold text-transparent">
            Event Calendar
          </h1>
          <p className="text-slate-600">Plan and track events with ease.</p>
        </div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] overflow-hidden border-0 shadow-xl">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100 pb-4">
                <CardTitle className="flex items-center gap-2 dark:text-gray-900">
                  <CalendarIcon className="h-5 w-5 text-black" />
                  Calendar View
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full p-4 dark:bg-white dark:text-black">
                {isLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                  </div>
                ) : (
                  <Calendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: "100%" }}
                    onSelectSlot={(slotInfo) => handleDateClick(slotInfo.start)}
                    onSelectEvent={handleEventClick}
                    selectable
                    views={["month"]}
                    defaultView="month"
                    eventPropGetter={() => ({
                      style: {
                        backgroundColor: "#4f46e5",
                        borderRadius: "8px",
                        border: "none",
                        color: "white",
                        fontSize: "12px",
                        padding: "2px 6px",
                      },
                    })}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Events List */}
          <div>
            <Card className="border-0 shadow-xl">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100">
                <CardTitle className="text-slate-700 dark:text-gray-900">
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto p-4 dark:bg-white">
                {events.length === 0 ? (
                  <div className="py-8 text-center text-slate-500">
                    <CalendarIcon className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                    <p>No upcoming events yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {events.map((event) => (
                      <div
                        key={event.event_id}
                        className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                        onClick={() =>
                          handleEventClick({
                            ...event,
                            title: event.event_name,
                            start: new Date(event.event_date),
                            end: new Date(event.event_date),
                          })
                        }
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <h3 className="font-semibold text-slate-800">
                            {event.event_name}
                          </h3>
                          <span
                            className={cn(
                              "rounded-full px-2 py-1 text-xs font-medium",
                              event.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : event.status === "disapproved"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            )}
                          >
                            {event.status}
                          </span>
                        </div>
                        <p className="mb-1 text-sm text-slate-600">
                          {new Date(event.event_date).toLocaleDateString()} at{" "}
                          {event.posting_time}
                        </p>
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
                          <a href={event.media_url} target="_blank">
                            <img
                              src={event.media_url}
                              alt="Event"
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          </a>
                        ) : (
                          <video
                            width="150"
                            height="150"
                            controls
                            className="rounded-lg"
                          >
                            <source src={event.media_url} type="video/mp4" />
                          </video>
                        )}
                        <div className="space-y-2">
                          {event.comments.map((comment, idx) => (
                            <div key={idx} className="text-xs text-black">
                              <strong>{comment.from}:</strong> {comment.comment}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-xl font-semibold text-slate-800">
                {isEditing ? "Edit Event" : "Create New Event"}
              </h2>
              <button
                onClick={closeModal}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                disabled={isSubmitting}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
              <p className="mb-6 text-sm text-slate-600">
                {isEditing
                  ? "Update your event details and share the latest changes."
                  : "Fill in the details to schedule a new event."}
              </p>

              <div className="space-y-6">
                {/* Event Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Event Name
                  </label>
                  <input
                    type="text"
                    value={eventForm.event_name}
                    onChange={(e) =>
                      setEventForm((prev) => ({
                        ...prev,
                        event_name: e.target.value,
                      }))
                    }
                    className={inputClassName}
                    placeholder="Enter event name"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Date & Time */}
                <div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Event Date
                      </label>
                      <input
                        type="date"
                        value={eventForm.event_date}
                        onChange={(e) =>
                          setEventForm((prev) => ({
                            ...prev,
                            event_date: e.target.value,
                          }))
                        }
                        className={inputClassName}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Posting Time
                      </label>
                      <input
                        type="time"
                        value={eventForm.posting_time.replace(/ AM| PM/g, "")}
                        onChange={(e) => {
                          const timeValue = e.target.value; // e.g., "14:30"
                          const [hours, minutes] = timeValue.split(":");
                          const hour24 = parseInt(hours, 10);
                          const hour12 = hour24 % 12 || 12;
                          const ampm = hour24 >= 12 ? "PM" : "AM";
                          const formattedTime = `${hour12}:${minutes} ${ampm}`;
                          setEventForm((prev) => ({
                            ...prev,
                            posting_time: formattedTime,
                          }));
                        }}
                        className={inputClassName}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                {/* Client Details */}
                <div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Client Name
                      </label>
                      <input
                        type="text"
                        value={
                          JSON.parse(localStorage.getItem("user") || "null")
                            ?.name || ""
                        }
                        className={inputClassName}
                        placeholder="Enter client name"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Client ID
                      </label>
                      <input
                        type="text"
                        value={
                          JSON.parse(localStorage.getItem("user") || "null")
                            ?.id || ""
                        }
                        className={inputClassName}
                        placeholder="Enter client ID"
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Current Media
                  </label>
                  <a href={eventForm.media_url} target="_blank">
                    <img
                      src={eventForm.media_url}
                      alt="Event"
                      className="w-full object-contain"
                    />
                  </a>
                </div>

                {/* Media Upload */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Media Upload
                  </label>
                  <div
                    {...getRootProps()}
                    className={cn(
                      "cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-indigo-400 hover:bg-indigo-50",
                      isSubmitting && "pointer-events-none opacity-50"
                    )}
                  >
                    <input {...getInputProps()} disabled={isSubmitting} />
                    {eventForm.media_url &&
                    eventForm.media_url !==
                      "https://via.placeholder.com/150" ? (
                      <div className="space-y-3">
                        {eventForm.media_type === "image" ? (
                          <img
                            src={eventForm.media_url}
                            alt="Uploaded"
                            className="mx-auto h-32 w-32 rounded-xl object-cover shadow-md"
                          />
                        ) : (
                          <video
                            src={eventForm.media_url}
                            className="mx-auto h-32 w-48 rounded-xl object-cover shadow-md"
                            controls
                          />
                        )}
                        <p className="text-sm text-slate-600">
                          Click or drag to replace
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="mx-auto h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                          <CalendarIcon className="h-8 w-8 text-indigo-500" />
                        </div>
                        <div>
                          <p className="text-slate-700 font-medium">
                            Drag & drop an image or video here
                          </p>
                          <p className="text-sm text-slate-500">
                            or click to browse files from your device
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Comments Section */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-slate-700">
                    Comments
                  </label>
                  {eventForm.comments.length > 0 && (
                    <div className="mb-4 max-h-32 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
                      {eventForm.comments.map((comment, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium text-indigo-600">
                            {comment.from}:
                          </span>{" "}
                          <span className="text-slate-700">
                            {comment.comment}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className={cn(inputClassName, "flex-1")}
                      placeholder="Add a comment..."
                      disabled={isSubmitting}
                      onKeyPress={(e) => e.key === "Enter" && addComment()}
                    />
                    <Button
                      type="button"
                      onClick={addComment}
                      variant="outline"
                      className="px-4"
                      disabled={isSubmitting}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Status
                  </label>
                  <select
                    value={eventForm.status}
                    onChange={(e) =>
                      setEventForm((prev) => ({
                        ...prev,
                        status: e.target.value as
                          | "pending"
                          | "approved"
                          | "disapproved",
                      }))
                    }
                    className={inputClassName}
                    disabled={isSubmitting}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="disapproved">Disapproved</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={closeModal}
                className="w-full sm:w-auto"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="gradient"
                onClick={handleSubmitEvent}
                className="w-full px-6 py-2.5 text-sm font-semibold shadow-lg sm:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting
                  ? isEditing
                    ? "Saving..."
                    : "Creating..."
                  : isEditing
                  ? "Save Changes"
                  : "Add Event"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
