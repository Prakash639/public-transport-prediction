
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import PassengerBusSearch from './passenger/PassengerBusSearch';
import DriverDashboard from './driver/DriverDashboard';
import AdminDashboard from './admin/AdminDashboard';

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    if (!user) return null;

    if (user.role === 'admin') {
        return <AdminDashboard />;
    } else if (user.role === 'driver') {
        return <DriverDashboard />;
    } else {
        return <PassengerBusSearch />;
    }
};

export default Dashboard;
