"use client"

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Grid,
  Chip,
  Alert,
  FormControl,
  FormLabel,
  Select,
  Option,
  Input,
  Modal,
  ModalDialog,
  ModalClose
} from '@mui/joy';
import {
  CalendarToday,
  Settings,
  Schedule,
  Payment,
  CheckCircle,
  ErrorOutline
} from '@mui/icons-material';
import { format, addDays, startOfDay, isAfter, isBefore, parseISO } from 'date-fns';
import { useSession } from 'next-auth/react';

const steps = [
  'Välj lektion',
  'Välj växellåda', 
  'Välj datum',
  'Välj tid',
  'Granska & betala'
];

const BookingFlow = () => {
  const { data: session } = useSession();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Booking state
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedGear, setSelectedGear] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('QLIRO');
  
  // Data state
  const [lessons, setLessons] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [adminSettings, setAdminSettings] = useState({});
  
  // UI state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    fetchLessons();
    fetchAdminSettings();
  }, []);

  useEffect(() => {
    if (selectedDate && selectedLesson) {
      fetchAvailableSlots();
    }
  }, [selectedDate, selectedLesson]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/lessons');
      const data = await response.json();
      setLessons(data.filter(lesson => lesson.isActive));
    } catch (err) {
      setError('Kunde inte ladda lektioner');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      const settingsMap = {};
      data.forEach(setting => {
        settingsMap[setting.settingKey] = setting.settingValue;
      });
      setAdminSettings(settingsMap);
    } catch (err) {
      console.error('Failed to load admin settings:', err);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/booking/available-slots?date=${selectedDate}&lessonId=${selectedLesson.id}`);
      const data = await response.json();
      setAvailableSlots(data);
    } catch (err) {
      setError('Kunde inte ladda tillgängliga tider');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

  const handleBooking = async () => {
    try {
      setLoading(true);
      
      const bookingData = {
        lessonId: selectedLesson.id,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        gearType: selectedGear,
        paymentMethod: paymentMethod,
        totalPrice: selectedLesson.price
      };

      const response = await fetch('/api/booking/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();
      
      if (result.success) {
        // Redirect to payment based on method
        if (paymentMethod === 'QLIRO') {
          window.location.href = result.paymentUrl;
        } else if (paymentMethod === 'SWISH') {
          window.location.href = `/payment/swish?bookingId=${result.bookingId}`;
        }
      } else {
        setError(result.message || 'Kunde inte skapa bokning');
      }
    } catch (err) {
      setError('Ett fel uppstod vid skapande av bokningen');
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0: return selectedLesson !== null;
      case 1: return selectedGear !== '';
      case 2: return selectedDate !== '';
      case 3: return selectedSlot !== null;
      case 4: return paymentMethod !== '';
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography level="h4" mb={3}>
              Välj din lektion
            </Typography>
            <Grid container spacing={2}>
              {lessons.map((lesson) => (
                <Grid xs={12} md={6} key={lesson.id}>
                  <Card
                    variant={selectedLesson?.id === lesson.id ? "solid" : "outlined"}
                    color={selectedLesson?.id === lesson.id ? "primary" : "neutral"}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 'lg' }
                    }}
                    onClick={() => setSelectedLesson(lesson)}
                  >
                    <CardContent>
                      <Typography level="h5">{lesson.name}</Typography>
                      <Typography level="body2" sx={{ mt: 1, mb: 2 }}>
                        {lesson.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip color="success">
                          {lesson.duration} minuter
                        </Chip>
                        <Typography level="h5" color="primary">
                          {lesson.price} SEK
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography level="h4" mb={3}>
              Välj växellåda
            </Typography>
            <Grid container spacing={2}>
              <Grid xs={12} md={6}>
                <Card
                  variant={selectedGear === 'AUTOMATIC' ? "solid" : "outlined"}
                  color={selectedGear === 'AUTOMATIC' ? "primary" : "neutral"}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 'lg' }
                  }}
                  onClick={() => setSelectedGear('AUTOMATIC')}
                >
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Settings sx={{ fontSize: 48, mb: 2 }} />
                    <Typography level="h5">Automat</Typography>
                    <Typography level="body2">
                      Perfekt för nybörjare och körning i stan
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid xs={12} md={6}>
                <Card
                  variant={selectedGear === 'MANUAL' ? "solid" : "outlined"}
                  color={selectedGear === 'MANUAL' ? "primary" : "neutral"}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 'lg' }
                  }}
                  onClick={() => setSelectedGear('MANUAL')}
                >
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Settings sx={{ fontSize: 48, mb: 2 }} />
                    <Typography level="h5">Manuell</Typography>
                    <Typography level="body2">
                      Full kontroll och traditionell körupplevelse
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography level="h4" mb={3}>
              Välj datum
            </Typography>
            <Box sx={{ maxWidth: 400 }}>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                slotProps={{
                  input: {
                    min: format(new Date(), 'yyyy-MM-dd'),
                    max: format(addDays(new Date(), 30), 'yyyy-MM-dd')
                  }
                }}
              />
              <Typography level="body2" sx={{ mt: 1 }}>
                Du kan boka upp till 30 dagar i förväg
              </Typography>
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography level="h4" mb={3}>
              Välj tid
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <div 
                  style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid #e5e7eb',
                    borderTop: '3px solid #3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}
                />
                <style jsx>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </Box>
            ) : availableSlots.length === 0 ? (
              <Alert color="warning" startDecorator={<ErrorOutline />}>
                Inga tillgängliga tider för det valda datumet. Välj ett annat datum.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {availableSlots.map((slot, index) => (
                  <Grid xs={6} md={4} lg={3} key={index}>
                    <Card
                      variant={selectedSlot?.startTime === slot.startTime ? "solid" : "outlined"}
                      color={selectedSlot?.startTime === slot.startTime ? "primary" : "neutral"}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 'lg' }
                      }}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Schedule sx={{ mb: 1 }} />
                        <Typography level="h6">
                          {slot.startTime} - {slot.endTime}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography level="h4" mb={3}>
              Granska & betala
            </Typography>
            
            {/* Booking Summary */}
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography level="h6" mb={2}>Bokningssammanfattning</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Lektion:</Typography>
                    <Typography level="body2">{selectedLesson?.name}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Växellåda:</Typography>
                    <Typography level="body2">{selectedGear}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Datum:</Typography>
                    <Typography level="body2">{selectedDate}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Tid:</Typography>
                    <Typography level="body2">
                      {selectedSlot?.startTime} - {selectedSlot?.endTime}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography level="h6">Totalt:</Typography>
                    <Typography level="h6" color="primary">
                      {selectedLesson?.price} SEK
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <Card variant="outlined">
              <CardContent>
                <Typography level="h6" mb={2}>Betalmetod</Typography>
                <FormControl>
                  <FormLabel>Välj betalmetod</FormLabel>
                  <Select
                    value={paymentMethod}
                    onChange={(e, newValue) => setPaymentMethod(newValue)}
                  >
                    <Option value="QLIRO">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <img src="https://assets.qliro.com/shared/se/sv/logo/1/logo_text_mint.png" 
                             alt="Qliro" style={{ height: 20, marginRight: 8 }} />
                        Qliro One
                      </Box>
                    </Option>
                    <Option value="SWISH">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Payment sx={{ mr: 1 }} />
                        Swish
                      </Box>
                    </Option>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography level="h2" mb={2}>
          Boka din körlektion
        </Typography>
        <Typography level="body1" color="neutral">
          Följ dessa enkla steg för att boka din lektion
        </Typography>
      </Box>

      {/* Stepper */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          {steps.map((label, index) => (
            <Box key={label} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: index <= activeStep ? 'primary.500' : 'neutral.300',
                  color: index <= activeStep ? 'white' : 'neutral.500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  mb: 1
                }}
              >
                {index + 1}
              </Box>
              <Typography 
                level="body3" 
                textAlign="center"
                color={index <= activeStep ? 'primary' : 'neutral'}
              >
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert color="danger" sx={{ mb: 3 }} startDecorator={<ErrorOutline />}>
          {error}
        </Alert>
      )}

      {/* Step Content */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={handleBack}
          disabled={activeStep === 0 || loading}
        >
          Tillbaka
        </Button>
        
        {activeStep === steps.length - 1 ? (
          <Button
            variant="solid"
            color="success"
            onClick={() => setShowConfirmDialog(true)}
            disabled={!canProceed() || loading}
            startDecorator={<Payment />}
          >
            Slutför bokning
          </Button>
        ) : (
          <Button
            variant="solid"
            onClick={handleNext}
            disabled={!canProceed() || loading}
          >
            Nästa
          </Button>
        )}
      </Box>

      {/* Confirmation Modal */}
      <Modal open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <ModalDialog>
          <ModalClose />
          <Typography level="h4" mb={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle color="success" />
              Bekräfta din bokning
            </Box>
          </Typography>
          <Typography mb={3}>
            Är du säker på att du vill fortsätta med denna bokning? Du kommer att omdirigeras till betalningssidan.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              onClick={() => setShowConfirmDialog(false)}
              disabled={loading}
            >
              Avbryt
            </Button>
            <Button 
              variant="solid" 
              color="success" 
              onClick={handleBooking}
              loading={loading}
            >
              Bekräfta & betala
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default BookingFlow;
