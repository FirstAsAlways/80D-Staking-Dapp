import React, {useState,useEffect  } from "react";
import { Count, CountText, Timer, Value, Wrapper,Digit } from "./Countdown.elements";


function PublicCountdown(props) {
     let countDownDate = new Date(props.date * 1000);
     countDownDate = countDownDate.setDate(countDownDate.getDate()+49);;

    let now = new Date().getTime();
  
    let timeleft = countDownDate - now;
  
    const [days, setDays] = useState();
    const [hours, setHour] = useState();
    const [minutes, setMint] = useState();
    const [seconds, setSec] = useState();
    useEffect(() => {
        const interval = setInterval(() => {

          setDays(Math.floor(timeleft / (1000 * 60 * 60 * 24)));

          setHour(
            Math.floor((timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          );
          setMint(Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60)));
          setSec(Math.floor((timeleft % (1000 * 60)) / 1000));
        }, 1000);
        return () => clearInterval(interval);
      }, [days, hours, minutes, seconds]);

  return (
    <>
        <Timer>
        <Count>
            <Digit>{days}&nbsp;:</Digit>
            </Count>
            <Count>
                <Digit>{hours}&nbsp;:</Digit>
            </Count>
            <Count>
                <Digit>{minutes}&nbsp;:</Digit>
            </Count>
            <Count>
                <Digit>{seconds}</Digit>
            </Count>
        </Timer>
    </>
  )
}

export default PublicCountdown