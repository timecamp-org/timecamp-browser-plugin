export type PomodoroInputsValues  = {
  pomodoroFocusPhase: string;
  pomodoroLongBreak: string;
  pomodoroShortBreak: string;
}

export enum PomodoroTypes {
  FOCUS_PHASE = 'Focus phase',
  SHORT_BREAK = 'Short break',
  LONG_BREAK  = 'Long break'
}


export function subtractTime(time1, time2) {
  const [hours1, minutes1, seconds1] = time1.split(":").map(Number);
  const [minutes2, seconds2] = time2.split(":").map(Number);

  const totalSeconds1 = hours1 * 3600 + minutes1 * 60 + seconds1;
  const totalSeconds2 = minutes2 * 60 + seconds2;

  const differenceSeconds = totalSeconds2 - totalSeconds1;

  if(differenceSeconds<60) {
    return `00:00:${differenceSeconds.toString().padStart(2,"0")}`
  }
  
  const hoursDiff = Math.floor(differenceSeconds / 3600);
  const remainingSeconds = differenceSeconds % 3600;
  const minutesDiff = Math.floor(remainingSeconds / 60);
  const secondsDiff = remainingSeconds % 60;

  const result =
    hoursDiff.toString().padStart(2, "0") +
    ":" +
    minutesDiff.toString().padStart(2, "0") +
    ":" +
    secondsDiff.toString().padStart(2, "0");

  return result;
}

export const isObjValid =(obj: Object): obj is PomodoroInputsValues=>{
  const validatedKeys = ["pomodoroFocusPhase", "pomodoroShortBreak", "pomodoroLongBreak" ]
  if(typeof obj !=='object' || obj===null)
  {
      return false
  }

  const valueNotValid = validatedKeys.some(key=> !obj.hasOwnProperty(key) || !/^\d{2}:\d{2}$/.test(obj[key]))
  
  if(valueNotValid)
  {
      return false
  }

  return true
  
}

export const isPomodoroTypeValid = (pomodoroType: PomodoroTypes) =>{
  if(!Object.values(PomodoroTypes).includes(pomodoroType)) {
      return false
  }
  return true
  
}
