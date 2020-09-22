import React, { useState, useRef} from 'react';
import { IonButton, IonModal, IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, useIonViewWillEnter, useIonViewDidEnter, useIonViewWillLeave } from '@ionic/react';
import './VideoPlayerFullscreen.css';
import { Capacitor, Plugins } from '@capacitor/core';
import { useVideoPlayer } from 'react-video-player-hook';
import { RouteComponentProps } from 'react-router';
import { useStorage } from '@capacitor-community/react-hooks/storage';

const { Toast } = Plugins;

const VideoPlayerFullscreen: React.FC<RouteComponentProps> = ({/*location,*/ history}) => {

  const platform = Capacitor.getPlatform();
  var params: any = useRef<any>({});
  var first: any = useRef<boolean>(false);
  var apiCount = useRef<number>(-1);
  let apiTimer1: any ;
  let apiTimer2: any ;
  let apiTimer3: any ;
  
  const [showModal, setShowModal] = useState(false);
  const { get, remove } = useStorage();
  const exit = useRef(false)

  /**
   * Define Listeners
   */

  const onReady = (fromPlayerId: string, currentTime: number | undefined) => {
    console.log("in OnReady playerId " + fromPlayerId +
            " currentTime " + currentTime);
  };
  const onEnded = (fromPlayerId: string, currentTime: number | undefined) => {
    console.log("in OnEnded playerId " + fromPlayerId +
            " currentTime " + currentTime);
      setShowModal(false);
      exit.current = true;
      history.push(`/home`);
  };
  const onExit = (dismiss: boolean) => {
      console.log("in OnExit dismiss " + dismiss);
      setShowModal(false);
      exit.current = true;
      history.push(`/home`);
  };
  const onPlay = async (fromPlayerId: string, currentTime: number | undefined) => {
    console.log("in OnPlay playerId " + fromPlayerId +
            " currentTime " + currentTime);
    const api:boolean = params.current.api;
    if(!exit.current) {
      if(api && first.current && apiCount.current < 4) {
        apiCount.current += 1;
      }
      if(api && first.current && apiCount.current === 0) {
        const mIsPlaying = await isPlaying(fromPlayerId);
        console.log("==> mIsPlaying " + JSON.stringify(mIsPlaying));
        apiTimer1 = setTimeout(async () => {
          const mPause = await pause(fromPlayerId);
          console.log('==> mPause ', mPause);
        }, 7000);
      } else if(api && first.current && apiCount.current === 2) {
        apiTimer2 = setTimeout(async () => {
          const rMuted = await setMuted("fullscreen",false);
          console.log('===> setMuted ' + JSON.stringify(rMuted));
          let rVolume = await getVolume("fullscreen");
          console.log("===> Volume before setVolume" + JSON.stringify(rVolume));
          rVolume = await setVolume("fullscreen", 0.5);
          console.log("===> setVolume " + JSON.stringify(rVolume));
          rVolume = await getVolume("fullscreen");
          console.log("===> Volume after setVolume" + JSON.stringify(rVolume));
          apiTimer3 = setTimeout(async () => {
            const rPause = await pause("fullscreen");
            console.log('====> pause ', JSON.stringify(rPause));  
          }, 10000);
        }, 8000);
      }
    }
  };
  const onPause = async (fromPlayerId: string, currentTime: number | undefined) => {
    console.log("in OnPause playerId " + fromPlayerId +
            " currentTime " + currentTime);
    if(!exit.current) {
      if(params.current.api && first.current && apiCount.current === 0) {
        apiCount.current += 1;
        const mIsPlaying = await isPlaying(fromPlayerId);
        console.log('==> isPlaying after pause ' + JSON.stringify(mIsPlaying));
        const currentTime = await getCurrentTime("fullscreen");
        console.log('==> currentTime ' + currentTime);
        let muted = await getMuted("fullscreen");
        console.log("==> muted before setMuted " + JSON.stringify(muted));
        muted = await setMuted("fullscreen",!muted.value);
        console.log("==> setMuted " + JSON.stringify(muted));
        muted = await getMuted("fullscreen");
        console.log("==> muted after setMuted " + JSON.stringify(muted));
        const duration = await getDuration("fullscreen");
        console.log("==> duration " + JSON.stringify(duration));
        if(duration.result && duration.value > 25) {
          // valid for movies having a duration > 25
          const seektime = currentTime.value + 0.5 * duration.value < duration.value -25 ? currentTime.value + 0.5 * duration.value
                          : duration.value -25;
          const rCurrentTime = await setCurrentTime("fullscreen",seektime);
          console.log("==> setCurrentTime " + rCurrentTime.value);
        }
        const rPlay = await play("fullscreen");
        console.log("==> play " + JSON.stringify(rPlay));
      } else if(params.current.api && first.current && apiCount.current === 2) { 
        apiCount.current += 1;
        const duration = await getDuration("fullscreen");
        const volume = await setVolume("fullscreen",1.0);
        console.log("====> Volume ",volume.value);
        const rCurrentTime = await setCurrentTime("fullscreen",duration.value - 3);
        console.log('====> setCurrentTime ', rCurrentTime.value);
        const rPlay = await play("fullscreen");
        console.log('====> play ', JSON.stringify(rPlay)); 
      }
    }
  };


  const {initPlayer, isPlaying, pause, play, getDuration, setVolume,
        getVolume, setMuted, getMuted, setCurrentTime, getCurrentTime} = 
    useVideoPlayer({
      onReady,
      onPlay,
      onPause,
      onEnded,
      onExit
  });
  /**
   * Lifecycle Methods
   */

  useIonViewWillEnter( async () => {
    setShowModal(true);
    first.current = false;
    exit.current = false;

    /* doesn't work location.state not updated for successive calls
    console.log("in VideoPlayerFullscreen useIonViewWillEnter " + JSON.stringify(location.state))
    params.current = location.state;
    */
    // work around using Storage 
    params.current.url = await get('url');
    params.current.api = await get('api') === "true" ? true : false;
    console.log("in VideoPlayerFullscreen useIonViewWillEnter url " + params.current.url +
        " api " + params.current.api);
    apiCount.current = -1;
    if (params.current.api) first.current = true;
    await remove('url');
    await remove('api');
  });

  useIonViewDidEnter( async () => {
    await launchPlayer();
  });
  useIonViewWillLeave( async () => {
    clearTimeout(apiTimer1);
    clearTimeout(apiTimer2);
    clearTimeout(apiTimer3);
    first.current = false;
    exit.current = false;
  });
  /**
   * Handler Methods
   */
  const closeModalHandler = () => {  
    setShowModal(false);
    history.push(`/home`);
  }

  /**
   * Launch Player
   */

    async function launchPlayer(): Promise<void>  {
        console.log('*** in launchPlayer *** ' + params.current.url)
        const url: string = params.current.url;
        const res:any  = await initPlayer("fullscreen", url, "fullscreen", "ion-modal");
        console.log('*** in launchPlayer after initPlayer *** ' + JSON.stringify(res))

        if(!res.result && (platform === "ios" || platform === "android")) {
          await Toast.show({
            text: res.message,
            duration: 'long',
            position: 'bottom'
          });        
        }
        if(!res.result) console.log("res.message",res.message);
      
        return;
    }

  /**
   * Page template
   */
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="primary">
              <IonButton ion-button onClick={closeModalHandler}>Close Modal</IonButton>
            </IonButtons>
            <IonTitle>Fullscreen Modal</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonModal isOpen={showModal} cssClass='modal-custom-class'>
            <div id="fullscreen" slot="fixed">
            </div>
          </IonModal>
        </IonContent>
      </IonPage>
    );
};
export default VideoPlayerFullscreen;
