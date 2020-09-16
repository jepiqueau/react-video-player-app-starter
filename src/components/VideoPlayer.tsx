//import { IonContent, IonPage } from '@ionic/react';
import React, {/*useState,*/ useEffect, useRef/*, createRef*/} from 'react';
import './VideoPlayer.css';
import { Plugins } from '@capacitor/core';
import { useVideoPlayer } from 'react-video-player-hook/dist';

const { Toast } = Plugins;
/*
const useResize = (containerRef: any) => {
  console.log("in useResize ")
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);
  const [isResize, setIsResize] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWidth(containerRef.current.offsetWidth);
      setHeight(containerRef.current.offsetHeight);
      setIsResize(true);
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [containerRef])
  console.log("in UseResize isResize " + isResize)
  return { width, height, isResize }
}
*/
interface PlayerProps { 
  url: string;
  api: boolean;
  platform: string;
  onJeepCapVideoPlayerExit:((data: any) => void);
  onJeepCapVideoPlayerEnded:((data: any) => void);
  onJeepCapVideoPlayerReady:((data: any) => void);
  onJeepCapVideoPlayerPlay:((data: any) => void);
  onJeepCapVideoPlayerPause:((data: any) => void);
}

const VideoPlayer: React.FC<PlayerProps> = ({url, api, platform,
  onJeepCapVideoPlayerExit, onJeepCapVideoPlayerEnded,
  onJeepCapVideoPlayerReady, onJeepCapVideoPlayerPlay,
  onJeepCapVideoPlayerPause}) => {

  const {initPlayer,pVideoPlayer} = useVideoPlayer();
  const containerRef = useRef<HTMLDivElement | null>(null); 
//  const { width, height, isResize} = useResize(containerRef);
//  const [isUpdate, setIsUpdate] = useState(isResize);

//  console.log("containerRef ",containerRef)
//  console.log("in  width " + width + " height " + height)

  useEffect( () => {
    const readyListener = pVideoPlayer.addListener('jeepCapVideoPlayerReady', (data:any) => {
      return onJeepCapVideoPlayerReady(data);
    });
    return () => readyListener.remove()

  },[pVideoPlayer, onJeepCapVideoPlayerReady]);

  useEffect( () => {
    const endedListener = pVideoPlayer.addListener('jeepCapVideoPlayerEnded', (data:any) => {
      return onJeepCapVideoPlayerEnded(data);
    });
    return () => endedListener.remove()

  },[pVideoPlayer, onJeepCapVideoPlayerEnded]);

  useEffect( () => {
    const exitListener = pVideoPlayer.addListener('jeepCapVideoPlayerExit', (data:any) => {
      //TODO Stop all players
      return onJeepCapVideoPlayerExit(data);
    });
    return () => exitListener.remove()

  },[pVideoPlayer, onJeepCapVideoPlayerExit]);

  useEffect( () => {
    const playListener = pVideoPlayer.addListener('jeepCapVideoPlayerPlay', (data:any) => {
      return onJeepCapVideoPlayerPlay(data);
    });
    return () => playListener.remove()

  },[pVideoPlayer, onJeepCapVideoPlayerPlay]);

  useEffect( () => {
    const pauseListener = pVideoPlayer.addListener('jeepCapVideoPlayerPause', (data:any) => {
      return onJeepCapVideoPlayerPause(data);
    });
    return () => pauseListener.remove()

  },[pVideoPlayer, onJeepCapVideoPlayerPause]);

  useEffect( () => {
    async function launchPlayer(): Promise<void>  {
      console.log('*** in launchPlayer ***')
      /*
      if(url !== null) {
//        console.log("in launchPlayer width " + width + " height " + height)
//        const res:any  = await initPlayer("fullscreen", url, "fullscreen", containerRef.current,
//                                          width, height);
        const res:any  = await initPlayer("fullscreen", url, "fullscreen", containerRef.current);
        if(!res.result && (platform === "ios" || platform === "android")) {
          await Toast.show({
            text: res.message,
            duration: 'long',
            position: 'bottom'
          });        
        }
        if(!res.result) console.log("res.message",res.message);
      }
      */
    }
    launchPlayer();
  },[initPlayer, url, platform, containerRef]);
                
  return (
        <div id="fullscreen" ref={containerRef} slot="fixed">
        </div>
  );
};

export default VideoPlayer;
