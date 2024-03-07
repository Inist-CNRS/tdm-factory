import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import CircularProgress from '@mui/material/CircularProgress';
import { useMemo } from 'react';
import type { TimelineContentProps } from '@mui/lab/TimelineContent';
import type { TimelineDotProps } from '@mui/lab/TimelineDot';

export type StatusTimeline = {
    isRunning?: boolean;
    isComplet?: boolean;
    isOnError?: boolean;
    text: string;
};

// TODO Add scss file instead of the jsx css
const CustomTimelineDot = ({
    color,
    isRunning,
    isOnError,
}: {
    color: TimelineDotProps['color'];
    isRunning: boolean;
    isOnError: boolean;
}) => {
    if (isRunning) {
        return (
            <TimelineDot color={color}>
                <CircularProgress size={16} />
            </TimelineDot>
        );
    }

    if (isOnError) {
        return (
            <TimelineDot color={color} sx={{ padding: 0 }}>
                <ErrorOutlineIcon sx={{ width: 24, height: 24 }} />
            </TimelineDot>
        );
    }

    return (
        <TimelineDot color={color}>
            <div style={{ width: 16, height: 16 }}></div>
        </TimelineDot>
    );
};

const StatusTimeline = ({ isRunning = false, isComplet = false, isOnError = false, text }: StatusTimeline) => {
    const dotColor = useMemo<TimelineDotProps['color']>(() => {
        if (isComplet) {
            return 'primary';
        }
        if (isOnError) {
            return 'error';
        }
        return undefined;
    }, [isComplet, isOnError]);

    const textColor = useMemo<TimelineContentProps['color']>(() => {
        if (isOnError) {
            return 'error';
        }
        return 'text.primary';
    }, [isOnError]);

    return (
        <TimelineItem>
            <TimelineSeparator>
                <TimelineConnector />
                <CustomTimelineDot color={dotColor} isRunning={isRunning} isOnError={isOnError} />
                <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent sx={{ m: 'auto 0' }} align="right" color={textColor}>
                {text}
            </TimelineContent>
        </TimelineItem>
    );
};

export default StatusTimeline;
