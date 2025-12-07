import VehicleRowB from "./VehicleRowB"; // Use the new Version B row
import browsee from '@browsee/web-sdk';

const VehicleTableB = ({
  vehicles,
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
  return (
    <div style={{ overflowX: "auto" }}>
        <table className="vehicle-table-b">
        <thead>
            <tr>
            <th>Vehicle</th>
            <th>Color</th>
            <th>Year</th>
            <th>Specs</th>
            <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {vehicles.map((vehicle) => (
            <VehicleRowB
                key={vehicle.vehicleId}
                vehicle={vehicle}
                userReservation={userReservation}
                canRepairVehicle={canRepairVehicle}
                canDeleteVehicle={canDeleteVehicle}
                handleView={handleView}
                handleReserve={(id) => {
                    browsee.addEvent('Reservation_Clicked', { vehicleName: vehicle.vehicleName });
                    handleReserve(id);
                }}
                removeReserve={removeReserve}
                setReportIssueVehicleId={setReportIssueVehicleId}
                handleRepair={handleRepair}
                handleDelete={handleDelete}
                handleViewMessage={handleViewMessage}
            />
            ))}
        </tbody>
        </table>
    </div>
  );
};

export default VehicleTableB;
