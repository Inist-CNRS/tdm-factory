type IDCellProps = {
    value?: string | null;
};

const IDCell = ({ value }: IDCellProps) => {
    if (value) {
        return <b>{value}</b>;
    }

    return <i>null</i>;
};

export default IDCell;
