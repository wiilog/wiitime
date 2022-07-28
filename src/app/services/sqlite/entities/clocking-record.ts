import {Entity} from '@app/services/sqlite/entities/entity';

export class ClockingRecord implements Entity {
    public id: number;
    public badgeNumber: string;
    public clockingDate: string;
    public isSynchronised: boolean;
}
