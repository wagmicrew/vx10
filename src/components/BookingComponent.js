import React, { useState } from 'react';
import { Button, Card, Badge } from '@mui/material';
import { useSession } from 'next-auth/react';
import { getLessons, getBlockedSlots, bookSlot } from '@/utils/api';

const BookingComponent = () => {
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedGear, setSelectedGear] = useState('AUTOMATIC');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableLessons, setAvailableLessons] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const { data: session } = useSession();

  // Load available lessons and blocked slots
  React.useEffect(() => {
    if (session) {
      getLessons().then((lessons) => setAvailableLessons(lessons));
      getBlockedSlots().then((slots) => setBlockedSlots(slots));
    }
  }, [session]);

  // Booking function
  const handleBooking = async () => {
    if (selectedLesson && selectedDate && selectedSlot) {
      const bookingDetails = {
        lessonId: selectedLesson.id,
        userId: session.user.id,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        gearType: selectedGear,
        paymentMethod: 'QLIRO', // Default payment method
      };

      const success = await bookSlot(bookingDetails);

      if (success) alert('Booking successful!');
      else alert('Failed to book. Please try again.');
    }
  };

  return (
    <Card className="booking-card">
      <div className="steps">
        <h2>Book Your Lesson</h2>
        {/* STEP 1: Select a Lesson */}
        <div className="step">
          <h3>Select Lesson</h3>
          <select
            value={selectedLesson?.id || ''}
            onChange={(e) =>
              setSelectedLesson(
                availableLessons.find((lesson) => lesson.id === e.target.value)
              )
            }
          >
            <option value="">Select a lesson</option>
            {availableLessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.name} - {lesson.price} SEK
              </option>
            ))}
          </select>
        </div>
        {/* STEP 2: Select Gear Type */}
        <div className="step">
          <h3>Select Gear Type</h3>
          <Button
            variant={selectedGear === 'AUTOMATIC' ? 'contained' : 'outlined'}
            onClick={() => setSelectedGear('AUTOMATIC')}
          >
            Automatic
          </Button>
          <Button
            variant={selectedGear === 'MANUAL' ? 'contained' : 'outlined'}
            onClick={() => setSelectedGear('MANUAL')}
          >
            Manual
          </Button>
        </div>
        {/* STEP 3: Select a Day */}
        <div className="step">
          <h3>Select Day</h3>
          <input
            type="date"
            value={selectedDate || ''}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        {/* STEP 4: Select a Slot */}
        <div className="step">
          <h3>Select Slot</h3>
          {selectedDate && (
            <select
              value={selectedSlot?.startTime || ''}
              onChange={(e) =>
                setSelectedSlot(
                  blockedSlots.find((slot) => slot.startTime === e.target.value)
                )
              }
            >
              <option value="">Select a slot</option>
              {
                // Logic to determine available slots based on lessons, blocked slots, etc.
                blockedSlots.map((slot) => (
                  <option key={slot.id} value={slot.startTime}>
                    {slot.startTime} - {slot.endTime}
                  </option>
                ))
              }
            </select>
          )}
        </div>
        {/* Recap and Payment */}
        <div className="step">
          <h3>Recap & Payment</h3>
          {selectedLesson && selectedDate && selectedSlot && (
            <div>
              <p>
                Lesson: {selectedLesson.name} ({selectedGear})<br />
                Date: {selectedDate}<br />
                Slot: {selectedSlot.startTime} to {selectedSlot.endTime}
              </p>
              <Button onClick={handleBooking} variant="contained" color="primary">
                Pay & Book
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default BookingComponent;

