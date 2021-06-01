import { Body, Controller, Post } from '@nestjs/common';
import { Whitelist } from 'src/models/whitelist.model';
import { Response, ResponseUtils } from 'src/utils';
import { ICOService } from 'src/services/ico.service';

@Controller('ico')
export class ICOController {
    constructor(private icoService: ICOService) {}

    @Post('whitelist')
    async whitelist(@Body() whitelist: Whitelist): Promise<Response> {
        return ResponseUtils.getSuccessResponse(
            await this.icoService.whitelist(whitelist)
          );        
    }
}
