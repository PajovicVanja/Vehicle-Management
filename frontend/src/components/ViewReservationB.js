// components/ViewReservationB.js
import React, { useState, useEffect } from 'react';
import '../CSS/UploadLicense.css';
import '../CSS/ReserveVehicle.css';
import '../CSS/VersionB.css'; // Import Version B CSS

import { getVehicleData, unreserveVehicle, reportVehicleIssue } from '../services/vehicleService';
import { deleteReservation } from '../services/reservationService';

function ViewResB({ token, reservationData, onReservationCleared, onRefresh }) {
  const [vehicles, setVehicles] = useState([]);
  const [userVehicle, setUserVehicle] = useState(null);

  // UI for actions on dashboard
  const [actionMsg, setActionMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [issueDescription, setIssueDescription] = useState('');

  // Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const vehicleSnapshot = await getVehicleData(token);
        if (vehicleSnapshot.success) {
          setVehicles(vehicleSnapshot.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchVehicles();
  }, [token]);

  useEffect(() => {
    if (vehicles.length > 0) {
      const v = vehicles.find(v => v.vehicleId === reservationData.vehicleId);
      setUserVehicle(v || null);
    }
  }, [vehicles, reservationData.vehicleId]);

  const clearReservationInParent = () => {
    if (typeof onReservationCleared === 'function') {
      onReservationCleared();
    }
  };

  const handleRemoveReservation = async () => {
    if (!reservationData?.reservationId || !reservationData?.vehicleId) return;
    setSubmitting(true);
    setActionMsg('');
    try {
      // 1) Mark vehicle available
      const unreserve = await unreserveVehicle(reservationData.vehicleId, token);
      if (!unreserve.success) {
        setActionMsg(unreserve.error || 'Failed to unreserve vehicle.');
        setSubmitting(false);
        return;
      }

      // 2) Delete the reservation doc
      const del = await deleteReservation(reservationData.reservationId, token);
      if (!del.success) {
        setActionMsg(del.error || 'Failed to delete reservation.');
        setSubmitting(false);
        return;
      }

      setActionMsg('Reservation removed.');
      if (typeof onRefresh === 'function') {
         await onRefresh();
      }
      clearReservationInParent();
    } catch (e) {
      console.error('Remove reservation error:', e);
      setActionMsg('An error occurred while removing the reservation.');
    } finally {
      setSubmitting(false);
      setShowConfirmModal(false); 
    }
  };

  const handleReportIssue = async (e) => {
    e.preventDefault();
    if (!issueDescription.trim()) {
      setActionMsg('Please describe the issue.');
      return;
    }
    setSubmitting(true);
    setActionMsg('');
    try {
      // Backend sets vehicle to "repair" and deletes active reservations for this vehicle.
      const res = await reportVehicleIssue(reservationData.vehicleId, { description: issueDescription.trim() }, token);
      if (!res.success) {
        setActionMsg(res.error || 'Failed to report issue.');
      } else {
        setActionMsg('Issue reported. Reservation has been cleared.');
        clearReservationInParent();
      }
    } catch (e) {
      console.error('Report issue error:', e);
      setActionMsg('An error occurred while reporting the issue.');
    } finally {
      setSubmitting(false);
      setShowReportForm(false);
      setIssueDescription('');
    }
  };

  if (!userVehicle) return <></>;

  return (
    <div className="reservation-container">
      {/* CARD DESIGN */}
      <div className="reservation-card">
        <h2>Your Current Reservation (vB)</h2>
        
        <div className="card-row">
            <span className="card-label">Vehicle Name:</span>
            <span className="card-value">{userVehicle.vehicleName}</span>
        </div>
        <div className="card-row">
            <span className="card-label">Start Date:</span>
            <span className="card-value">{reservationData.startDate}</span>
        </div>
        <div className="card-row">
            <span className="card-label">End Date:</span>
            <span className="card-value">{reservationData.endDate}</span>
        </div>
        <div className="card-row">
            <span className="card-label">Status:</span>
            <span className="card-value">{reservationData.status}</span>
        </div>

        <div className="button-group" style={{ marginTop: 20, justifyContent: 'center' }}>
          <button
            className="btn-danger"
            onClick={() => setShowConfirmModal(true)} // Open modal instead of direct action
            disabled={submitting}
          >
            {submitting ? 'Processing…' : 'Remove Reservation'}
          </button>

          {!showReportForm ? (
            <button
              className="btn-primary"
              onClick={() => setShowReportForm(true)}
              disabled={submitting}
            >
              Report Issue
            </button>
          ) : null}
        </div>
      </div>

      {showReportForm && (
        <form onSubmit={handleReportIssue} style={{ marginTop: 12, maxWidth: 500, margin: '20px auto' }}>
          <textarea
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            placeholder="Describe the issue"
            rows={4}
            style={{ width: '100%' }}
          />
          <div className="button-group" style={{ marginTop: 8, justifyContent: 'center' }}>
            <button className="btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Issue'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setShowReportForm(false);
                setIssueDescription('');
              }}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {actionMsg && <p className="profile-message" style={{ marginTop: 10, textAlign: 'center' }}>{actionMsg}</p>}

        {/* CONFIRMATION MODAL */}
        {showConfirmModal && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h3>Are you sure you want to cancel this reservation?</h3>
                    <div className="modal-actions">
                        <button 
                            className="btn-secondary"
                            onClick={() => setShowConfirmModal(false)}
                        >
                            No, Keep it
                        </button>
                        <button 
                            className="btn-danger"
                            onClick={handleRemoveReservation}
                        >
                            Yes, Cancel
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}

export default ViewResB;
