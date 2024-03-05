import '~/app/components/progress/CircularWaiting.scss';
import CircularProgress from '@mui/material/CircularProgress';

const CircularWaiting = () => {
    return (
        <div className="circular-waiting">
            <CircularProgress />
        </div>
    );
};

export default CircularWaiting;
