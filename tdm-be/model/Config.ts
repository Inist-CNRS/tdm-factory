
export class Config {
    wrappers: SwaggerApi[] = [
        {
            url: 'https://data-wrapper.services.istex.fr',
            tags: [{
                name: 'data-wrapper',
                excluded: []
            }]
        }
    ];
    enrichments: SwaggerApi[] = [
        {
            url: 'https://data-computer.services.istex.fr',
            retrieveUrl: '/v1/retrieve',
            tags: [{
                name: 'data-computer',
                excluded: ['/v1/collect', '/v1/retrieve', '/v1/mock-error-async', '/v1/mock-error-sync']
            }]
        }
    ];

    mailSuccess: Mail = {
        subject: 'Objet du mail succès',
        text: 'Vous pouvez télécharger le fichier enrichi à l\'adresse ci-dessous'
    };
    mailError: Mail = {
        subject: 'Objet du mail d\'erreur',
        text: 'Une erreur s\'est produite lors de l\'enrichissement'
    };

    getConfig(): Config {
        return this;
    }
    setConfig(data: Config) {
        this.wrappers = data.wrappers;
        this.enrichments = data.enrichments;
    }
}

export class SwaggerApi {
    url: string = '';
    retrieveUrl?: string;
    tags: Tag[] = [];
}

export class Tag {
    name: string = '';
    excluded?: string[] = [];
}

export class Mail {
    subject: string = '';
    text: string = '';
}
const singleton = new Config()

module.exports = singleton;
