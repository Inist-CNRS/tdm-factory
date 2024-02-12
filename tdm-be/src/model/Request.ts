export class Request {
    label?: string;
    url = '';
    parameters?: Parameter[];
    fileType?: string[];
    description?: string;
}

export class Parameter {
    displayName?: string;
    name?: string;
    value?: string;
}
