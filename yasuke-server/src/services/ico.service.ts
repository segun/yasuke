import { Logger } from '@ethersproject/logger';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Whitelist } from 'src/models/whitelist.model';
import { Repository } from 'typeorm';

@Injectable()
export class ICOService {
    private readonly logger = new Logger(ICOService.name);

    @InjectRepository(Whitelist)
    whitelistRepository: Repository<Whitelist>

    constructor() {

    }

    async whitelist(whitelist: Whitelist): Promise<Whitelist> {
        return new Promise(async (resolve, reject) => {
            try {
                let dbWhitelist = await this.whitelistRepository.createQueryBuilder("whitelist")
                    .where("email = :email", { email: whitelist.email })
                    .getOne();

                if (dbWhitelist !== undefined) {
                    reject("Email Address already exists");
                }

                dbWhitelist = await this.whitelistRepository.createQueryBuilder("whitelist")
                    .where("walletAddress = :wa", { wa: whitelist.walletAddress })
                    .getOne();

                if (dbWhitelist !== undefined) {
                    reject("Wallet Address already exists");
                }

                dbWhitelist = await this.whitelistRepository.createQueryBuilder("whitelist")
                    .where("linkedInURL = :lu", { lu: whitelist.linkedInURL })
                    .getOne();

                if (dbWhitelist !== undefined) {
                    reject("Linked In URL already exists");
                }

                dbWhitelist = await this.whitelistRepository.save(whitelist);

                resolve(dbWhitelist);
            } catch (error) {
                reject(error);
            }
        });

    }
}
