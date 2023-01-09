declare namespace VxDicionario {
    export interface data {
         /**
         * - Veja o significado da palavra!
         * 
         * @palavra args.
         * @exemplo 
         * ```js
         * palavra.data[0].significado;
         * ```
         */
        significados: string[]|null;
        /**
         * - Veja de qual classe a palavra pertence!
         * 
         * @palavra args.
         * @exemplo 
         * ```js
         * palavra.data[0].classe;
         * ```
         */
        classe: string;
    }

    export interface API {
        httpsResponse: string;
        /**
         * - Veja as informações da palavra!
         * 
         * @palavra args.
         * @exemplo 
         * ```js
         * //para obter tudo:
         * palavra.data;
         * ```
         * ```js
         * //para obter resultados:
         * palavra.data[0];
         * ```
         */
        data: data[]|null;
        /**
         * - Veja o status da api.
         * 
         * @palavra args.
         * @exemplo 
         * ```js
         * if(palavra.status === 404) return "api não achou a palavra!";
         * if(palavra.status === 200) return "api achou a apalavra!"
         * ```
         */
        status: number;
        version: number;
        /**
         * - Veja as frases da palavra.
         * 
         * @palavra args.
         * @exemplo 
         * ```js
         * console.log(palavra.frases); //mostra todas
         * console.log(palavra.frases[0]) //mostra apenas uma
         * ```
         */
        frases: string[];
        /**
         * - Veja a etimologia da palavra.
         * 
         * @palavra args.
         * @exemplo 
         * ```js
         * console.log(palavra.etimologia);
         * ```
         */
        etimologia: string;
        /**
         * - Veja o plural da palavra.
         * 
         * @palavra args.
         * @exemplo 
         * ```js
         * console.log(palavra.plural);
         * ```
         */
        plural: string | null;
        /**
         * - Veja os sinônimos da palavra.
         * 
         * @palavra args.
         * @exemplo 
         * ```js
         * console.log(palavra.sinonimos);
         * ```
         */
        sinonimos: string[];
        /**
         * - Veja os antônimos da palavra.
         * 
         * @palavra args.
         * @exemplo 
         * ```js
         * console.log(palavra.antonimos);
         * ```
         */
        antonimos: string[];
                /**
         * - Veja como a palavra fica se separar elas.
         * 
         * @palavra args.
         * @exemplo 
         * ```js
         * console.log(palavra.separacaoSilabica);
         * ```
         */
        separacaoSilabica: string[];
    }
}

declare namespace Version {
    export interface version {
        version : "1.3.0"
    }
}

/**
 * - Este pacote foi criado e desenvolvido para pegar as informações de https://www.dicio.com.br/ e formatadas para json, sendo assim isto fica muito mais fácil de usar em qualquer aplicação.
 * @param pesquisar Pesquise a palavra que você deseja saber.
 * 
 * Tutorial: https://www.npmjs.com/package/vxdicionario.
 */
declare function VxDicionario(termo: string): Promise<VxDicionario.API>;

declare function Version(): Promise<Version.version>;

export = VxDicionario   