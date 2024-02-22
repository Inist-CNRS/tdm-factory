// eslint-disable-next-line no-shadow
enum Status {
    UNKNOWN,
    STARTING,
    WRAPPER_RUNNING,
    WRAPPER_ERROR,
    ENRICHMENT_RUNNING,
    ENRICHMENT_ERROR,
    WAITING_WEBHOOK,
    FINISHED,
    FINISHED_ERROR,
}
export default Status;
