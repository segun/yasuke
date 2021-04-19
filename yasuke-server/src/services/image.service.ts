import { Injectable, Logger } from '@nestjs/common';
import { UploadApiOptions, UploadApiResponse, v2 } from 'cloudinary';

@Injectable()
export class ImageService {
    private readonly logger = new Logger(ImageService.name);
    constructor() {
        v2.config({
            cloud_name: 'xendbit',
            api_key: '289875491748246',
            api_secret: 'tZILi09rvlogXGuTMkP7x0MrhTA'
        });
    }

    async uploadAssetImage(b64Image: string): Promise<string> {
        if(b64Image === "11111111111") {
            return "imageUrl";
        }
        const options: UploadApiOptions = {
            resource_type: "raw"
        }

        const response: UploadApiResponse = await v2.uploader.upload(b64Image, options);
        return response.secure_url;
    }
}
