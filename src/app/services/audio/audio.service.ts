import {Injectable} from '@angular/core';
import {StorageService} from '@app/services/storage/storage.service';
import {AudioAssetInfo} from '@app/services/audio/audio-asset-info';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {from, iif, Observable, of, ReplaySubject} from 'rxjs';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {NativeAudio} from '@capacitor-community/native-audio';
import {AudioStatus} from '@app/services/audio/audio-status';

@Injectable({
    providedIn: 'root'
})
export class AudioService {

    private preloadedAudioId: Map<string, AudioStatus>;

    public constructor(private storageService: StorageService) {
        this.preloadedAudioId = new Map<string, AudioStatus>();
    }

    public tryPreloadAudio(audioId: string, audioInfo: AudioAssetInfo): Observable<boolean> {
        const loadOver = new ReplaySubject<any>(1);

        if (this.preloadedAudioId.has(audioId)) {
            const currentAudioStatus = this.preloadedAudioId.get(audioId);

            if (currentAudioStatus.unload$Array.length === 0) {
                console.log(`cannot load the sound with id ${audioId}, it's already loading`);
                return of(false);
            }

            currentAudioStatus.load$Array.push(loadOver);
            currentAudioStatus.unload$Array.pop()
                .pipe(
                    mergeMap(() =>
                        this.preloadAudio(audioId, audioInfo)
                    ),
                )
                .subscribe((loadResult: boolean) => {
                    loadOver.next(loadResult);
                    currentAudioStatus.isLoaded = true;
                    console.log('load done');
                });

        } else {
            const currentAudioStatus = {
                load$Array: new Array<ReplaySubject<any>>(),
                unload$Array: new Array<ReplaySubject<any>>(),
                isLoaded: false
            };
            this.preloadedAudioId.set(audioId, currentAudioStatus);

            currentAudioStatus.load$Array.push(loadOver);
            this.preloadAudio(audioId, audioInfo)
                .subscribe((loadResult: boolean) => {
                    currentAudioStatus.isLoaded = true;
                    loadOver.next(loadResult);
                    console.log('load done');
                });
        }

        return loadOver;
    }

    /**
     * Play the audio file linked to the given id from start time second if it's loaded
     * Never await this function as NativeAudio.play will never finish
     *
     * @param audioId the id of the loaded audio that should be played
     * @param startTime the starting second of the audio file (should be inferior to the file length)
     */
    public playAudio(audioId: string, startTime: number): void {
        if (!this.preloadedAudioId.has(audioId) || !this.preloadedAudioId.get(audioId).isLoaded) {
            console.log(`sound with id ${audioId} is not loaded, cannot play it`);
            return;
        }

        NativeAudio.getDuration({assetId: audioId})
            .then((soundDuration) => {
                    if (startTime > soundDuration.duration) {
                        return;
                    }
                    NativeAudio.play({
                        assetId: audioId,
                        time: startTime
                    });
                }
            );
    }

    public unloadAudio(audioId: string): Observable<any> {
        if (!this.preloadedAudioId.has(audioId)) {
            console.log(`cannot unload the sound with id ${audioId}, it's not loaded`);
            return of(false);
        }

        const currentAudioStatus = this.preloadedAudioId.get(audioId);

        if (currentAudioStatus.load$Array.length === 0) {
            console.log(`cannot unload the sound with id ${audioId}, it's already unloading`);
            return of(false);
        }

        const unloadOver = new ReplaySubject<any>(1);
        currentAudioStatus.unload$Array.push(unloadOver);

        currentAudioStatus.load$Array.pop()
            .pipe(
                mergeMap(() =>
                    from(NativeAudio.unload({
                        assetId: audioId
                    }))
                ),
            )
            .subscribe(() => {
                console.log('unload done');
                currentAudioStatus.isLoaded = false;
                unloadOver.next(true);
            });

        return unloadOver;
    }

    private preloadAudio(audioId: string, audioInfo: AudioAssetInfo): Observable<boolean> {
        return this.storageService.getValue(StorageKeyEnum.CLOCKING_SOUND_VOLUME)
            .pipe(
                mergeMap((clockingSoundVolume) =>
                    NativeAudio.preload({
                        assetId: audioId,
                        assetPath: audioInfo.assetPath,
                        //volume should be between 0 and 1 and value from storage is between 0 and 100
                        volume: Number(clockingSoundVolume) / 100,
                        audioChannelNum: 1,
                        isUrl: audioInfo.isPathUrl,
                    })
                ),
                map(() =>
                    true
                ),
                catchError((err) => {
                    console.error(err);
                    return of(false);
                }),
            );
    }
}
