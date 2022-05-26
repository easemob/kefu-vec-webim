import React, { useRef, useEffect } from "react";
import './MediaPlayer.scss';

const MediaPlayer = ({ bindClick, hasAudio, isLocal, name: userName, ...props }) => {
  const container = useRef(null);

  useEffect(() => {
    if (!container.current) return;
    props.videoTrack?.play(container.current);
    
    return () => {
      props.videoTrack?.stop();
    };
  }, [container, props.videoTrack]);

  useEffect(() => {
    if(props.audioTrack){
      props.audioTrack?.play();
    }
    return () => {
      props.audioTrack?.stop();
    };
  }, [props.audioTrack]);

  let _userName = isLocal ? '我' : `客服-${userName}`;

  return (
    <div 
      title={_userName}
      onClick={bindClick}
      ref={container} 
      className="video-player" 
      style={{ width: "100px", height: "76px", position: 'relative', borderRadius: '5px', overflow: 'hidden' }}>
      <span className={hasAudio ? 'icon-microphone' : 'icon-microphone-close'}></span>

      <p style={{ 
        fontSize: '12px', 
        position: 'absolute', 
        bottom: 2,
        textAlign: 'center',
        zIndex: 99,
        width: '100%'  
      }}>
        <span style={{
          fontSize: '12px',
          color: 'white',
          background: 'rgba(0, 0, 0, 0.5)',
          padding: '2px 5px',
          display: 'inline-block',
          wordBreak: 'keep-all',
          overflow: 'hidden',
          maxWidth: '100%',
          textOverflow: 'ellipsis',
          boxSizing: 'border-box',
          borderRadius: '3px',
          transform: 'scale(0.8)',
          whiteSpace: 'nowrap'
        }}>
        {_userName}
      </span>
      </p>
    </div>
  );
}

export default MediaPlayer;