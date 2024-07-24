type TextCellProps = {
    value?: string | null;
};

const TextCell = ({ value }: TextCellProps) => {
    if (value) {
        return <code>{value}</code>;
    }

    return (
        <i>
            <code>null</code>
        </i>
    );
};

export default TextCell;
