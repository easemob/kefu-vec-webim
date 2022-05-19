import React, { useState, useEffect} from 'react'


const TimeControl = ({ label = '' }) => {
    let [time, setTime] = useState(0);
  
    const formatTime = function(time) {
      let hour = parseInt(time / 3600);
      let minute = parseInt((time - hour * 3600) / 60);
      let second = parseInt(time - hour * 3600 - minute * 60);
  
      hour = `${hour}`.padStart(2, 0);
      minute = `${minute}`.padStart(2, 0);
      second = `${second}`.padStart(2, 0);
  
      return `${label && `${label}：`}${hour}:${minute}:${second}`
    };
  
    useEffect(() => {
      let timerId = window.setInterval(() => {
        setTime((time) => ++time)
      }, 1000)
  
      return () => void window.clearInterval(timerId)
    }, []) 
  
    return (
      <span>{formatTime(`${time}`)}</span>
    )
}

export default TimeControl
