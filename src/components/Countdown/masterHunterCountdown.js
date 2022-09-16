import React, {useState,useEffect  } from "react";
import { Count, CountText, Timer, Value, Wrapper,Digit } from "./Countdown.elements";


function MasterHunterCountdown() {
    let countDownDate = new Date("Sep 01, 2022 00:00:00 GMT +5:00 ").getTime();

    let now = new Date().getTime();
  
    let timeleft = countDownDate - now;
  
    const [days, setDays] = useState();
    const [hours, setHour] = useState();
    const [minutes, setMint] = useState();
    const [seconds, setSec] = useState();
console.log({days});
    useEffect(() => {
        const interval = setInterval(() => {
          setDays(Math.floor(timeleft / (1000 * 60 * 60 * 24)));
          setHour(
            Math.floor(24 * days)
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

export default MasterHunterCountdown