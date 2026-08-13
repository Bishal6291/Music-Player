import { useNavigate, useLocation } from "react-router-dom";
import { parseBlob } from "music-metadata-browser";
import { useState, useRef, useEffect } from "react";
import "./Player-Page.css";
import defaultImage from "./defaultImage.png";
import  defaultVideo from "./now-playing-video.mp4"

export default function PlayerPage() {
  const fileLocation = useLocation();
  const [files, setFiles] = useState([]);
  const [currentSong, setCurrentSong] = useState("");
  const [currentSongInfo, setCurrentSongInfo] = useState("");
  const [playButton, setPlayButton] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffleIndex, setShuffleIndex] = useState(false);
  const [repeatIndex, setRepeatIndex] = useState(false);
  const [search, setSearch] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const audioRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredFiles = files.filter((item) =>
    item.file.name.toLowerCase().includes(search.toLowerCase())
  );

  const deleteIndex = (index) => {
    setFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== index);
      if (index === currentIndex) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setProgress(0);
        setCurrentSong(null);
        setCurrentSongInfo("");
        setDuration(0);
        setCurrentTime(0);
        setPlayButton(false);

        if (newFiles.length > 0) {
          const newIndex = index >= newFiles.length ? newFiles.length - 1 : index;
          setTimeout(() => {
            playSong(newFiles[newIndex].file, newIndex);
          }, 100);
        }
      } else if (index < currentIndex) {
        setCurrentIndex((prevIndex) => prevIndex - 1);
      }
      return newFiles;
    });
  };

  useEffect(() => {
    const loadFiles = async () => {
      const musicFiles = fileLocation.state?.file || [];

      const fileImage = await Promise.all( //Process all music files at the same time and wait for all of them to finish.
        musicFiles.map(async (file) => {
          try {
            const metadata = await parseBlob(file);
            let imageURL = null;

            if (metadata.common.picture?.length) {
              const picture = metadata.common.picture[0];
              imageURL = URL.createObjectURL(
                new Blob([picture.data], { type: picture.format })
              );
            }

            return { file, imageURL };
          } catch {
            return { file, imageURL: null };
          }
        })
      );

      setFiles(fileImage);
    };

    loadFiles();
  }, [fileLocation.state]);

  const addMusic = async (e) => {
    const newFiles = Array.from(e.target.files);

    const fileImage = await Promise.all(
      newFiles.map(async (file) => {
        try {
          const metadata = await parseBlob(file);
          
          let imageURL = null;

          if (metadata.common.picture?.length) {
            const picture = metadata.common.picture[0];
            imageURL = URL.createObjectURL(
              new Blob([picture.data], { type: picture.format })
            );
          }

          return { file, imageURL };
        } catch {
          return { file, imageURL: null };
        }
      })
    );

    setFiles((prev) => [...prev, ...fileImage]);
  };

  const playSong = (file, index) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCurrentSong(url);
    setCurrentSongInfo(file.name);
    setPlayButton(true);
    setCurrentIndex(index);
    setTimeout(() => {
      audioRef.current.play();
      setPlayButton(true);
    }, 100);
  };

  const handleButton = () => {
    if(files.length === 0) return;
    if(!currentSong){
      playSong(files[0].file,0);
      return;
    }
    if (!audioRef.current) return;
    if (playButton) {
      audioRef.current.pause();
      setPlayButton(false);
    } else {
      audioRef.current.play();
      setPlayButton(true);
    }
  };

  const onTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio) {
      const seekTime = (audio.currentTime / audio.duration) * 100;
      setProgress(seekTime || 0);
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration);
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    const value = e.target.value;

    if (audio) {
      audio.currentTime = (value / 100) * audio.duration;
      setProgress(value);
    }
  };

  const timeChange = (time) => {
    if (isNaN(time)) return "0:00";
    const minute = Math.floor(time / 60);
    const second = Math.floor(time % 60);
    return `${minute}:${second < 10 ? "0" : ""}${second}`;
  };

  const activeImage = currentSong ? files[currentIndex]?.imageURL || defaultImage: defaultImage;

  return (
    <>
      <div className="screenSize">
        <div className="navbar">
          <div className="logo"></div>
          <label htmlFor="addMusic">
            <div className="addSongDiv">
            <i className="bi bi-plus" id="add-file"></i>
            <p className="addSongText">Add Song</p>
            </div>
          </label>
          <input
            type="file"
            multiple
            accept="audio/*"
            id="addMusic"
            style={{ display: "none" }}
            onChange={addMusic}
          />
          <div className="searchBox">
            <i className="bi bi-search" id="search-button"></i>
            <input
              type="text"
              id="searchText"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="heroBox">
          <div className="heroHeader">
            <div className="heroHeaderName">
              <i className="bi bi-music-note" id="playlist"></i>
              <div className="slides">
                <p className="slides-text">Music Player</p>
              </div>
            </div>
          </div>

          <div className="heroContent">
            {/* Left Panel: Playlist / Song List */}
            <div className="musicList">
              {files.length === 0 ? (
                <p style={{ color:"#aaa", textAlign: "center", marginTop: "20px" }}>
                  No music found
                </p>
              ) : (
                filteredFiles.map((file) => {
                  const index = files.indexOf(file);
                  return (
                    <div
                      key={index}
                      className={`musicBox-list ${
                        currentIndex === index ? "activeSong" : ""
                      }`}
                      onClick={() => playSong(file.file, index)}
                    >
                      <div className="musicImage">
                        <img
                          src={file.imageURL || defaultImage}
                          alt="cover"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>

                      <div className="musicBox-info">
                        <p>{file.file.name}</p>
                      </div>

                      <i
                        className="bi bi-trash3"
                        id="deleteIcon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteIndex(index);
                        }}
                      ></i>
                    </div>
                  );
                })
              )}
            </div>

            <div className="rightSideContainer">
              <div className="now-playing-card">
                <video className="now-playing-Video" src={defaultVideo} autoPlay loop muted />

                <div className={`disc-wrapper ${playButton ? "playing" : ""}`}>
                  <div className="disc">
                    <img
                      src={activeImage}
                      alt="Album Cover"
                      className="disc-cover"
                    />
                  </div>
                </div>

                <div className="song-display-details">
                  <h2 className="now-playing-title">
                    {currentSongInfo || "No Song Selected"}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Player Controls */}
        <div className="player">
          <div className="ProgressTimeBox">
            <input
              type="range"
              name="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              id="progressBar1"
            />
            <div className="timeStamp">
              <span className="time">{timeChange(currentTime)}</span>
              <span className="time">{timeChange(duration)}</span>
            </div>
          </div>

          <div className="musicInfo">
            <p className="songName">{currentSongInfo}</p>
          </div>

          <div className="controls">
            <i
              className={`bi bi-shuffle ${shuffleIndex ? "ShuffleStart" : ""}`}
              id="shuffle-button"
              onClick={() => setShuffleIndex(!shuffleIndex)}
            ></i>
            <i
              className="bi bi-skip-backward"
              id="backward-button"
              onClick={() => {
                if (files.length === 0) return;
                let newIndex;
                if (shuffleIndex) {
                  newIndex = Math.floor(Math.random() * files.length);
                } else {
                  newIndex = currentIndex - 1;
                }
                if (newIndex < 0) {
                  newIndex = files.length - 1;
                }
                playSong(files[newIndex].file, newIndex);
              }}
            ></i>
            <i
              className={`bi ${playButton ? "bi-pause" : "bi-play"}`}
              id="play-button"
              onClick={handleButton}
            ></i>
            <i
              className="bi bi-skip-forward"
              id="forward-button"
              onClick={() => {
                if (files.length === 0) return;
                let newIndex;
                if (shuffleIndex) {
                  newIndex = Math.floor(Math.random() * files.length);
                } else {
                  newIndex = currentIndex + 1;
                }
                if (newIndex >= files.length) {
                  newIndex = 0;
                }
                playSong(files[newIndex].file, newIndex);
              }}
            ></i>
            <i
              className={`bi bi-repeat ${repeatIndex ? "repeatStart" : ""}`}
              id="repeat-button"
              onClick={() => setRepeatIndex(!repeatIndex)}
            ></i>
          </div>

          <audio
            ref={audioRef}
            src={currentSong}
            onTimeUpdate={onTimeUpdate}
            onEnded={() => {
              if (repeatIndex) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
              } else {
                let newIndex;
                if (shuffleIndex) {
                  newIndex = Math.floor(Math.random() * files.length);
                } else {
                  newIndex = currentIndex + 1;
                }
                if (newIndex >= files.length) {
                  newIndex = 0;
                }
                playSong(files[newIndex].file, newIndex);
              }
            }}
          ></audio>
        </div>
      </div>
    </>
  );
}