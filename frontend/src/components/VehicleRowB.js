// frontend/src/components/VehicleRowB.js
import React, { useState } from "react";
import "../CSS/VersionB.css";

const VehicleRowB = ({
  vehicle,
  userReservation,
  canRepairVehicle,
  canDeleteVehicle,
  handleView,
  handleReserve,
  removeReserve,
  setReportIssueVehicleId,
  handleRepair,
  handleDelete,
  handleViewMessage,
}) => {
  const status = vehicle.status;
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  return (
    <tr className={`vehicle-row-b ${status}`}>
      <td>
        <div className="vehicle-name-b">{vehicle.vehicleName}</div>

      </td>
      <td>{vehicle.color || "—"}</td>
      <td>{vehicle.year || "—"}</td>
      <td>
        <span className="engine-badge-b">{vehicle.engine}</span>
        {vehicle.hp && <span className="hp-badge-b">{vehicle.hp} HP</span>}
      </td>
      <td>
        <div className="vehicle-actions-b">
          <button onClick={() => handleView(vehicle)} className="btn-action-b btn-view-b">
            View
          </button>

          {status === "available" && !userReservation && (
            <button
              onClick={() => handleReserve(vehicle.vehicleId)}
              className="btn-action-b btn-reserve-b"
            >
              Reserve
            </button>
          )}

          {status !== "available" && userReservation?.vehicleId === vehicle.vehicleId && (
            <>
              <button
                onClick={() => setShowConfirmModal(true)}
                className="btn-action-b btn-warning-b"
              >
                End
              </button>
              <button
                onClick={() => setReportIssueVehicleId(vehicle.vehicleId)}
                className="btn-action-b btn-outline-b"
              >
                Report
              </button>
            </>
          )}

          {canRepairVehicle && status === "repair" && (
            <>
              <button onClick={() => handleRepair(vehicle.vehicleId)} className="btn-action-b btn-repair-b">
                Fix
              </button>
              <button onClick={() => handleViewMessage(vehicle.vehicleId)} className="btn-action-b btn-outline-b">
                Message
              </button>
            </>
          )}

          {canDeleteVehicle && (
            <button onClick={() => handleDelete(vehicle.vehicleId)} className="btn-action-b btn-delete-b">
              Delete
            </button>
          )}
        </div>

        {/* Custom Confirmation Modal */}
        {showConfirmModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>End Reservation?</h3>
              <p>Are you sure you want to end your reservation?</p>
              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setShowConfirmModal(false)}
                >
                  No, Keep it
                </button>
                <button
                  className="btn-danger"
                  onClick={() => {
                    removeReserve(vehicle);
                    setShowConfirmModal(false);
                  }}
                >
                  Yes, End it
                </button>
              </div>
            </div>
          </div>
        )}
      </td>
    </tr>
  );
};

export default VehicleRowB;
