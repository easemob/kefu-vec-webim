import React, { useRef, useLayoutEffect } from "react";
import whiteboard from '@/assets/img/whiteboard.jpg';

export default ({ setWhiteboardRoomInfo, bindClick }) => {
  const container = useRef(null);

  useLayoutEffect(() => {
    setWhiteboardRoomInfo(val => ({ ...val, domNode: container.current }));
  }, [])

  return (
    <div 
      onClick={bindClick}
      className="video-player" 
      style={{ width: "100px", height: "76px", position: 'relative', borderRadius: '5px', overflow: 'hidden' }}>
      <div style={{ display: 'none' }} ref={container} />
      <img src={whiteboard} alt="" style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
