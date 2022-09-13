import {ReplaySubject} from 'rxjs';

export interface AudioStatus {
    load$Array: Array<ReplaySubject<any>>;
    unload$Array: Array<ReplaySubject<any>>;
    isLoaded: boolean;
}
