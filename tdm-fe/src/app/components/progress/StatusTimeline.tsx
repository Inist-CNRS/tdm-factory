import '~/app/components/progress/scss/StatusTimeline.scss';
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

export type StatusTimelineProps = {
    isRunning?: boolean;
    isComplete?: boolean;
    isOnError?: boolean;
    text: string;
};

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
            <TimelineDot color={color} className="status-timeline-error">
                <ErrorOutlineIcon className="status-timeline-error-icon" />
            </TimelineDot>
        );
    }

    return (
        <TimelineDot color={color}>
            <div className="status-timeline-waiting"></div>
        </TimelineDot>
    );
};

const StatusTimeline = ({
    isRunning = false,
    isComplete = false,
    isOnError = false,
    text,
}: StatusTimelineProps) => {
    const dotColor = useMemo<TimelineDotProps['color']>(() => {
        if (isComplete) {
            return 'primary';
        }
        if (isOnError) {
            return 'error';
        }
        return undefined;
    }, [isComplete, isOnError]);

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
                <CustomTimelineDot
                    color={dotColor}
                    isRunning={isRunning}
                    isOnError={isOnError}
                />
                <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent
                className="status-timeline-content"
                align="right"
                color={textColor}
            >
                {text}
            </TimelineContent>
        </TimelineItem>
    );
};

export default StatusTimeline;
