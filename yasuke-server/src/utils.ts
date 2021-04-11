export class Utils {
    public static address0 = "0x0000000000000000000000000000000000000000";
    public static getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
}

export class ResponseUtils {    
    static getSuccessResponse(data: any, message?: string): Response {
        const r: Response = {
            status: "success",
            message: message,
            data: data
        };

        return r;
    }
}

export class Response {
    status: string;
    message: string;
    data: any;
}
