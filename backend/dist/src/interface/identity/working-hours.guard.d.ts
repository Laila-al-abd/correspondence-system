import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { BusinessHoursService } from '../../application/observability/services/business-hours.service';
export declare class WorkingHoursGuard implements CanActivate {
    private readonly reflector;
    private readonly businessHours;
    private readonly config;
    private readonly logger;
    constructor(reflector: Reflector, businessHours: BusinessHoursService, config: ConfigService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private assertAllowedNetwork;
    private assertWorkingHours;
    private closedMessage;
}
