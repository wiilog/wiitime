import {Entity} from '@app/services/sqlite/entities/entity';

export interface Clocking extends Entity {
    badge_number: string;
    clocking_date: string;
    is_synchronised: boolean;
}
