import React, { useState, useRef, useEffect } from 'react';
import{ Time, Transport, Players, Part } from 'tone';
import deepClone from 'lodash.clonedeep';

import styles from './App.module.css';

import { rock, house } from './config';

import kick from './samples/drum/kick.ogg';
import snare from './samples/drum/snare.ogg';
import closedHat from './samples/drum/closedHat.ogg';
import openHat from './samples/drum/openHat.ogg';

const Drums = [ 'openHat', 'closedHat', 'snare', 'kick'];

const DefaultTempo = 85;

const DefaultPattern = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

function App() {
  const [tempo, setTempo] = useState(DefaultTempo);
  const [playing, setPlayState] = useState(false);
  const [pattern, setPattern] = useState(DefaultPattern);

  const players = useRef(null);
  const part = useRef(null);

  const play = () => {
    setPlayState(true);
    Transport.start();
  }

  const pause = () => {
    setPlayState(false);
    Transport.stop();
  }

  const reset = () => {
    pause();
    setPattern(DefaultPattern);
    setTempo(DefaultTempo);
  }

  const changeTempo = (event) => {
    setTempo(event.target.value);
  }

  const select = (name, row, col) => {
    part.current.clear();

    const value = pattern[row][col];
    const newPattern = deepClone(pattern);
    const newValue = value === 1 ? 0 : 1;

    newPattern[row][col] = newValue;
    setPattern(newPattern);
    
    if (newValue && !playing) {
      players.current.player(name).start();
    }
  }

  const chooseRock = () => {
    Transport.cancel();
    setTempo(rock.bpm);
    setPattern(rock.pattern);
  }

  const chooseHouse = () => {
    Transport.cancel();
    setTempo(house.bpm);
    setPattern(house.pattern);
  }

  useEffect(() => {
    pattern.forEach((item, index) => {
      const ticks = new Time('1m').toTicks();
      const interval = ticks / item.length;
      for (let i = 0; i < item.length; i++) {
        if (item[i] === 1) {
          part.current.add(`${interval.toFixed(0) * i}i`, Drums[index]);
        }
      }
    });
  }, [pattern]);

  useEffect(() => {
    Transport.bpm.rampTo(tempo);
  },[tempo]);

  useEffect(() => {
    players.current = new Players({
      openHat,
      closedHat,
      snare,
      kick
    }).toDestination();

    part.current = new Part((time, note) => {
      players.current.player(note).start(time);
    }, []);
    part.current.loop = true;
    part.current.start();
  }, []);
  
  return (
    <div className={styles.wrapper}>
      <div className={styles.main}>
        <div className={styles.control}>
          <button onClick={playing ? pause : play}>
            <i className={playing ? styles.pause : styles.play} />
          </button>
          <button onClick={reset}>
            <i className={styles.reset} />
          </button>
          <button onClick={chooseRock}><span className={styles.rock}>rock</span></button>
          <button onClick={chooseHouse}><span className={styles.house}>house</span></button>
        </div>
        <div className={styles.tempo}>
          <span>Tempo: {tempo} bpm</span>
          <input type="range" min="30" max="240" onChange={changeTempo} value={tempo} />
        </div>
        <div className={styles.instruments}>
          {pattern.map((row, rowIndex) => {
            return (
              <div key={rowIndex} className={styles.row}>
                <div className={styles.label}>{Drums[rowIndex]}</div>
                <div className={styles.panel}>
                  {row.map((col, colIndex) => {
                    return (
                      <button
                        key={colIndex}
                        onClick={() => select(Drums[rowIndex], rowIndex, colIndex)}
                        className={pattern[rowIndex][colIndex] === 1 ? styles.selected : null}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
        <div className={styles.num}>
          {pattern[0].map((item, index) => {
            return (
              <span
                key={index}
                style={{ color: index % 4 === 0 ? 'white' : '#bbb'}}
              >{index + 1}</span>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default App;