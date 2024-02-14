export class Parameter {
    displayName?: string;
    name?: string;
    value?: string;
}

export class Request {
    label?: string;
    url = '';
    parameters?: Parameter[];
    fileType?: string[];
    description?: string;
}
