import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton,
  IonList, IonItem, useIonViewWillEnter } from '@ionic/react';
import React, {useState, useEffect, useRef} from 'react';
import { useStorage } from '@capacitor-community/storage-react';

import './Home.css';
import { Capacitor } from '@capacitor/core';
import { useHistory, RouteComponentProps } from 'react-router-dom';


const Home: React.FC<RouteComponentProps> = () => {
  const platform = Capacitor.getPlatform();
  var api: any = useRef<boolean>(false);
  const [type,setType] = useState("");
  const useApi = () => {
    console.log("==> in useApi before setApi api " + api.current)
    api.current = ! api.current;
    console.log("==> in useApi after setApi api " + api.current)
  }
  const history = useHistory();
  const {set} = useStorage();

  useIonViewWillEnter( () => {
    console.log("in useIonViewWillEnter '" + type + "'")
    setType("");
    api.current = false;
  });
  useEffect( () => {
    async function launchFullscreen(): Promise<void>  {

    console.log("in lauchFullscreen type '" + type + "'")
    console.log("in lauchFullscreen api '" + api.current + "'")

      let url: string = "";
      if(type === "mp4") {
        url = "https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4?alt=media&token=a8abafa7-5fd9-4179-be5f-1963a5b60d51";
      } else if (type === "webm") {
        url = "https://upload.wikimedia.org/wikipedia/commons/transcoded/f/f1/Sintel_movie_4K.webm/Sintel_movie_4K.webm.720p.webm";
      } else if (type === "hls") {
        url = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
      } else if (type === "mpd") {
        url = "https://bitmovin-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd";
      } else if (type === "smooth") {
        url = "https://test.playready.microsoft.com/smoothstreaming/SSWSS720H264/SuperSpeedway_720.ism/manifest";
      } else if (type === "aws") {
        url = "https://universo-dev-a-m.s3.amazonaws.com/779970/fe774806dbe7ad042c24ce522b7b46594f16c66e";
      } else if (type === 'application') {
        url = "application/files/bigbuckbunny.mp4";
      } else if (type === 'internal') {
        url = "internal";
      } else if (type === 'asset' && platform === 'ios') {
        url = "public/assets/video/video.mp4";
      } else if (type === 'asset' && platform === 'android') {
        url = "public/assets/video/video.mp4";
      } else if (type === 'asset' && (platform === 'web' || platform === 'electron')) {
        url = "assets/video/video.mp4";
      } else {
        console.log("Video format not supported");
      }
      /* this doesn't work state:params not updated between successives calls
      console.log("==> in lauchFullscreen before push api " + api.current)
      const params = {url:url,api:api.current};
      console.log("==> in lauchFullscreen before push params " + JSON.stringify(params))
      history.push({
        pathname: '/fullscreen',
        state: params
      })
      */
     // work around by using Storage
     await set('url', url);
     await set('api', api.current ? "true" : "false");
     history.push('/fullscreen');
    }
    if(type.length >  0) launchFullscreen();
  },[ api, platform, history, type, set]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>VideoPlayer Test</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">VideoPlayer test</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonList>
          <IonItem>
            <IonButton onClick={useApi} expand="block">Test API On/Off</IonButton>
          </IonItem>
          <IonItem>
            <IonButton onClick={() => setType("mp4")} expand="block">Test Fullscreen MP4 Video</IonButton>
          </IonItem>
          <IonItem>
            <IonButton onClick={() => setType("hls")} expand="block">Test Fullscreen HLS Video</IonButton>
          </IonItem>
          {(platform === 'android') &&
            <IonItem >
              <IonButton onClick={() => setType("mpd")} expand="block">Test Fullscreen DASH MPD Video</IonButton>
            </IonItem>
          }
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Home;
