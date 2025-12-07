// frontend/src/components/ReserveVehicleFormB.js
import React, { useState } from 'react';
import browsee from '@browsee/web-sdk';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { reserveVehicle } from '../services/vehicleService';
import { getAuth } from 'firebase/auth';
import '../CSS/VersionB.css'; // Use new styles

function ReserveVehicleFormB({ token, reserveVehicleId, setReserveVehicleId, fetchVehicles, onRefresh, onSuccess }) {
  const [endDate, setEndDate] = useState(new Date());
  const startDate = new Date().toISOString().split('T')[0];
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReservationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const auth = getAuth();
    const user = auth.currentUser;
    const uid = user ? user.uid : null;

    if (!uid) {
      setMessage('Please log in to make a reservation.');
      setLoading(false);
      return;
    }

    if (!endDate) {
      setMessage('Please select an end date.');
      setLoading(false);
      return;
    }

    try {
      const result = await reserveVehicle(reserveVehicleId, {
        startDate,
        endDate: endDate.toISOString().split('T')[0],
      }, token);

      if (result.success) {
        browsee.addEvent('Reservation_Success', { vehicleId: reserveVehicleId, variant: 'B' });
        if (onRefresh) {
            await onRefresh();
        }
        if (onSuccess) {
            onSuccess();
        } else {
             setReserveVehicleId(null);
             fetchVehicles();
        }
      } else {
        setMessage(result.error || 'Failed to reserve vehicle.');
      }
    } catch (error) {
      console.error('Error reserving:', error);
      setMessage('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reservation-page-container-b"> 
       <div className='reservation-card' style={{maxWidth: '600px', width: '100%'}}>
            <h2 style={{textAlign: 'center', marginBottom: '10px'}}>Complete Your Reservation</h2>
            <p style={{textAlign: 'center', color: '#666', marginBottom: '30px'}}>
                Select an end date for your reservation starting today ({startDate}).
            </p>

            <form onSubmit={handleReservationSubmit} className="reservation-form-b">
                <div className="calendar-wrapper-b">
                    <Calendar
                        onChange={setEndDate}
                        value={endDate}
                        minDate={new Date()}
                        className="custom-calendar-b"
                    />
                </div>

                <div className="form-actions-b">
                     <button 
                        type="button" 
                        onClick={() => setReserveVehicleId(null)} 
                        className="btn-action-b btn-view-b"
                        style={{fontSize: '1rem', padding: '12px 24px'}}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className="btn-action-b btn-reserve-b"
                        disabled={loading}
                        style={{fontSize: '1rem', padding: '12px 24px'}}
                    >
                        {loading ? 'Reserving...' : 'Confirm Reservation'}
                    </button>
                </div>
            </form>
            
            {message && (
                <div style={{
                    marginTop: '20px', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    backgroundColor: '#fff5f5', 
                    color: '#c53030', 
                    border: '1px solid #feb2b2',
                    textAlign: 'center'
                }}>
                    {message}
                </div>
            )}
       </div>
    </div>
  );
}

export default ReserveVehicleFormB;
