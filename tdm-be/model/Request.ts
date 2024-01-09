export class Request {
  label?: string;
  url?: string;
  parameters?: Parameter[];
  fileType?: string[];
  description?: string;
}

export class Parameter {
  displayName?: string;
  name?: string;
  value?: string;
}