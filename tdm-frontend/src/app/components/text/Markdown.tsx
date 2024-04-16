import '~/app/components/text/Markdown.scss';
import MarkDownIt from 'markdown-it';
import { useMemo } from 'react';

import type { DetailedHTMLProps, HTMLAttributes } from 'react';

export type MarkdownProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
    text: string;
};

const md = MarkDownIt({
    html: false, // Disable source HTML tags rendering
    typographer: true,
    quotes: ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'],
});

const Markdown = ({ text, ...props }: MarkdownProps) => {
    const renderedText = useMemo(() => {
        return md.render(text);
    }, [text]);

    return (
        <div
            {...props}
            className={`markdown ${props.className}`}
            dangerouslySetInnerHTML={{
                __html: renderedText,
            }}
        >
            {/* Markdown are set via innerHTML*/}
        </div>
    );
};

export default Markdown;
