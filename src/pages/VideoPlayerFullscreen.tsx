import React, { useState, useEffect, useRef} from 'react';
import { IonButton, IonModal, IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, useIonViewWillEnter, useIonViewDidEnter, useIonViewWillLeave } from '@ionic/react';
import './VideoPlayerFullscreen.css';
import { Capacitor, Plugins } from '@capacitor/core';
import { useVideoPlayer } from 'react-video-player-hook/dist';
import { RouteComponentProps } from 'react-router';
import { useStorage } from '@capacitor-community/react-hooks/storage';

/*interface VideoPlayerFullscreenProps extends RouteComponentProps<{
//    props: string;
//      detail: any;
}> {}
*/
const { Toast } = Plugins;

//const VideoPlayerFullscreen: React.FC<VideoPlayerFullscreenProps> = ({match,history}) => {
const VideoPlayerFullscreen: React.FC<RouteComponentProps> = ({/*location,*/ history}) => {

  const platform = Capacitor.getPlatform();
//  const containerRef = useRef<HTMLDivElement | null>(null); 
//  const props = JSON.parse(match.params.props);
  //const props = location.state;
  var params: any = useRef<any>({});
  var first: any = useRef<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const { get, remove } = useStorage();
//  const [first,setFirst] = useState(false);
//  const [apiCount,setApiCount] = useState(-1);
  var apiCount = useRef<number>(-1);
  let apiTimer1: any ;
  let apiTimer2: any ;
  let apiTimer3: any ;
  let playListener: any;
  let pauseListener: any;
  let readyListener: any;
  let exitListener: any;
  let endedListener: any;

  const {pVideoPlayer, initPlayer, isPlaying, pause, play, getDuration, setVolume,
    getVolume, setMuted, getMuted, setCurrentTime, getCurrentTime, stopAllPlayers} = useVideoPlayer();
  /**
   * Lifecycle Methods
   */

  useIonViewWillEnter( async () => {
    setShowModal(true);
    first.current = false;
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
    await addListeners();
    await launchPlayer();
  });
  useIonViewWillLeave( async () => {
    playListener.remove();
    pauseListener.remove();
    readyListener.remove();
    exitListener.remove();
    endedListener.remove();
    clearTimeout(apiTimer1);
    clearTimeout(apiTimer2);
    clearTimeout(apiTimer3);
    first.current = false;
  });
  /**
   * Handler Methods
   */
  const closeModalHandler = () => {  
    setShowModal(false);
    history.push(`/home`);
  }

  /**
   * Define Listener for jeepCapVideoPlayerPlay
   */
  async function addListeners(): Promise<void>  {

    playListener = pVideoPlayer.addListener('jeepCapVideoPlayerPlay', async (data:any) => {      
      console.log("pVideoPlayer.addListener jeepCapVideoPlayerPlay " + data.fromPlayerId + " " + data.currentTime);
      const api:boolean = params.current.api;
      if(api && first.current && apiCount.current < 3) {
        apiCount.current += 1;
      }
      if(api && first.current && apiCount.current === 0) {
        const mIsPlaying = await isPlaying(data.fromPlayerId);
        console.log("==> mIsPlaying " + JSON.stringify(mIsPlaying));
        apiTimer1 = setTimeout(async () => {
          const mPause = await pause(data.fromPlayerId);
          console.log('==> mPause ', mPause);
        }, 7000);
      } else if(api && first.current && apiCount.current === 1) {
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
    });
    pauseListener = pVideoPlayer.addListener('jeepCapVideoPlayerPause', async (data:any) => {
        if(params.current.api && first.current && apiCount.current === 0) {
          const mIsPlaying = await isPlaying(data.fromPlayerId);
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
        } else if(params.current.api && first.current && apiCount.current === 1) { 
          const duration = await getDuration("fullscreen");
          const volume = await setVolume("fullscreen",1.0);
          console.log("====> Volume ",volume.value);
          const rCurrentTime = await setCurrentTime("fullscreen",duration.value - 3);
          console.log('====> setCurrentTime ', rCurrentTime.value);
          const rPlay = await play("fullscreen");
          console.log('====> play ', JSON.stringify(rPlay)); 
        }
     
    });
    exitListener = pVideoPlayer.addListener('jeepCapVideoPlayerExit', (data:any) => {
        //TODO Stop all players
      console.log("in pVideoPlayer.addListener jeepCapVideoPlayerExit " + JSON.stringify(data))
      setShowModal(false);
      history.push(`/home`);
    });
    endedListener = pVideoPlayer.addListener('jeepCapVideoPlayerEnded', (data:any) => {
        console.log("in pVideoPlayer.addListener jeepCapVideoPlayerEnded " + JSON.stringify(data))
      setShowModal(false);
      history.push(`/home`);
    });
    readyListener = pVideoPlayer.addListener('jeepCapVideoPlayerReady', (data:any) => {
        console.log("pVideoPlayer.addListener jeepCapVideoPlayerReady " + data.fromPlayerId + " " + data.currentTime);      
    });
    return;
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
