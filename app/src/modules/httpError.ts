export class HttpError extends Error {
    code:number;
    constructor(_code:number, message:string) {
        super(message);
        this.code=_code;        
    }
} 