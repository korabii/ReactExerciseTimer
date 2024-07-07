Timer: </br>
The timer uses setTimerCount to call useEffect as time is incremented on every re-render. 
This causes the set interval to be unmounted and recreated on every re-render, not ideal.

State update in useffect with setinterval: </br>
easier to understand if you think of it as recursion rather than a loop.
1. use effect calls everything inside it (assuming isRunning is true)
2. one of those things is a state varibale that is also part of the useEffect dependency array (timerCount).
3. the current execution must finish (including set interval wait time). (step in recursion)
4. since setTimerCount was called inside useEffect another execution of useEffect is scheduled
5. next cycle repeats until isRunning is set to false, 
   i. since isRunning is the top level if statement the setTimerCount can not be called
  ii. the useEffect clean up function is called (clearing the interval), since setTimerCount wasnt called a new interval is not created and execution stops.
