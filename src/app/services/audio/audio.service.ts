import {Injectable} from '@angular/core';
import {StorageService} from '@app/services/storage/storage.service';
import {AudioAssetInfo} from '@app/services/audio/audio-asset-info';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {from, Observable, of, ReplaySubject} from 'rxjs';
import {catchError, map, mergeMap} from 'rxjs/operators';
import {NativeAudio} from '@capacitor-community/native-audio';

@Injectable({
    providedIn: 'root'
})
export class AudioService {

    private preloadedAudioId: Map<string, Observable<any>>;

    public constructor(private storageService: StorageService) {
        this.preloadedAudioId = new Map<string, Observable<any>>();
    }

    public tryPreloadAudio(audioId: string, audioInfo: AudioAssetInfo): Observable<boolean> {

        const loadingOver = new ReplaySubject<any>(1);

        if (!this.preloadedAudioId.has(audioId)) {
            this.preloadedAudioId.set(audioId, loadingOver);
            this.preloadAudio(audioId, audioInfo).subscribe((preloadResult: boolean) => {
                loadingOver.next(preloadResult);
            });

        } else {
            this.preloadedAudioId.get(audioId)
                .pipe(
                    mergeMap(() => this.preloadAudio(audioId, audioInfo)),
                )
                .subscribe((preloadResult: boolean) => {
                    this.preloadedAudioId.get(audioId)
                        .pipe(
                            mergeMap(() => loadingOver)
                        );
                    loadingOver.next(preloadResult);
                });
        }
        return loadingOver;
    }

    /**
     * Play the audio file linked to the given id from start time second if it's loaded
     * Never await this function as NativeAudio.play will never finish
     *
     * @param audioId the id of the loaded audio that should be played
     * @param startTime the starting second of the audio file (should be inferior to the file length)
     */
    public playAudio(audioId: string, startTime: number): void {
        if (!this.preloadedAudioId.has(audioId)) {
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

    public unloadAudio(audioId: string): void {
        if (!this.preloadedAudioId.has(audioId)) {
            console.log('cannot unload a non loaded sound :', audioId);
            return;
        }

        const unloadOver = new ReplaySubject<any>(1);

        this.preloadedAudioId.get(audioId)
            .pipe(
                mergeMap(() =>
                    from(NativeAudio.unload({
                        assetId: audioId
                    }))
                ),
            )
            .subscribe(() => {
                console.log('unload done');
                this.preloadedAudioId.get(audioId)
                    .pipe(
                        mergeMap(() => unloadOver)
                    );
                unloadOver.next(false);
            });
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
